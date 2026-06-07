// ─────────────────────────────────────────────
//  PAGE RESPONSABLE
// ─────────────────────────────────────────────

const ManagerPage = {

  async init() {
    const p = Auth.currentProfile;
    const c = avatarBg(p.full_name);
    document.getElementById('screen-manager').innerHTML = `
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:10px;">
        <button id="menu-toggle" onclick="ManagerPage.toggleMenu()" style="display:none;background:none;border:1px solid #E5E7EB;border-radius:8px;font-size:20px;cursor:pointer;padding:6px 10px;line-height:1;">☰</button>
        <div class="logo-mark">🚚 AM Transport 31</div>
      </div>
      <div class="user-pill">
        <div class="av-sm" style="background:${c.bg};color:${c.color};">${initials(p.full_name)}</div>
        <span>${p.full_name} — <strong>Responsable</strong></span>
        <button class="btn-link" onclick="App.logout()" style="margin-left:10px;">⬅ Déconnexion</button>
      </div>
    </div>
    <div id="sidebar-overlay" onclick="ManagerPage.closeMenu()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99;"></div>
    <div class="main-layout">
      <div class="sidebar" id="manager-sidebar">
        <div class="sidebar-section-label">Vue générale</div>
        <div class="sidebar-item active" onclick="ManagerPage.nav('dashboard',this)">📊 Tableau de bord</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('chauffeurs',this)">👥 Chauffeurs</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('planning',this)">📅 Planning</div>
        <div class="sidebar-section-label">Véhicules & Équipements</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('vehicules',this)">🚛 Attributions du jour</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('historique',this)">🕓 Historique camions</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('telepeage',this)">💳 Badges télépéage</div>
        <div class="sidebar-section-label">Données</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('photos',this)">📷 Photos reçues</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('km',this)">📈 Kilométrages</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('performance',this)">🏆 Performances</div>
        <div class="sidebar-section-label">Gestion</div>
        <div class="sidebar-item" onclick="ManagerPage.nav('admin',this)">⚙️ Administration</div>
      </div>
      <div class="content" id="manager-content">
        <div class="panel active" id="panel-dashboard"><p class="text-muted">Chargement...</p></div>
        <div class="panel" id="panel-chauffeurs"></div>
        <div class="panel" id="panel-planning"></div>
        <div class="panel" id="panel-vehicules"></div>
        <div class="panel" id="panel-historique"></div>
        <div class="panel" id="panel-telepeage"></div>
        <div class="panel" id="panel-photos"></div>
        <div class="panel" id="panel-km"></div>
        <div class="panel" id="panel-performance"></div>
        <div class="panel" id="panel-admin"></div>
      </div>
    </div>

    <!-- Popup planning -->
    <div id="planning-popup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;padding:24px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.2);max-height:90vh;overflow-y:auto;">
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;" id="popup-title">Planning</div>
        <div style="font-size:12px;color:#9CA3AF;margin-bottom:14px;" id="popup-subtitle"></div>
        <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Présence</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <button onclick="ManagerPage.selectStatut('travail')"   id="btn-stat-travail"   class="popup-stat-btn" style="background:#F0FDF4;border:2px solid #D1FAE5;color:#166534;">🟢 Travail</button>
          <button onclick="ManagerPage.selectStatut('repos')"     id="btn-stat-repos"     class="popup-stat-btn" style="background:#F9FAFB;border:2px solid #E5E7EB;color:#6B7280;">⚪ Repos</button>
          <button onclick="ManagerPage.selectStatut('cut')"       id="btn-stat-cut"       class="popup-stat-btn" style="background:#FFF5F5;border:2px solid #FEE2E2;color:#991B1B;">✂️ Cut</button>
          <button onclick="ManagerPage.selectStatut('mad')"       id="btn-stat-mad"       class="popup-stat-btn" style="background:#EFF6FF;border:2px solid #DBEAFE;color:#1E40AF;">🔵 MAD</button>
        </div>
        <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Absence / RH</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <button onclick="ManagerPage.selectStatut('absent')"        id="btn-stat-absent"        class="popup-stat-btn" style="background:#FFF7ED;border:2px solid #FED7AA;color:#92400E;">🚫 Absent</button>
          <button onclick="ManagerPage.selectStatut('mis_a_pied')"    id="btn-stat-mis_a_pied"    class="popup-stat-btn" style="background:#FEF2F2;border:2px solid #FECACA;color:#7F1D1D;">⛔ Mis à pied</button>
          <button onclick="ManagerPage.selectStatut('arret_travail')" id="btn-stat-arret_travail" class="popup-stat-btn" style="background:#F5F3FF;border:2px solid #DDD6FE;color:#4C1D95;">🏥 Arrêt travail</button>
          <button onclick="ManagerPage.selectStatut('refus')"         id="btn-stat-refus"         class="popup-stat-btn" style="background:#FFF1F2;border:2px solid #FFE4E6;color:#881337;">🙅 Refus</button>
        </div>
        <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Formation / Terrain</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          <button onclick="ManagerPage.selectStatut('ride_along')" id="btn-stat-ride_along" class="popup-stat-btn" style="background:#ECFDF5;border:2px solid #A7F3D0;color:#065F46;">🚗 Ride Along</button>
          <button onclick="ManagerPage.selectStatut('formation')"  id="btn-stat-formation"  class="popup-stat-btn" style="background:#FFFBEB;border:2px solid #FDE68A;color:#78350F;">📚 Formation</button>
        </div>
        <div id="popup-heures-row" style="display:none;margin-bottom:14px;">
          <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Heures effectuées (optionnel)</div>
          <input type="number" id="popup-heures" min="0" max="24" step="0.5" placeholder="Ex: 4.5" style="width:100%;padding:8px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;">
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="ManagerPage.closePlanningPopup()" style="flex:1;padding:10px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;font-size:13px;">Annuler</button>
          <button onclick="ManagerPage.savePlanningStat()" id="btn-popup-save" style="flex:1;padding:10px;border-radius:10px;border:none;background:#E5E7EB;color:#9CA3AF;font-size:13px;font-weight:700;cursor:not-allowed;" disabled>✓ Valider</button>
        </div>
      </div>
    </div>

    <!-- Popup édition attribution -->
    <div id="edit-attr-popup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;padding:24px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="font-size:15px;font-weight:700;margin-bottom:16px;" id="edit-attr-title">✏️ Modifier l'attribution</div>
        <div class="form-row"><label class="form-label">Plaque du camion</label><input class="form-input" type="text" id="edit-plaque" style="font-family:monospace;text-transform:uppercase;"></div>
        <div class="form-row"><label class="form-label">Numéro de route</label><input class="form-input" type="text" id="edit-route" style="text-transform:uppercase;"></div>
        <div class="form-row"><label class="form-label">Vague de départ</label>
          <select class="form-input" id="edit-vague">
            <option value="">— Aucune —</option>
            <option value="1">1ère vague — 12h10</option>
            <option value="2">2ème vague — 12h20</option>
            <option value="3">3ème vague</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">Badge télépéage</label><select class="form-input" id="edit-badge"></select></div>
        <div class="flex-end">
          <button class="btn" onclick="ManagerPage.closeEditAttrPopup()">Annuler</button>
          <button class="btn primary" onclick="ManagerPage.saveEditAttribution()" style="margin-left:8px;">✓ Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- Popup Transporter ID -->
    <div id="tid-popup" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;padding:24px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;" id="tid-popup-title">🔗 Transporter ID</div>
        <div style="font-size:12px;color:#9CA3AF;margin-bottom:16px;">Identifiant Amazon unique du chauffeur</div>
        <div class="form-row">
          <label class="form-label">Transporter ID</label>
          <input class="form-input" type="text" id="tid-input" placeholder="Ex: A34Q69ZJEEAHO6" style="font-family:monospace;text-transform:uppercase;">
        </div>
        <div class="flex-end">
          <button class="btn" onclick="ManagerPage.closeTidPopup()">Annuler</button>
          <button class="btn primary" onclick="ManagerPage.saveTid()" style="margin-left:8px;">✓ Enregistrer</button>
        </div>
      </div>
    </div>`;

    const style = document.createElement('style');
    style.textContent = `.popup-stat-btn{padding:11px 6px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;transition:all .15s;text-align:center;} .popup-stat-btn.selected{box-shadow:0 0 0 3px #374151;transform:scale(1.03);}`;
    document.head.appendChild(style);

    await ManagerPage.loadDashboard();
  },

  toggleMenu() {
    const sidebar = document.getElementById('manager-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  },

  closeMenu() {
    const sidebar = document.getElementById('manager-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  },

  nav(panelId, el) {
    Router.navigate('panel-' + panelId, el);
    ManagerPage.closeMenu();
    const loaders = {
      dashboard:   ManagerPage.loadDashboard,
      chauffeurs:  ManagerPage.loadChauffeurs,
      planning:    ManagerPage.loadPlanning,
      vehicules:   ManagerPage.loadVehicules,
      historique:  ManagerPage.loadHistorique,
      telepeage:   ManagerPage.loadTelepeage,
      photos:      ManagerPage.loadPhotos,
      km:          ManagerPage.loadKm,
      performance: ManagerPage.loadPerformance,
      admin:       ManagerPage.loadAdmin,
    };
    if (loaders[panelId]) loaders[panelId]();
  },

  // ── DASHBOARD ──
  async loadDashboard() {
    const el = document.getElementById('panel-dashboard');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const todayStr = today();
      const { data: tournees } = await supabase
        .from('tournees').select('*, profiles(full_name), vehicule_attributions(plaque, telepeage_badges(reference))')
        .eq('date', todayStr);
      const total = tournees?.length || 0;
      const clotures = tournees?.filter(t => t.statut === 'cloture').length || 0;
      const photos_ok = tournees?.filter(t => t.photo_camion_matin && t.photo_mobilic_matin).length || 0;
      el.innerHTML = `
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Chauffeurs actifs</div><div class="stat-value">${total}</div><div class="stat-sub">aujourd'hui</div></div>
        <div class="stat-card"><div class="stat-label">Tournées clôturées</div><div class="stat-value">${clotures}</div><div class="stat-sub">sur ${total}</div></div>
        <div class="stat-card"><div class="stat-label">Photos matin reçues</div><div class="stat-value">${photos_ok}</div><div class="stat-sub">sur ${total}</div></div>
        <div class="stat-card"><div class="stat-label">En cours</div><div class="stat-value" style="color:#BA7517;">${total - clotures}</div><div class="stat-sub">non clôturées</div></div>
      </div>
      <div class="card">
        <div class="card-title">🔔 Alertes du jour</div>
        ${(tournees || []).filter(t => t.statut !== 'cloture').map(t => `
          <div class="notif ${t.statut === 'absent' ? 'err' : 'warn'}">
            <strong>${t.profiles?.full_name}</strong> —
            ${t.statut === 'absent' ? 'Aucune connexion aujourd\'hui' : t.statut === 'en_tournee' ? 'Tournée non clôturée' : 'Données incomplètes'}
            ${t.vehicule_attributions?.plaque ? `(${t.vehicule_attributions.plaque})` : ''}
          </div>
        `).join('') || '<div class="notif ok">Tout est en ordre aujourd\'hui ✓</div>'}
      </div>
      <div class="card">
        <div class="card-title">⚡ Activité récente</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Heure</th><th>Chauffeur</th><th>Véhicule</th><th>Action</th><th>Statut</th></tr></thead>
          <tbody>
            ${(tournees || []).map(t => `
            <tr>
              <td class="text-muted text-sm">${t.heure_depart ? t.heure_depart.slice(0,5) : '—'}</td>
              <td>${avatarHTML(t.profiles?.full_name, 28)} ${t.profiles?.full_name}</td>
              <td>${plateBadge(t.vehicule_attributions?.plaque)}</td>
              <td>${t.statut === 'cloture' ? 'Tournée clôturée' : t.statut === 'en_tournee' ? 'Départ enregistré' : 'Aucune activité'}</td>
              <td>${statusBadge(t.statut || 'absent')}</td>
            </tr>`).join('') || '<tr><td colspan="5" class="text-muted">Aucune donnée pour aujourd\'hui</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur de chargement : ${e.message}</div>`;
    }
  },

  // ── CHAUFFEURS ──
  async loadChauffeurs() {
    const el = document.getElementById('panel-chauffeurs');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: tournees } = await supabase
        .from('tournees')
        .select('*, profiles(full_name), vehicule_attributions(plaque, route, telepeage_badges(reference))')
        .eq('date', today()).order('created_at', { ascending: true });
      el.innerHTML = `
      <div class="card">
        <div class="card-title">👥 Chauffeurs — statut du jour</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Route</th><th>Camion</th><th>Télépéage</th><th>Km</th><th>Photos</th><th>Statut</th></tr></thead>
          <tbody>
          ${(tournees || []).map(t => {
            const km = t.km_retour && t.km_depart ? t.km_retour - t.km_depart : null;
            const photos = [t.photo_camion_matin, t.photo_mobilic_matin, t.photo_camion_soir, t.photo_mobilic_soir].filter(Boolean).length;
            return `<tr>
              <td><div class="driver-info">${avatarHTML(t.profiles?.full_name, 28)}<span>${t.profiles?.full_name}</span></div></td>
              <td>${routeBadge(t.vehicule_attributions?.route)}</td>
              <td>${plateBadge(t.vehicule_attributions?.plaque)}</td>
              <td>${tpBadge(t.vehicule_attributions?.telepeage_badges?.reference)}</td>
              <td>${km !== null ? fmtKm(km) : '—'}</td>
              <td><span class="dot ${photos === 4 ? 'dot-ok' : photos >= 2 ? 'dot-warn' : 'dot-err'}"></span>${photos}/4</td>
              <td>${statusBadge(t.statut || 'absent')}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="7" class="text-muted">Aucune donnée</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  // ── PLANNING ──
  _planningWeekOffset: 0,

  _statutConfig: {
    travail:      { icon: '🟢', label: 'Travail',      bg: '#D1FAE5', color: '#166534', border: '#A7F3D0' },
    repos:        { icon: '⚪', label: 'Repos',        bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' },
    cut:          { icon: '✂️', label: 'Cut',          bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    mad:          { icon: '🔵', label: 'MAD',          bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
    absent:       { icon: '🚫', label: 'Absent',       bg: '#FFF7ED', color: '#92400E', border: '#FED7AA' },
    mis_a_pied:   { icon: '⛔', label: 'Mis à pied',  bg: '#FEF2F2', color: '#7F1D1D', border: '#FECACA' },
    arret_travail:{ icon: '🏥', label: 'Arrêt',        bg: '#F5F3FF', color: '#4C1D95', border: '#DDD6FE' },
    refus:        { icon: '🙅', label: 'Refus',        bg: '#FFF1F2', color: '#881337', border: '#FFE4E6' },
    ride_along:   { icon: '🚗', label: 'Ride Along',   bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
    formation:    { icon: '📚', label: 'Formation',    bg: '#FFFBEB', color: '#78350F', border: '#FDE68A' },
  },

  async loadPlanning() {
    const el = document.getElementById('panel-planning');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const offset = ManagerPage._planningWeekOffset || 0;
      const startDate = new Date(Date.now() + offset * 7 * 86400000);
      const days = Array.from({length:7}, (_,i) => {
        const d = new Date(startDate.getTime() + i * 86400000);
        return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'numeric'}) };
      });
      const { data: planning } = await supabase.from('planning').select('*, profiles(full_name)').gte('date', days[0].date).lte('date', days[6].date);
      const { data: chauffeurs } = await supabase.from('profiles').select('id,full_name').eq('role','driver').order('full_name');
      const { data: forecasts } = await supabase.from('planning_forecast').select('*').gte('date', days[0].date).lte('date', days[6].date);
      const forecastMap = {};
      (forecasts||[]).forEach(f => { forecastMap[f.date] = f; });
      const cfg = ManagerPage._statutConfig;
      const countByDay = {};
      days.forEach(d => {
        const entries = (planning||[]).filter(p => p.date === d.date);
        const counts = { forecast: forecastMap[d.date]?.forecast || 0 };
        Object.keys(cfg).forEach(s => { counts[s] = entries.filter(p => p.statut === s).length; });
        countByDay[d.date] = counts;
      });
      const statutCell = (entry) => {
        if (!entry) return `<div style="width:100%;height:36px;border-radius:8px;background:#F3F4F6;border:2px dashed #E5E7EB;cursor:pointer;"></div>`;
        const c = cfg[entry.statut];
        if (!c) return `<div style="width:100%;height:36px;border-radius:8px;background:#F3F4F6;border:2px solid #E5E7EB;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;">${entry.statut}</div>`;
        const heuresLabel = entry.heures ? `<span style="font-size:9px;opacity:.8;">${entry.heures}h</span>` : '';
        return `<div style="width:100%;height:36px;border-radius:8px;background:${c.bg};color:${c.color};border:2px solid ${c.border};display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;gap:1px;">${c.icon}${heuresLabel}</div>`;
      };
      const totalTravail  = days.reduce((s, d) => s + countByDay[d.date].travail, 0);
      const totalMad      = days.reduce((s, d) => s + countByDay[d.date].mad, 0);
      const totalForecast = days.reduce((s, d) => s + countByDay[d.date].forecast, 0);
      const totalBuffer   = totalTravail - totalForecast;
      const bufferStyle = (buffer, forecast) => {
        if (forecast === 0) return { color: '#9CA3AF', bg: '#F3F4F6', label: '—' };
        const sign = buffer > 0 ? '+' : '';
        const color = buffer < 0 ? '#B91C1C' : buffer <= 3 ? '#92400E' : '#166534';
        const bg    = buffer < 0 ? '#FEE2E2' : buffer <= 3 ? '#FEF3C7' : '#D1FAE5';
        return { color, bg, label: sign + buffer };
      };
      el.innerHTML = `
      <div class="card" style="overflow-x:auto;">
        <div class="card-title">📅 Planning
          <div class="card-actions">
            <button class="btn sm" onclick="ManagerPage._planningWeekOffset--;ManagerPage.loadPlanning()">◀</button>
            <span style="font-size:11px;color:#6B7280;padding:0 4px;">${days[0].label} → ${days[6].label}</span>
            <button class="btn sm" onclick="ManagerPage._planningWeekOffset++;ManagerPage.loadPlanning()">▶</button>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;min-width:500px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;font-size:11px;color:#6B7280;min-width:120px;"></th>
              ${days.map(d => `<th style="text-align:center;padding:6px 3px;font-size:10px;color:#6B7280;min-width:44px;">${d.label}</th>`).join('')}
              <th style="text-align:center;padding:6px 3px;font-size:10px;color:#6B7280;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#EFF6FF;">
              <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#1E40AF;">📊 Forecast</td>
              ${days.map(d => `<td style="padding:3px;text-align:center;"><input type="number" min="0" max="99" value="${countByDay[d.date].forecast}" style="width:40px;text-align:center;border:1px solid #BFDBFE;border-radius:6px;padding:4px 2px;font-size:12px;font-weight:700;color:#1E40AF;background:#EFF6FF;" onchange="ManagerPage.saveForecast('${d.date}', this.value)"></td>`).join('')}
              <td style="padding:6px 3px;text-align:center;font-size:12px;font-weight:700;color:#1E40AF;">${totalForecast}</td>
            </tr>
            <tr style="background:#F0FDF4;">
              <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#166534;">🟢 Travail</td>
              ${days.map(d => { const count = countByDay[d.date].travail; const forecast = countByDay[d.date].forecast; const color = forecast > 0 && count < forecast ? '#B91C1C' : count > 0 ? '#166534' : '#9CA3AF'; return `<td style="padding:6px 3px;text-align:center;font-size:13px;font-weight:700;color:${color};">${count || '—'}</td>`; }).join('')}
              <td style="padding:6px 3px;text-align:center;font-size:13px;font-weight:700;color:#166534;">${totalTravail}</td>
            </tr>
            <tr style="background:#FFFBEB;">
              <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#374151;">📊 Buffer</td>
              ${days.map(d => { const buffer = countByDay[d.date].travail - countByDay[d.date].forecast; const bs = bufferStyle(buffer, countByDay[d.date].forecast); return `<td style="padding:4px 3px;text-align:center;"><span style="display:inline-block;min-width:32px;padding:3px 6px;border-radius:6px;background:${bs.bg};color:${bs.color};font-size:12px;font-weight:700;">${bs.label}</span></td>`; }).join('')}
              <td style="padding:4px 3px;text-align:center;">${(() => { const bs = bufferStyle(totalBuffer, totalForecast); return `<span style="display:inline-block;min-width:32px;padding:3px 6px;border-radius:6px;background:${bs.bg};color:${bs.color};font-size:12px;font-weight:700;">${bs.label}</span>`; })()}</td>
            </tr>
            <tr style="background:#EFF6FF;">
              <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#1E40AF;">🔵 MAD</td>
              ${days.map(d => { const count = countByDay[d.date].mad; return `<td style="padding:6px 3px;text-align:center;font-size:13px;font-weight:700;color:${count > 0 ? '#1E40AF' : '#9CA3AF'};">${count || '—'}</td>`; }).join('')}
              <td style="padding:6px 3px;text-align:center;font-size:13px;font-weight:700;color:#1E40AF;">${totalMad}</td>
            </tr>
            ${(() => {
              const absStatuts = ['absent','mis_a_pied','arret_travail','refus','ride_along','formation'];
              const hasAny = days.some(d => absStatuts.some(s => countByDay[d.date][s] > 0));
              if (!hasAny) return '';
              return absStatuts.map(s => {
                const c = cfg[s];
                const total = days.reduce((sum, d) => sum + (countByDay[d.date][s] || 0), 0);
                if (total === 0) return '';
                return `<tr style="background:${c.bg};"><td style="padding:5px 8px;font-size:11px;font-weight:700;color:${c.color};">${c.icon} ${c.label}</td>${days.map(d => { const count = countByDay[d.date][s] || 0; return `<td style="padding:5px 3px;text-align:center;font-size:12px;font-weight:700;color:${count > 0 ? c.color : '#9CA3AF'};">${count || '—'}</td>`; }).join('')}<td style="padding:5px 3px;text-align:center;font-size:12px;font-weight:700;color:${c.color};">${total}</td></tr>`;
              }).join('');
            })()}
            <tr><td colspan="9" style="height:8px;background:#F9FAFB;"></td></tr>
            ${(chauffeurs||[]).map(c => {
              const cells = days.map(d => { const entry = planning?.find(p => p.profile_id === c.id && p.date === d.date); return `<td style="padding:3px;" onclick="ManagerPage.openPlanningPopup('${c.id}','${c.full_name}','${d.date}','${d.label}')">${statutCell(entry)}</td>`; }).join('');
              const totalJours = days.filter(d => { const entry = planning?.find(p => p.profile_id === c.id && p.date === d.date); return entry?.statut === 'travail'; }).length;
              return `<tr><td style="padding:6px 8px;"><div style="display:flex;align-items:center;gap:6px;">${avatarHTML(c.full_name, 24)}<span style="font-size:11px;font-weight:500;">${c.full_name.split(' ')[0]}</span></div></td>${cells}<td style="padding:6px 3px;text-align:center;font-size:12px;font-weight:600;color:#6B7280;">${totalJours || '—'}</td></tr>`;
            }).join('') || '<tr><td colspan="9" class="text-muted">Aucun chauffeur</td></tr>'}
          </tbody>
        </table>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  async saveForecast(date, value) {
    const forecast = parseInt(value) || 0;
    const { error } = await supabase.from('planning_forecast').upsert({ date, forecast }, { onConflict: 'date' });
    if (error) toast('Erreur sauvegarde forecast : ' + error.message);
  },

  openPlanningPopup(driverId, driverName, date, dateLabel) {
    ManagerPage._popupDriverId = driverId;
    ManagerPage._popupDate = date;
    ManagerPage._selectedStatut = null;
    document.getElementById('popup-title').textContent = driverName;
    document.getElementById('popup-subtitle').textContent = dateLabel;
    document.querySelectorAll('.popup-stat-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('popup-heures-row').style.display = 'none';
    document.getElementById('popup-heures').value = '';
    const btnSave = document.getElementById('btn-popup-save');
    btnSave.disabled = true;
    btnSave.style.background = '#E5E7EB';
    btnSave.style.color = '#9CA3AF';
    btnSave.style.cursor = 'not-allowed';
    document.getElementById('planning-popup').style.display = 'flex';
  },

  selectStatut(statut) {
    ManagerPage._selectedStatut = statut;
    document.querySelectorAll('.popup-stat-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.getElementById('btn-stat-' + statut);
    if (btn) btn.classList.add('selected');
    document.getElementById('popup-heures-row').style.display = (statut !== 'repos') ? 'block' : 'none';
    const btnSave = document.getElementById('btn-popup-save');
    btnSave.disabled = false;
    btnSave.style.background = '#1E40AF';
    btnSave.style.color = '#fff';
    btnSave.style.cursor = 'pointer';
  },

  closePlanningPopup() {
    document.getElementById('planning-popup').style.display = 'none';
    ManagerPage._selectedStatut = null;
  },

  async savePlanningStat() {
    const statut   = ManagerPage._selectedStatut;
    const driverId = ManagerPage._popupDriverId;
    const date     = ManagerPage._popupDate;
    if (!statut || !driverId || !date) return;
    const heuresVal = document.getElementById('popup-heures').value;
    const heures = heuresVal !== '' ? parseFloat(heuresVal) : null;
    const { error } = await supabase.from('planning').upsert({ profile_id: driverId, date, statut, route: null, heures }, { onConflict: 'profile_id,date' });
    if (error) { toast('Erreur : ' + error.message); return; }
    ManagerPage.closePlanningPopup();
    toast('Planning mis à jour ✓');
    ManagerPage.loadPlanning();
  },

  // ── VEHICULES ──
  async loadVehicules() {
    const el = document.getElementById('panel-vehicules');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: attrs } = await supabase.from('vehicule_attributions').select('*, profiles(full_name), telepeage_badges(reference), tournees(km_depart,km_retour,statut)').eq('date', today()).order('created_at');
      const { data: chauffeurs } = await supabase.from('profiles').select('id,full_name').eq('role','driver').order('full_name');
      const { data: badges } = await supabase.from('telepeage_badges').select('id,reference').order('reference');
      const plaques  = (attrs||[]).map(a => a.plaque).filter(Boolean);
      const routes   = (attrs||[]).map(a => a.route).filter(Boolean);
      const badgeIds = (attrs||[]).map(a => a.telepeage_badge_id).filter(Boolean);
      const doublonPlaques = plaques.filter((p, i) => plaques.indexOf(p) !== i);
      const doublonRoutes  = routes.filter((r, i) => routes.indexOf(r) !== i);
      const doublonBadges  = badgeIds.filter((b, i) => badgeIds.indexOf(b) !== i);
      const alertes = [];
      if (doublonPlaques.length) alertes.push(`⚠️ Plaque(s) en doublon : <strong>${[...new Set(doublonPlaques)].join(', ')}</strong>`);
      if (doublonRoutes.length)  alertes.push(`⚠️ Route(s) en doublon : <strong>${[...new Set(doublonRoutes)].join(', ')}</strong>`);
      if (doublonBadges.length)  alertes.push(`⚠️ Badge(s) télépéage en doublon !`);
      el.innerHTML = `
      ${alertes.length ? `<div class="notif err" style="margin-bottom:12px;">${alertes.join('<br>')}</div>` : ''}
      <div class="card">
        <div class="card-title">🚛 Attributions véhicules — aujourd'hui</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Plaque</th><th>Route</th><th>Vague</th><th>Télépéage</th><th>Statut</th><th></th></tr></thead>
          <tbody>
          ${(attrs||[]).map(a => {
            const t = Array.isArray(a.tournees) ? a.tournees[0] : a.tournees;
            const isDuplPlaque = doublonPlaques.includes(a.plaque);
            const isDuplRoute  = doublonRoutes.includes(a.route);
            const isDuplBadge  = doublonBadges.includes(a.telepeage_badge_id);
            return `<tr>
              <td>${avatarHTML(a.profiles?.full_name,28)} ${a.profiles?.full_name}</td>
              <td style="${isDuplPlaque?'color:#B91C1C;font-weight:700;':''}">${plateBadge(a.plaque)}${isDuplPlaque?' ⚠️':''}</td>
              <td style="${isDuplRoute?'color:#B91C1C;font-weight:700;':''}">${routeBadge(a.route)}${isDuplRoute?' ⚠️':''}</td>
              <td>${a.vague ? `<span class="badge b-amber">Vague ${a.vague}</span>` : '—'}</td>
              <td style="${isDuplBadge?'color:#B91C1C;font-weight:700;':''}">${tpBadge(a.telepeage_badges?.reference)}${isDuplBadge?' ⚠️':''}</td>
              <td>${statusBadge(t?.statut || 'absent')}</td>
              <td><button class="btn sm" onclick="ManagerPage.openEditAttrPopup('${a.id}','${a.plaque||''}','${a.route||''}','${a.vague||''}','${a.telepeage_badge_id||''}','${a.profiles?.full_name||''}')">✏️</button></td>
            </tr>`;
          }).join('') || '<tr><td colspan="7" class="text-muted">Aucune attribution aujourd\'hui</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">➕ Attribuer un véhicule</div>
        <div class="grid-4">
          <div class="form-row"><label class="form-label">Chauffeur</label><select class="form-input" id="veh-driver">${(chauffeurs||[]).map(c=>`<option value="${c.id}">${c.full_name}</option>`).join('')}</select></div>
          <div class="form-row"><label class="form-label">Plaque du camion</label><input class="form-input" type="text" id="veh-plaque" placeholder="AB-1234-CD" style="font-family:monospace;letter-spacing:1px;text-transform:uppercase;"></div>
          <div class="form-row"><label class="form-label">Numéro de route</label><input class="form-input" type="text" id="veh-route" placeholder="Ex: R-14" style="text-transform:uppercase;"></div>
          <div class="form-row"><label class="form-label">Vague de départ</label><select class="form-input" id="veh-vague"><option value="">— Aucune —</option><option value="1">1ère vague — 12h10</option><option value="2">2ème vague — 12h20</option><option value="3">3ème vague</option></select></div>
          <div class="form-row"><label class="form-label">Badge télépéage</label><select class="form-input" id="veh-badge"><option value="">— Aucun —</option>${(badges||[]).map(b=>`<option value="${b.id}">${b.reference}</option>`).join('')}</select></div>
          <div class="form-row"><label class="form-label">Date</label><input class="form-input" type="date" id="veh-date" value="${today()}"></div>
        </div>
        <div class="flex-end"><button class="btn primary" onclick="ManagerPage.saveAttribution()">✓ Attribuer</button></div>
      </div>`;
      ManagerPage._badges = badges || [];
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  async openEditAttrPopup(id, plaque, route, vague, badgeId, name) {
    ManagerPage._editAttrId = id;
    document.getElementById('edit-attr-title').textContent = `✏️ Modifier — ${name}`;
    document.getElementById('edit-plaque').value = plaque;
    document.getElementById('edit-route').value = route;
    document.getElementById('edit-vague').value = vague;
    const badgeSelect = document.getElementById('edit-badge');
    badgeSelect.innerHTML = `<option value="">— Aucun —</option>` + (ManagerPage._badges||[]).map(b => `<option value="${b.id}" ${b.id === badgeId ? 'selected' : ''}>${b.reference}</option>`).join('');
    document.getElementById('edit-attr-popup').style.display = 'flex';
  },

  closeEditAttrPopup() { document.getElementById('edit-attr-popup').style.display = 'none'; },

  async saveEditAttribution() {
    const id     = ManagerPage._editAttrId;
    const plaque = document.getElementById('edit-plaque').value.trim().toUpperCase();
    const route  = document.getElementById('edit-route').value.trim().toUpperCase() || null;
    const vague  = document.getElementById('edit-vague').value || null;
    const badge  = document.getElementById('edit-badge').value || null;
    if (!plaque) return toast('La plaque est obligatoire.');
    const { error } = await supabase.from('vehicule_attributions').update({ plaque, route, vague, telepeage_badge_id: badge || null }).eq('id', id);
    if (error) return toast('Erreur : ' + error.message);
    toast('Attribution mise à jour ✓');
    ManagerPage.closeEditAttrPopup();
    ManagerPage.loadVehicules();
  },

  async saveAttribution() {
    const driver = document.getElementById('veh-driver').value;
    const plaque = document.getElementById('veh-plaque').value.trim().toUpperCase();
    const route  = document.getElementById('veh-route').value.trim().toUpperCase() || null;
    const vague  = document.getElementById('veh-vague').value || null;
    const badge  = document.getElementById('veh-badge').value || null;
    const date   = document.getElementById('veh-date').value;
    if (!driver || !plaque || !date) return toast('Merci de remplir tous les champs obligatoires.');
    const { error } = await supabase.from('vehicule_attributions').upsert({ profile_id: driver, plaque, route, vague, telepeage_badge_id: badge || null, date }, { onConflict: 'profile_id,date' });
    if (error) return toast('Erreur : ' + error.message);
    toast('Véhicule attribué ✓');
    ManagerPage.loadVehicules();
  },

  // ── HISTORIQUE ──
  async loadHistorique() {
    const el = document.getElementById('panel-historique');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: hist } = await supabase.from('vehicule_attributions').select('*, profiles(full_name), telepeage_badges(reference), tournees(km_depart,km_retour,statut,photo_camion_matin,photo_mobilic_matin,photo_camion_soir,photo_mobilic_soir)').order('date', { ascending: false }).limit(100);
      const plaques = [...new Set((hist||[]).map(h => h.plaque))].sort();
      const chauffeurs = [...new Set((hist||[]).map(h => h.profiles?.full_name).filter(Boolean))].sort();
      el.innerHTML = `
      <div class="card">
        <div class="card-title">🕓 Historique camions
          <div class="card-actions">
            <input type="date" class="form-input" id="hist-date" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()">
            <select class="form-input" id="hist-chauffeur" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()"><option value="all">Tous</option>${chauffeurs.map(c=>`<option value="${c}">${c.split(' ')[0]}</option>`).join('')}</select>
            <select class="form-input" id="hist-filter" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()"><option value="all">Tous véhicules</option>${plaques.map(p=>`<option value="${p}">${p}</option>`).join('')}</select>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Date</th><th>Chauffeur</th><th>Plaque</th><th>Km</th><th>Statut</th><th>Photos</th></tr></thead>
          <tbody id="hist-tbody">
          ${(hist||[]).map(h => {
            const t = Array.isArray(h.tournees) ? h.tournees[0] : h.tournees;
            const km = t?.km_retour && t?.km_depart ? t.km_retour - t.km_depart : null;
            const photos = [{ url: t?.photo_camion_matin, label: '🚛M' }, { url: t?.photo_mobilic_matin, label: '📱M' }, { url: t?.photo_camion_soir, label: '🚛S' }, { url: t?.photo_mobilic_soir, label: '📱S' }].filter(p => p.url);
            return `<tr data-plate="${h.plaque}" data-chauffeur="${h.profiles?.full_name || ''}" data-date="${h.date}">
              <td class="text-muted text-sm">${fmtDate(h.date)}</td>
              <td>${avatarHTML(h.profiles?.full_name,24)} <span style="font-size:11px;">${h.profiles?.full_name?.split(' ')[0]||''}</span></td>
              <td>${plateBadge(h.plaque)}</td>
              <td>${km !== null ? '<strong>'+fmtKm(km)+'</strong>' : '—'}</td>
              <td>${statusBadge(t?.statut || 'absent')}</td>
              <td>${photos.map(p => `<a href="${p.url}" target="_blank"><button class="btn sm" style="margin:1px;padding:2px 6px;font-size:10px;">${p.label}</button></a>`).join('')||'—'}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="6" class="text-muted">Aucun historique</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  filterHistorique() {
    const plate = document.getElementById('hist-filter')?.value || 'all';
    const chauffeur = document.getElementById('hist-chauffeur')?.value || 'all';
    const date = document.getElementById('hist-date')?.value || '';
    document.querySelectorAll('#hist-tbody tr').forEach(row => {
      const matchPlate = plate === 'all' || row.dataset.plate === plate;
      const matchChauffeur = chauffeur === 'all' || row.dataset.chauffeur === chauffeur;
      const matchDate = !date || row.dataset.date === date;
      row.style.display = (matchPlate && matchChauffeur && matchDate) ? '' : 'none';
    });
  },

  // ── TELEPEAGE ──
  async loadTelepeage() {
    const el = document.getElementById('panel-telepeage');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: badges } = await supabase.from('telepeage_badges').select('*, vehicule_attributions(date, plaque, profiles(full_name))').order('reference');
      el.innerHTML = `
      <div class="card">
        <div class="card-title">💳 Badges télépéage</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Badge</th><th>Chauffeur</th><th>Plaque</th><th>Date</th><th>Statut</th></tr></thead>
          <tbody>
          ${(badges||[]).map(b => {
            const attrs = Array.isArray(b.vehicule_attributions) ? b.vehicule_attributions : [];
            const last = attrs.sort((a,b) => b.date > a.date ? 1 : -1)[0];
            const isToday = last?.date === today();
            return `<tr><td>${tpBadge(b.reference)}</td><td>${last ? avatarHTML(last.profiles?.full_name,24)+' <span style="font-size:11px;">'+last.profiles?.full_name?.split(' ')[0]+'</span>' : '—'}</td><td>${last ? plateBadge(last.plaque) : '—'}</td><td class="text-muted text-sm">${last ? fmtDate(last.date) : '—'}</td><td>${isToday ? '<span class="badge b-green">En service</span>' : last ? '<span class="badge b-gray">Inactif</span>' : '<span class="badge b-gray">Dispo</span>'}</td></tr>`;
          }).join('') || '<tr><td colspan="5" class="text-muted">Aucun badge</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">➕ Ajouter un badge</div>
        <div class="grid-2">
          <div class="form-row"><label class="form-label">Référence (ex: TP-016)</label><input class="form-input" type="text" id="tp-ref" placeholder="TP-016" style="font-family:monospace;"></div>
          <div class="form-row"><label class="form-label">Notes (optionnel)</label><input class="form-input" type="text" id="tp-notes" placeholder="Badge de remplacement..."></div>
        </div>
        <div class="flex-end"><button class="btn primary" onclick="ManagerPage.saveBadge()">➕ Ajouter</button></div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  async saveBadge() {
    const ref   = document.getElementById('tp-ref').value.trim().toUpperCase();
    const notes = document.getElementById('tp-notes').value.trim();
    if (!ref) return toast('Merci de saisir une référence.');
    const { error } = await supabase.from('telepeage_badges').insert({ reference: ref, notes });
    if (error) return toast('Erreur : ' + error.message);
    toast('Badge ajouté ✓');
    ManagerPage.loadTelepeage();
  },

  // ── PHOTOS ──
  async loadPhotos() {
    const el = document.getElementById('panel-photos');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: tournees } = await supabase.from('tournees').select('*, profiles(full_name), vehicule_attributions(plaque)').eq('date', today()).order('created_at');
      const rows = [];
      for (const t of (tournees || [])) {
        const name = t.profiles?.full_name;
        const photos = [{ url: t.photo_camion_matin, type: 'Camion', moment: 'Matin' }, { url: t.photo_mobilic_matin, type: 'Mobilic', moment: 'Matin' }, { url: t.photo_camion_soir, type: 'Camion', moment: 'Soir' }, { url: t.photo_mobilic_soir, type: 'Mobilic', moment: 'Soir' }];
        for (const ph of photos) rows.push({ name, ...ph });
      }
      const recu = rows.filter(r => r.url).length;
      const manquant = rows.filter(r => !r.url).length;
      el.innerHTML = `
      <div class="card">
        <div class="card-title">📷 Photos reçues — aujourd'hui <span class="badge b-green" style="margin-left:4px;">${recu} reçues</span><span class="badge b-amber" style="margin-left:4px;">${manquant} manquantes</span></div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Type</th><th>Moment</th><th>Statut</th><th>Voir</th></tr></thead>
          <tbody>
          ${rows.map(r => `<tr><td>${avatarHTML(r.name,24)} <span style="font-size:11px;">${r.name?.split(' ')[0]||''}</span></td><td><span class="badge ${r.type==='Camion'?'b-blue':'b-amber'}" style="font-size:10px;">${r.type}</span></td><td style="font-size:12px;">${r.moment}</td><td><span class="dot ${r.url?'dot-ok':'dot-err'}"></span></td><td>${r.url ? `<a href="${r.url}" target="_blank"><button class="btn sm">👁</button></a>` : '—'}</td></tr>`).join('') || '<tr><td colspan="5" class="text-muted">Aucune donnée</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  // ── KM ──
  async loadKm() {
    const el = document.getElementById('panel-km');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const weekStart = new Date(Date.now() - 6*86400000).toISOString().split('T')[0];
      const { data: tournees } = await supabase.from('tournees').select('*, profiles(full_name), vehicule_attributions(plaque, route)').gte('date', weekStart).order('date');
      const byDriver = {};
      for (const t of (tournees || [])) {
        const name = t.profiles?.full_name;
        if (!byDriver[name]) byDriver[name] = { jours: {}, total: 0 };
        const km = t.km_retour && t.km_depart ? t.km_retour - t.km_depart : null;
        byDriver[name].jours[t.date] = km;
        if (km) byDriver[name].total += km;
      }
      const days = Array.from({length:7},(_,i) => { const d = new Date(Date.now() - (6-i)*86400000); return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}) }; });
      el.innerHTML = `
      <div class="card">
        <div class="card-title">📈 Kilométrages — 7 derniers jours</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th>${days.map(d=>`<th style="font-size:10px;">${d.label}</th>`).join('')}<th>Total</th></tr></thead>
          <tbody>
          ${Object.entries(byDriver).map(([name, data]) => `<tr><td style="font-size:11px;">${avatarHTML(name,24)} ${name.split(' ')[0]}</td>${days.map(d => `<td style="font-size:11px;">${data.jours[d.date] !== undefined ? data.jours[d.date] !== null ? data.jours[d.date]+' km' : '—' : '—'}</td>`).join('')}<td><strong style="font-size:11px;">${fmtKm(data.total)}</strong></td></tr>`).join('') || '<tr><td colspan="9" class="text-muted">Aucune donnée</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  // ── PERFORMANCE ──
  async loadPerformance() {
    const el = document.getElementById('panel-performance');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: semaines } = await supabase.from('performance_semaines').select('semaine').order('semaine', { ascending: false });
      const uniqueSemaines = [...new Set((semaines||[]).map(s => s.semaine))];
      const derniereSemaine = uniqueSemaines[0] || '';
      let data = [];
      if (derniereSemaine) {
        const { data: perf } = await supabase.from('performance_semaines').select('*').eq('semaine', derniereSemaine).order('classement', { ascending: true });
        data = perf || [];
      }
      const total = data.length;
      el.innerHTML = `
      <div class="card">
        <div class="card-title">🏆 Performances
          <div class="card-actions">
            <select class="form-input" id="perf-semaine" style="width:auto;font-size:12px;" onchange="ManagerPage.changerSemainePerf(this.value)">${uniqueSemaines.map(s => `<option value="${s}" ${s===derniereSemaine?'selected':''}>${s}</option>`).join('')}</select>
            <button class="btn sm primary" onclick="ManagerPage.showImportPerf()">⬆ Import</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>#</th><th>Chauffeur</th><th>Statut</th><th>Moy.</th><th>Colis</th><th>DCR</th><th>Remb.</th><th>LOR</th><th>Photo</th><th>Contact</th><th>Plainte</th></tr></thead>
          <tbody id="perf-tbody">${ManagerPage.renderPerfRows(data, total)}</tbody>
        </table>
        </div>
      </div>
      <div class="card" id="import-perf-card" style="display:none;">
        <div class="card-title">⬆ Importer scorecard Excel</div>
        <div class="grid-2">
          <div class="form-row"><label class="form-label">Semaine (ex: W23)</label><input class="form-input" type="text" id="perf-semaine-input" placeholder="W23"></div>
          <div class="form-row"><label class="form-label">Fichier Excel</label><input class="form-input" type="file" id="perf-file" accept=".xlsx,.xls,.xlsm"></div>
        </div>
        <div class="flex-end">
          <button class="btn" onclick="document.getElementById('import-perf-card').style.display='none'">Annuler</button>
          <button class="btn primary" id="btn-import-perf" onclick="ManagerPage.importPerf()" style="margin-left:8px;">✓ Importer</button>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  renderPerfRows(data, total) {
    if (!data || data.length === 0) return '<tr><td colspan="11" class="text-muted">Aucune donnée</td></tr>';
    const statutBadge = (s) => { const map = { 'FANTASTIC +': '<span class="badge" style="background:#E6F4EA;color:#1E7E34;font-size:10px;">⭐F+</span>', 'FANTASTIC': '<span class="badge" style="background:#E8F0FE;color:#1A56DB;font-size:10px;">✅F</span>', 'GREAT': '<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px;">👍G</span>', 'FAIR': '<span class="badge" style="background:#FEE2E2;color:#B91C1C;font-size:10px;">⚠️F</span>', 'POOR': '<span class="badge" style="background:#F3F4F6;color:#6B7280;font-size:10px;">❌P</span>' }; return map[s] || `<span class="badge b-gray" style="font-size:10px;">${s||'—'}</span>`; };
    const pctColor = (v) => { if (!v) return ''; const n = parseFloat(v) > 2 ? parseFloat(v) : parseFloat(v) * 100; if (n >= 99) return 'color:#1E7E34;font-weight:600'; if (n >= 97) return 'color:#92400E;font-weight:600'; return 'color:#B91C1C;font-weight:600'; };
    const numColor = (v) => { if (v === null || v === undefined) return ''; return parseFloat(v) === 0 ? 'color:#1E7E34;font-weight:600' : 'color:#B91C1C;font-weight:600'; };
    const fmtPct = (v) => { if (v === null || v === undefined) return '—'; const n = parseFloat(v); return isNaN(n) ? '—' : (n > 2 ? n.toFixed(1) : (n * 100).toFixed(1)) + '%'; };
    return data.map((d) => `<tr><td style="font-size:11px;color:#6B7280;">${d.classement}/${total}</td><td style="font-size:11px;">${avatarHTML(d.nom_prenom, 22)} ${d.nom_prenom?.split(' ')[0]||''}</td><td>${statutBadge(d.statut)}</td><td style="font-size:11px;font-weight:600;">${d.moyenne ? Math.round(d.moyenne * 100) / 100 : '—'}</td><td style="font-size:11px;">${d.colis_livres ?? '—'}</td><td style="font-size:11px;${pctColor(d.reussite_livraison_pct)}">${fmtPct(d.reussite_livraison_pct)}</td><td style="font-size:11px;${numColor(d.remboursement_colis)}">${d.remboursement_colis ?? '—'}</td><td style="font-size:11px;${numColor(d.lor_dpmo)}">${d.lor_dpmo ?? '—'}</td><td style="font-size:11px;${pctColor(d.photo_pct)}">${fmtPct(d.photo_pct)}</td><td style="font-size:11px;${pctColor(d.contact_pct)}">${fmtPct(d.contact_pct)}</td><td style="font-size:11px;${numColor(d.plainte_client)}">${d.plainte_client ?? '—'}</td></tr>`).join('');
  },

  showImportPerf() { const card = document.getElementById('import-perf-card'); if (card) card.style.display = 'block'; },

  async changerSemainePerf(semaine) {
    const { data: perf } = await supabase.from('performance_semaines').select('*').eq('semaine', semaine).order('classement', { ascending: true });
    const total = (perf||[]).length;
    const tbody = document.getElementById('perf-tbody');
    if (tbody) tbody.innerHTML = ManagerPage.renderPerfRows(perf, total);
  },

  async importPerf() {
    const semaine = document.getElementById('perf-semaine-input').value.trim();
    const file = document.getElementById('perf-file').files[0];
    if (!semaine || !file) return toast('Merci de remplir tous les champs.');
    const btn = document.getElementById('btn-import-perf');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Import...';
    try {
      const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheetName = wb.SheetNames.find(n => n.toUpperCase().trim().includes('SCORECARD')) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
      let headerRow = -1;
      for (let i = 0; i < rows.length; i++) { if (rows[i].some(c => String(c||'').toLowerCase().includes('classement'))) { headerRow = i; break; } }
      if (headerRow === -1) throw new Error('Format non reconnu');
      const dataRows = rows.slice(headerRow + 1).filter(r => r[1] && String(r[1]).trim() !== '');
      const total = dataRows.length;
      if (total === 0) throw new Error('Aucune donnée trouvée');
      const records = dataRows.map((r, i) => ({ semaine, classement: i + 1, total_chauffeurs: total, nom_prenom: String(r[1]).trim(), statut: r[3] ? String(r[3]).trim() : null, moyenne: r[4] !== null ? parseFloat(r[4]) : null, transporter_id: r[5] ? String(r[5]).trim() : null, colis_livres: r[6] !== null ? parseInt(r[6]) : null, reussite_livraison_pct: r[7] !== null ? parseFloat(r[7]) : null, remboursement_colis: r[8] !== null ? parseInt(r[8]) : null, lor_dpmo: r[9] !== null ? parseInt(r[9]) : null, photo_pct: r[10] !== null ? parseFloat(r[10]) : null, contact_pct: r[11] !== null ? parseFloat(r[11]) : null, plainte_client: r[12] !== null ? parseInt(r[12]) : null, note_client: r[13] !== null ? String(r[13]) : null, score_reussite: null, score_remboursement: null, score_lor: null, score_photo: null, score_contact: null, score_plainte: null, score_note: null }));
      await supabase.from('performance_semaines').delete().eq('semaine', semaine);
      const { error } = await supabase.from('performance_semaines').insert(records);
      if (error) throw error;
      toast(`✓ ${records.length} chauffeurs importés pour ${semaine}`);
      document.getElementById('import-perf-card').style.display = 'none';
      ManagerPage.loadPerformance();
    } catch(e) {
      toast('Erreur import : ' + e.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '✓ Importer';
    }
  },

  // ── ADMIN ──
  async loadAdmin() {
    const el = document.getElementById('panel-admin');
    const { data: drivers } = await supabase.from('profiles').select('*').eq('role','driver').order('full_name');
    el.innerHTML = `
    <div class="card">
      <div class="card-title">👤 Créer un compte chauffeur</div>
      <div class="grid-2">
        <div class="form-row"><label class="form-label">Prénom Nom</label><input class="form-input" type="text" id="adm-name" placeholder="Jean Dupont"></div>
        <div class="form-row"><label class="form-label">Email</label><input class="form-input" type="email" id="adm-email" placeholder="jean@gmail.com"></div>
        <div class="form-row"><label class="form-label">Mot de passe</label><input class="form-input" type="text" id="adm-pwd" placeholder="Min. 8 caractères" value="Transport31!"></div>
        <div class="form-row"><label class="form-label">Transporter ID <span style="color:#9CA3AF;font-weight:400;">(optionnel)</span></label><input class="form-input" type="text" id="adm-tid" placeholder="Ex: A34Q69ZJEEAHO6" style="font-family:monospace;text-transform:uppercase;"></div>
      </div>
      <p class="text-muted text-sm" style="margin-top:4px;">💡 Communique les identifiants au chauffeur via WhatsApp.</p>
      <div class="flex-end">
        <button class="btn primary" id="btn-create-driver" onclick="ManagerPage.createDriver()">➕ Créer le compte</button>
      </div>
      <div id="driver-created-result" style="display:none;margin-top:14px;background:#F0FDF4;border:1px solid #D1FAE5;border-radius:10px;padding:14px;">
        <div style="font-size:13px;font-weight:600;color:#166534;margin-bottom:8px;">✅ Compte créé — identifiants à transmettre :</div>
        <div style="font-size:12px;font-family:monospace;color:#374151;line-height:1.8;" id="driver-created-info"></div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn sm" onclick="ManagerPage.copyDriverCredentials()">📋 Copier</button>
          <button class="btn sm" style="background:#25D366;color:#fff;border-color:#25D366;" onclick="ManagerPage.sendDriverWhatsApp()">WhatsApp</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">👥 Chauffeurs existants</div>
      <div class="tbl-wrap">
      <table class="tbl">
        <thead><tr><th>Chauffeur</th><th>Email</th><th>Transporter ID</th><th>Créé le</th><th></th></tr></thead>
        <tbody>
        ${(drivers||[]).map(d=>`
          <tr>
            <td>${avatarHTML(d.full_name,28)} ${d.full_name}</td>
            <td class="text-muted" style="font-size:11px;">${d.email || '—'}</td>
            <td style="font-size:11px;font-family:monospace;">
              ${d.transporter_id
                ? `<span style="color:#166534;background:#D1FAE5;padding:2px 8px;border-radius:6px;">${d.transporter_id}</span>`
                : `<span style="color:#9CA3AF;font-style:italic;">Non renseigné</span>`}
            </td>
            <td class="text-muted text-sm">${fmtDate(d.created_at)}</td>
            <td style="display:flex;gap:4px;">
              <button class="btn sm" title="Renseigner Transporter ID" onclick="ManagerPage.openTidPopup('${d.id}','${d.full_name}','${d.transporter_id||''}')">🔗</button>
              <button class="btn sm" style="color:#B91C1C;border-color:#FECACA;" onclick="ManagerPage.deleteDriver('${d.id}','${d.full_name}')">🗑️</button>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="5" class="text-muted">Aucun chauffeur</td></tr>'}
        </tbody>
      </table>
      </div>
    </div>`;
  },

  async createDriver() {
    const name  = document.getElementById('adm-name').value.trim();
    const email = document.getElementById('adm-email').value.trim();
    const pwd   = document.getElementById('adm-pwd').value.trim();
    const tid   = document.getElementById('adm-tid').value.trim().toUpperCase() || null;
    if (!name || !email || !pwd) return toast('Merci de remplir tous les champs obligatoires.');
    if (pwd.length < 8) return toast('Le mot de passe doit faire au moins 8 caractères.');
    const btn = document.getElementById('btn-create-driver');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Création...';
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session.access_token;
      const response = await fetch(
        'https://hzyuzirncpgfpqhattur.supabase.co/functions/v1/create-driver',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ full_name: name, email, password: pwd, transporter_id: tid })
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur inconnue');
      }
      ManagerPage._lastDriverName  = name;
      ManagerPage._lastDriverEmail = email;
      ManagerPage._lastDriverPwd   = pwd;
      document.getElementById('driver-created-info').innerHTML =
        `📧 Email : <strong>${email}</strong><br>🔑 Mot de passe : <strong>${pwd}</strong>`;
      document.getElementById('driver-created-result').style.display = 'block';
      document.getElementById('adm-name').value  = '';
      document.getElementById('adm-email').value = '';
      document.getElementById('adm-pwd').value   = 'Transport31!';
      document.getElementById('adm-tid').value   = '';
      toast('Compte créé ✓');
      ManagerPage.loadAdmin();
    } catch(e) {
      toast('Erreur : ' + e.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '➕ Créer le compte';
    }
  },

  copyDriverCredentials() {
    const text = `AM Transport 31 — Identifiants de connexion\nEmail : ${ManagerPage._lastDriverEmail}\nMot de passe : ${ManagerPage._lastDriverPwd}\nLien : https://am-transport-31.vercel.app`;
    navigator.clipboard.writeText(text).then(() => toast('Copié ✓'));
  },

  sendDriverWhatsApp() {
    const msg = encodeURIComponent(
      `Bonjour ${ManagerPage._lastDriverName} ! 👋\n\nVoici tes identifiants pour accéder à l'application AM Transport 31 :\n\n📧 Email : ${ManagerPage._lastDriverEmail}\n🔑 Mot de passe : ${ManagerPage._lastDriverPwd}\n\n🔗 Lien : https://am-transport-31.vercel.app\n\nPense à changer ton mot de passe depuis l'app après ta première connexion.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  },

  openTidPopup(driverId, driverName, currentTid) {
    ManagerPage._tidDriverId = driverId;
    document.getElementById('tid-popup-title').textContent = `🔗 Transporter ID — ${driverName}`;
    document.getElementById('tid-input').value = currentTid || '';
    document.getElementById('tid-popup').style.display = 'flex';
  },

  closeTidPopup() {
    document.getElementById('tid-popup').style.display = 'none';
  },

  async saveTid() {
    const tid = document.getElementById('tid-input').value.trim().toUpperCase() || null;
    const { error } = await supabase.from('profiles').update({ transporter_id: tid }).eq('id', ManagerPage._tidDriverId);
    if (error) return toast('Erreur : ' + error.message);
    toast('Transporter ID enregistré ✓');
    ManagerPage.closeTidPopup();
    ManagerPage.loadAdmin();
  },

  async deleteDriver(id, name) {
    if (!confirm(`Supprimer le compte de ${name} ?\n\nSes données (tournées, planning, performances) seront conservées.`)) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session.access_token;
      const response = await fetch(
        'https://hzyuzirncpgfpqhattur.supabase.co/functions/v1/delete-driver',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ user_id: id })
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur inconnue');
      }
      toast(`Compte de ${name} supprimé ✓`);
      ManagerPage.loadAdmin();
    } catch(e) {
      toast('Erreur : ' + e.message);
    }
  },

  exportChauffeurs() { toast('Export en cours...'); },
  exportVehicules()  { toast('Export en cours...'); },
  exportHistorique() { toast('Export en cours...'); },
  exportPlanning()   { toast('Export en cours...'); },
  exportKm()         { toast('Export en cours...'); },
};
