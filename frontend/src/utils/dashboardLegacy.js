// Legacy Dashboard Code - To be integrated later
// This contains the original MRI analysis dashboard functionality
// To use: import Dashboard from './components/Dashboard'

import { useEffect, useMemo, useRef, useState } from "react";

function clampApiBase(raw) {
  const v = String(raw || "").trim().replace(/\/+$/, "");
  return v || "http://127.0.0.1:5000";
}

function basenameFromPath(p) {
  const s = String(p || "");
  const parts = s.split(/[/\\]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function toHeatmapUrl(apiBase, maybePath) {
  const base = clampApiBase(apiBase);
  const p = (maybePath ?? "").toString().trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("heatmap/")) return `${base}/${p}`;
  if (p.startsWith("/heatmap/")) return `${base}${p}`;
  if (/[a-zA-Z]:\\/.test(p) || p.includes("\\") || p.includes("/heatmaps/") || p.includes("\\heatmaps\\")) {
    const fn = basenameFromPath(p);
    return fn ? `${base}/heatmap/${encodeURIComponent(fn)}` : "";
  }
  if (/\.(png|jpg|jpeg)$/i.test(p)) return `${base}/heatmap/${encodeURIComponent(basenameFromPath(p))}`;
  return "";
}

function splitComparisonIntoPanels(url) {
  if (!url) return null;
  return {
    original: { url, bgPos: "0% 0%" },
    heatmap: { url, bgPos: "50% 0%" },
    overlay: { url, bgPos: "100% 0%" },
  };
}

function confidenceTone(level) {
  const v = String(level || "").toLowerCase();
  if (v === "high") return { label: "High", cls: "bg-emerald-500/15 text-emerald-700 ring-emerald-200 dark:text-emerald-300 dark:ring-emerald-900/60" };
  if (v === "medium") return { label: "Medium", cls: "bg-amber-500/15 text-amber-800 ring-amber-200 dark:text-amber-300 dark:ring-amber-900/60" };
  if (v === "low") return { label: "Low", cls: "bg-rose-500/15 text-rose-700 ring-rose-200 dark:text-rose-300 dark:ring-rose-900/60" };
  return { label: level ? String(level) : "Unknown", cls: "bg-sky-500/15 text-sky-700 ring-sky-200 dark:text-sky-300 dark:ring-sky-900/60" };
}

function formatAge(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}`;
}

function validateFile(file) {
  if (!file) return { ok: false, msg: "Please upload an MRI image (PNG/JPG)." };
  const typeOk = ["image/png", "image/jpeg"].includes(file.type);
  const nameOk = /\.(png|jpg|jpeg)$/i.test(file.name || "");
  if (!typeOk && !nameOk) return { ok: false, msg: "Invalid file type. Please use PNG or JPG." };
  if (file.size <= 0) return { ok: false, msg: "Uploaded file is empty." };
  if (file.size > 50 * 1024 * 1024) return { ok: false, msg: "File too large. Maximum size is 50 MB." };
  if (/(heatmap|overlay|visualization|gradcam|grad_cam)/i.test(file.name || "")) {
    return { ok: false, msg: "This looks like a generated visualization. Please upload the original MRI image." };
  }
  return { ok: true, msg: "" };
}
