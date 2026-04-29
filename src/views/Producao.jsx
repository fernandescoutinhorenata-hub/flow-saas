import React, { useState } from 'react';
import { usePedidos } from '../hooks/usePedidos';

export default function Producao({ selectedProject, addToast }) {
  const { pedidos, loading, createPedido, updatePedidoStatus, deletePedido } = usePedidos(selectedProject?.id);
  const [showModal, setShowModal] = useState(false);
  const [newPedido, setNewPedido] = useState({ title: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  const columns = [
    { id: 'pendente', label: 'PEDIDOS PENDENTES', color: 'var(--text-secondary)' },
    { id: 'em_andamento', label: 'PEDIDOS EM ANDAMENTO', color: 'var(--accent)' },
    { id: 'finalizado', label: 'PEDIDOS FINALIZADOS', color: '#7A7A7A' },
  ];

  async function handleCreate(e) {
    e.preventDefault();
    if (!newPedido.title) return;
    setIsSaving(true);
    try {
      await createPedido(newPedido);
      addToast("✅ Pedido criado com sucesso!");
      setShowModal(false);
      setNewPedido({ title: '', description: '' });
    } catch (err) {
      addToast("❌ Erro ao criar pedido.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e, targetStatus) => {
    const pedidoId = e.dataTransfer.getData("pedidoId");
    if (!pedidoId) return;
    try {
      await updatePedidoStatus(pedidoId, targetStatus);
    } catch (err) {
      addToast("❌ Erro ao mover pedido.");
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh",
      minHeight: 0,
      overflow: "hidden",
      background: "var(--bg-base)"
    }} className="anim-fadeIn">
      {/* Sub-header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Fluxo de Produção</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "transform 0.2s" }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          + Novo Pedido
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        gap: 16, 
        padding: 24, 
        overflowX: "auto",
        alignItems: "flex-start",
        minHeight: 0
      }}>
        {columns.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{ minWidth: 320, width: 320, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color }}></div>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.1em" }}>{col.label}</h3>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-secondary)", opacity: 0.5 }}>
                {pedidos.filter(p => p.status === col.id).length}
              </span>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {pedidos.filter(p => p.status === col.id).map(pedido => (
                <div 
                  key={pedido.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("pedidoId", pedido.id)}
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, cursor: "grab", transition: "all 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = "var(--accent-soft)"}
                  onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{pedido.title}</div>
                  {pedido.description && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{pedido.description}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.5 }}>
                      #{pedido.id.slice(0, 4)} • {new Date(pedido.created_at).toLocaleDateString()}
                    </div>
                    {col.id === 'finalizado' && (
                       <button 
                        onClick={() => deletePedido(pedido.id)}
                        style={{ background: 'none', border: 'none', color: '#FF4C4C', fontSize: 11, cursor: 'pointer', padding: '4px' }}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Carregando...</div>}
              {!loading && pedidos.filter(p => p.status === col.id).length === 0 && (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 12, opacity: 0.3 }}>
                  Nenhum pedido
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Pedido */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }}>
          <div className="anim-scaleIn" style={{ background: "var(--bg-card)", width: "100%", maxWidth: 400, borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>Novo Pedido de Produção</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}>&times;</button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}>Título do Pedido *</label>
                <input 
                  autoFocus
                  required
                  placeholder="Ex: Fabricação Lote A"
                  value={newPedido.title}
                  onChange={e => setNewPedido({...newPedido, title: e.target.value})}
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}>Descrição / Observações</label>
                <textarea 
                  placeholder="Detalhes técnicos ou observações..."
                  value={newPedido.description}
                  onChange={e => setNewPedido({...newPedido, description: e.target.value})}
                  style={{ width: "100%", height: 100, background: "var(--bg-base)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", fontSize: 14, resize: "none" }}
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving}
                style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}
              >
                {isSaving ? "Criando..." : "Criar Pedido"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
