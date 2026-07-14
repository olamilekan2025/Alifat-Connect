
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      // ❌ No token = block
      if (!token) return false;

      const role = token.role;
      const isAdmin = token.isAdmin === true;

      // 🔐 ADMIN ROUTES
      if (pathname.startsWith("/admin")) {
        return role === "admin" && isAdmin;
      }

      // 🧑 MODERATOR ROUTES
      if (pathname.startsWith("/moderator")) {
        return role === "moderator";
      }

      // 👤 DASHBOARD ROUTES
      if (pathname.startsWith("/dashboard")) {
        return true; // any logged-in user
      }

      // 🚫 BLOCK EVERYTHING ELSE PROTECTED AREAS
      return false;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/moderator/:path*",
  ],
};