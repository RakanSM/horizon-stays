import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getAllThemes, getTheme } from "../../lib/themes";
import { useTheme, getAdminToken, clearAdminToken } from "../../lib/ThemeContext";
import { ThemeSwatch, ScheduleSection } from "../Admin";

export default function AdminThemes() {
  const { activeThemeId, baseThemeId, overrides, saveSettings, schedules, activeScheduleId } = useTheme();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const allThemes = getAllThemes();

  const activate = async (id: string) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusyId(id);
    try {
      await saveSettings(tok, id, overrides);
      setToast(`تم تفعيل طابع «${getTheme(id).nameAr}»`);
      setTimeout(() => setToast(""), 2500);
    } catch {
      setErr("انتهت الجلسة — سجّل الدخول مجدداً");
      clearAdminToken();
    } finally {
      setBusyId(null);
    }
  };

  const scheduledThemeIds = new Set(schedules.filter((s) => s.enabled).map((s) => s.themeId));

  return (
    <AdminLayout title="الطُّبوع (الثيمات)" subtitle={`${allThemes.length} طابعاً جاهزاً — بينها طُبوع موسمية لرمضان والعيدين وطابع فني بتأثير Parallax`}>
      {err && <div className="admin-err">{err}</div>}
      {toast && <div className="admin-toast">{toast}</div>}
      <div className="adm-toolbar">
        <div />
        <div className="theme-actions">
          <button className="btn-editor" onClick={() => navigate("/admin/editor")}>✨ محرر الطابع</button>
          <button className="btn-editor alt" onClick={() => navigate("/admin/editor?new=1")}>+ إنشاء طابع جديد</button>
        </div>
      </div>
      {activeScheduleId && (
        <div className="schedule-banner">
          📅 يعمل الموقع الآن بطابع مجدول «{getTheme(activeThemeId).nameAr}» — الطابع الأساسي: «{getTheme(baseThemeId).nameAr}»
        </div>
      )}
      <div className="theme-grid">
        {allThemes.map((t) => (
          <ThemeSwatch
            key={t.id}
            t={t}
            active={t.id === activeThemeId}
            scheduled={scheduledThemeIds.has(t.id)}
            onActivate={() => activate(t.id)}
            busy={busyId === t.id}
          />
        ))}
      </div>
      <ScheduleSection />
    </AdminLayout>
  );
}
