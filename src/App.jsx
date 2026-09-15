import React, { useState, useRef, Suspense } from 'react';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import TaskModal from './components/TaskModal.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import Toast from './components/Toast.jsx';
import Avatar from './components/Avatar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import RoleSelector from './components/RoleSelector.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useTasks } from './hooks/useTasks.js';
import { useRegistros } from './hooks/useRegistros.js';
import { useProjects } from './hooks/useProjects.js';
import { useUsers } from './hooks/useUsers.js';

const Registros = React.lazy(() => import('./views/Registros.jsx'));
const Dashboard = React.lazy(() => import('./views/Dashboard.jsx'));
const Canal = React.lazy(() => import('./views/Canal.jsx'));
const Timeline = React.lazy(() => import('./views/Timeline.jsx'));
const Reports = React.lazy(() => import('./views/Reports.jsx'));
const Producao = React.lazy(() => import('./views/Producao.jsx'));
const Settings = React.lazy(() => import('./views/Settings.jsx'));
const Archive = React.lazy(() => import('./views/Archive.jsx'));
const PlanejamentoSemanal = React.lazy(() => import('./views/PlanejamentoSemanal.jsx'));

function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
      <span className="anim-pulse">FLOW</span>
      <span>carregando...</span>
    </div>
  );
}

export default function App() {
  const { user, currentUser, loading: authLoading, signOut } = useAuth();
  const { projects, selectedProject, setSelectedProject, createProject, updateProject, deleteProject, addMember, removeMember, loading: projectsLoading } = useProjects(currentUser);
  const { users, toggleUserActive, deleteUser } = useUsers();

  const { archivedTasks, updateTask, deleteTask } = useTasks(selectedProject?.id);
  const { tickets, createTicket, respondTicket, updateTicketStatus, deleteTicket } = useRegistros();

  const [activeModal, setActiveModal] = useState(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("board");
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const toastTimer = useRef({});

  React.useEffect(() => {
    const handleNav = (e) => setActiveNav(e.detail);
    window.addEventListener('nav-change', handleNav);
    return () => window.removeEventListener('nav-change', handleNav);
  }, []);

  function addToast(message) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, exiting: false }]);
    toastTimer.current[id] = setTimeout(() => {
      setToasts(prev => (prev || []).map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => (prev || []).filter(t => t.id !== id)), 350);
    }, 2800);
  }

  function handleCardClick(task) { setActiveModal(task); }

  function handleDeleteTask(id) {
    deleteTask(id);
    setActiveModal(null);
    addToast("Tarefa excluída.");
  }

  function handleCreateTicket(data) {
    const newTicket = {
      ...data,
      author_id: currentUser?.id,
      author_initials: currentUser?.initials,
      author: currentUser?.name,
      status: "aberto",
    };
    createTicket(newTicket);
    addToast("Novo registro aberto com sucesso.");
  }

  function handleRespondTicket(ticketId, text) {
    respondTicket(ticketId, text);
    addToast("Resposta enviada.");
  }

  function handleUpdateTicketStatus(ticketId, status) {
    updateTicketStatus(ticketId, status);
    addToast("Status do registro atualizado.");
  }

  function handleDeleteTicket(id) {
    deleteTicket(id);
    addToast("Registro excluído.");
  }

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

  if (user && !currentUser) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        background: 'var(--bg-base)', color: 'var(--accent)',
        fontFamily: "'Syne', sans-serif", fontSize: 24, gap: 12
      }}>
        <span className="anim-pulse">FLOW</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>carregando perfil...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <header style={{
        height: 56, background: "var(--bg-base)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 20px",
        gap: 16, flexShrink: 0, zIndex: 100,
      }}>
        <button
          onClick={() => isMobile ? setMobileOpen(p => !p) : setSidebarCollapsed(p => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 16, padding: "6px", borderRadius: 6, transition: "color 0.15s, background 0.15s" }}
          onMouseOver={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
          onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
        >☰</button>

        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          FLOW<span style={{ color: "var(--accent)" }}>.</span>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowProjectMenu(!showProjectMenu)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, padding: '6px 14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedProject?.name || 'Selecionar projeto'}</div>
                {selectedProject && (
                  <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, marginTop: -2 }}>{selectedProject.fase}</div>
                )}
              </div>
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 4 }}>▾</span>
            </button>

            {showProjectMenu && (
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8, background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 12, minWidth: 200, zIndex: 2000, boxShadow: '0 10px 32px rgba(0,0,0,0.5)', padding: 6 }}>
                {projects.length === 0 && (
                  <div style={{ padding: '12px', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>Nenhum projeto encontrado</div>
                )}
                {projects.map(p => (
                  <div key={p.id} onClick={() => { setSelectedProject(p); setShowProjectMenu(false) }}
                    className="dropdown-item"
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderRadius: 6,
                      color: selectedProject?.id === p.id ? 'var(--accent)' : 'var(--text-primary)',
                      background: selectedProject?.id === p.id ? 'var(--accent-soft)' : 'transparent',
                      transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                    onMouseOver={e => { if (selectedProject?.id !== p.id) e.currentTarget.style.background = 'var(--bg-surface)' }}
                    onMouseOut={e => { if (selectedProject?.id !== p.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span>{p.name}</span>
                    <span style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.5 }}>{p.fase}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={currentUser?.initials || '?'} avatarUrl={currentUser?.avatar_url} size={32} roleBadge={currentUser?.role} />
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
        <Sidebar
          collapsed={sidebarCollapsed}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <Suspense fallback={<PageLoader />}>
          {activeNav === "board" && (
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ErrorBoundary>
                <PlanejamentoSemanal selectedProject={selectedProject} addToast={addToast} />
              </ErrorBoundary>
            </main>
          )}

          {activeNav === "registros" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Registros
                tickets={tickets}
                onUpdateStatus={handleUpdateTicketStatus}
                onCreate={handleCreateTicket}
                onRespond={handleRespondTicket}
                onDelete={handleDeleteTicket}
                currentUser={currentUser}
              />
            </main>
          )}

          {activeNav === "home" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Dashboard onTaskClick={handleCardClick} />
            </main>
          )}

          {activeNav === "canal" && (
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ErrorBoundary>
                <Canal users={users} addToast={addToast} />
              </ErrorBoundary>
            </main>
          )}

          {activeNav === "producao" && (
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ErrorBoundary>
                <Producao addToast={addToast} />
              </ErrorBoundary>
            </main>
          )}

          {activeNav === "timeline" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Timeline users={users} />
            </main>
          )}

          {activeNav === "reports" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Reports />
            </main>
          )}

          {activeNav === "settings" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <ErrorBoundary>
                <Settings
                  currentUser={currentUser}
                  addToast={addToast}
                  projects={projects}
                  projectsLoading={projectsLoading}
                  createProject={createProject}
                  updateProject={updateProject}
                  deleteProject={deleteProject}
                  addMember={addMember}
                  removeMember={removeMember}
                  users={users}
                  toggleUserActive={toggleUserActive}
                  deleteUser={deleteUser}
                />
              </ErrorBoundary>
            </main>
          )}

          {activeNav === "archive" && (
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Archive tasks={archivedTasks} users={users} />
            </main>
          )}
        </Suspense>
      </div>

      {/* Modal de tarefa (aberto via Dashboard) */}
      {activeModal && (
        <TaskModal
          task={activeModal}
          onClose={() => setActiveModal(null)}
          onUpdate={updateTask}
          onDelete={handleDeleteTask}
          addToast={addToast}
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
