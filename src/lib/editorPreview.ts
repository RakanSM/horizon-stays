import { createContext } from "react";
import type { SiteContent } from "./themes";

/** Lightweight bridge used only when the theme editor renders the public-site preview. */
export const EditorContentContext = createContext<SiteContent | null>(null);
