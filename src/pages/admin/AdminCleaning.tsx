import AdminLayout from "../../components/AdminLayout";
import { CleaningSection } from "../Admin";

export default function AdminCleaning() {
  return (
    <AdminLayout title="النظافة" subtitle="سجل النظافة وإدارة العاملات — صفحة العاملات: /cleaner">
      <CleaningSection />
    </AdminLayout>
  );
}
