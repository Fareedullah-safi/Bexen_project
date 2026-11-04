import AdminShell from "@/app/Components/Admin/AdminShell";
import AdminThemeProvider from "@/app/Components/Admin/AdminThemeProvider";

export default function AdminLayout({ children }) {
  return (
    <AdminThemeProvider>
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  );
}
