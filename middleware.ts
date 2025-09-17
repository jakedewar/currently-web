import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run middleware on specific protected routes
     */
    "/protected/:path*",
    "/api/projects/:path*",
    "/api/organizations/:path*", 
    "/api/users/:path*",
    "/api/integrations/:path*",
    "/api/invitations/:path*",
    "/api/url-preview",
    "/auth/:path*",
  ],
};
