import { useState, useEffect, useCallback } from "react";
import { getAdminToken } from "../lib/ThemeContext";
import { supabase } from "../lib/supabase";


type ChannelRow = {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  airbnb_url: string | null;
  gathern_url: string | null;
  airbnb_ical_url: string | null;
  gatherin_ical_url: string | null;
  ical_token: string | null;
};

const SITE = "https://horizonstay-sa.com";

export default function ChannelsSection() {
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<ChannelRow>>({});
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const tok = getAdminToken();
    if (!tok) return;
    const { data } = await supabase.rpc("admin_list_channels", { p_token: tok });
    if (data?.ok) setRows(data.properties || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRow = (r: ChannelRow) => {
    setOpen(open === r.id ? null : r.id);
    setDraft({
      airbnb_url: r.airbnb_url || "",
      gathern_url: r.gathern_url || "",
      airbnb_ical_url: r.airbnb_ical_url || "",
      gatherin_ical_url: r.gatherin_ical_url || "",
    });
    setMsg("");
  };

  const save = async (id: number) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusy(true);
    setMsg("");
    try {
      const { data, error } = await supabase.rpc("admin_update_channels", {
        p_token: tok,
        p_property_id: id,
        p_airbnb_url: draft.airbnb_url || "",
        p_gathern_url: draft.gathern_url || "",
        p_airbnb_ical: draft.airbnb_ical_url || "",
        p_gathern_ical: draft.gatherin_ical_url || "",
      });
      if (error || !data?.ok) {
        setMsg("فشل الحفظ — تحقق من الجلسة");
        return;
      }
      setMsg("تم حفظ روابط المنصات ✓");
      await load();
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setBusy(false);
    }
  };

  const syncNow = async (slug: string) => {
    const tok = getAdminToken();
    if (!tok) return;
    setSyncing(slug);
    setMsg("");
    try {
      const res = await fetch(`/api/property/${slug}/sync`, {
        method: "POST",
        headers: { "x-admin-token": tok },
      });
      const out = await res.json();
      if (res.ok) {
        const total = (out.synced || []).reduce((s: number, r: { events?: number }) => s + (r.events || 0), 0);
        setMsg(`تمت مزامنة «${slug}» — ${total} حجزاً من ${out.feedsConfigured} تقويم ✓`);
      } else {
        setMsg(`فشلت المزامنة: ${out.error || res.status}`);
      }
      setTimeout(() => setMsg(""), 5000);
    } catch {
      setMsg("فشلت المزامنة — تحقق من الاتصال");
    } finally {
      setSyncing(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setMsg("تم النسخ ✓");
    setTimeout(() => setMsg(""), 1500);
  };

  const filtered = filter
    ? rows.filter((r) => (r.name_en + r.name_ar + r.slug).toLowerCase().includes(filter.toLowerCase()))
    : rows;

  const gCount = rows.filter((r) => r.gatherin_ical_url).length;
  const aCount = rows.filter((r) => r.airbnb_ical_url).length;

  return (
    <div className="odoo-card channels-card">
      <div className="odoo-card-head">
        <div>
          <h2>المنصات وقنوات الحجز 🔗</h2>
          <p>
            إدارة روابط Airbnb وGathern لكل وحدة — روابط التقويم (iCal) للمزامنة، وروابط الإعلان للأزرار في صفحة الوحدة.
            لكل وحدة ٣ واجهات API: قراءة التوفر (JSON)، تصدير التقويم (iCal)، وتحديث المزامنة (POST).
          </p>
        </div>
        <div className="channels-stats" dir="ltr">
          <span className="odoo-status on">Airbnb {aCount}/{rows.length}</span>
          <span className="odoo-status on">Gathern {gCount}/{rows.length}</span>
        </div>
      </div>

      <input
        className="odoo-input channels-filter"
        placeholder="بحث عن وحدة…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="channels-list">
        {filtered.map((r) => (
          <div key={r.id} className={`channel-item ${open === r.id ? "open" : ""}`}>
            <button className="channel-row" onClick={() => openRow(r)}>
              <span className="ch-name">
                <strong>{r.name_ar}</strong>
                <small dir="ltr">{r.slug}</small>
              </span>
              <span className="ch-badges" dir="ltr">
                <i className={`ch-dot ${r.airbnb_ical_url ? "on" : ""}`} title="Airbnb iCal" >A</i>
                <i className={`ch-dot g ${r.gatherin_ical_url ? "on" : ""}`} title="Gathern iCal">G</i>
                <em>{open === r.id ? "▲" : "▼"}</em>
              </span>
            </button>

            {open === r.id && (
              <div className="channel-detail">
                <div className="sf-row">
                  <label>رابط إعلان Airbnb (يظهر زر «عرض على Airbnb»)</label>
                  <input dir="ltr" value={draft.airbnb_url || ""} placeholder="https://www.airbnb.com/rooms/…"
                    onChange={(e) => setDraft({ ...draft, airbnb_url: e.target.value })} />
                </div>
                <div className="sf-row">
                  <label>رابط إعلان Gathern (يظهر زر «عرض على Gathern»)</label>
                  <input dir="ltr" value={draft.gathern_url || ""} placeholder="https://gathern.co/unit/…"
                    onChange={(e) => setDraft({ ...draft, gathern_url: e.target.value })} />
                </div>
                <div className="sf-row">
                  <label>Airbnb iCal (استيراد الحجوزات من Airbnb)</label>
                  <input dir="ltr" value={draft.airbnb_ical_url || ""} placeholder="https://www.airbnb.com/calendar/ical/…ics?t=…"
                    onChange={(e) => setDraft({ ...draft, airbnb_ical_url: e.target.value })} />
                </div>
                <div className="sf-row">
                  <label>Gathern iCal (استيراد الحجوزات من Gathern)</label>
                  <input dir="ltr" value={draft.gatherin_ical_url || ""} placeholder="https://gathern.co/calendar/ical/…"
                    onChange={(e) => setDraft({ ...draft, gatherin_ical_url: e.target.value })} />
                </div>

                <div className="channel-endpoints" dir="ltr">
                  <div className="ce-row">
                    <span className="ce-method get">GET</span>
                    <code onClick={() => copy(`${SITE}/api/property/${r.slug}/availability`)} title="اضغط للنسخ">
                      /api/property/{r.slug}/availability
                    </code>
                    <small>التوفر JSON</small>
                  </div>
                  <div className="ce-row">
                    <span className="ce-method get">GET</span>
                    <code onClick={() => copy(`${SITE}/api/ical/${r.slug}?token=${r.ical_token || ""}`)} title="اضغط للنسخ">
                      /api/ical/{r.slug}?token=•••
                    </code>
                    <small>تصدير iCal — الصقه في Airbnb/Gathern</small>
                  </div>
                  <div className="ce-row">
                    <span className="ce-method post">POST</span>
                    <code onClick={() => copy(`${SITE}/api/property/${r.slug}/sync`)} title="اضغط للنسخ">
                      /api/property/{r.slug}/sync
                    </code>
                    <small>مزامنة فورية</small>
                  </div>
                </div>

                <div className="theme-actions">
                  <button className="btn-activate" onClick={() => save(r.id)} disabled={busy}>
                    {busy ? "..." : "حفظ الروابط"}
                  </button>
                  <button className="btn-ghost" onClick={() => syncNow(r.slug)} disabled={syncing === r.slug}>
                    {syncing === r.slug ? "جارٍ المزامنة…" : "⟳ مزامنة الآن"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}
