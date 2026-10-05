import AdminThemeProvider from "@/app/Components/Admin/AdminThemeProvider";
import AdminShell from "@/app/Components/Admin/AdminShell";

export default function AdminLayout({ children }) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}