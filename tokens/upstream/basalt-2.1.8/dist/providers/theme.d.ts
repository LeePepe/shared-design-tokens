import { type ReactNode } from "react";
export type BasaltTheme = "light" | "dark" | "system";
type ThemeContextValue = {
    theme: BasaltTheme;
    setTheme: (theme: BasaltTheme) => void;
};
export interface ThemeProviderProps {
    /**
     * Application components wrapped by the theme context.
     */
    children: ReactNode;
    /**
     * Storage key used for theme persistence.
     * @default "theme"
     */
    storageKey?: string;
    /**
     * Initial theme used when no stored preference exists or during SSR.
     * @default "system"
     */
    defaultTheme?: BasaltTheme;
    /**
     * Whether to persist theme changes to localStorage.
     * If false, localStorage is never read or written.
     * @default true
     */
    persist?: boolean;
    /**
     * Controlled theme value. When provided, the provider acts as a controlled component
     * and internal state is driven by this prop.
     */
    theme?: BasaltTheme;
    /**
     * Callback fired when theme change is requested.
     * In controlled mode, callers are responsible for updating `theme`.
     */
    onThemeChange?: (theme: BasaltTheme) => void;
    /**
     * Whether to apply mode classes and data-mode attribute to document.documentElement.
     * Set to false when a host theme system manages the document root.
     * @default true
     */
    applyToDocument?: boolean;
}
export declare function ThemeProvider({ children, storageKey, defaultTheme, persist, theme: controlledTheme, onThemeChange, applyToDocument, }: ThemeProviderProps): import("react").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export {};
