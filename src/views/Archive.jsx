import React from 'react';
import Avatar from '../components/Avatar.jsx';
import { formatDate } from '../utils.js';

export default function Archive({ tasks = [], users = [] }) {
  const getGroup = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 1) return "ONTEM";
    if (diff < 7) return "ESTA SEMANA";
    if (diff < 14) return "SEMANA PASSADA";
    if (diff < 30) return "ESTE MÊS";
    if (diff < 60) return "MÊS PASSADO";
    return "MAIS ANTIGOS";
  };

  const groups = ["ONTEM", "ESTA SEMANA", "SEMANA PASSADA", "ESTE MÊS", "MÊS PASSADO", "MAIS ANTIGOS"];
  
  const groupedTasks = tasks.reduce((acc, task) => {
    const group = getGroup(task.updated_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(task);
    return acc;
  }, {});

  return (
    <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Arquivo Histórico</h2>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
          {tasks.length} tarefas arquivadas
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {groups.map(group => {
          const groupTasks = groupedTasks[group] || [];
          if (groupTasks.length === 0) return null;

          return (
            <div key={group}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                {group}
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {groupTasks.map(task => (
                  <div key={task.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.title}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(() => {
                          const assigneeUser = users?.find(u => 
                            u.id === task.assignee_id || 
                            u.initials === task.assignee_initials ||
                            u.name === task.assignee
                          );

                          const creatorUser = users?.find(u =>
                            u.id === task.created_by ||
                            u.id === task.author_id
                          );

                          const displayUser = assigneeUser || creatorUser;

                          return (
                            <>
                              <Avatar 
                                initials={displayUser?.initials || task.assignee_initials || '?'} 
                                avatarUrl={displayUser?.avatar_url}
                                size={20} 
                              />
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                {assigneeUser ? assigneeUser.name : creatorUser ? `${creatorUser.name} (criou)` : 'Sem responsável'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>
                        Concluída em {new Date(task.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <p>Nenhuma tarefa arquivada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
