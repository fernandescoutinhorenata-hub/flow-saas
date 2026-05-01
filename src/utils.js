import { TODAY } from './data.js';
export { TODAY };

export const formatDate = (dateStr) => {
  if (!dateStr) return 'Sem prazo';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Sem prazo';
  return date.toLocaleDateString('pt-BR');
};

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return false;
  return d < TODAY;
}

export function getInitials(name) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

let _nextId = 100;
export function newId() { return ++_nextId; }

export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "agora mesmo";
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  return `há ${Math.floor(diffInSeconds / 86400)} dias`;
}
