// ─────────────────────────────────────────────
//  PAGE CHAUFFEUR
// ─────────────────────────────────────────────

const DriverPage = {
  tourneeId: null,
  attribution: null,
  statut: 'depart',

  async init() {
    const p = Auth.currentProfile;
    const c = avatarBg(p.full_name);

    // Charge attribution du jour
    const { data: attr } = await supabase
      .from('vehicule_attributions')
      .select('*, telepeage_badges(reference)')
      .eq('profile_id', p.id)
      .eq('date', today())
      .maybeSingle();

    DriverPage.attribution = attr;

    // Charge ou crée la tournée du jour
    let { data: tournee } = await supabase
      .from('tournees')
      .select('*')
      .eq('profile_id', p.id)
      .eq('date', today())
      .maybeSingle();

    if (!tournee) {
      const { data: newT } = await supabase.from('tournees').insert({
        profile_id: p.id,
        vehicule_attribution_id: attr?.id || null,
        date: today(),
        statut: 'depart'
      }).select().maybeSingle();
      tournee = newT;
    }

    DriverPage.tourneeId = tournee?.id;
    DriverPage.statut = tournee?.statut || 'depart';

    const route = attr?.planning?.route || attr?.route || '—';
    const plaque = attr?.plaque || null;
    const tpRef = attr?.telepeage_badges?.reference || null;

    document.getElementById('screen-driver').innerHTML = `
    <div class="topbar">
      <div class="logo-mark">🚚 AM Transport 31</div>
      <div class="user-pill">
        <div class="av-sm" style="background:${c.bg};color:${c.color};">${initials(p.full_name)}</div>
        <span>${p.full_name}</span>
        <button class="btn-link" onclick="App.logout()" style="margin-left:10px;">⬅ Déconnexion</button>
      </div>
    </div>
    <div class="driver-page">

      ${!plaque ? `<div class="notif warn" style="margin-bottom:14px;">⚠️ Aucun véhicule attribué aujourd'hui. Contactez votre responsable.</div>` : ''}

      <div class="vehicle-banner">
        <div class="vb-item">
          <label>🚛 Votre camion aujourd'hui</label>
          ${plaque ? `<div class="plate">${plaque}</div>` : '<span class="badge b-red">Non attribué</span>'}
        </div>
        ${tpRef ? `<div class="vb-item"><label>💳 Badge télépéage</label><div class="tp-tag">${tpRef}</div></div>` : ''}
        <div class="vb-item"><label>📍 Route</label>${routeBadge(route)}</div>
        ${vague ? `<div class="vb-item"><label>🕐 Vague</label><span class="badge b-amber" style="font-size:12px;padding:4px 10px;">${vague}</span></div>` : ''}
        <div class="vb-item" style="margin-left:auto;">
          <label>Statut</label>
          <div id="statut-badge">${DriverPage.getStatutBadge(DriverPage.statut)}</div>
        </div>
      </div>

      <div class="step-bar">
        <div class="step-item ${DriverPage.statut === 'depart' ? 'active' : 'done'}" id="step-matin-btn">☀️ Matin — Départ</div>
        <div class="step-item ${DriverPage.statut === 'en_tournee' ? 'active' : DriverPage.statut === 'cloture' ? 'done' : ''}" id="step-soir-btn">🌙 Soir — Retour</div>
      </div>

      <div id="step-depart" style="display:${DriverPage.statut === 'depart' ? 'block' : 'none'};">
        ${DriverPage.renderMatinForm(tournee)}
      </div>

      <div id="step-retour" style="display:${DriverPage.statut === 'en_tournee' ? 'block' : 'none'};">
        ${DriverPage.renderRetourConfirm(tournee)}
        ${DriverPage.renderSoirForm()}
      </div>

      <div id="step-cloture" style="display:${DriverPage.statut === 'cloture' ? 'block' : 'none'};">
        ${DriverPage.renderCloture(tournee)}
      </div>

    </div>`;
  },

  getStatutBadge(statut) {
    if (statut === 'depart')     return '<span class="badge b-blue">Départ à enregistrer</span>';
    if (statut === 'en_tournee') return '<span class="badge b-amber">En tournée</span>';
    if (statut === 'cloture')    return '<span class="badge b-green">Clôturé ✓</span>';
    return '<span class="badge b-gray">—</span>';
  },

  renderMatinForm(t) {
    return `
    <div class="card">
      <div class="card-title">☀️ Début de tournée — Matin</div>
      <div class="form-row">
        <label class="form-label">Kilométrage de départ (compteur)</label>
        <input class="form-input" type="number" id="km-depart" placeholder="Ex: 45 230" value="${t?.km_depart || ''}">
      </div>
      <div class="grid-2" style="margin-top:6px;">
        <div>
          <label class="form-label">📸 Photo du camion (état départ)</label>
          <div class="photo-zone" onclick="document.getElementById('f-camion-m').click()">
            <span class="pz-icon">📷</span>
            Appuyer pour photographier
            <input type="file" id="f-camion-m" accept="image/*" style="display:none" capture="environment" onchange="DriverPage.previewPhoto(this,'prev-camion-m')">
          </div>
          <div class="photo-thumbs" id="prev-camion-m"></div>
        </div>
        <div>
          <label class="form-label">📋 Capture Mobilic (début)</label>
          <div class="photo-zone" onclick="document.getElementById('f-mobilic-m').click()">
            <span class="pz-icon">📱</span>
            Importer capture écran
            <input type="file" id="f-mobilic-m" accept="image/*" style="display:none" onchange="DriverPage.previewPhoto(this,'prev-mobilic-m')">
          </div>
          <div class="photo-thumbs" id="prev-mobilic-m"></div>
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="form-label">Remarques départ (optionnel)</label>
        <input class="form-input" type="text" id="remarques-depart" placeholder="RAS ou description d'un problème..." value="${t?.remarques_depart || ''}">
      </div>
      <div class="flex-end">
        <button class="btn success" id="btn-depart" onclick="DriverPage.submitDepart()">
          ✈️ Enregistrer le départ
        </button>
      </div>
    </div>`;
  },

  renderRetourConfirm(t) {
    return `
    <div class="card" style="background:var(--green-light);border-color:var(--green-border);">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:22px;">✅</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--green);">Départ enregistré avec succès</div>
          <div class="text-sm" style="color:#639922;margin-top:2px;">
            Km départ : ${t?.km_depart ? fmtNum(t.km_depart) : '—'} · Photos matin transmises
          </div>
        </div>
      </div>
    </div>`;
  },

  renderSoirForm() {
    return `
    <div class="card">
      <div class="card-title">🌙 Fin de tournée — Soir</div>
      <div class="form-row">
        <label class="form-label">Kilométrage de retour (compteur)</label>
        <input class="form-input" type="number" id="km-retour" placeholder="Ex: 45 458">
      </div>
      <div class="grid-2" style="margin-top:6px;">
        <div>
          <label class="form-label">📸 Photo du camion (état retour)</label>
          <div class="photo-zone" onclick="document.getElementById('f-camion-s').click()">
            <span class="pz-icon">📷</span>
            Appuyer pour photographier
            <input type="file" id="f-camion-s" accept="image/*" style="display:none" capture="environment" onchange="DriverPage.previewPhoto(this,'prev-camion-s')">
          </div>
          <div class="photo-thumbs" id="prev-camion-s"></div>
        </div>
        <div>
          <label class="form-label">📋 Capture Mobilic (fin)</label>
          <div class="photo-zone" onclick="document.getElementById('f-mobilic-s').click()">
            <span class="pz-icon">📱</span>
            Importer capture écran
            <input type="file" id="f-mobilic-s" accept="image/*" style="display:none" onchange="DriverPage.previewPhoto(this,'prev-mobilic-s')">
          </div>
          <div class="photo-thumbs" id="prev-mobilic-s"></div>
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="form-label">Remarques retour (optionnel)</label>
        <input class="form-input" type="text" id="remarques-retour" placeholder="Incidents, dégâts, livraisons non effectuées...">
      </div>
      <div class="flex-end">
        <button class="btn primary" id="btn-retour" onclick="DriverPage.submitRetour()">
          🔒 Clôturer la tournée
        </button>
      </div>
    </div>`;
  },

  renderCloture(t) {
    const km = t?.km_retour && t?.km_depart ? t.km_retour - t.km_depart : null;
    return `
    <div class="success-card">
      <span class="success-icon">✅</span>
      <div style="font-size:18px;font-weight:600;color:var(--green);margin-bottom:8px;">Tournée clôturée !</div>
      <div class="text-sm" style="color:#639922;">
        ${DriverPage.attribution?.plaque ? DriverPage.attribution.plaque+' · ' : ''}
        ${km !== null ? km+' km parcourus · ' : ''}
        4 photos transmises
      </div>
      <div class="text-sm text-muted" style="margin-top:12px;">Toutes vos données ont été transmises au responsable. À demain ! 👋</div>
    </div>`;
  },

  previewPhoto(input, containerId) {
    if (!input.files || !input.files[0]) return;
    const url = URL.createObjectURL(input.files[0]);
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'photo-thumb';
    d.innerHTML = `<img src="${url}" alt="photo"><button class="rm-btn" onclick="this.parentNode.remove()">✕</button>`;
    c.appendChild(d);
  },

  async submitDepart() {
    const km = document.getElementById('km-depart').value;
    if (!km) return toast('Merci de saisir le kilométrage de départ.');

    const btn = document.getElementById('btn-depart');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Envoi...';

    try {
      let photoUrl = null, mobilicUrl = null;
      const camionFile = document.getElementById('f-camion-m').files[0];
      const mobilicFile = document.getElementById('f-mobilic-m').files[0];
      if (camionFile)  photoUrl   = await uploadPhoto(camionFile,  `matin/${Auth.currentProfile.id}`);
      if (mobilicFile) mobilicUrl = await uploadPhoto(mobilicFile, `mobilic_matin/${Auth.currentProfile.id}`);

      const remarques = document.getElementById('remarques-depart').value;

      await supabase.from('tournees').update({
        km_depart: parseInt(km),
        photo_camion_matin:  photoUrl,
        photo_mobilic_matin: mobilicUrl,
        remarques_depart: remarques,
        heure_depart: new Date().toTimeString().slice(0,8),
        statut: 'en_tournee'
      }).eq('id', DriverPage.tourneeId);

      document.getElementById('step-depart').style.display = 'none';
      document.getElementById('step-retour').style.display = 'block';
      document.getElementById('step-matin-btn').className = 'step-item done';
      document.getElementById('step-soir-btn').className = 'step-item active';
      document.getElementById('statut-badge').innerHTML = '<span class="badge b-amber">En tournée</span>';
      DriverPage.statut = 'en_tournee';
      toast('Départ enregistré ✓');
    } catch(e) {
      toast('Erreur : ' + e.message);
      btn.disabled = false;
      btn.innerHTML = '✈️ Enregistrer le départ';
    }
  },

  async submitRetour() {
    const km = document.getElementById('km-retour').value;
    if (!km) return toast('Merci de saisir le kilométrage de retour.');

    const { data: t } = await supabase.from('tournees').select('km_depart').eq('id', DriverPage.tourneeId).maybeSingle();
    if (t?.km_depart && parseInt(km) <= t.km_depart) return toast('Le km de retour doit être supérieur au km de départ.');

    const btn = document.getElementById('btn-retour');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Clôture...';

    try {
      let photoUrl = null, mobilicUrl = null;
      const camionFile = document.getElementById('f-camion-s').files[0];
      const mobilicFile = document.getElementById('f-mobilic-s').files[0];
      if (camionFile)  photoUrl   = await uploadPhoto(camionFile,  `soir/${Auth.currentProfile.id}`);
      if (mobilicFile) mobilicUrl = await uploadPhoto(mobilicFile, `mobilic_soir/${Auth.currentProfile.id}`);

      const remarques = document.getElementById('remarques-retour').value;

      await supabase.from('tournees').update({
        km_retour: parseInt(km),
        photo_camion_soir:  photoUrl,
        photo_mobilic_soir: mobilicUrl,
        remarques_retour: remarques,
        heure_retour: new Date().toTimeString().slice(0,8),
        statut: 'cloture'
      }).eq('id', DriverPage.tourneeId);

      document.getElementById('step-retour').style.display = 'none';
      document.getElementById('step-cloture').style.display = 'block';
      document.getElementById('step-soir-btn').className = 'step-item done';
      document.getElementById('statut-badge').innerHTML = '<span class="badge b-green">Clôturé ✓</span>';

      const { data: updated } = await supabase.from('tournees').select('*').eq('id', DriverPage.tourneeId).maybeSingle();
      document.getElementById('step-cloture').innerHTML = DriverPage.renderCloture(updated);
      toast('Tournée clôturée ✓');
    } catch(e) {
      toast('Erreur : ' + e.message);
      btn.disabled = false;
      btn.innerHTML = '🔒 Clôturer la tournée';
    }
  }
};
