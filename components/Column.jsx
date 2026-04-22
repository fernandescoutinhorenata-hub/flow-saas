import React, { useState } from 'react';
import TaskCard from './TaskCard.jsx';

export default function Column({ col, tasks, onCardClick, dragState, onDragStart, onDragEnd, onDrop, onDragOver, isAdmin, onRename, onRemove }) {
  const [isOver, setIsOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState(col.label);
  const [headerHovered, setHeaderHovered] = useState(false);

  const handleRename = () => {
    if (newLabel.trim() && newLabel.trim() !== col.label) {
      onRename(col.id, newLabel.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      style={{ width: 280, flexShrink: 0 }}
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(col.id); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onDrop(e, col.id); }}
    >
      <div style={{
        background: "var(--bg-surface)",
        border: isOver ? "1px solid #00FF8730" : "1px solid var(--border)",
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        transition: "border-color 0.15s, background 0.15s",
        background: isOver ? "#161616ee" : "var(--bg-surface)",
      }}>
        {/* Column header */}
        <div 
          onMouseEnter={() => setHeaderHovered(true)}
          onMouseLeave={() => setHeaderHovered(false)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px", height: 24 }}
        >
          {isEditing ? (
            <input
              autoFocus
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === "Enter" && handleRename()}
              style={{
                background: "#161616", border: "1px solid var(--accent)",
                color: "var(--text-primary)", fontSize: 11, fontWeight: 600,
                padding: "2px 4px", borderRadius: 4, outline: "none", width: "120px"
              }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {col.label}
              </span>
              {isAdmin && headerHovered && (
                <div className="anim-fadeIn" style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, padding: 2, color: "var(--text-secondary)" }} title="Renomear">✏️</button>
                  {!col.locked && (
                    <button 
                      onClick={() => onRemove(col.id)} 
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, padding: 2, color: "#3A3A3A" }} 
                      onMouseOver={e => e.currentTarget.style.color = "#FF4C4C"}
                      onMouseOut={e => e.currentTarget.style.color = "#3A3A3A"}
                      title="Remover coluna"
                    >🗑️</button>
                  )}
                </div>
              )}
            </div>
          )}
          <span style={{
            background: "var(--border)", color: "var(--text-secondary)",
            fontSize: 11, padding: "2px 7px", borderRadius: 4,
          }}>{tasks.length}</span>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onCardClick}
              isDragging={dragState.dragId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              animDelay={`${i * 50}ms`}
            />
          ))}
          {tasks.length === 0 && (
            <div style={{
              height: 60, border: "1px dashed var(--border)",
              borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-disabled)", fontSize: 12,
            }}>
              Solte aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
