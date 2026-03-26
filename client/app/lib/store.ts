import { atom } from "jotai";

export type AppTheme = "light" | "dark" | "system";
export const colorScheme = atom<AppTheme>("system");
export const colorSchemePreference = atom<AppTheme>("system");

export type NavPanel = "incidents" | "resources" | "analytics" | null;
export const activePanelAtom = atom<NavPanel>(null);
