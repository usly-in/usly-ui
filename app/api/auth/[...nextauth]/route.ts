// NOTE: This route requires a server-side runtime. Ensure it's dynamic so
// NextAuth handlers execute on the server during requests.
export const dynamic = "force-dynamic";

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
