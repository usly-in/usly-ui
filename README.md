# usly — UI

> *A private space for the people who matter most.*

Usly is an invite-only memory-keeping app for couples, families, and close-knit groups. Members share **Moments** (photo galleries), write **Chapters** (long-form stories), and send **Letters** (time-locked messages that reveal themselves on a future date).

This is the **Next.js frontend**. The backend lives in [`../usly-api`](../usly-api).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 (Auth.js) — Google OAuth |
| HTTP client | Axios |
| Animation | Framer Motion |
| Markdown | `@uiw/react-md-editor` + `react-markdown` |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Features

- **Moments** — Upload up to 6 photos per post. The server generates a thumbnail sprite sheet; the gallery renders from it without extra requests.
- **Chapters** — Long-form stories written in Markdown. Preserved as a chronological book of shared memories.
- **Letters** — Write a letter and set an `openAt` date. It stays sealed until that day arrives, showing only a countdown to other members.
- **Invite-only groups** — Admins invite members by email. There is no public sign-up; every user belongs to exactly one group (tenant).
- **Admin controls** — Admins can invite/revoke members, update group settings, and delete any content.
- **Responsive UI** — Dark-themed, mobile-friendly across all pages.

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- A running instance of `usly-api` (see [`../usly-api/README.md`](../usly-api/README.md))
- Google OAuth credentials (Cloud Console → OAuth 2.0 Client ID)

### 1. Install dependencies

```bash
cd usly-ui
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random 32-char secret for NextAuth JWT signing (`openssl rand -hex 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (browser-side, default: `http://localhost:8000`) |
| `API_URL` | Backend API base URL (server-side, for auth callbacks) |
| `INTERNAL_API_SECRET` | Shared secret for UI→API internal auth endpoints |

> Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
usly-ui/
├── app/
│   ├── (app)/            # Auth-required route group
│   ├── api/auth/         # NextAuth API route
│   ├── chapters/         # List, detail, and create chapters
│   ├── dashboard/        # Group home / overview
│   ├── invitations/      # Manage invites (admin)
│   ├── letters/          # List, detail, and create letters
│   ├── login/            # Google sign-in page
│   ├── memory/[id]/      # Generic content viewer (all types)
│   ├── moments/          # Photo gallery
│   ├── only-us/          # Private group space
│   ├── settings/         # Group settings (admin)
│   └── signup/           # Onboarding — create a new group
├── components/
│   ├── ContentCard.tsx   # Shared card for all content types
│   ├── CountdownTimer.tsx# Countdown for locked letters
│   ├── InviteModal.tsx   # Admin invite-by-email modal
│   ├── MarkdownEditor.tsx# Rich text editor (chapters / letters)
│   ├── Sidebar.tsx       # Navigation + group switcher
│   └── UploadZone.tsx    # Drag-and-drop file picker
├── lib/
│   ├── api.ts            # Axios client (browser) — injects auth headers
│   └── db-server.ts      # Server-side auth bridge → usly-api internal endpoints
├── types/
│   └── index.ts          # Shared TypeScript interfaces
├── auth.ts               # NextAuth v5 config (Google + JWT callbacks)
└── middleware.ts         # Route protection (redirects unauthenticated users)
```

---

## Auth Flow

1. User clicks **Sign in with Google**.
2. NextAuth receives the Google profile and calls `usly-api`'s internal lookup endpoint.
3. **Returning user** → JWT is populated with `tenantId`, `role`, and `groups`.
4. **Invited user** (email matches a pending invite) → user record is created, invite is accepted, JWT populated as above.
5. **Brand-new user** (no invite) → redirected to `/signup` to create a new group.
6. All subsequent API calls attach `x-tenant-id`, `x-user-id`, `x-user-role`, and `x-user-email` headers automatically via the Axios interceptor.

---

## Deployment (Vercel)

```bash
npm run build   # verify build locally first
```

Then push to your Vercel-linked repository. Set the same environment variables from `.env.local.example` in the Vercel project settings.

```
https://your-domain.vercel.app/api/auth/callback/google
```

---

## Roadmap

### Near-term
- [ ] Push notifications for new moments / unsealed letters
- [ ] Multi-group support (belong to more than one group)
- [ ] Cover photo upload for group settings
- [ ] Reaction / emoji responses on content

### Medium-term
- [ ] Mobile app (React Native, shared API)
- [ ] Annual recap — auto-generated "year in review" PDF export
- [ ] Letter scheduling UI (calendar picker + preview)
- [ ] Rich embeds in chapters (YouTube, Spotify)

### Long-term
- [ ] Premium tier with unlimited storage and advanced media features
- [ ] Shared album collaboration (multi-author moments)
- [ ] End-to-end encrypted letters

