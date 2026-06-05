// ─────────────────────────────────────────────
//  APP — point d'entrée principal
// ─────────────────────────────────────────────

const App = {
  async init() {
    // Inject HTML structure
    document.getElementById('app').innerHTML = `
      <div id="toast"></div>
      ${LoginPage.render()}
      <div class="screen" id="screen-manager"></div>
      <div class="screen" id="screen-driver"></div>
    `;

    // Check session existante
    try {
      const session = await Auth.getSession();
      if (session) {
        if (Auth.isManager()) {
          await ManagerPage.init();
          Router.show('screen-manager');
        } else {
          await DriverPage.init();
          Router.show('screen-driver');
        }
        return;
      }
    } catch(e) {
      console.log('No session:', e.message);
    }

    Router.show('screen-login');

    // Ecoute Enter sur login
    document.getElementById('login-password')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') LoginPage.submit();
    });
  },

  async logout() {
    await Auth.logout();
    Router.show('screen-login');
    toast('Déconnecté');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
