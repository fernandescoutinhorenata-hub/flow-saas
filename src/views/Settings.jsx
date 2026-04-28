import React, { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import Toggle from '../components/Toggle.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useUsers } from '../hooks/useUsers.js';
import { useProjects } from '../hooks/useProjects.js';

export default function Settings({ currentUser, hasPermission, addToast }) {
  const { inviteMember } = useAuth();
  const { users, loading: usersLoading, toggleUserActive } = useUsers();
  const { projects, loading: projectsLoading, deleteProject, createProject } = useProjects();
  
  const [activeTab, setActiveTab] = useState("perfil");
  const [notifs, setNotifs] = useState({ n1: true, n2: true, n3: false, n4: true });
  const [compact, setCompact] = useState(false);
  const [density, setDensity] = useState("Confortável");
  
  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'membro' });
  const [inviting, setInviting] = useState(false);

  // Project states
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', deadline: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteMember(inviteData);
      addToast(`✅ Convite enviado para ${inviteData.email}`);
      setShowInvite(false);
      setInviteData({ name: '', email: '', role: 'membro' });
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("already exists") || msg.includes("unique")) {
        addToast(`❌ Este email já está cadastrado`);
      } else {
        addToast("❌ Erro ao enviar convite.");
      }
    } finally {
      setInviting(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectData.name) return;
    
    setIsCreating(true);
    try {
      await createProject(newProjectData);
      addToast("✅ Projeto criado com sucesso!");
      setShowNewProject(false);
      setNewProjectData({ name: '', description: '', deadline: '' });
    } catch (err) {
      addToast("❌ Erro ao criar projeto.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteProject() {
    if (!confirmDeleteProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(confirmDeleteProject.id);
      addToast("✅ Projeto excluído com sucesso.");
      setConfirmDeleteProject(null);
    } catch (err) {
      addToast("❌ Erro ao excluir projeto.");
    } finally {
      setIsDeleting(false);
    }
  }

  const tabs = ([
    { id: "perfil", label: "Perfil" },
    { id: "projetos", label: "Projetos", perm: "manage_members" },
    { id: "membros", label: "Membros", perm: "manage_members" },
    { id: "notificacoes", label: "Notificações" },
    { id: "aparencia", label: "Aparência" },
  ]).filter(t => !t.perm || hasPermission(t.perm));

  return (
    <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Configurações</h2>
      
      <div style={{ display: "flex", gap: 32, flex: 1, alignItems: "flex-start" }}>
        {/* Sidebar settings */}
        <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 4 }}>
          {(tabs || []).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? "var(--bg-surface)" : "transparent",
              border: "none", color: activeTab === t.id ? "var(--accent)" : "var(--text-secondary)",
              padding: "10px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 13,
              borderLeft: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.2s", fontWeight: activeTab === t.id ? 500 : 400
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 32, maxWidth: 640 }}>
          {activeTab === "perfil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="anim-fadeInUp">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar initials={currentUser?.initials || ''} size={64} />
                <button style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", padding: "8px 16px", cursor: "pointer", fontSize: 13, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--border)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Trocar Avatar</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>Nome Completo</label>
                  <input type="text" defaultValue={currentUser?.name || ''} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>E-mail</label>
                  <input type="email" defaultValue={currentUser?.email || "voce@flow.com"} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
                </div>
              </div>
              <button style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 500, alignSelf: "flex-start", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-dark)"} onMouseOut={e => e.currentTarget.style.background = "var(--accent)"}>Salvar Alterações</button>
            </div>
          )}

          {activeTab === "projetos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="anim-fadeInUp">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>Projetos Ativos</h3>
                <button 
                  onClick={() => setShowNewProject(true)}
                  style={{ background: "transparent", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--accent)", padding: "8px 16px", cursor: "pointer", fontSize: 13, transition: "background 0.2s", fontWeight: 500 }} 
                  onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} 
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  + Novo Projeto
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {projectsLoading ? (
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Carregando projetos...</div>
                ) : projects.length === 0 ? (
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhum projeto encontrado.</div>
                ) : projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-card)" }}>
                    <div>
                      <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.status || "Ativo"} • Criado: {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", padding: "4px 8px", borderRadius: 4, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Arquivar</button>
                      <span style={{ color: "#3A3A3A" }}>|</span>
                      <button 
                        onClick={() => setConfirmDeleteProject(p)}
                        style={{ background: "none", border: "none", color: "#FF4C4C", fontSize: 13, cursor: "pointer", padding: "4px 8px", borderRadius: 4, transition: "all 0.2s" }} 
                        onMouseOver={e => {
                          e.currentTarget.style.background = "#FF4C4C10";
                          e.currentTarget.style.color = "#FF6B6B";
                        }} 
                        onMouseOut={e => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#FF4C4C";
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "membros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="anim-fadeInUp">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>Membros da Equipe</h3>
                <button 
                  onClick={() => setShowInvite(!showInvite)}
                  style={{ background: "transparent", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--accent)", padding: "8px 16px", cursor: "pointer", fontSize: 13, transition: "background 0.2s", fontWeight: 500 }} 
                  onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} 
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  {showInvite ? "Cancelar" : "+ Convidar"}
                </button>
              </div>

              {showInvite && (
                <form onSubmit={handleInvite} style={{ background: "var(--bg-card)", padding: 20, borderRadius: 10, border: "1px solid var(--accent-soft)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input 
                      placeholder="Nome" 
                      required
                      value={inviteData.name} 
                      onChange={e => setInviteData({...inviteData, name: e.target.value})}
                      style={{ background: "var(--bg-base)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 6, color: "var(--text-primary)", outline: "none" }}
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      required
                      value={inviteData.email} 
                      onChange={e => setInviteData({...inviteData, email: e.target.value})}
                      style={{ background: "var(--bg-base)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 6, color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <select 
                      value={inviteData.role} 
                      onChange={e => setInviteData({...inviteData, role: e.target.value})}
                      style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 6, color: "var(--text-primary)", outline: "none" }}
                    >
                      <option value="membro">Membro</option>
                      <option value="gestor">Gestor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      disabled={inviting}
                      style={{ background: "var(--accent)", border: "none", color: "#0D0D0D", padding: "8px 24px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
                    >
                      {inviting ? "Enviando..." : "Enviar Convite"}
                    </button>
                  </div>
                </form>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {usersLoading ? (
                  <div style={{ color:'var(--text-secondary)', 
                    fontSize:13 }}>Carregando membros...</div>
                ) : users.length === 0 ? (
                  <div style={{ color:'var(--text-secondary)', 
                    fontSize:13 }}>Nenhum membro cadastrado.</div>
                ) : users.map(u => (
                  <div key={u.id} style={{ 
                    display:'flex', justifyContent:'space-between', 
                    alignItems:'center', padding:16,
                    border:'1px solid var(--border)', 
                    borderRadius:8, background:'var(--bg-card)' 
                  }}>
                    <div style={{ display:'flex', 
                      alignItems:'center', gap:12 }}>
                      <Avatar initials={u.initials || '?'} size={36} />
                      <div>
                        <div style={{ fontSize:14, 
                          color:'var(--text-primary)', 
                          fontWeight:500, marginBottom:2 }}>
                          {u.name}
                          <span style={{ fontSize:11, 
                            color:'var(--text-secondary)', 
                            fontWeight:400, marginLeft:6 }}>
                            ({u.role})
                          </span>
                        </div>
                        <div style={{ fontSize:12, 
                          color:'var(--text-secondary)' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', 
                      alignItems:'center', gap:12 }}>
                      <span style={{ 
                        fontSize:10, fontWeight:700,
                        padding:'2px 8px', borderRadius:4,
                        background: u.active 
                          ? 'var(--accent-soft)' : '#3A3A3A',
                        color: u.active 
                          ? 'var(--accent)' : 'var(--text-secondary)',
                        textTransform:'uppercase'
                      }}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Toggle 
                        checked={u.active} 
                        onChange={val => toggleUserActive(u.id, val)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notificacoes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="anim-fadeInUp">
              <h3 style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>Preferências de Notificação</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {([
                  { id: "n1", label: "Tarefa atribuída a mim" },
                  { id: "n2", label: "Prazo chegando (48h antes)" },
                  { id: "n3", label: "Tarefa movida de coluna" },
                  { id: "n4", label: "Comentário na minha tarefa" }
                ] || []).map(n => (
                  <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{n.label}</span>
                    <Toggle checked={notifs[n.id]} onChange={val => setNotifs({...notifs, [n.id]: val})} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "aparencia" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="anim-fadeInUp">
              <h3 style={{ fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>Personalização</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>Cor de Destaque</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Personalize a cor principal da interface</div>
                </div>
                <input type="color" defaultValue="#00FF87" style={{ width: 32, height: 32, border: "1px solid var(--border)", background: "var(--bg-card)", cursor: "pointer", borderRadius: 4, padding: 2 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>Modo Compacto</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Reduz margens e paddings globais</div>
                </div>
                <Toggle checked={compact} onChange={setCompact} />
              </div>

              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12, fontWeight: 600 }}>Densidade da Interface</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["Confortável", "Compacto", "Ultra-compacto"] || []).map((d, i) => (
                    <button key={i} onClick={() => setDensity(d)} style={{ flex: 1, padding: "10px", background: density === d ? "var(--accent-soft)" : "var(--bg-card)", border: density === d ? "1px solid var(--accent)" : "1px solid var(--border)", borderRadius: 8, color: density === d ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: "#242424", width: "100%", maxWidth: 440, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.7)", overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>Novo Projeto</h3>
              <button onClick={() => setShowNewProject(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer" }}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateProject} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Nome do projeto *</label>
                <input 
                  autoFocus
                  required
                  placeholder="Ex: Redesign do App"
                  value={newProjectData.name}
                  onChange={e => setNewProjectData({...newProjectData, name: e.target.value})}
                  style={{ width: "100%", background: "#161616", border: "1px solid #2A2A2A", padding: "12px 14px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                  onFocus={e => e.target.style.borderColor = "#00FF87"}
                  onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Descrição</label>
                <textarea 
                  placeholder="Breve descrição dos objetivos..."
                  value={newProjectData.description}
                  onChange={e => setNewProjectData({...newProjectData, description: e.target.value})}
                  style={{ width: "100%", height: 80, background: "#161616", border: "1px solid #2A2A2A", padding: "12px 14px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, resize: "none" }}
                  onFocus={e => e.target.style.borderColor = "#00FF87"}
                  onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Data de entrega</label>
                <input 
                  type="date"
                  value={newProjectData.deadline}
                  onChange={e => setNewProjectData({...newProjectData, deadline: e.target.value})}
                  style={{ width: "100%", background: "#161616", border: "1px solid #2A2A2A", padding: "12px 14px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                  onFocus={e => e.target.style.borderColor = "#00FF87"}
                  onBlur={e => e.target.style.borderColor = "#2A2A2A"}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button 
                  type="submit"
                  disabled={isCreating}
                  style={{ flex: 1, background: "#00FF87", color: "#0D0D0D", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {isCreating ? "Criando..." : "Criar Projeto"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  style={{ flex: 1, background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div className="anim-scaleIn" style={{ background: "var(--bg-card)", padding: 32, borderRadius: 16, border: "1px solid var(--border)", width: 400, textAlign: "center" }}>
            <h3 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: 12, fontWeight: 700 }}>Excluir projeto?</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.5 }}>
              Essa ação é permanente e removerá todas as tarefas vinculadas ao projeto <strong>{confirmDeleteProject.name}</strong>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button 
                onClick={handleDeleteProject}
                disabled={isDeleting}
                style={{ width: "100%", padding: 12, background: "#FF4C4C", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                {isDeleting ? "Excluindo..." : "Excluir permanentemente"}
              </button>
              <button 
                onClick={() => setConfirmDeleteProject(null)}
                style={{ width: "100%", padding: 12, background: "transparent", color: "var(--text-secondary)", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
