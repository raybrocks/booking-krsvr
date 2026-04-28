import AdminDashboard from "@/components/AdminDashboard";
import AdminAuthWrapper from "@/components/AdminAuthWrapper";

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <AdminDashboard />
    </AdminAuthWrapper>
  );
}
