// import { AppSidebar } from "@/components/dashboard/app-sidebar";

// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SidebarProvider defaultOpen>
//       <AppSidebar />

//       <SidebarInset>
//         {/* TOP BAR */}
//         <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/70">
//           <SidebarTrigger />

//           <DashboardNavbar />
//         </div>

//         {/* PAGE */}
//         <main className="min-h-screen  bg-zinc-50 p-6 dark:bg-black">
//           {children}
//         </main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }



import { AppSidebar } from "@/components/dashboard/app-sidebar";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        {/* FIXED NAVBAR */}
        <DashboardNavbar />

        {/* PAGE CONTENT */}
        <main className="min-h-screen bg-white p-1 pt-8 dark:bg-black md:p-6 md:pt-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}