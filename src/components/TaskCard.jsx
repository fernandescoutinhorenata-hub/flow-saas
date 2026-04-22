import React, { useState } from 'react';
import Avatar from './Avatar.jsx';
import { formatDue, isOverdue } from '../utils.js';
import { PRIORITY_COLORS } from '../data.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TaskCard({ task, onClick, isDragging, onDragStart, onDragEnd, style: extStyle, animDelay, onAccept }) {
  const { currentUser } = useAuth();
  const overdue = isOverdue(task.due) && task.status !== "done";
  const pColor = PRIORITY_COLORS[task.priority];
  const prog = task.subtasks.total > 0 ? task.subtasks.done / task.subtasks.total : 0;
  const isAvailable = !task.assignee;
  const isMine = task.assigneeInitials === currentUser.initials;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="anim-fadeInUp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        border: isAvailable ? "1px dashed #2A2A2A" : "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 14px 14px 18px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        opacity: isDragging ? 0.35 : 1,
        transition: "all 0.15s",
        boxShadow: hovered && isAvailable ? "0 0 0 1px #00FF8720, 0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.4)",
        borderColor: hovered && isAvailable ? "var(--accent)" : (isAvailable ? "#2A2A2A" : "var(--border)"),
        animationDelay: animDelay || "0ms",
        ...extStyle,
      }}
    >
      {/* Priority bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 3, background: pColor, borderRadius: "10px 0 0 10px",
      }}/>

      {/* Available Badge */}
      {isAvailable && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "var(--accent-soft)", color: "var(--accent)",
          fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
          letterSpacing: "0.05em"
        }}>DISPONÍVEL</div>
      )}

      {/* Title */}
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.45, marginBottom: 8, paddingRight: isAvailable ? 70 : 0 }}>
        {task.title}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
          {task.tags.map(tag => (
            <span key={tag} style={{
              background: "var(--border)", color: "var(--text-secondary)",
              fontSize: 11, padding: "3px 7px", borderRadius: 4,
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        {isAvailable ? (
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px dashed #7A7A7A", display: "flex", alignItems: "center", justifyContent: "center", color: "#7A7A7A", fontSize: 12 }}>+</div>
        ) : (
          <Avatar initials={task.assigneeInitials} size={20} />
        )}
        
        <span style={{ fontSize: 12, color: overdue ? "#FF4C4C" : "var(--text-secondary)", flex: 1 }}>
          {overdue && "⚠ "}{formatDue(task.due)}
        </span>

        {isMine && !isAvailable && (
          <span style={{ fontSize: 10, color: "#7A7A7A", fontWeight: 500, marginRight: 8 }}>Aceito por você</span>
        )}

        {isAvailable && hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(task.id); }}
            style={{
              background: "var(--accent)", color: "#0D0D0D", border: "none",
              borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >Aceitar tarefa →</button>
        )}

        <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="0.5" y="0.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1"/>
            {task.subtasks.done > 0 && <path d="M2.5 5.5l2 2 4-4" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
          {task.subtasks.done}/{task.subtasks.total}
        </span>
      </div>

      {/* Progress bar */}
      {task.subtasks.total > 0 && (
        <div style={{ marginTop: 8, height: 2, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${prog * 100}%`, background: prog === 1 ? "var(--accent)" : "#FFB800", borderRadius: 99, transition: "width 0.3s" }}/>
        </div>
      )}
    </div>
  );
}
