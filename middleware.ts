import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    authorized: ({ token, req }) => {
      const pathname =
        req.nextUrl.pathname;

      // NOT LOGGED IN
      if (!token) {
        return false;
      }

      // ADMIN ROUTES
      if (
        pathname.startsWith(
          "/admin"
        )
      ) {
        return (
          token.role === "Admin"
        );
      }

      // MODERATOR ROUTES
      if (
        pathname.startsWith(
          "/moderator"
        )
      ) {
        return (
          token.role ===
          "Moderator"
        );
      }

      // USER DASHBOARD
      if (
        pathname.startsWith(
          "/dashboard"
        )
      ) {
        return true;
      }

      return true;
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