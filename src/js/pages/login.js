// ─────────────────────────────────────────────
//  PAGE LOGIN
// ─────────────────────────────────────────────

const LoginPage = {
  render() {
    return `
    <div class="screen" id="screen-login">
      <div class="login-wrap">
        <div class="login-box">
          <div class="login-logo">
            <div class="mark">🚚 AM Transport 31</div>
            <p>Connectez-vous pour accéder à votre espace</p>
          </div>
          <div class="form-row">
            <label class="form-label">Adresse email</label>
            <input class="form-input" type="email" id="login-email" placeholder="votre@email.com" autocomplete="email">
          </div>
          <div class="form-row">
            <label class="form-label">Mot de passe</label>
            <input class="form-input" type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div class="error-box" id="login-error"></div>
          <button class="btn primary" id="login-btn" style="width:100%;justify-content:center;" onclick="LoginPage.submit()">
            Se connecter
          </button>
          <p class="text-sm text-muted" style="text-align:center;margin-top:14px;">
            Compte bloqué ? Contactez votre responsable.
          </p>
        </div>
      </div>
    </div>`;
  },

  async submit() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errEl.style.display = 'none';
    if (!email || !password) {
      errEl.textContent = 'Merci de remplir tous les champs.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Connexion...';

    try {
      await Auth.login(email, password);
      if (Auth.isManager()) {
        await ManagerPage.init();
        Router.show('screen-manager');
      } else {
        await DriverPage.init();
        Router.show('screen-driver');
      }
    } catch (err) {
      errEl.textContent = 'Identifiant ou mot de passe incorrect.';
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Se connecter';
    }
  }
};
