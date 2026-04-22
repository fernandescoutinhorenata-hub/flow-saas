import React, { useState, useEffect, useRef } from 'react';
import Avatar from './Avatar.jsx';
import { PRIORITY_COLORS, PRIORITY_LABELS, COLUMNS } from '../data.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TaskModal({ task, onClose, onSave, onDelete, onAccept }) {
  const { currentUser, hasPermission } = useAuth();
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [desc, setDesc] = useState(task.description || "");
  const [subtasks, setSubtasks] = useState(
    Array.from({ length: task.subtasks.total }, (_, i) => ({ id: i, label: `Subtarefa ${i + 1}`, done: i < task.subtasks.done }))
  );
  const [priority, setPriority] = useState(task.priority);
  const [due, setDue] = useState(task.due);
  const titleRef = useRef();

  const isAvailable = !task.assignee;
  const isOwner = task.assigneeInitials === currentUser.initials;
  
  const canEdit = !isAvailable && (hasPermission("edit_any_task") || (isOwner && currentUser.role === "membro"));
  const showDelete = !isAvailable && (hasPermission("delete_task") || (isOwner && currentUser.role === "gestor"));

  useEffect(() => { if (editingTitle) titleRef.current?.focus(); }, [editingTitle]);

  const doneSub = subtasks.filter(s => s.done).length;
  const progPct = subtasks.length > 0 ? (doneSub / subtasks.length) * 100 : 0;

  function toggleSub(id) {
    if (!canEdit) return;
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  }

  function handleSave() {
    if (!canEdit) return;
    onSave({ ...task, title, description: desc, priority, due, subtasks: { done: doneSub, total: subtasks.length } });
  }

  const pBtns = [
    { key: "low",    label: "Baixa",   color: "#00FF87" },
    { key: "medium", label: "Média",   color: "#FFB800" },
    { key: "urgent", label: "Urgente", color: "#FF4C4C" },
  ];

  const activityLog = [
    { text: `${task.assignee || 'Sistema'} adicionou esta tarefa`, time: "há 3 dias" },
    { text: "Status alterado para Em Andamento", time: "há 1 dia" },
    { text: "Prazo atualizado", time: "há 2h" },
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="anim-scaleIn"
        style={{
          background: "var(--bg-modal)", border: "1px solid var(--border)",
          borderRadius: 16, width: 640, maxWidth: "100%",
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        {/* Modal header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {editingTitle && canEdit ? (
              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
                  color: "var(--text-primary)", width: "100%",
                  borderBottom: "1px solid var(--accent)",
                }}
              />
            ) : (
              <h2
                onClick={() => canEdit && setEditingTitle(true)}
                title={canEdit ? "Clique para editar" : ""}
                style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
                  color: "var(--text-primary)", cursor: canEdit ? "text" : "default", lineHeight: 1.3,
                }}
              >{title}</h2>
            )}
            <span style={{
              display: "inline-block", marginTop: 8,
              background: PRIORITY_COLORS[priority] + "20",
              color: PRIORITY_COLORS[priority],
              fontSize: 11, padding: "3px 8px", borderRadius: 4,
              fontWeight: 600, letterSpacing: "0.05em",
            }}>
              {PRIORITY_LABELS[priority].toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-secondary)", fontSize: 20, lineHeight: 1,
              transition: "color 0.15s", flexShrink: 0, marginTop: 2,
            }}
            onMouseOver={e => e.target.style.color = "var(--text-primary)"}
            onMouseOut={e => e.target.style.color = "var(--text-secondary)"}
          >✕</button>
        </div>

        {/* Modal body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left column */}
          <div style={{ flex: "0 0 60%", padding: "20px 16px 20px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Descrição</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                readOnly={!canEdit}
                placeholder={canEdit ? "Adicione uma descrição..." : "Sem descrição."}
                rows={3}
                style={{
                  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
                  padding: "10px 12px", resize: "vertical", outline: "none",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  transition: "border-color 0.15s",
                }}
                onFocus={e => canEdit && (e.target.style.borderColor = "#00FF8760")}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Subtasks */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Subtarefas
                </label>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{doneSub}/{subtasks.length}</span>
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${progPct}%`, background: "var(--accent)", borderRadius: 99, transition: "width 0.3s" }}/>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subtasks.map(s => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: canEdit ? "pointer" : "default" }}>
                    <div
                      onClick={() => toggleSub(s.id)}
                      style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: s.done ? `1.5px solid var(--accent)` : "1.5px solid var(--border)",
                        background: s.done ? "var(--accent-soft)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {s.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: s.done ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: s.done ? "line-through" : "none" }}>
                      {s.label}
                    </span>
                  </label>
                ))}
                {subtasks.length === 0 && <div style={{ fontSize: 12, color: "var(--text-disabled)", fontStyle: "italic" }}>Nenhuma subtarefa definida.</div>}
              </div>
            </div>

            {/* Activity */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Atividade</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activityLog.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: 11, color: "var(--text-disabled)", whiteSpace: "nowrap" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: "0 0 40%", padding: "20px 28px 20px 16px", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Assignee */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Responsável</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isAvailable ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-disabled)", fontStyle: "italic" }}>Sem responsável</span>
                    <button
                      onClick={() => onAccept(task.id)}
                      style={{
                        background: "var(--accent)", color: "#0D0D0D", border: "none",
                        borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}
                    >Aceitar tarefa →</button>
                  </div>
                ) : (
                  <>
                    <Avatar initials={task.assigneeInitials} size={24} />
                    <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{task.assignee}</span>
                  </>
                )}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Prazo</label>
              <input
                type="date"
                value={due}
                onChange={e => setDue(e.target.value)}
                readOnly={!canEdit}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
                  padding: "8px 10px", outline: "none", width: "100%",
                  fontFamily: "'DM Sans', sans-serif",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Prioridade</label>
              <div style={{ display: "flex", gap: 4 }}>
                {pBtns.map(b => (
                  <button
                    key={b.key}
                    onClick={() => canEdit && setPriority(b.key)}
                    style={{
                      flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                      cursor: canEdit ? "pointer" : "default", transition: "all 0.15s",
                      border: priority === b.key ? `1px solid ${b.color}` : "1px solid var(--border)",
                      background: priority === b.key ? b.color + "20" : "var(--bg-card)",
                      color: priority === b.key ? b.color : "var(--text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >{b.label}</button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Status</label>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--text-primary)" }}>
                {COLUMNS.find(c => c.id === task.status)?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {showDelete && (
            <button
              onClick={() => onDelete(task.id)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "#FF4C4C", fontSize: 13, padding: "9px 16px",
                borderRadius: 8, fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#FF4C4C15"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >Excluir tarefa</button>
          )}
          {canEdit && (
            <button
              onClick={handleSave}
              style={{
                background: "var(--accent)", border: "none", borderRadius: 8,
                color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, fontSize: 14, padding: "9px 24px",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseOver={e => e.target.style.background = "var(--accent-dark)"}
              onMouseOut={e => e.target.style.background = "var(--accent)"}
            >Salvar alterações</button>
          )}
        </div>
      </div>
    </div>
  );
}
