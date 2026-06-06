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
        <div class="panel" id="panel-admin"></div>
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
  async loadPlanning() {
    const el = document.getElementById('panel-planning');
    el.innerHTML = '<p class="text-muted">Chargement...</p>';
    try {
      const { data: planning } = await supabase
        .from('planning')
        .select('*, profiles(full_name)')
        .gte('date', today())
        .lte('date', new Date(Date.now() + 6*86400000).toISOString().split('T')[0])
        .order('date');

      const { data: chauffeurs } = await supabase
        .from('profiles').select('id,full_name').eq('role','driver').order('full_name');

      const days = Array.from({length:7}, (_,i) => {
        const d = new Date(Date.now() + i*86400000);
        return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'}) };
      });

      el.innerHTML = `
      <div class="card">
        <div class="card-title">📅 Planning — 7 prochains jours
          <div class="card-actions">
            <button class="btn sm primary" onclick="ManagerPage.exportPlanning()">⬇ Export</button>
          </div>
        </div>
        <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Chauffeur</th>
              ${days.map(d=>`<th>${d.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${(chauffeurs||[]).map(c => {
              const rows = days.map(d => {
                const entry = planning?.find(p => p.profile_id === c.id && p.date === d.date);
                if (!entry) return '<td>—</td>';
                if (entry.statut === 'conge') return `<td><span class="text-muted text-sm">Congé</span></td>`;
                if (entry.statut === 'maladie') return `<td><span class="text-muted text-sm">Maladie</span></td>`;
                return `<td>${routeBadge(entry.route)}</td>`;
              }).join('');
              return `<tr><td>${avatarHTML(c.full_name,28)} ${c.full_name}</td>${rows}</tr>`;
            }).join('') || '<tr><td colspan="8" class="text-muted">Aucun planning saisi</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">✏️ Ajouter / modifier une entrée</div>
        <div class="grid-4">
          <div class="form-row">
            <label class="form-label">Chauffeur</label>
            <select class="form-input" id="plan-driver">
              ${(chauffeurs||[]).map(c=>`<option value="${c.id}">${c.full_name}</option>`).join('')}
            </select>
          </div>
          <div class="form-row"><label class="form-label">Date</label><input class="form-input" type="date" id="plan-date" value="${today()}"></div>
          <div class="form-row"><label class="form-label">Route (ex: R-14)</label><input class="form-input" type="text" id="plan-route" placeholder="R-14"></div>
          <div class="form-row">
            <label class="form-label">Statut</label>
            <select class="form-input" id="plan-statut">
              <option value="actif">Route active</option>
              <option value="conge">Congé</option>
              <option value="maladie">Maladie</option>
              <option value="formation">Formation</option>
            </select>
          </div>
        </div>
        <div class="flex-end">
          <button class="btn primary" onclick="ManagerPage.savePlanning()">✓ Enregistrer</button>
        </div>
      </div>`;
    } catch(e) {
      el.innerHTML = `<div class="notif err">Erreur : ${e.message}</div>`;
    }
  },

  async savePlanning() {
    const driver = document.getElementById('plan-driver').value;
    const date   = document.getElementById('plan-date').value;
    const route  = document.getElementById('plan-route').value.trim().toUpperCase();
    const statut = document.getElementById('plan-statut').value;
    if (!driver || !date) return toast('Merci de remplir tous les champs.');
    const { error } = await supabase.from('planning').upsert({
      profile_id: driver, date, route: statut === 'actif' ? route : null, statut
    }, { onConflict: 'profile_id,date' });
    if (error) return toast('Erreur : ' + error.message);
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

  filterHistorique(plate) {
    document.querySelectorAll('#hist-tbody tr').forEach(row => {
      row.style.display = (plate === 'all' || row.dataset.plate === plate) ? '' : 'none';
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

      const { data: chauffeurs } = await supabase.from('profiles').select('id,full_name').eq('role','driver').order('full_name');

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
