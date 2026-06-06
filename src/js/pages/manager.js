// ─────────────────────────────────────────────
//  PAGE RESPONSABLE
// ─────────────────────────────────────────────

const ManagerPage = {

  async init() {
    const p = Auth.currentProfile;
    const c = avatarBg(p.full_name);
    document.getElementById('screen-manager').innerHTML = `
    <div class="topbar">
      <div class="logo-mark">🚚 AM Transport 31</div>
      <div class="user-pill">
        <div class="av-sm" style="background:${c.bg};color:${c.color};">${initials(p.full_name)}</div>
        <span>${p.full_name} — <strong>Responsable</strong></span>
        <button class="btn-link" onclick="App.logout()" style="margin-left:10px;">⬅ Déconnexion</button>
      </div>
    </div>
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
      <div style="background:#fff;border-radius:16px;padding:24px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;" id="popup-title">Planning</div>
        <div style="font-size:12px;color:#9CA3AF;margin-bottom:16px;" id="popup-subtitle"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          <button onclick="ManagerPage.savePlanningStat('travail')" style="padding:14px;border-radius:12px;border:2px solid #D1FAE5;background:#F0FDF4;color:#166534;font-weight:700;font-size:14px;cursor:pointer;">🟢 Travail</button>
          <button onclick="ManagerPage.savePlanningStat('repos')" style="padding:14px;border-radius:12px;border:2px solid #E5E7EB;background:#F9FAFB;color:#6B7280;font-weight:700;font-size:14px;cursor:pointer;">⚪ Repos</button>
          <button onclick="ManagerPage.savePlanningStat('cut')" style="padding:14px;border-radius:12px;border:2px solid #FEE2E2;background:#FFF5F5;color:#991B1B;font-weight:700;font-size:14px;cursor:pointer;">✂️ Cut</button>
          <button onclick="ManagerPage.savePlanningStat('mad')" style="padding:14px;border-radius:12px;border:2px solid #DBEAFE;background:#EFF6FF;color:#1E40AF;font-weight:700;font-size:14px;cursor:pointer;">🔵 MAD</button>
        </div>
        <button onclick="ManagerPage.closePlanningPopup()" style="width:100%;padding:10px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;color:#6B7280;cursor:pointer;font-size:13px;">Annuler</button>
      </div>
    </div>`;
    await ManagerPage.loadDashboard();
  },

  nav(panelId, el) {
    Router.navigate('panel-' + panelId, el);
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
            ${t.statut === 'absent' ? 'Aucune connexion aujourd\'hui' :
              !t.photo_mobilic_soir && t.statut === 'cloture' ? 'Photo Mobilic soir manquante' :
              t.statut === 'en_tournee' ? 'Tournée non clôturée' : 'Données incomplètes'}
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
        .eq('date', today())
        .order('created_at', { ascending: true });

      el.innerHTML = `
      <div class="card">
        <div class="card-title">👥 Chauffeurs — statut du jour
          <div class="card-actions">
            <button class="btn sm primary" onclick="ManagerPage.exportChauffeurs()">⬇ Export Excel</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Route</th><th>Camion</th><th>Télépéage</th><th>Km parcourus</th><th>Photos</th><th>Statut</th></tr></thead>
          <tbody>
          ${(tournees || []).map(t => {
            const km = t.km_retour && t.km_depart ? t.km_retour - t.km_depart : null;
            const photos = [t.photo_camion_matin, t.photo_mobilic_matin, t.photo_camion_soir, t.photo_mobilic_soir].filter(Boolean).length;
            return `<tr>
              <td><div class="driver-info">${avatarHTML(t.profiles?.full_name, 32)}<span>${t.profiles?.full_name}</span></div></td>
              <td>${routeBadge(t.vehicule_attributions?.route)}</td>
              <td>${plateBadge(t.vehicule_attributions?.plaque)}</td>
              <td>${tpBadge(t.vehicule_attributions?.telepeage_badges?.reference)}</td>
              <td>${km !== null ? fmtKm(km) : '—'}</td>
              <td>
                <span class="dot ${photos === 4 ? 'dot-ok' : photos >= 2 ? 'dot-warn' : 'dot-err'}"></span>${photos}/4
                ${t.photo_camion_matin ? `<a href="${t.photo_camion_matin}" target="_blank"><button class="btn sm" style="margin-left:4px;">📷 Voir</button></a>` : ''}
              </td>
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

  async loadPlanning() {
    const el = document.getElementById('panel-planning');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const offset = ManagerPage._planningWeekOffset || 0;
      const startDate = new Date(Date.now() + offset * 7 * 86400000);
      const days = Array.from({length:7}, (_,i) => {
        const d = new Date(startDate.getTime() + i * 86400000);
        return {
          date: d.toISOString().split('T')[0],
          label: d.toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'numeric'})
        };
      });

      const { data: planning } = await supabase
        .from('planning')
        .select('*, profiles(full_name)')
        .gte('date', days[0].date)
        .lte('date', days[6].date);

      const { data: chauffeurs } = await supabase
        .from('profiles').select('id,full_name').eq('role','driver').order('full_name');

      const statutCell = (entry) => {
        if (!entry) return `<div style="width:100%;height:36px;border-radius:8px;background:#F3F4F6;border:2px dashed #E5E7EB;cursor:pointer;"></div>`;
        const map = {
          'travail': 'background:#D1FAE5;color:#166534;border:2px solid #A7F3D0;',
          'repos':   'background:#F3F4F6;color:#6B7280;border:2px solid #E5E7EB;',
          'cut':     'background:#FEE2E2;color:#991B1B;border:2px solid #FECACA;',
          'mad':     'background:#DBEAFE;color:#1E40AF;border:2px solid #BFDBFE;',
        };
        const icons = { travail:'🟢', repos:'⚪', cut:'✂️', mad:'🔵' };
        const style = map[entry.statut] || 'background:#F3F4F6;color:#6B7280;border:2px solid #E5E7EB;';
        return `<div style="width:100%;height:36px;border-radius:8px;${style}display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;cursor:pointer;">${icons[entry.statut]||''} ${entry.statut?.toUpperCase()||''}</div>`;
      };

      el.innerHTML = `
      <div class="card" style="overflow-x:auto;">
        <div class="card-title">📅 Planning
          <div class="card-actions">
            <button class="btn sm" onclick="ManagerPage._planningWeekOffset--;ManagerPage.loadPlanning()">◀ Préc.</button>
            <span style="font-size:12px;color:#6B7280;padding:0 8px;">${days[0].label} → ${days[6].label}</span>
            <button class="btn sm" onclick="ManagerPage._planningWeekOffset++;ManagerPage.loadPlanning()">Suiv. ▶</button>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;min-width:700px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6B7280;width:160px;">Chauffeur</th>
              ${days.map(d => `<th style="text-align:center;padding:8px 6px;font-size:11px;color:#6B7280;">${d.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${(chauffeurs||[]).map(c => {
              const cells = days.map(d => {
                const entry = planning?.find(p => p.profile_id === c.id && p.date === d.date);
                return `<td style="padding:4px 6px;text-align:center;" onclick="ManagerPage.openPlanningPopup('${c.id}','${c.full_name}','${d.date}','${d.label}')">${statutCell(entry)}</td>`;
              }).join('');
              return `<tr>
                <td style="padding:8px 12px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${avatarHTML(c.full_name, 28)}
                    <span style="font-size:13px;font-weight:500;">${c.full_name}</span>
                  </div>
                </td>
                ${cells}
              </tr>`;
            }).join('') || '<tr><td colspan="8" class="text-muted">Aucun chauffeur</td></tr>'}
          </tbody>
        </table>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  openPlanningPopup(driverId, driverName, date, dateLabel) {
    ManagerPage._popupDriverId = driverId;
    ManagerPage._popupDate = date;
    const popup = document.getElementById('planning-popup');
    document.getElementById('popup-title').textContent = driverName;
    document.getElementById('popup-subtitle').textContent = dateLabel;
    popup.style.display = 'flex';
  },

  closePlanningPopup() {
    document.getElementById('planning-popup').style.display = 'none';
  },

  async savePlanningStat(statut) {
    const driverId = ManagerPage._popupDriverId;
    const date = ManagerPage._popupDate;
    if (!driverId || !date) return;

    const { error } = await supabase.from('planning').upsert({
      profile_id: driverId,
      date,
      statut,
      route: null
    }, { onConflict: 'profile_id,date' });

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
      const { data: attrs } = await supabase
        .from('vehicule_attributions')
        .select('*, profiles(full_name), telepeage_badges(reference), tournees(km_depart,km_retour,statut)')
        .eq('date', today())
        .order('created_at');

      const { data: chauffeurs } = await supabase.from('profiles').select('id,full_name').eq('role','driver').order('full_name');
      const { data: badges } = await supabase.from('telepeage_badges').select('id,reference').order('reference');

      el.innerHTML = `
      <div class="card">
        <div class="card-title">🚛 Attributions véhicules — aujourd'hui
          <div class="card-actions">
            <button class="btn sm primary" onclick="ManagerPage.exportVehicules()">⬇ Export</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Plaque</th><th>Télépéage</th><th>Km départ</th><th>Km retour</th><th>Total</th><th>Statut</th></tr></thead>
          <tbody>
          ${(attrs||[]).map(a => {
            const t = Array.isArray(a.tournees) ? a.tournees[0] : a.tournees;
            const km = t?.km_retour && t?.km_depart ? t.km_retour - t.km_depart : null;
            return `<tr>
              <td>${avatarHTML(a.profiles?.full_name,30)} ${a.profiles?.full_name}</td>
              <td>${plateBadge(a.plaque)}</td>
              <td>${tpBadge(a.telepeage_badges?.reference)}</td>
              <td>${t?.km_depart ? fmtNum(t.km_depart) : '—'}</td>
              <td>${t?.km_retour ? fmtNum(t.km_retour) : '—'}</td>
              <td>${km !== null ? '<strong>'+fmtKm(km)+'</strong>' : '—'}</td>
              <td>${statusBadge(t?.statut || 'absent')}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="7" class="text-muted">Aucune attribution aujourd\'hui</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">➕ Attribuer un véhicule</div>
        <div class="grid-4">
          <div class="form-row"><label class="form-label">Chauffeur</label>
            <select class="form-input" id="veh-driver">
              ${(chauffeurs||[]).map(c=>`<option value="${c.id}">${c.full_name}</option>`).join('')}
            </select>
          </div>
          <div class="form-row"><label class="form-label">Plaque du camion</label>
            <input class="form-input" type="text" id="veh-plaque" placeholder="AB-1234-CD" style="font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
          </div>
          <div class="form-row"><label class="form-label">Numéro de route</label><input class="form-input" type="text" id="veh-route" placeholder="Ex: R-14" style="text-transform:uppercase;"></div>
          <div class="form-row"><label class="form-label">Vague de départ</label>
            <select class="form-input" id="veh-vague">
              <option value="">— Aucune —</option>
              <option value="1">1ère vague — 12h10</option>
              <option value="2">2ème vague — 12h20</option>
              <option value="3">3ème vague</option>
            </select>
          </div>
          <div class="form-row"><label class="form-label">Badge télépéage</label>
            <select class="form-input" id="veh-badge">
              <option value="">— Aucun —</option>
              ${(badges||[]).map(b=>`<option value="${b.id}">${b.reference}</option>`).join('')}
            </select>
          </div>
          <div class="form-row"><label class="form-label">Date</label>
            <input class="form-input" type="date" id="veh-date" value="${today()}">
          </div>
        </div>
        <div class="flex-end">
          <button class="btn primary" onclick="ManagerPage.saveAttribution()">✓ Attribuer</button>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  async saveAttribution() {
    const driver = document.getElementById('veh-driver').value;
    const plaque = document.getElementById('veh-plaque').value.trim().toUpperCase();
    const route  = document.getElementById('veh-route').value.trim().toUpperCase() || null;
    const vague  = document.getElementById('veh-vague').value || null;
    const badge  = document.getElementById('veh-badge').value || null;
    const date   = document.getElementById('veh-date').value;
    if (!driver || !plaque || !date) return toast('Merci de remplir tous les champs obligatoires.');
    const { error } = await supabase.from('vehicule_attributions').upsert({
      profile_id: driver, plaque, route, vague, telepeage_badge_id: badge || null, date
    }, { onConflict: 'profile_id,date' });
    if (error) return toast('Erreur : ' + error.message);
    toast('Véhicule attribué ✓');
    ManagerPage.loadVehicules();
  },

  // ── HISTORIQUE ──
  async loadHistorique() {
    const el = document.getElementById('panel-historique');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: hist } = await supabase
        .from('vehicule_attributions')
        .select('*, profiles(full_name), telepeage_badges(reference), tournees(km_depart,km_retour,statut,photo_camion_matin,photo_mobilic_matin,photo_camion_soir,photo_mobilic_soir)')
        .order('date', { ascending: false })
        .limit(100);

      const plaques = [...new Set((hist||[]).map(h => h.plaque))].sort();
      const chauffeurs = [...new Set((hist||[]).map(h => h.profiles?.full_name).filter(Boolean))].sort();

      el.innerHTML = `
      <div class="card">
        <div class="card-title">🕓 Historique des attributions camions
          <div class="card-actions">
            <input type="date" class="form-input" id="hist-date" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()">
            <select class="form-input" id="hist-chauffeur" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()">
              <option value="all">Tous les chauffeurs</option>
              ${chauffeurs.map(c=>`<option value="${c}">${c}</option>`).join('')}
            </select>
            <select class="form-input" id="hist-filter" style="width:auto;font-size:12px;" onchange="ManagerPage.filterHistorique()">
              <option value="all">Tous les véhicules</option>
              ${plaques.map(p=>`<option value="${p}">${p}</option>`).join('')}
            </select>
            <button class="btn sm primary" onclick="ManagerPage.exportHistorique()">⬇ Export</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Date</th><th>Chauffeur</th><th>Plaque</th><th>Télépéage</th><th>Km départ</th><th>Km retour</th><th>Total</th><th>Statut</th><th>Photos</th></tr></thead>
          <tbody id="hist-tbody">
          ${(hist||[]).map(h => {
            const t = Array.isArray(h.tournees) ? h.tournees[0] : h.tournees;
            const km = t?.km_retour && t?.km_depart ? t.km_retour - t.km_depart : null;
            const photos = [
              { url: t?.photo_camion_matin,  label: '🚛 Matin' },
              { url: t?.photo_mobilic_matin, label: '📱 Matin' },
              { url: t?.photo_camion_soir,   label: '🚛 Soir' },
              { url: t?.photo_mobilic_soir,  label: '📱 Soir' },
            ].filter(p => p.url);
            return `<tr data-plate="${h.plaque}" data-chauffeur="${h.profiles?.full_name || ''}" data-date="${h.date}">
              <td class="text-muted text-sm">${fmtDate(h.date)}</td>
              <td>${avatarHTML(h.profiles?.full_name,28)} ${h.profiles?.full_name}</td>
              <td>${plateBadge(h.plaque)}</td>
              <td>${tpBadge(h.telepeage_badges?.reference)}</td>
              <td>${t?.km_depart ? fmtNum(t.km_depart) : '—'}</td>
              <td>${t?.km_retour ? fmtNum(t.km_retour) : '—'}</td>
              <td>${km !== null ? '<strong>'+fmtKm(km)+'</strong>' : '—'}</td>
              <td>${statusBadge(t?.statut || 'absent')}</td>
              <td>
                ${photos.length > 0
                  ? photos.map(p => `<a href="${p.url}" target="_blank"><button class="btn sm" style="margin:2px;">${p.label}</button></a>`).join('')
                  : '<span class="text-muted">—</span>'
                }
              </td>
            </tr>`;
          }).join('') || '<tr><td colspan="9" class="text-muted">Aucun historique</td></tr>'}
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
      const { data: badges } = await supabase
        .from('telepeage_badges')
        .select('*, vehicule_attributions(date, plaque, profiles(full_name))')
        .order('reference');

      el.innerHTML = `
      <div class="card">
        <div class="card-title">💳 Badges télépéage — état actuel</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Badge</th><th>Chauffeur actuel</th><th>Plaque camion</th><th>Date attribution</th><th>Statut</th></tr></thead>
          <tbody>
          ${(badges||[]).map(b => {
            const attrs = Array.isArray(b.vehicule_attributions) ? b.vehicule_attributions : [];
            const last = attrs.sort((a,b) => b.date > a.date ? 1 : -1)[0];
            const isToday = last?.date === today();
            return `<tr>
              <td>${tpBadge(b.reference)}</td>
              <td>${last ? avatarHTML(last.profiles?.full_name,28)+' '+last.profiles?.full_name : '<span class="text-muted">—</span>'}</td>
              <td>${last ? plateBadge(last.plaque) : '<span class="text-muted">—</span>'}</td>
              <td class="text-muted text-sm">${last ? fmtDate(last.date) : '—'}</td>
              <td>${isToday ? '<span class="badge b-green">En service</span>' : last ? '<span class="badge b-gray">Inactif</span>' : '<span class="badge b-gray">Disponible</span>'}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="5" class="text-muted">Aucun badge enregistré</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">🕓 Historique des attributions badges</div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Date</th><th>Badge</th><th>Chauffeur</th><th>Plaque</th></tr></thead>
          <tbody>
          ${(badges||[]).flatMap(b =>
            (Array.isArray(b.vehicule_attributions) ? b.vehicule_attributions : [])
            .map(a => ({ badge: b.reference, date: a.date, name: a.profiles?.full_name, plaque: a.plaque }))
          ).sort((a,b) => b.date > a.date ? 1 : -1).slice(0,30).map(row => `
            <tr>
              <td class="text-muted text-sm">${fmtDate(row.date)}</td>
              <td>${tpBadge(row.badge)}</td>
              <td>${avatarHTML(row.name,28)} ${row.name}</td>
              <td>${plateBadge(row.plaque)}</td>
            </tr>
          `).join('') || '<tr><td colspan="4" class="text-muted">Aucun historique</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">➕ Ajouter un nouveau badge</div>
        <div class="grid-2">
          <div class="form-row"><label class="form-label">Référence du badge (ex: TP-016)</label>
            <input class="form-input" type="text" id="tp-ref" placeholder="TP-016" style="font-family:monospace;">
          </div>
          <div class="form-row"><label class="form-label">Notes (optionnel)</label>
            <input class="form-input" type="text" id="tp-notes" placeholder="Badge de remplacement...">
          </div>
        </div>
        <div class="flex-end">
          <button class="btn primary" onclick="ManagerPage.saveBadge()">➕ Ajouter le badge</button>
        </div>
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
      const { data: tournees } = await supabase
        .from('tournees')
        .select('*, profiles(full_name), vehicule_attributions(plaque)')
        .eq('date', today())
        .order('created_at');

      const rows = [];
      for (const t of (tournees || [])) {
        const plaque = t.vehicule_attributions?.plaque;
        const name = t.profiles?.full_name;
        const photos = [
          { url: t.photo_camion_matin,  type: 'Camion',  moment: 'Matin' },
          { url: t.photo_mobilic_matin, type: 'Mobilic', moment: 'Matin' },
          { url: t.photo_camion_soir,   type: 'Camion',  moment: 'Soir'  },
          { url: t.photo_mobilic_soir,  type: 'Mobilic', moment: 'Soir'  },
        ];
        for (const ph of photos) {
          rows.push({ name, plaque, ...ph });
        }
      }

      const recu = rows.filter(r => r.url).length;
      const manquant = rows.filter(r => !r.url).length;

      el.innerHTML = `
      <div class="card">
        <div class="card-title">📷 Photos reçues — aujourd'hui
          <span class="badge b-green" style="margin-left:4px;">${recu} reçues</span>
          <span class="badge b-amber" style="margin-left:4px;">${manquant} manquantes</span>
          <div class="card-actions">
            <div class="text-sm text-muted">Stockées dans Supabase Storage</div>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Chauffeur</th><th>Plaque</th><th>Type</th><th>Moment</th><th>Statut</th><th>Aperçu</th></tr></thead>
          <tbody>
          ${rows.map(r => `<tr>
            <td>${avatarHTML(r.name,28)} ${r.name}</td>
            <td>${plateBadge(r.plaque)}</td>
            <td><span class="badge ${r.type==='Camion'?'b-blue':'b-amber'}">${r.type}</span></td>
            <td>${r.moment}</td>
            <td><span class="dot ${r.url?'dot-ok':'dot-err'}"></span>${r.url?'Reçue':'Manquante'}</td>
            <td>${r.url ? `<a href="${r.url}" target="_blank"><button class="btn sm">👁 Voir</button></a>` : '—'}</td>
          </tr>`).join('') || '<tr><td colspan="6" class="text-muted">Aucune donnée</td></tr>'}
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
      const { data: tournees } = await supabase
        .from('tournees')
        .select('*, profiles(full_name), vehicule_attributions(plaque, route)')
        .gte('date', weekStart)
        .order('date');

      const byDriver = {};
      for (const t of (tournees || [])) {
        const name = t.profiles?.full_name;
        if (!byDriver[name]) byDriver[name] = { plaque: t.vehicule_attributions?.plaque, jours: {}, total: 0 };
        const km = t.km_retour && t.km_depart ? t.km_retour - t.km_depart : null;
        byDriver[name].jours[t.date] = km;
        if (km) byDriver[name].total += km;
      }

      const days = Array.from({length:7},(_,i) => {
        const d = new Date(Date.now() - (6-i)*86400000);
        return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}) };
      });

      el.innerHTML = `
      <div class="card">
        <div class="card-title">📈 Kilométrages — 7 derniers jours
          <div class="card-actions">
            <button class="btn sm primary" onclick="ManagerPage.exportKm()">⬇ Export Excel</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Chauffeur</th>
              <th>Dernier camion</th>
              ${days.map(d=>`<th>${d.label}</th>`).join('')}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
          ${Object.entries(byDriver).map(([name, data]) => `
            <tr>
              <td>${avatarHTML(name,28)} ${name}</td>
              <td>${plateBadge(data.plaque)}</td>
              ${days.map(d => `<td>${data.jours[d.date] !== undefined ? data.jours[d.date] !== null ? data.jours[d.date]+' km' : '—' : '—'}</td>`).join('')}
              <td><strong>${fmtKm(data.total)}</strong></td>
            </tr>
          `).join('') || '<tr><td colspan="10" class="text-muted">Aucune donnée</td></tr>'}
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
      const { data: semaines } = await supabase
        .from('performance_semaines')
        .select('semaine')
        .order('semaine', { ascending: false });

      const uniqueSemaines = [...new Set((semaines||[]).map(s => s.semaine))];
      const derniereSemaine = uniqueSemaines[0] || '';

      let data = [];
      if (derniereSemaine) {
        const { data: perf } = await supabase
          .from('performance_semaines')
          .select('*')
          .eq('semaine', derniereSemaine)
          .order('classement', { ascending: true });
        data = perf || [];
      }

      const total = data.length;

      el.innerHTML = `
      <div class="card">
        <div class="card-title">🏆 Performances chauffeurs
          <div class="card-actions">
            <select class="form-input" id="perf-semaine" style="width:auto;font-size:12px;" onchange="ManagerPage.changerSemainePerf(this.value)">
              ${uniqueSemaines.map(s => `<option value="${s}" ${s===derniereSemaine?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="btn sm primary" onclick="ManagerPage.showImportPerf()">⬆ Importer Excel</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th><th>Chauffeur</th><th>Statut</th><th>Moyenne</th>
              <th>Colis livrés</th><th>Réussite livraison</th><th>Remboursement</th>
              <th>LOR DPMO</th><th>Photo</th><th>Contact</th><th>Plainte</th><th>Note client</th>
            </tr>
          </thead>
          <tbody id="perf-tbody">
          ${ManagerPage.renderPerfRows(data, total)}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card" id="import-perf-card" style="display:none;">
        <div class="card-title">⬆ Importer le scorecard Excel</div>
        <p class="text-muted text-sm" style="margin-bottom:12px;">Sélectionnez votre fichier Excel hebdomadaire.</p>
        <div class="grid-2">
          <div class="form-row">
            <label class="form-label">Semaine (ex: W23)</label>
            <input class="form-input" type="text" id="perf-semaine-input" placeholder="W23">
          </div>
          <div class="form-row">
            <label class="form-label">Fichier Excel (.xlsx / .xlsm)</label>
            <input class="form-input" type="file" id="perf-file" accept=".xlsx,.xls,.xlsm">
          </div>
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
    if (!data || data.length === 0) {
      return '<tr><td colspan="12" class="text-muted">Aucune donnée — importez un fichier Excel</td></tr>';
    }

    const statutBadge = (s) => {
      const map = {
        'FANTASTIC +': '<span class="badge" style="background:#E6F4EA;color:#1E7E34;">⭐ Fantastic +</span>',
        'FANTASTIC':   '<span class="badge" style="background:#E8F0FE;color:#1A56DB;">✅ Fantastic</span>',
        'GREAT':       '<span class="badge" style="background:#FEF3C7;color:#92400E;">👍 Great</span>',
        'FAIR':        '<span class="badge" style="background:#FEE2E2;color:#B91C1C;">⚠️ Fair</span>',
        'POOR':        '<span class="badge" style="background:#F3F4F6;color:#6B7280;">❌ Poor</span>',
      };
      return map[s] || `<span class="badge b-gray">${s || '—'}</span>`;
    };

    const fmtNum2 = (v) => {
      if (v === null || v === undefined) return '—';
      const n = parseFloat(v);
      return isNaN(n) ? '—' : Math.round(n * 100) / 100;
    };

    const pctColor = (v) => {
      if (v === null || v === undefined) return '';
      const n = parseFloat(v) > 2 ? parseFloat(v) : parseFloat(v) * 100;
      if (n >= 99) return 'color:#1E7E34;font-weight:600';
      if (n >= 97) return 'color:#92400E;font-weight:600';
      return 'color:#B91C1C;font-weight:600';
    };

    const numColor = (v, inverse = false) => {
      if (v === null || v === undefined) return '';
      const n = parseFloat(v);
      if (isNaN(n)) return '';
      if (inverse) return n === 0 ? 'color:#1E7E34;font-weight:600' : n <= 1000 ? 'color:#92400E;font-weight:600' : 'color:#B91C1C;font-weight:600';
      return n === 0 ? 'color:#1E7E34;font-weight:600' : 'color:#B91C1C;font-weight:600';
    };

    const fmtPct = (v) => {
      if (v === null || v === undefined) return '—';
      const n = parseFloat(v);
      if (isNaN(n)) return '—';
      return n > 2 ? n.toFixed(2) + '%' : (n * 100).toFixed(2) + '%';
    };

    const moyColor = (v) => {
      if (!v) return '';
      if (v >= 95) return 'color:#1E7E34;font-weight:600';
      if (v >= 85) return 'color:#92400E;font-weight:600';
      return 'color:#B91C1C;font-weight:600';
    };

    return data.map((d) => `
      <tr>
        <td class="text-muted text-sm">${d.classement}/${total}</td>
        <td>${avatarHTML(d.nom_prenom, 28)} ${d.nom_prenom}</td>
        <td>${statutBadge(d.statut)}</td>
        <td style="${moyColor(d.moyenne)}">${fmtNum2(d.moyenne)}</td>
        <td>${d.colis_livres ?? '—'}</td>
        <td style="${pctColor(d.reussite_livraison_pct)}">${fmtPct(d.reussite_livraison_pct)}</td>
        <td style="${numColor(d.remboursement_colis, true)}">${d.remboursement_colis ?? '—'}</td>
        <td style="${numColor(d.lor_dpmo, true)}">${d.lor_dpmo ?? '—'}</td>
        <td style="${pctColor(d.photo_pct)}">${fmtPct(d.photo_pct)}</td>
        <td style="${pctColor(d.contact_pct)}">${fmtPct(d.contact_pct)}</td>
        <td style="${numColor(d.plainte_client)}">${d.plainte_client ?? '—'}</td>
        <td>${d.note_client ?? '—'}</td>
      </tr>
    `).join('');
  },

  showImportPerf() {
    const card = document.getElementById('import-perf-card');
    if (card) card.style.display = 'block';
  },

  async changerSemainePerf(semaine) {
    const { data: perf } = await supabase
      .from('performance_semaines')
      .select('*')
      .eq('semaine', semaine)
      .order('classement', { ascending: true });

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
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(c => String(c||'').toLowerCase().includes('classement'))) {
          headerRow = i;
          break;
        }
      }
      if (headerRow === -1) throw new Error('Format non reconnu — colonne Classement introuvable');

      const dataRows = rows.slice(headerRow + 1).filter(r => r[1] && String(r[1]).trim() !== '');
      const total = dataRows.length;

      if (total === 0) throw new Error('Aucune donnée trouvée dans la feuille SCORECARD');

      const records = dataRows.map((r, i) => ({
        semaine,
        classement: i + 1,
        total_chauffeurs: total,
        nom_prenom: String(r[1]).trim(),
        statut: r[3] ? String(r[3]).trim() : null,
        moyenne: r[4] !== null ? parseFloat(r[4]) : null,
        transporter_id: r[5] ? String(r[5]).trim() : null,
        colis_livres: r[6] !== null ? parseInt(r[6]) : null,
        reussite_livraison_pct: r[7] !== null ? parseFloat(r[7]) : null,
        remboursement_colis: r[8] !== null ? parseInt(r[8]) : null,
        lor_dpmo: r[9] !== null ? parseInt(r[9]) : null,
        photo_pct: r[10] !== null ? parseFloat(r[10]) : null,
        contact_pct: r[11] !== null ? parseFloat(r[11]) : null,
        plainte_client: r[12] !== null ? parseInt(r[12]) : null,
        note_client: r[13] !== null ? String(r[13]) : null,
        score_reussite: null,
        score_remboursement: null,
        score_lor: null,
        score_photo: null,
        score_contact: null,
        score_plainte: null,
        score_note: null,
      }));

      await supabase.from('performance_semaines').delete().eq('semaine', semaine);
      const { error } = await supabase.from('performance_semaines').insert(records);
      if (error) throw error;

      toast(`✓ ${records.length} chauffeurs importés pour la semaine ${semaine}`);
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
      <p class="text-muted text-sm" style="margin-bottom:14px;">Le compte sera créé immédiatement avec le mot de passe temporaire <strong>ChangeMe2024!</strong></p>
      <div class="grid-2">
        <div class="form-row"><label class="form-label">Prénom Nom</label><input class="form-input" type="text" id="adm-name" placeholder="Jean Dupont"></div>
        <div class="form-row"><label class="form-label">Email</label><input class="form-input" type="email" id="adm-email" placeholder="jean.dupont@transport31.fr"></div>
      </div>
      <div class="flex-end">
        <button class="btn primary" id="btn-create-driver" onclick="ManagerPage.createDriver()">➕ Créer le compte</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">👥 Comptes chauffeurs existants</div>
      <div class="tbl-wrap">
      <table class="tbl">
        <thead><tr><th>Chauffeur</th><th>Email</th><th>Créé le</th></tr></thead>
        <tbody>
        ${(drivers||[]).map(d=>`
          <tr>
            <td>${avatarHTML(d.full_name,28)} ${d.full_name}</td>
            <td class="text-muted">${d.email || '—'}</td>
            <td class="text-muted text-sm">${fmtDate(d.created_at)}</td>
          </tr>
        `).join('') || '<tr><td colspan="3" class="text-muted">Aucun chauffeur</td></tr>'}
        </tbody>
      </table>
      </div>
    </div>`;
  },

  async createDriver() {
    const name  = document.getElementById('adm-name').value.trim();
    const email = document.getElementById('adm-email').value.trim();
    if (!name || !email) return toast('Merci de remplir tous les champs.');

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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ full_name: name, email })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur inconnue');
      }

      toast('Compte créé ✓ — mot de passe temporaire : ChangeMe2024!');
      document.getElementById('adm-name').value = '';
      document.getElementById('adm-email').value = '';
      ManagerPage.loadAdmin();
    } catch(e) {
      toast('Erreur : ' + e.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '➕ Créer le compte';
    }
  },

  // ── EXPORTS ──
  exportChauffeurs() { toast('Export Excel en cours de génération...'); },
  exportVehicules()  { toast('Export Excel en cours de génération...'); },
  exportHistorique() { toast('Export Excel en cours de génération...'); },
  exportPlanning()   { toast('Export Excel en cours de génération...'); },
  exportKm()         { toast('Export Excel en cours de génération...'); },
};
