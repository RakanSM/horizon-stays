import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "./supabase";
import {
  THEMES, DEFAULT_THEME_ID, DEFAULT_CONTENT, getTheme, applyThemeToDOM,
  type ThemeOverrides, type SiteContent, type ThemePreset,
} from "./themes";

type ThemeState = {
  activeThemeId: string;
  overrides: Record<string, ThemeOverrides>; // per-theme overrides keyed by theme id
  content: SiteContent;
  theme: ThemePreset;
  loading: boolean;
  odooUrl: string;
  setOdooUrl: (token: string, url: string) => Promise<void>;
  /** preview mode: editor applies without saving */
  previewTheme: (id: string, ov?: ThemeOverrides) => void;
  /** persist via admin RPC */
  saveSettings: (token: string, id: string, allOverrides: Record<string, ThemeOverrides>) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<ThemeState | null>(null);

const LS_KEY = "hs_theme_cache";

function readCache(): { id: string; overrides: Record<string, ThemeOverrides> } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const cached = readCache();
  const [activeThemeId, setActiveThemeId] = useState(cached?.id || DEFAULT_THEME_ID);
  const [overrides, setOverrides] = useState<Record<string, ThemeOverrides>>(cached?.overrides || {});
  const [loading, setLoading] = useState(true);
  const [odooUrl, setOdooUrlState] = useState("");

  // Apply immediately from cache (no flash), then refresh from Supabase
  useEffect(() => {
    applyThemeToDOM(getTheme(activeThemeId), overrides[activeThemeId]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.from("site_settings").select("active_theme, overrides, odoo_url").eq("id", 1).maybeSingle();
      if (data) {
        const id = THEMES.some((t) => t.id === data.active_theme) ? data.active_theme : DEFAULT_THEME_ID;
        const ov = (data.overrides || {}) as Record<string, ThemeOverrides>;
        setActiveThemeId(id);
        setOverrides(ov);
        setOdooUrlState((data as any).odoo_url || "");
        applyThemeToDOM(getTheme(id), ov[id]);
        localStorage.setItem(LS_KEY, JSON.stringify({ id, overrides: ov }));
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      setActiveThemeId(id);
      setOverrides(allOverrides);
      applyThemeToDOM(getTheme(id), allOverrides[id]);
      localStorage.setItem(LS_KEY, JSON.stringify({ id, overrides: allOverrides }));
    },
    []
  );

  const setOdooUrl = useCallback(async (token: string, url: string) => {
    const { error } = await supabase.rpc("admin_set_odoo_url", { p_token: token, p_url: url });
    if (error) throw error;
    setOdooUrlState(url);
  }, []);

  const theme = getTheme(activeThemeId);
  const content: SiteContent = { ...DEFAULT_CONTENT, ...(overrides[activeThemeId]?.content || {}) };

  return (
    <Ctx.Provider value={{ activeThemeId, overrides, content, theme, loading, previewTheme, saveSettings, refresh, odooUrl, setOdooUrl }}>
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
