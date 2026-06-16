import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminNavbar from "@/components/admin/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="admin-root"
      className="flex h-screen overflow-hidden bg-zinc-950"
    >
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}