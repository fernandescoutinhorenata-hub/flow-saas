export const INITIAL_TASKS = [
  { id: 1,  title: "Redesign da tela de login",         priority: "urgent", assignee: "Ana S.",   assigneeInitials: "AS", due: "2025-06-10", subtasks: { done: 2, total: 5 }, status: "doing",   tags: ["Design"] },
  { id: 2,  title: "Integração com API de pagamento",   priority: "medium", assignee: "Lucas M.", assigneeInitials: "LM", due: "2025-06-18", subtasks: { done: 4, total: 4 }, status: "review",  tags: ["Dev", "API"] },
  { id: 3,  title: "Documentar fluxo de onboarding",    priority: "low",    assignee: "Carla T.", assigneeInitials: "CT", due: "2025-06-25", subtasks: { done: 0, total: 3 }, status: "backlog", tags: ["Docs"] },
  { id: 4,  title: "Testes de usabilidade",             priority: "medium", assignee: "João P.",  assigneeInitials: "JP", due: "2025-06-05", subtasks: { done: 1, total: 2 }, status: "done",    tags: ["UX"] },
  { id: 5,  title: "Configurar CI/CD no GitHub Actions",priority: "urgent", assignee: "Lucas M.", assigneeInitials: "LM", due: "2025-05-28", subtasks: { done: 1, total: 4 }, status: "doing",   tags: ["Dev", "Infra"] },
  { id: 6,  title: "Criar componente de DatePicker",    priority: "low",    assignee: "Ana S.",   assigneeInitials: "AS", due: "2025-07-01", subtasks: { done: 0, total: 2 }, status: "backlog", tags: ["Design", "Dev"] },
  { id: 7,  title: "Análise de métricas — Sprint 4",   priority: "medium", assignee: "Carla T.", assigneeInitials: "CT", due: "2025-06-12", subtasks: { done: 3, total: 3 }, status: "review",  tags: ["Analytics"] },
  { id: 8,  title: "Atualizar dependências do projeto", priority: "low",    assignee: "João P.",  assigneeInitials: "JP", due: "2025-06-30", subtasks: { done: 0, total: 1 }, status: "backlog", tags: ["Manutenção"] },
];

export const COLUMNS = [
  { id: "backlog",  label: "BACKLOG",       locked: true },
  { id: "doing",    label: "EM ANDAMENTO",  locked: true },
  { id: "review",   label: "REVISÃO",       locked: false },
  { id: "done",     label: "CONCLUÍDO",     locked: true },
];

export const PRIORITY_COLORS = { urgent: "#FF4C4C", medium: "#FFB800", low: "#00FF87" };
export const PRIORITY_LABELS = { urgent: "Urgente", medium: "Média", low: "Baixa" };

export const TODAY = new Date("2025-06-09");

export const INITIAL_TICKETS = [
  { id: 1, type: "duvida", title: "Como mover tarefa para revisão?", description: "Não estou conseguindo arrastar o card para a coluna revisão.", authorId: "u4", author: "João P.", authorInitials: "JP", taskId: 3, taskTitle: "Documentar fluxo de onboarding", status: "aberto", priority: "normal", createdAt: "2025-06-08T10:00:00", responses: [{ id: 1, authorId: "u1", author: "Ana S.", authorInitials: "AS", role: "admin", text: "Olá João! Você pode arrastar segurando o botão esquerdo do mouse no card.", createdAt: "2025-06-08T11:30:00" }] },
  { id: 2, type: "problema", title: "Bug na tela de login", description: "Ao tentar entrar com magic link o sistema retorna erro 404.", authorId: "u3", author: "Carla T.", authorInitials: "CT", taskId: null, taskTitle: null, status: "em_analise", priority: "urgente", createdAt: "2025-06-07T14:00:00", responses: [] },
  { id: 3, type: "sugestao", title: "Adicionar filtro por data no Kanban", description: "Seria útil poder filtrar as tarefas por período de prazo.", authorId: "u4", author: "João P.", authorInitials: "JP", taskId: null, taskTitle: null, status: "aberto", priority: "normal", createdAt: "2025-06-06T09:00:00", responses: [] },
];

export const TICKET_TYPES = {
  duvida:     { label: "Dúvida",     color: "#00FF87" },
  observacao: { label: "Observação", color: "#7A7A7A" },
  problema:   { label: "Problema",   color: "#FF4C4C" },
  sugestao:   { label: "Sugestão",   color: "#FFB800" },
};

export const TICKET_STATUS = {
  aberto:     { label: "Aberto",     bg: "#00FF8720", text: "#00FF87" },
  em_analise: { label: "Em Análise", bg: "#FFB80020", text: "#FFB800" },
  resolvido:  { label: "Resolvido",  bg: "#3A3A3A",   text: "#7A7A7A" },
};

export const USERS = [
  { id: "u1", name: "Ana S.",    initials: "AS", role: "admin",  email: "ana@flow.com" },
  { id: "u2", name: "Lucas M.",  initials: "LM", role: "gestor", email: "lucas@flow.com" },
  { id: "u3", name: "Carla T.",  initials: "CT", role: "membro", email: "carla@flow.com" },
  { id: "u4", name: "João P.",   initials: "JP", role: "membro", email: "joao@flow.com" },
  { id: "u5", name: "Você",      initials: "VC", role: "admin",  email: "voce@flow.com" },
];

export const PERMISSIONS = {
  admin:  ["view_all_tasks", "edit_any_task", "delete_task", "manage_members", "view_reports", "view_dashboard", "create_task", "invite_members"],
  gestor: ["view_all_tasks", "edit_any_task", "view_reports", "view_dashboard", "create_task"],
  membro: ["edit_own_task"],
};
