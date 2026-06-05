// ─────────────────────────────────────────────
//  ROUTER — gestion des écrans
// ─────────────────────────────────────────────

const Router = {
  show(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
  },

  showPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(panelId);
    if (el) el.classList.add('active');
  },

  activateSidebarItem(el) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
  },

  navigate(panelId, sidebarEl) {
    Router.showPanel(panelId);
    Router.activateSidebarItem(sidebarEl);
  }
};
