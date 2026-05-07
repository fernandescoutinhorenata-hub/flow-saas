import React, { useState, useEffect } from 'react';
import Avatar from '../components/Avatar.jsx';
import Toggle from '../components/Toggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useProjects } from '../hooks/useProjects.js';
import { supabase } from '../lib/supabase'

export default function Settings({ 
  addToast, 
  projects, 
  projectsLoading, 
  createProject, 
  updateProject, 
  deleteProject, 
  addMember, 
  removeMember,
  users,
  toggleUserActive
}) {
  const { currentUser, inviteMember, refreshUser, hasPermission, setProfile, setUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState("perfil");
  const [notifs, setNotifs] = useState({ n1: true, n2: true, n3: false, n4: true });
  const [compact, setCompact] = useState(false);
  const [density, setDensity] = useState("Confortável");

  // Estados de perfil controlados
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')

  // Sincroniza quando currentUser carrega de forma assíncrona
  useEffect(() => {
    if (currentUser) {
      setName(currentUser?.name || '')
      setEmail(currentUser?.email || '')
    }
  }, [currentUser])
  
  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'membro' });
  const [inviting, setInviting] = useState(false);

  // Project states
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', fase: 'planejamento' });
  const [editingProject, setEditingProject] = useState(null);
  const [showMemberAdd, setShowMemberAdd] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteMember(inviteData);
      addToast(`✅ Membro ${inviteData.email} adicionado com sucesso!`);
      setShowInvite(false);
      setInviteData({ name: '', email: '', role: 'membro' });
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("already exists") || msg.includes("unique")) {
        addToast(`❌ Este email já está cadastrado`);
      } else {
        addToast("❌ Erro ao adicionar membro.");
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
      if (editingProject) {
        await updateProject(editingProject.id, newProjectData);
        addToast("✅ Projeto atualizado!");
      } else {
        await createProject(newProjectData);
        addToast("✅ Projeto criado!");
      }
      setShowNewProject(false);
      setEditingProject(null);
      setNewProjectData({ name: '', description: '', fase: 'planejamento' });
    } catch (err) {
      addToast("❌ Erro ao salvar projeto.");
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

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      addToast('Imagem muito grande. Máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      
      // 1. Salvar no banco
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: base64 })
        .eq('email', currentUser.email)
      
      if (error) {
        addToast('Erro ao salvar avatar.')
        return
      }
      
      // 2. Atualizar localStorage com avatar_url
      const updatedUser = { ...currentUser, avatar_url: base64 }
      localStorage.setItem('flow_user', JSON.stringify(updatedUser))
      
      // 3. Atualizar estado do React
      setProfile({ ...updatedUser })
      setUser({ ...updatedUser })
      
      addToast('Avatar atualizado! ✅')
    }
  async function handleSaveProfile() {
    const { error } = await supabase
      .from('users')
      .update({ name: name, email: email })
      .eq('id', currentUser.id)
    
    if (error) { addToast('Erro ao salvar perfil.'); return }
    
    const updated = { ...currentUser, name: name, email: email }
    localStorage.setItem('flow_user', JSON.stringify(updated))
    setProfile({ ...updated })
    setUser({ ...updated })
    addToast('Perfil atualizado! ✅')
  }

  const tabs = ([
    { id: "perfil", label: "Perfil" },
    { id: "projetos", label: "Projetos", perm: "manage_members" },
    { id: "membros", label: "Equipe", ownerOnly: true },
    { id: "notificacoes", label: "Notificações" },
    { id: "aparencia", label: "Aparência" },
  ]).filter(t => {
    if (t.ownerOnly) return currentUser?.role === 'dono';
    if (t.perm) return hasPermission(t.perm);
    return true;
  });

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
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {currentUser?.avatar_url ? (
                    <img 
                      src={currentUser.avatar_url} 
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00FF87' }} 
                    />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#F0F0F0', border: '2px solid #2A2A2A' }}>
                      {currentUser?.initials || '?'}
                    </div>
                  )}
                  <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#00FF87', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
                    ✏️
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Foto de Perfil</div>
                  Tamanho máximo: 2MB
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>Nome Completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }} />
                </div>
              </div>
              <button onClick={handleSaveProfile} style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 500, alignSelf: "flex-start", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-dark)"} onMouseOut={e => e.currentTarget.style.background = "var(--accent)"}>Salvar Alterações</button>
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
                  <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 16, padding: 20, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-card)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", display: 'flex', gap: 12 }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>{p.fase}</span>
                          <span>•</span>
                          <span>Criado: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button 
                          onClick={() => {
                            setEditingProject(p);
                            setNewProjectData({ name: p.name, description: p.description || '', fase: p.fase || 'planejamento' });
                            setShowNewProject(true);
                          }}
                          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", padding: "4px 8px", borderRadius: 4, transition: "background 0.2s" }} 
                          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Editar</button>
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

                    {/* Membros do Projeto */}
                    {currentUser?.role === 'dono' && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Membros do Projeto</span>
                          <button 
                            onClick={() => setShowMemberAdd(showMemberAdd === p.id ? null : p.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                          >
                            {showMemberAdd === p.id ? 'Fechar' : '+ Adicionar'}
                          </button>
                        </div>

                        {showMemberAdd === p.id && (
                          <div style={{ background: 'var(--bg-base)', padding: 8, borderRadius: 8, marginBottom: 12, display: 'flex', gap: 8 }}>
                            <select 
                              id={`select-member-${p.id}`}
                              style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                            >
                              <option value="">Selecionar usuário...</option>
                              {users.filter(u => !p.project_members?.some(m => m.user_id === u.id)).map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                              ))}
                            </select>
                            <button 
                              onClick={async () => {
                                const select = document.getElementById(`select-member-${p.id}`);
                                const userId = select.value;
                                if (!userId) return;
                                try {
                                  await addMember(p.id, userId);
                                  addToast("✅ Membro adicionado ao projeto!");
                                  setShowMemberAdd(null);
                                } catch (err) {
                                  addToast("❌ Erro ao adicionar membro.");
                                }
                              }}
                              style={{ background: 'var(--accent)', border: 'none', color: '#0D0D0D', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Add
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {p.project_members?.length === 0 && (
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhum membro atribuído</span>
                          )}
                          {p.project_members?.map(m => {
                            const user = users.find(u => u.id === m.user_id);
                            if (!user) return null;
                            return (
                              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-base)', padding: '4px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
                                <Avatar initials={user.initials} size={18} />
                                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{user.name}</span>
                                <button 
                                  onClick={() => removeMember(p.id, user.id)}
                                  style={{ background: 'none', border: 'none', color: '#FF4C4C', fontSize: 14, cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                  {showInvite ? "Cancelar" : "+ Adicionar Membro"}
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
                      style={{ background: "var(--accent)", border: "none", color: "#0D0D0D", padding: "8px 24px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}
                    >
                      {inviting ? "Adicionando..." : "Adicionar membro"}
                    </button>
                  </div>
                </form>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {!users ? (
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
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </h3>
              <button onClick={() => { setShowNewProject(false); setEditingProject(null); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 24, cursor: "pointer" }}>&times;</button>
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
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Fase do projeto</label>
                <select 
                  value={newProjectData.fase}
                  onChange={e => setNewProjectData({...newProjectData, fase: e.target.value})}
                  style={{ width: "100%", background: "#161616", border: "1px solid #2A2A2A", padding: "12px 14px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                >
                  <option value="planejamento">Planejamento</option>
                  <option value="execução">Execução</option>
                  <option value="revisão">Revisão</option>
                  <option value="concluído">Concluído</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button 
                  type="submit"
                  disabled={isCreating}
                  style={{ flex: 1, background: "#00FF87", color: "#0D0D0D", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {isCreating ? (editingProject ? "Salvando..." : "Criando...") : (editingProject ? "Atualizar Projeto" : "Criar Projeto")}
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
