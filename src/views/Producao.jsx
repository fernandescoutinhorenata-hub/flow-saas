import React, { useState } from 'react';
import { usePedidos } from '../hooks/usePedidos';

export default function Producao({ selectedProject, addToast }) {
  const { pedidos, loading, createPedido, updatePedidoStatus, deletePedido } = usePedidos(selectedProject?.id);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const columns = [
    { id: 'pendente', label: 'PEDIDOS PENDENTES' },
    { id: 'em_andamento', label: 'PEDIDOS EM ANDAMENTO' },
    { id: 'finalizado', label: 'PEDIDOS FINALIZADOS' },
  ];

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createPedido({ title, description });
      setTitle('');
      setDescription('');
      setShowModal(false);
      addToast?.('Pedido criado!');
    } catch {
      addToast?.('Erro ao criar pedido.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Produção
        </h2>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#00FF87', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
        >
          + Novo Pedido
        </button>
      </div>

      {/* Kanban */}
      <div className="producao-board" style={{ display: 'flex', gap: 16, padding: 24, overflowX: 'auto', flex: 1, alignItems: 'flex-start' }}>
        {columns.map(col => (
          <div key={col.id} className="producao-col" style={{ minWidth: 300, width: 300, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', padding: 16 }}>
            
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{col.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 20 }}>
                {pedidos.filter(p => p.status === col.id).length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pedidos.filter(p => p.status === col.id).map(pedido => (
                <div key={pedido.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{pedido.title}</div>
                  {pedido.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{pedido.description}</div>}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {col.id !== 'em_andamento' && col.id !== 'finalizado' && (
                      <button onClick={() => updatePedidoStatus(pedido.id, 'em_andamento')} style={{ fontSize: 11, background: '#00FF8720', color: '#00FF87', border: '1px solid #00FF87', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Iniciar
                      </button>
                    )}
                    {col.id === 'em_andamento' && (
                      <button onClick={() => updatePedidoStatus(pedido.id, 'finalizado')} style={{ fontSize: 11, background: '#00FF8720', color: '#00FF87', border: '1px solid #00FF87', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Finalizar
                      </button>
                    )}
                    {col.id === 'finalizado' && (
                      <button onClick={() => deletePedido(pedido.id)} style={{ fontSize: 11, background: '#FF4C4C20', color: '#FF4C4C', border: '1px solid #FF4C4C', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && pedidos.filter(p => p.status === col.id).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, padding: 20, opacity: 0.5 }}>
                  Nenhum pedido
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1F1F1F', borderRadius: 16, border: '1px solid #2A2A2A', width: 400, padding: 24 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", color: '#F0F0F0', margin: '0 0 20px' }}>Novo Pedido</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                autoFocus required
                placeholder="Título do pedido"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', color: '#F0F0F0', fontSize: 14, outline: 'none' }}
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 12px', color: '#F0F0F0', fontSize: 14, outline: 'none', resize: 'none', height: 80 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ flex: 1, background: '#00FF87', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, cursor: 'pointer' }}>Criar</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent', color: '#7A7A7A', border: '1px solid #2A2A2A', borderRadius: 8, padding: 12, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
