// "use client";

// import { useSession, signOut } from "next-auth/react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { User, LogOut } from "lucide-react";
// import { MessageCircle } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

// export default function AdminNavbar() {
//   const { data: session } = useSession();
//   const router = useRouter();

//   const user = {
//     name: session?.user?.name || "Admin",
//     email: session?.user?.email || "admin@example.com",
//   };

//   const firstName = user.name.split(" ")[0];
//   const initials = user.name
//     .split(" ")
//     .slice(0, 2)
//     .map((name) => name.charAt(0).toUpperCase())
//     .join("");

//   const handleLogout = async () => {
//     await signOut({ redirect: false });
//     router.push("/");
//   };

//   return (
//     <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black bg-white px-4 dark:border-white/30 dark:bg-gradient-to-r dark:from-black dark:via-zinc-900 dark:to-black sm:px-6">
//       {/* LEFT */}
//       <div className="flex min-w-0 flex-1 items-center gap-3">
//         <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-400 sm:text-base">
//           Admin Dashboard
//         </h1>
//       </div>

//       {/* RIGHT */}
//       <div className="flex shrink-0 items-center gap-2 sm:gap-3">
//         {/* NOTIFICATION */}
//         <NotificationDropdown role="admin" />

//         {/* PROFILE */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <button className="flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-1 shadow-sm transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-black sm:h-11 sm:w-11 sm:text-base">
//                 {initials}
//               </div>
//             </button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent
//             align="end"
//             sideOffset={8}
//             className="w-64 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
//           >
//             {/* USER CARD */}
//             <div className="mb-1 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-black">
//                 {initials}
//               </div>

//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
//                   {user.name}
//                 </p>

//                 <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
//                   {user.email}
//                 </p>
//               </div>
//             </div>

//             <DropdownMenuSeparator />

//             <DropdownMenuItem asChild>
//               <Link
//                 href="/"
//                 className="flex h-11 items-center gap-3 rounded-xl px-3"
//               >
//                 <User className="h-4 w-4" />
//                 Home
//               </Link>
//             </DropdownMenuItem>

//             <DropdownMenuSeparator />

//                            <Link
//   href="/admin-dashboard/chat"
//   className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
// >
//   <MessageCircle className="h-4 w-4" />
//   Live Chat
// </Link>
//             <DropdownMenuSeparator />

//             <DropdownMenuItem
//               onClick={handleLogout}
//               className="flex h-11 items-center gap-3 rounded-xl px-3 text-red-500"
//             >
//               <LogOut className="h-4 w-4" />
//               Logout
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// }




"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { User, LogOut, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export default function AdminNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@example.com",
  };

  const firstName = user.name.split(" ")[0];
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black bg-white px-4 dark:border-white/30 dark:bg-gradient-to-r dark:from-black dark:via-zinc-900 dark:to-black sm:px-6">
      {/* LEFT */}
<div className="flex min-w-0 flex-1 items-center gap-3 pl-12 md:pl-0">
  <motion.h1
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-[length:200%_auto] bg-clip-text text-sm font-bold uppercase tracking-wider text-transparent animate-[shine_4s_linear_infinite] sm:text-base"
  >
    Admin Dashboard
  </motion.h1>
</div>

      {/* RIGHT */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* NOTIFICATION */}
        <NotificationDropdown role="admin" />

        {/* PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-1 shadow-sm transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-black sm:h-11 sm:w-11 sm:text-base">
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
          >
            {/* USER CARD */}
            <div className="mb-1 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-black">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {user.name}
                </p>

                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex h-11 items-center gap-3 rounded-xl px-3"
              >
                <User className="h-4 w-4" />
                Home
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/admin-dashboard/chat"
                className="flex h-11 items-center gap-3 rounded-xl px-3"
              >
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}