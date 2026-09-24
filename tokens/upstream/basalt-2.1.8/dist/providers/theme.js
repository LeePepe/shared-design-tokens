"use client";
import { createPreferenceStore as e } from "../utils/preference-store.js";
import { createContext as t, useCallback as n, useContext as r, useEffect as i, useMemo as a, useState as o, useSyncExternalStore as s } from "react";
import { jsx as c } from "react/jsx-runtime";
//#region src/providers/theme.tsx
var l = "theme", u = t(null);
function d(e) {
	if (typeof document > "u") return;
	let t = document.documentElement, n = !1;
	try {
		typeof window < "u" && typeof window.matchMedia == "function" && (n = window.matchMedia("(prefers-color-scheme: dark)").matches);
	} catch {
		n = !1;
	}
	let r = e === "dark" || e === "system" && n;
	t.classList.toggle("dark", r), t.classList.toggle("light", !r), t.dataset.mode = r ? "dark" : "light";
}
function f(e) {
	return e === "light" || e === "dark" || e === "system";
}
function p({ children: t, storageKey: r = l, defaultTheme: p = "system", persist: m = !0, theme: h, onThemeChange: g, applyToDocument: _ = !0 }) {
	let v = h !== void 0, [y] = o(() => e({
		storageKey: r,
		defaultValue: p,
		persist: m,
		isValid: f,
		normalize: (e) => e,
		eventName: "basalt:theme-change"
	}));
	i(() => {
		y.updateConfig({
			storageKey: r,
			defaultValue: p,
			persist: m
		});
	}, [
		y,
		r,
		p,
		m
	]);
	let b = n(() => p, [p]), x = s(y.subscribe, y.getSnapshot, b), S = v ? h : x;
	i(() => {
		if (!(!_ || typeof window > "u") && (d(S), S === "system")) try {
			let e = window.matchMedia("(prefers-color-scheme: dark)"), t = () => d("system");
			return e.addEventListener("change", t), () => e.removeEventListener("change", t);
		} catch {
			return;
		}
	}, [S, _]);
	let C = n((e) => {
		if (v) {
			g?.(e);
			return;
		}
		y.setValue(e), g?.(e);
	}, [
		v,
		g,
		y
	]), w = a(() => ({
		theme: S,
		setTheme: C
	}), [S, C]);
	return /* @__PURE__ */ c(u.Provider, {
		value: w,
		children: t
	});
}
function m() {
	let e = r(u);
	if (!e) throw Error("useTheme must be used within ThemeProvider");
	return e;
}
//#endregion
export { p as ThemeProvider, m as useTheme };

//# sourceMappingURL=theme.js.map