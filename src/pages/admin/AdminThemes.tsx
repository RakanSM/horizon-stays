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
  const [category, setCategory] = useState<"all" | "shopify" | "wordpress" | "luxury" | "celebration">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 48;
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

  const filteredThemes = allThemes.filter((t) => {
    if (category === "shopify") {
      if (!t.id.includes("shopify")) return false;
    } else if (category === "wordpress") {
      if (!t.id.includes("wordpress")) return false;
    } else if (category === "celebration") {
      if (!t.id.includes("ramadan") && !t.id.includes("eid") && !t.id.includes("riyadh") && !t.id.includes("celebration")) return false;
    } else if (category === "luxury") {
      if (t.id.includes("shopify") || t.id.includes("wordpress") || t.id.includes("ramadan") || t.id.includes("eid") || t.id.includes("celebration")) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.nameAr.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredThemes.length / pageSize) || 1;
  const paginatedThemes = filteredThemes.slice((page - 1) * pageSize, page * pageSize);

  const scheduledThemeIds = new Set(schedules.filter((s) => s.enabled).map((s) => s.themeId));

  return (
    <AdminLayout title="سوق الطُّبوع (Theme Market 2500+)" subtitle={`أكثر من 2,500 طابعاً متاحاً — متاجر Shopify، مدونات WordPress، فخامة الأفق، ومواسم الاحتفالات`}>
      {err && <div className="admin-err">{err}</div>}
      {toast && <div className="admin-toast">{toast}</div>}
      <div className="adm-toolbar" style={{ flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}>
        <div className="adm-tabs" style={{ flexWrap: "wrap" }}>
          <button className={`adm-tab ${category === "all" ? "active" : ""}`} onClick={() => { setCategory("all"); setPage(1); }}>الكل ({allThemes.length})</button>
          <button className={`adm-tab ${category === "shopify" ? "active" : ""}`} onClick={() => { setCategory("shopify"); setPage(1); }}>متاجر Shopify 🛍️</button>
          <button className={`adm-tab ${category === "wordpress" ? "active" : ""}`} onClick={() => { setCategory("wordpress"); setPage(1); }}>مدونات WordPress 📝</button>
          <button className={`adm-tab ${category === "luxury" ? "active" : ""}`} onClick={() => { setCategory("luxury"); setPage(1); }}>الفخامة والأفق ✨</button>
          <button className={`adm-tab ${category === "celebration" ? "active" : ""}`} onClick={() => { setCategory("celebration"); setPage(1); }}>المواسم والأعياد 🌙</button>
        </div>
        <div className="theme-actions">
          <input
            type="text"
            placeholder="بحث في 2500+ طابع..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc", background: "var(--card)", color: "var(--text)", minWidth: "220px" }}
          />
          <button className="btn-editor" onClick={() => navigate("/admin/editor")}>✨ محرر الطابع</button>
          <button className="btn-editor alt" onClick={() => navigate("/admin/editor?new=1")}>+ إنشاء طابع جديد</button>
        </div>
      </div>

      {activeScheduleId && (
        <div className="schedule-banner">
          📅 يعمل الموقع الآن بطابع مجدول «{getTheme(activeThemeId).nameAr}» — الطابع الأساسي: «{getTheme(baseThemeId).nameAr}»
        </div>
      )}

      <div style={{ margin: "12px 0", color: "var(--text-muted)", fontSize: "14px" }}>
        عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, filteredThemes.length)} من أصل {filteredThemes.length} طابعاً متاحاً
      </div>

      <div className="theme-grid" style={{ marginTop: "10px" }}>
        {paginatedThemes.map((t) => (
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "30px 0", flexWrap: "wrap" }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← السابق</button>
          <span style={{ padding: "8px 16px", alignSelf: "center", fontWeight: "bold" }}>صفحة {page} من {totalPages}</span>
          <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>التالي →</button>
        </div>
      )}

      <ScheduleSection />
    </AdminLayout>
  );
}
