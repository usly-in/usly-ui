import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { lookupByEmail, createUser, acceptInvitation } from "@/lib/db-server";
import type { UserGroup } from "@/types";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google") return false;
      // Always allow Google sign-in.
      // - Existing users:     jwt callback attaches tenantId + role
      // - Invited first-time: jwt callback creates user record and accepts invite
      // - Brand new users:    tenantId stays unset → middleware sends to /signup
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Handle session update() calls from the client (e.g. after onboarding / group switch)
      if (trigger === "update" && session) {
        if (session.tenantId) token.tenantId = session.tenantId;
        if (session.role)     token.role     = session.role;
        if (session.userId)   token.userId   = session.userId;
        if (session.groups)   token.groups   = session.groups;
        return token;
      }

      if (account && user) {
        // First sign-in — populate base fields always
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        try {
          const email = user.email!;
          const { users, invitation } = await lookupByEmail(email);

          if (users.length > 0) {
            // Existing user — could belong to multiple groups
            token.groups  = users;
            // Active group = most recently created (already sorted by DynamoDB query)
            token.userId  = users[0].userId;
            token.tenantId = users[0].tenantId;
            token.role    = users[0].role;
          } else if (invitation) {
            // Invited first-timer — create user record, accept invite
            const newUser = await createUser({
              email,
              name: user.name ?? "",
              tenantId: invitation.tenantId,
              role: "member",
            });
            await acceptInvitation(invitation.inviteId);
            const newGroup: UserGroup = {
              tenantId: invitation.tenantId,
              userId: newUser?.userId ?? "",
              role: "member",
              groupType: (invitation.groupType ?? "lover") as UserGroup["groupType"],
              name: invitation.tenantName ?? "",
            };
            token.groups   = [newGroup];
            token.userId   = newUser?.userId;
            token.tenantId = invitation.tenantId;
            token.role     = "member";
          }
          // No user, no invite → brand new user, tenantId stays unset → /signup
        } catch (err) {
          console.error("[auth] jwt callback error:", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id       = token.userId as string;
      session.user.tenantId = token.tenantId as string;
      session.user.role     = token.role as "admin" | "member";
      session.user.groups   = (token.groups ?? []) as UserGroup[];
      if (token.picture) session.user.image = token.picture as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
