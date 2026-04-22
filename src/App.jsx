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
export default function App() {
  const [screen, setScreen] = useState("login");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeModal, setActiveModal] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dragState, setDragState] = useState({ dragId: null, overCol: null });
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("board");
  const [columns, setColumns] = useState(COLUMNS);
  const [confirmDeleteCol, setConfirmDeleteCol] = useState(null);
  const [registros, setRegistros] = useState(INITIAL_TICKETS);
  const toastTimer = useRef({});

  const { currentUser, hasPermission } = useAuth();

  function addToast(message) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, exiting: false }]);
    toastTimer.current[id] = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 2800);
  }

  function handleLogin() { setScreen("app"); }

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
    const task = tasks.find(t => t.id === dragId);
    if (!task || task.status === colId) return;
    setTasks(prev => prev.map(t => t.id === dragId ? { ...t, status: colId } : t));
    const colName = columns.find(c => c.id === colId)?.label;
    addToast(`"${task.title.slice(0, 30)}…" movido para ${colName}`);
    setDragState({ dragId: null, overCol: null });
  }

  function handleAddColumn(label) {
    const newCol = {
      id: `col_${Date.now()}`,
      label: label.toUpperCase(),
      locked: false
    };
    // Inserir entre EM ANDAMENTO (doing) e CONCLUÍDO (done)
    const newCols = [...columns];
    const doneIndex = newCols.findIndex(c => c.id === "done");
    newCols.splice(doneIndex, 0, newCol);
    setColumns(newCols);
    addToast(`Coluna "${newCol.label}" adicionada.`);
  }

  function handleRemoveColumn(columnId) {
    const col = columns.find(c => c.id === columnId);
    if (!col || col.locked) return;

    const tasksInCol = tasks.filter(t => t.status === columnId);
    if (tasksInCol.length > 0) {
      setTasks(prev => prev.map(t => t.status === columnId ? { ...t, status: "backlog" } : t));
      addToast(`${tasksInCol.length} tarefa(s) movida(s) para o Backlog`);
    }

    setColumns(prev => prev.filter(c => c.id !== columnId));
    setConfirmDeleteCol(null);
    addToast(`Coluna "${col.label}" removida.`);
  }

  function handleRenameColumn(columnId, newLabel) {
    if (currentUser.role !== "admin") return;
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, label: newLabel.toUpperCase() } : c));
    addToast("Coluna renomeada.");
  }

  function handleCardClick(task) { setActiveModal(task); }

  function handleSaveTask(updated) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setActiveModal(null);
    addToast("Tarefa salva com sucesso.");
  }

  function handleDeleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setActiveModal(null);
    addToast("Tarefa excluída.");
  }

  function handleCreateTask({ title, priority, due, status }) {
    const newTask = {
      id: newId(),
      title,
      priority,
      due,
      status,
      assignee: null,
      assigneeInitials: null,
      subtasks: { done: 0, total: 0 },
      tags: [],
      description: "",
    };
    setTasks(prev => [...prev, newTask]);
    setShowNewTask(false);
    addToast(`✅ Tarefa "${title}" criada!`);
  }

  function handleAcceptTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    if (currentUser.role === "membro" && task.assignee) {
      addToast("Esta tarefa já possui um responsável.");
      return;
    }

    const updatedTasks = tasks.map(t => t.id === id ? {
      ...t,
      assignee: currentUser.name === "Você" ? "Você" : currentUser.name,
      assigneeInitials: currentUser.initials
    } : t);
    
    setTasks(updatedTasks);
    if (activeModal && activeModal.id === id) {
      setActiveModal({ ...activeModal, assignee: currentUser.name, assigneeInitials: currentUser.initials });
    }
    addToast("✅ Tarefa aceita com sucesso!");
  }

  function handleCreateTicket(data) {
    const newTicket = {
      id: Date.now(),
      ...data,
      authorId: currentUser.id,
      author: currentUser.name,
      authorInitials: currentUser.initials,
      status: "aberto",
      createdAt: new Date().toISOString(),
      responses: [],
    };
    setRegistros(prev => [newTicket, ...prev]);
    addToast("Novo registro aberto com sucesso.");
  }

  function handleRespondTicket(ticketId, text) {
    setRegistros(prev => prev.map(t => {
      if (t.id === ticketId) {
        const response = {
          id: Date.now(),
          authorId: currentUser.id,
          author: currentUser.name,
          authorInitials: currentUser.initials,
          role: currentUser.role,
          text,
          createdAt: new Date().toISOString(),
        };
        return { ...t, responses: [...t.responses, response] };
      }
      return t;
    }));
    addToast("Resposta enviada.");
  }

  function handleUpdateTicketStatus(ticketId, status) {
    setRegistros(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    addToast("Status do registro atualizado.");
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === "mine") return t.assignee === "Você" || t.assigneeInitials === "VC";
    if (filter === "overdue") return isOverdue(t.due) && t.status !== "done";
    return true;
  });

  if (screen === "login") return <Login onLogin={handleLogin} />;

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
          {[{ key: "all", label: "Todas" }, { key: "mine", label: "Minhas" }, { key: "overdue", label: "Atrasadas" }].map(f => (
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

        <Avatar initials={currentUser.initials} size={32} roleBadge={currentUser.role} />
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
            {columns.map(col => (
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
            tickets={registros}
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
          <Settings currentUser={currentUser} hasPermission={hasPermission} />
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
