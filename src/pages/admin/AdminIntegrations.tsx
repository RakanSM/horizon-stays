import AdminLayout from "../../components/AdminLayout";
import ChannelsSection from "../../components/ChannelsSection";
import TTLockSection from "../../components/TTLockSection";
import { OdooSection } from "../Admin";

export default function AdminIntegrations() {
  return (
    <AdminLayout title="التكاملات" subtitle="القنوات (Airbnb / Gathern)، الأقفال الذكية TTLock، وتكامل Odoo ERP">
      <ChannelsSection />
      <TTLockSection />
      <OdooSection />
    </AdminLayout>
  );
}
