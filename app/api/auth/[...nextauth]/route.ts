// NOTE: This route is not functional on static hosts (GitHub Pages).
// Auth requires a server-side runtime. For full auth, deploy to Vercel or a Node.js host.
export const dynamic = "force-static";

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
