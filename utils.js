import { TODAY } from './data.js';

export function formatDue(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function isOverdue(dateStr) {
  return new Date(dateStr + "T00:00:00") < TODAY;
}

export function getInitials(name) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

let _nextId = 100;
export function newId() { return ++_nextId; }

export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date("2025-06-09T12:00:00");
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "agora mesmo";
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  return `há ${Math.floor(diffInSeconds / 86400)} dias`;
}
