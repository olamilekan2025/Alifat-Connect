import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    role?: string;
    verified?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await connectToDatabase();

  const params = (await searchParams) ?? {};

  const page = Math.max(1, Number(params.page ?? "1"));
  const search = params.search?.trim() ?? "";
  const role = params.role ?? "";
  const verified = params.verified ?? "";

  const query: Record<string, any> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escaped, "i");

    query.$or = [
      { name: regex },
      { firstname: regex },
      { lastname: regex },
      { email: regex },
      { phone: regex },
      { referralCode: regex },
      { subscriptionType: regex },
    ];
  }

  if (role) {
    // Schema role enum: admin | user | moderator
    // Seller is represented by accountType
    if (role === "seller") {
      query.accountType = "seller";
    } else {
      query.role = role;
    }
  }

  if (verified === "true") {
    query.emailVerified = true;
  }

  if (verified === "false") {
    query.emailVerified = false;
  }

  const [
    users,
    totalUsers,
    verifiedUsers,
    adminUsers,
    sellerUsers,
    filteredCount,
  ] = await Promise.all([
    User.find(query)
      .select(
        [
          "name",
          "firstname",
          "lastname",
          "email",
          "phone",
          "role",
          "accountType",
          "walletBalance",
          "emailVerified",
          "subscriptionActive",
          "subscriptionType",
          "referralCode",
          "referralsCount",
          "createdAt",
        ].join(" "),
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),

    User.countDocuments(),

    User.countDocuments({
      emailVerified: true,
    }),

    User.countDocuments({
      role: "admin",
    }),

    User.countDocuments({
      accountType: "seller",
    }),

    User.countDocuments(query),
  ]);

  const totalPages =
    filteredCount === 0 ? 1 : Math.ceil(filteredCount / PAGE_SIZE);

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-b from-background to-muted/20 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Users Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage platform users, roles, subscriptions and activity.
          </p>
        </div>
        <div className="w-full rounded-2xl border bg-card px-5 py-4 shadow-sm sm:w-auto sm:px-6">
          <p className="text-xs uppercase text-muted-foreground">
            Total Registered
          </p>
          <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <p className="text-muted-foreground text-sm">Total Users</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">{totalUsers}</h2>
        </div>

        <div className="rounded-3xl border bg-emerald-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-emerald-700 text-sm">Verified Users</p>
          <h2 className="mt-3 text-4xl font-black text-emerald-600">
            {verifiedUsers}
          </h2>
        </div>

        <div className="rounded-3xl border bg-red-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-red-700 text-sm">Admins</p>
          <h2 className="mt-3 text-4xl font-black text-red-600">
            {adminUsers}
          </h2>
        </div>

        <div className="rounded-3xl border bg-yellow-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-yellow-700 text-sm">Sellers</p>
          <h2 className="mt-3 text-4xl font-black text-yellow-600">
            {sellerUsers}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users..."
            className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2"
          />

          <select
            name="role"
            defaultValue={role}
            className="h-12 rounded-xl border bg-background px-4"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
          </select>

          <select
            name="verified"
            defaultValue={verified}
            className="h-12 rounded-xl border bg-background px-4"
          >
            <option value="">Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <button
            className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold transition hover:scale-[1.02]"
            type="submit"
          >
            Apply Filters
          </button>

          <Link
            href="/admin/users"
            className="flex h-12 items-center justify-center rounded-xl border px-4 transition hover:bg-muted"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
              <tr className="text-left text-sm font-semibold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Wallet</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Referrals</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user: any) => {
                const fullName =
                  user.name ||
                  `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() ||
                  "-";

                return (
                  <tr
                    key={String(user._id)}
                    className="border-t transition hover:bg-muted/40"
                  >
                    <td className="px-4 py-4 sm:px-6 sm:py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold">
                          {fullName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
  <div className="truncate font-semibold">
    {fullName}
  </div>

  <div className="truncate text-sm text-muted-foreground">
    {user.email}
  </div>

  <div className="truncate text-xs text-muted-foreground">
    {user.phone || "-"}
  </div>
</div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-mono font-semibold">
                      ₦{Number(user.walletBalance ?? 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-5">
                      {user.emailVerified ? (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      {user.subscriptionActive ? (
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-700">
                          {user.subscriptionType}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {user.referralsCount ?? 0}
                    </td>

                    <td className="px-6 py-5 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-muted-foreground"
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm text-muted-foreground">
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </p>

       <div className="flex flex-wrap gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}&search=${encodeURIComponent(
                search,
              )}&role=${role}&verified=${verified}`}
             className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={`?page=${page + 1}&search=${encodeURIComponent(
                search,
              )}&role=${role}&verified=${verified}`}
             className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
