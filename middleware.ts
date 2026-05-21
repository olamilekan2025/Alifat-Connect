import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    authorized: ({
      token,
      req,
    }) => {
      const pathname =
        req.nextUrl.pathname;

      if (!token) {
        return false;
      }

      // ADMIN

      if (
        pathname.startsWith(
          "/admin"
        )
      ) {
        return (
          token.role ===
          "admin"
        );
      }

      // MODERATOR

      if (
        pathname.startsWith(
          "/moderator"
        )
      ) {
        return (
          token.role ===
          "moderator"
        );
      }

      // USER

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