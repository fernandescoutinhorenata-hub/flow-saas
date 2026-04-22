import React, { useState, useRef } from 'react';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Column from './components/Column.jsx';
import TaskModal from './components/TaskModal.jsx';
import NewTaskModal from './components/NewTaskModal.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import Toast from './components/Toast.jsx';
import Avatar from './components/Avatar.jsx';
import { INITIAL_TASKS, COLUMNS, INITIAL_TICKETS, PERMISSIONS } from './data.js';
import { isOverdue, newId, timeAgo } from './utils.js';
import Registros from './views/Registros.jsx';
import Dashboard from './views/Dashboard.jsx';
import Timeline from './views/Timeline.jsx';
import Reports from './views/Reports.jsx';
import Settings from './views/Settings.jsx';
import NewColumnButton from './components/NewColumnGhost.jsx';
import RoleSelector from './components/RoleSelector.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useTasks } from './hooks/useTasks.js';
import { useColumns } from './hooks/useColumns.js';
import { useRegistros } from './hooks/useRegistros.js';
export default function App() {
  const { user, profile, currentUser, loading: authLoading, hasPermission, signOut } = useAuth();
  
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, moveTask } = useTasks();
  const { columns, addColumn, removeColumn, renameColumn } = useColumns();
  const { tickets, createTicket, respondTicket, updateTicketStatus } = useRegistros();
  
  const [activeModal, setActiveModal] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dragState, setDragState] = useState({ dragId: null, overCol: null });
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("board");
  const [confirmDeleteCol, setConfirmDeleteCol] = useState(null);
  const toastTimer = useRef({});


  function addToast(message) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, exiting: false }]);
    toastTimer.current[id] = setTimeout(() => {
      setToasts(prev => (prev || []).map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => (prev || []).filter(t => t.id !== id)), 350);
    }, 2800);
  }

  function handleLogin() { /* Não necessário mais com Auth real */ }

  function handleDragStart(e, taskId) {
    e.dataTransfer.effectAllowed = "move";
    setDragState(prev => ({ ...prev, dragId: taskId }));
  }

  function handleDragEnd() {
    setDragState({ dragId: null, overCol: null });
  }

  function handleDrop(e, colId) {
    e.preventDefault();
    const { dragId } = dragState;
    if (!dragId) return;
    const task = (tasks || []).find(t => t.id === dragId);
    if (!task || task.status === colId) return;
    
    moveTask(dragId, colId);
    
    const colName = (columns || []).find(c => c.id === colId)?.label;
    addToast(`"${task.title.slice(0, 30)}…" movido para ${colName}`);
    setDragState({ dragId: null, overCol: null });
  }

  function handleAddColumn(label) {
    addColumn(label);
    addToast(`Coluna "${label.toUpperCase()}" adicionada.`);
  }

  function handleRemoveColumn(columnId) {
    const col = (columns || []).find(c => c.id === columnId);
    if (!col || col.locked) return;

    removeColumn(columnId);
    setConfirmDeleteCol(null);
    addToast(`Coluna "${col.label}" removida.`);
  }

  function handleRenameColumn(columnId, newLabel) {
    if (currentUser.role !== "admin") return;
    renameColumn(columnId, newLabel);
    addToast("Coluna renomeada.");
  }

  function handleCardClick(task) { setActiveModal(task); }

  function handleSaveTask(updated) {
    updateTask(updated.id, updated);
    setActiveModal(null);
    addToast("Tarefa salva com sucesso.");
  }

  function handleDeleteTask(id) {
    deleteTask(id);
    setActiveModal(null);
    addToast("Tarefa excluída.");
  }

  function handleCreateTask({ title, priority, due, status }) {
    const newTask = {
      title,
      priority,
      due,
      status,
      assignee: null,
      assigneeInitials: null,
      subtasks: { done: 0, total: 0 },
      tags: [],
      description: "",
      position: (tasks || []).length
    };
    createTask(newTask);
    setShowNewTask(false);
    addToast(`✅ Tarefa "${title}" criada!`);
  }

  function handleAcceptTask(id) {
    const task = (tasks || []).find(t => t.id === id);
    if (!task) return;
    
    if (currentUser.role === "membro" && task.assignee) {
      addToast("Esta tarefa já possui um responsável.");
      return;
    }

    const updates = {
      assignee: currentUser.name === "Você" ? "Você" : currentUser.name,
      assigneeInitials: currentUser.initials
    };
    
    updateTask(id, updates);
    if (activeModal && activeModal.id === id) {
      setActiveModal({ ...activeModal, ...updates });
    }
    addToast("✅ Tarefa aceita com sucesso!");
  }

  function handleCreateTicket(data) {
    const newTicket = {
      ...data,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_initials: currentUser.initials,
      status: "aberto",
    };
    createTicket(newTicket);
    addToast("Novo registro aberto com sucesso.");
  }

  function handleRespondTicket(ticketId, text) {
    const response = {
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_initials: currentUser.initials,
      author_role: currentUser.role,
      text,
    };
    respondTicket(ticketId, response);
    addToast("Resposta enviada.");
  }

  function handleUpdateTicketStatus(ticketId, status) {
    updateTicketStatus(ticketId, status);
    addToast("Status do registro atualizado.");
  }

  const filteredTasks = (tasks || []).filter(t => {
    if (filter === "mine") return t.assignee === "Você" || t.assigneeInitials === "VC";
    if (filter === "overdue") return isOverdue(t.due) && t.status !== "done";
    return true;
  });

  if (authLoading) return (
    <div style={{ 
      display: 'flex', alignItems: 'center', 
      justifyContent: 'center', height: '100vh',
      color: 'var(--accent)', 
      fontFamily: "'Syne', sans-serif",
      fontSize: 24, gap: 12,
      background: "var(--bg-base)"
    }}>
      <span className="anim-pulse">FLOW</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>validando acesso...</span>
    </div>
  );

  if (!user) return <Login />;

  if (tasksLoading) return (
    <div style={{ 
      display: 'flex', alignItems: 'center', 
      justifyContent: 'center', height: '100vh',
      color: 'var(--accent)', 
      fontFamily: "'Syne', sans-serif",
      fontSize: 24, gap: 12,
      background: "var(--bg-base)"
    }}>
      <span className="anim-pulse">FLOW</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>carregando dados...</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <header style={{
        height: 56, background: "var(--bg-base)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 20px",
        gap: 16, flexShrink: 0, zIndex: 100,
      }}>
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 16, padding: "6px", borderRadius: 6, transition: "color 0.15s, background 0.15s" }}
          onMouseOver={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
          onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
        >☰</button>

        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          FLOW<span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <button style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
            padding: "6px 14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Projeto Alpha ▾
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 2 }}>
          {([{ key: "all", label: "Todas" }, { key: "mine", label: "Minhas" }, { key: "overdue", label: "Atrasadas" }] || []).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: filter === f.key ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 13, padding: "6px 10px", borderRadius: 6,
                borderBottom: filter === f.key ? "2px solid var(--accent)" : "2px solid transparent",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              }}
            >{f.label}</button>
          ))}
        </div>

        <button
          onClick={() => setShowNewTask(true)}
          style={{
            background: "transparent", border: "1px solid var(--accent)", borderRadius: 8,
            color: "var(--accent)", fontSize: 13, fontWeight: 500, padding: "7px 14px",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nova Tarefa
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={currentUser?.initials} size={32} roleBadge={currentUser?.role} />
          <button 
            onClick={signOut}
            title="Sair"
            style={{ 
              background: "none", border: "none", color: "var(--text-secondary)", 
              cursor: "pointer", fontSize: 18, padding: "4px", borderRadius: 6,
              transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            onMouseOver={e => { e.currentTarget.style.color = "#FF4C4C"; e.currentTarget.style.background = "rgba(255, 76, 76, 0.1)"; }}
            onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar collapsed={sidebarCollapsed} activeNav={activeNav} setActiveNav={setActiveNav} />

        {activeNav === "board" && (
          <main style={{
            flex: 1, overflowX: "auto", overflowY: "hidden",
            padding: "20px 24px",
            display: "flex", gap: 16, alignItems: "flex-start",
          }}>
            {(columns || []).map(col => (
              <Column
                key={col.id}
                col={col}
                tasks={filteredTasks.filter(t => t.status === col.id)}
                onCardClick={handleCardClick}
                dragState={dragState}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onDragOver={colId => setDragState(prev => ({ ...prev, overCol: colId }))}
                onAccept={handleAcceptTask}
                isAdmin={currentUser.role === "admin"}
                onRename={handleRenameColumn}
                onRemove={(id) => {
                  const col = columns.find(c => c.id === id);
                  const count = tasks.filter(t => t.status === id).length;
                  setConfirmDeleteCol({ id, label: col.label, taskCount: count });
                }}
              />
            ))}
            
            {currentUser.role === "admin" && (
              <NewColumnButton onAdd={handleAddColumn} />
            )}
          </main>
        )}

        {activeNav === "registros" && (
          <Registros
            tickets={tickets}
            onUpdateStatus={handleUpdateTicketStatus}
            onCreate={handleCreateTicket}
            onRespond={handleRespondTicket}
            currentUser={currentUser}
          />
        )}
        
        {activeNav === "home" && (
          <Dashboard tasks={tasks} onTaskClick={handleCardClick} />
        )}

        {activeNav === "timeline" && (
          <Timeline />
        )}

        {activeNav === "reports" && (
          <Reports tasks={tasks} />
        )}

        {activeNav === "settings" && (
          <Settings currentUser={currentUser} hasPermission={hasPermission} addToast={addToast} />
        )}
      </div>

      {/* Confirmation Modal for Column Removal */}
      {confirmDeleteCol && (
        <div className="anim-fadeIn" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: "var(--bg-modal)", width: "100%", maxWidth: 400, borderRadius: 16, border: "1px solid var(--border)", padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Remover coluna?</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.5 }}>
              {confirmDeleteCol.taskCount === 0 
                ? `A coluna "${confirmDeleteCol.label}" será removida.`
                : `A coluna "${confirmDeleteCol.label}" tem ${confirmDeleteCol.taskCount} tarefa(s). Elas serão movidas para o Backlog.`
              }
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmDeleteCol(null)} style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", padding: "12px", fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => handleRemoveColumn(confirmDeleteCol.id)} style={{ flex: 1, background: "var(--status-urgent)", color: "#F0F0F0", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal && (
        <TaskModal
          task={activeModal}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAccept={handleAcceptTask}
        />
      )}
      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onCreate={handleCreateTask}
          columns={columns}
        />
      )}

      {/* Tweaks */}
      <TweaksPanel />

      {/* Role Selector (Dev Only) */}
      <RoleSelector />

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}
