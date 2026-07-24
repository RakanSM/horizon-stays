import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "./supabase";
import {
  DEFAULT_THEME_ID, DEFAULT_CONTENT, getTheme, getAllThemes, applyThemeToDOM,
  setCustomThemes, resolveScheduledTheme,
  type ThemeOverrides, type SiteContent, type ThemePreset, type ThemeSchedule,
} from "./themes";

type ThemeState = {
  activeThemeId: string;
  /** theme chosen manually in admin (before schedule resolution) */
  baseThemeId: string;
  overrides: Record<string, ThemeOverrides>; // per-theme overrides keyed by theme id
  content: SiteContent;
  theme: ThemePreset;
  loading: boolean;
  odooUrl: string;
  schedules: ThemeSchedule[];
  customThemes: ThemePreset[];
  /** id of the schedule currently forcing the theme, null if manual theme is shown */
  activeScheduleId: string | null;
  setOdooUrl: (token: string, url: string) => Promise<void>;
  /** preview mode: editor applies without saving */
  previewTheme: (id: string, ov?: ThemeOverrides) => void;
  /** persist via admin RPC */
  saveSettings: (token: string, id: string, allOverrides: Record<string, ThemeOverrides>) => Promise<void>;
  saveSchedules: (token: string, schedules: ThemeSchedule[]) => Promise<void>;
  saveCustomThemes: (token: string, themes: ThemePreset[]) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<ThemeState | null>(null);

const LS_KEY = "hs_theme_cache_v2";

type Cache = {
  id: string;
  overrides: Record<string, ThemeOverrides>;
  schedules?: ThemeSchedule[];
  customThemes?: ThemePreset[];
};

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Resolve schedule override → returns effective theme id */
function effective(baseId: string, schedules: ThemeSchedule[]): { id: string; scheduleId: string | null } {
  const scheduled = resolveScheduledTheme(schedules);
  if (scheduled && getAllThemes().some((t) => t.id === scheduled)) {
    const s = schedules.find((x) => x.enabled && x.themeId === scheduled);
    return { id: scheduled, scheduleId: s?.id || null };
  }
  return { id: baseId, scheduleId: null };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const cached = readCache();
  if (cached?.customThemes) setCustomThemes(cached.customThemes);
  const initialSchedules = cached?.schedules || [];
  const initialBase = cached?.id || DEFAULT_THEME_ID;
  const initialEff = effective(initialBase, initialSchedules);

  const [baseThemeId, setBaseThemeId] = useState(initialBase);
  const [activeThemeId, setActiveThemeId] = useState(initialEff.id);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(initialEff.scheduleId);
  const [overrides, setOverrides] = useState<Record<string, ThemeOverrides>>(cached?.overrides || {});
  const [schedules, setSchedules] = useState<ThemeSchedule[]>(initialSchedules);
  const [customThemesState, setCustomThemesState] = useState<ThemePreset[]>(cached?.customThemes || []);
  const [loading, setLoading] = useState(true);
  const [odooUrl, setOdooUrlState] = useState("");

  // Apply immediately from cache (no flash), then refresh from Supabase
  useEffect(() => {
    applyThemeToDOM(getTheme(activeThemeId), overrides[activeThemeId]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyState = useCallback(
    (base: string, ov: Record<string, ThemeOverrides>, sch: ThemeSchedule[], custom: ThemePreset[]) => {
      setCustomThemes(custom);
      const eff = effective(base, sch);
      setBaseThemeId(base);
      setActiveThemeId(eff.id);
      setActiveScheduleId(eff.scheduleId);
      setOverrides(ov);
      setSchedules(sch);
      setCustomThemesState(custom);
      applyThemeToDOM(getTheme(eff.id), ov[eff.id]);
      localStorage.setItem(LS_KEY, JSON.stringify({ id: base, overrides: ov, schedules: sch, customThemes: custom }));
    },
    []
  );

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("active_theme, overrides, odoo_url, schedules, custom_themes")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        const custom = ((data as any).custom_themes || []) as ThemePreset[];
        setCustomThemes(custom);
        const base = getAllThemes().some((t) => t.id === data.active_theme) ? data.active_theme : DEFAULT_THEME_ID;
        const ov = (data.overrides || {}) as Record<string, ThemeOverrides>;
        const sch = ((data as any).schedules || []) as ThemeSchedule[];
        setOdooUrlState((data as any).odoo_url || "");
        applyState(base, ov, sch, custom);
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, [applyState]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-evaluate schedules periodically (handles day rollover while page open)
  useEffect(() => {
    const iv = setInterval(() => {
      const eff = effective(baseThemeId, schedules);
      if (eff.id !== activeThemeId) {
        setActiveThemeId(eff.id);
        setActiveScheduleId(eff.scheduleId);
        applyThemeToDOM(getTheme(eff.id), overrides[eff.id]);
      }
    }, 60_000);
    return () => clearInterval(iv);
  }, [baseThemeId, schedules, activeThemeId, overrides]);

  const previewTheme = useCallback((id: string, ov?: ThemeOverrides) => {
    applyThemeToDOM(getTheme(id), ov);
  }, []);

  const saveSettings = useCallback(
    async (token: string, id: string, allOverrides: Record<string, ThemeOverrides>) => {
      const { error } = await supabase.rpc("admin_update_settings", {
        p_token: token,
        p_active_theme: id,
        p_overrides: allOverrides,
      });
      if (error) throw error;
      applyState(id, allOverrides, schedules, customThemesState);
    },
    [applyState, schedules, customThemesState]
  );

  const saveSchedules = useCallback(
    async (token: string, sch: ThemeSchedule[]) => {
      const { error } = await supabase.rpc("admin_set_schedules", { p_token: token, p_schedules: sch });
      if (error) throw error;
      applyState(baseThemeId, overrides, sch, customThemesState);
    },
    [applyState, baseThemeId, overrides, customThemesState]
  );

  const saveCustomThemes = useCallback(
    async (token: string, themes: ThemePreset[]) => {
      const { error } = await supabase.rpc("admin_set_custom_themes", { p_token: token, p_custom_themes: themes });
      if (error) throw error;
      applyState(baseThemeId, overrides, schedules, themes);
    },
    [applyState, baseThemeId, overrides, schedules]
  );

  const setOdooUrl = useCallback(async (token: string, url: string) => {
    const { error } = await supabase.rpc("admin_set_odoo_url", { p_token: token, p_url: url });
    if (error) throw error;
    setOdooUrlState(url);
  }, []);

  const theme = getTheme(activeThemeId);
  const content: SiteContent = { ...DEFAULT_CONTENT, ...(overrides[activeThemeId]?.content || {}) };

  return (
    <Ctx.Provider
      value={{
        activeThemeId, baseThemeId, overrides, content, theme, loading,
        previewTheme, saveSettings, refresh, odooUrl, setOdooUrl,
        schedules, customThemes: customThemesState, activeScheduleId,
        saveSchedules, saveCustomThemes,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme outside provider");
  return v;
}

/* ---------- Admin session ---------- */
const ADMIN_KEY = "hs_admin_token";

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_KEY) || localStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(tok: string) {
  localStorage.setItem(ADMIN_KEY, tok);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export async function adminLogin(password: string): Promise<string> {
  const { data, error } = await supabase.rpc("admin_login", { p_password: password });
  if (error) throw new Error("كلمة المرور غير صحيحة");
  setAdminToken(data as string);
  return data as string;
}

export async function adminCheck(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("admin_check", { p_token: token });
  if (error) return false;
  return !!data;
}
