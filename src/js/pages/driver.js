// ─────────────────────────────────────────────
//  PAGE CHAUFFEUR
// ─────────────────────────────────────────────

const DriverPage = {
  tourneeId: null,
  attribution: null,
  statut: 'depart',
  _semaines: [],
  _semaineIdx: 0,
  _perfName: null,

  async init() {
    const p = Auth.currentProfile;
    const c = avatarBg(p.full_name);

    const { data: attr } = await supabase
      .from('vehicule_attributions')
      .select('*, telepeage_badges(reference)')
      .eq('profile_id', p.id)
      .eq('date', today())
      .maybeSingle();

    DriverPage.attribution = attr;

    // Vérifie le planning du jour
    const { data: planningToday } = await supabase
      .from('planning')
      .select('*')
      .eq('profile_id', p.id)
      .eq('date', today())
      .maybeSingle();

    const statutPlanning = planningToday?.statut || null;

    // Si pas travail → affiche écran spécial
    if (statutPlanning && statutPlanning !== 'travail') {
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
        ${DriverPage.renderStatutSpecial(statutPlanning, p.full_name)}
        <div id="driver-perf-section"></div>
      </div>`;
      await DriverPage.loadPerformance(p.full_name);
      return;
    }

    // Si travail ou pas de planning → affiche écran mission
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

    const route = attr?.route || '—';
    const plaque = attr?.plaque || null;
    const tpRef = attr?.telepeage_badges?.reference || null;
    const vagueNum = attr?.vague;
    const vague = vagueNum === '1' ? '1ère vague — 12h10' : vagueNum === '2' ? '2ème vague — 12h20' : vagueNum === '3' ? '3ème vague' : null;

    // Si départ pas encore accepté → écran mission
    const missionAccepted = DriverPage.statut !== 'depart' || sessionStorage.getItem('mission_accepted_' + today());

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

      ${!missionAccepted ? DriverPage.renderMissionAccept(p.full_name) : `

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

      `}

      <div id="driver-perf-section"></div>
    </div>`;

    await DriverPage.loadPerformance(p.full_name);
  },

  renderMissionAccept(name) {
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:32px;">
      <div style="font-size:72px;margin-bottom:24px;animation:pulse 2s infinite;">🎯</div>
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:3px;color:#9CA3AF;margin-bottom:12px;">Message de votre responsable</div>
      <div style="font-size:28px;font-weight:800;color:#1a1a1a;margin-bottom:8px;line-height:1.3;">
        Bonjour ${name.split(' ')[0]} !
      </div>
      <div style="font-size:20px;font-weight:600;color:#374151;margin-bottom:32px;line-height:1.4;">
        Une mission t'attend...<br>si tu l'acceptes. 🚚
      </div>
      <button onclick="DriverPage.acceptMission()" style="background:linear-gradient(135deg,#1a56db,#0e3fa0);color:#fff;border:none;border-radius:16px;padding:18px 48px;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(26,86,219,0.4);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ✅ J'accepte la mission !
      </button>
      <div style="margin-top:16px;font-size:12px;color:#9CA3AF;">Ce message s'autodétruira après votre tournée 💥</div>
    </div>`;
  },

  acceptMission() {
    sessionStorage.setItem('mission_accepted_' + today(), '1');
    DriverPage.init();
  },

  renderStatutSpecial(statut, name) {
    const prenom = name.split(' ')[0];
    const configs = {
      repos: {
        emoji: '😴',
        titre: `Repose-toi bien ${prenom} !`,
        message: 'Profite de ta journée, recharge les batteries 🔋\nLa route peut attendre !',
        bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
        color: '#166534',
      },
      cut: {
        emoji: '⏳',
        titre: `Reste dans le coin ${prenom} !`,
        message: 'Tu pourrais être rappelé à tout moment... ✂️\nGarde ton téléphone près de toi !',
        bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)',
        color: '#9A3412',
      },
      mad: {
        emoji: '📲',
        titre: `En attente de mission ${prenom} !`,
        message: 'Tiens-toi prêt, on peut t\'appeler à tout moment 🔵\nReste disponible et réactif !',
        bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
        color: '#1E40AF',
      },
    };

    const cfg = configs[statut] || configs['repos'];

    // Planning des prochains jours
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:32px;">
      <div style="font-size:80px;margin-bottom:24px;">${cfg.emoji}</div>
      <div style="background:${cfg.bg};border-radius:24px;padding:32px 40px;max-width:480px;width:100%;">
        <div style="font-size:24px;font-weight:800;color:${cfg.color};margin-bottom:12px;">${cfg.titre}</div>
        <div style="font-size:16px;color:${cfg.color};opacity:0.8;line-height:1.6;white-space:pre-line;">${cfg.message}</div>
      </div>
      <div id="driver-next-planning" style="margin-top:24px;width:100%;max-width:480px;"></div>
    </div>`;
  },

  async loadPerformance(fullName) {
    const el = document.getElementById('driver-perf-section');
    if (!el) return;

    // Charge aussi le planning des prochains jours
    await DriverPage.loadNextPlanning();

    try {
      const { data: semaines } = await supabase
        .from('performance_semaines')
        .select('semaine')
        .order('semaine', { ascending: false });

      if (!semaines || semaines.length === 0) return;

      const uniqueSemaines = [...new Set(semaines.map(s => s.semaine))];
      DriverPage._semaines = uniqueSemaines;
      DriverPage._semaineIdx = 0;
      DriverPage._perfName = fullName;

      await DriverPage.renderPerformance();
    } catch(e) {
      console.error('Erreur performances:', e);
    }
  },

  async loadNextPlanning() {
    const p = Auth.currentProfile;
    const el = document.getElementById('driver-next-planning');
    if (!el) return;

    try {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const { data: planning } = await supabase
        .from('planning')
        .select('*')
        .eq('profile_id', p.id)
        .gte('date', tomorrow)
        .lte('date', weekEnd)
        .order('date', { ascending: true });

      if (!planning || planning.length === 0) return;

      const icons = { travail:'🟢', repos:'😴', cut:'✂️', mad:'📲' };
      const labels = { travail:'Travail', repos:'Repos', cut:'Cut', mad:'MAD' };
      const colors = {
        travail: 'background:#D1FAE5;color:#166534;',
        repos: 'background:#F3F4F6;color:#6B7280;',
        cut: 'background:#FEE2E2;color:#991B1B;',
        mad: 'background:#DBEAFE;color:#1E40AF;',
      };

      el.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#9CA3AF;margin-bottom:12px;">📅 Mes prochains jours</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${planning.map(p => {
            const d = new Date(p.date);
            const label = d.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
            const style = colors[p.statut] || colors.repos;
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;${style}">
              <span style="font-size:13px;font-weight:500;text-transform:capitalize;">${label}</span>
              <span style="font-size:13px;font-weight:700;">${icons[p.statut]||''} ${labels[p.statut]||p.statut}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    } catch(e) {
      console.error('Erreur planning:', e);
    }
  },

  async renderPerformance() {
    const el = document.getElementById('driver-perf-section');
    if (!el) return;

    const semaines = DriverPage._semaines;
    const idx = DriverPage._semaineIdx;
    const semaine = semaines[idx];
    const fullName = DriverPage._perfName;

    const { data: perf } = await supabase
      .from('performance_semaines')
      .select('*')
      .eq('semaine', semaine)
      .ilike('nom_prenom', `%${fullName}%`)
      .maybeSingle();

    const statutBadge = (s) => {
      const map = {
        'FANTASTIC +': '<span class="badge" style="background:#E6F4EA;color:#1E7E34;font-size:14px;padding:6px 12px;">⭐ Fantastic +</span>',
        'FANTASTIC':   '<span class="badge" style="background:#E8F0FE;color:#1A56DB;font-size:14px;padding:6px 12px;">✅ Fantastic</span>',
        'GREAT':       '<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:14px;padding:6px 12px;">👍 Great</span>',
        'FAIR':        '<span class="badge" style="background:#FEE2E2;color:#B91C1C;font-size:14px;padding:6px 12px;">⚠️ Fair</span>',
        'POOR':        '<span class="badge" style="background:#F3F4F6;color:#6B7280;font-size:14px;padding:6px 12px;">❌ Poor</span>',
      };
      return map[s] || `<span class="badge b-gray">${s || '—'}</span>`;
    };

    const pctColor = (v) => {
      if (v === null || v === undefined) return 'color:#9CA3AF';
      const n = parseFloat(v) > 2 ? parseFloat(v) : parseFloat(v) * 100;
      if (n >= 99) return 'color:#1E7E34;font-weight:700';
      if (n >= 97) return 'color:#92400E;font-weight:700';
      return 'color:#B91C1C;font-weight:700';
    };

    const numColor = (v) => {
      if (v === null || v === undefined) return 'color:#9CA3AF';
      return parseFloat(v) === 0 ? 'color:#1E7E34;font-weight:700' : 'color:#B91C1C;font-weight:700';
    };

    const fmtPct = (v) => {
      if (v === null || v === undefined) return '—';
      const n = parseFloat(v);
      if (isNaN(n)) return '—';
      return n > 2 ? n.toFixed(2) + '%' : (n * 100).toFixed(2) + '%';
    };

    const hasPrev = idx < semaines.length - 1;
    const hasNext = idx > 0;

    el.innerHTML = `
    <div class="card" style="margin-top:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div class="card-title" style="margin:0;">🏆 Mes performances</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn sm" onclick="DriverPage._semaineIdx++;DriverPage.renderPerformance()" ${!hasPrev?'disabled':''} style="font-size:16px;padding:4px 10px;">◀</button>
          <span style="font-weight:600;font-size:14px;min-width:40px;text-align:center;">${semaine}</span>
          <button class="btn sm" onclick="DriverPage._semaineIdx--;DriverPage.renderPerformance()" ${!hasNext?'disabled':''} style="font-size:16px;padding:4px 10px;">▶</button>
        </div>
      </div>

      ${!perf ? `<p class="text-muted text-sm">Aucune donnée disponible pour ${semaine}.</p>` : `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="font-size:32px;font-weight:800;color:#1a1a1a;">#${perf.classement}<span style="font-size:16px;color:#9CA3AF;font-weight:400;">/${perf.total_chauffeurs}</span></div>
        ${statutBadge(perf.statut)}
        <div style="margin-left:auto;text-align:right;">
          <div style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Score moyen</div>
          <div style="font-size:28px;font-weight:700;color:#1a1a1a;">${perf.moyenne ? Math.round(perf.moyenne * 100) / 100 : '—'}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">📦 Colis livrés</div>
          <div style="font-size:20px;font-weight:700;">${perf.colis_livres ?? '—'}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">✅ Réussite livraison</div>
          <div style="font-size:20px;font-weight:700;${pctColor(perf.reussite_livraison_pct)}">${fmtPct(perf.reussite_livraison_pct)}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">💸 Remboursement</div>
          <div style="font-size:20px;font-weight:700;${numColor(perf.remboursement_colis)}">${perf.remboursement_colis ?? '—'}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">🛣️ LOR DPMO</div>
          <div style="font-size:20px;font-weight:700;${numColor(perf.lor_dpmo)}">${perf.lor_dpmo ?? '—'}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">📸 Photo</div>
          <div style="font-size:20px;font-weight:700;${pctColor(perf.photo_pct)}">${fmtPct(perf.photo_pct)}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">📞 Contact</div>
          <div style="font-size:20px;font-weight:700;${pctColor(perf.contact_pct)}">${fmtPct(perf.contact_pct)}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">⚠️ Plainte client</div>
          <div style="font-size:20px;font-weight:700;${numColor(perf.plainte_client)}">${perf.plainte_client ?? '—'}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">⭐ Note client</div>
          <div style="font-size:20px;font-weight:700;">${perf.note_client ?? '—'}</div>
        </div>
      </div>
      `}
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
