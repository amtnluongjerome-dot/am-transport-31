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

    const { data: planningToday } = await supabase
      .from('planning')
      .select('*')
      .eq('profile_id', p.id)
      .eq('date', today())
      .maybeSingle();

    const statutPlanning = planningToday?.statut || null;

    if (statutPlanning && statutPlanning !== 'travail') {
      document.getElementById('screen-driver').innerHTML = `
      <div class="topbar">
        <div class="logo-mark">🚚 AM Transport 31</div>
        <div class="user-pill">
          <div class="av-sm" style="background:${c.bg};color:${c.color};">${initials(p.full_name)}</div>
          <span>${p.full_name}</span>
          ${DriverPage.renderLangSelector()}
          <button class="btn-link" onclick="App.logout()" style="margin-left:10px;">${i18n.t('logout')}</button>
        </div>
      </div>
      <div class="driver-page">
        ${DriverPage.renderStatutSpecial(statutPlanning, p.full_name)}
        <div id="driver-planning-section"></div>
        <div id="driver-perf-section"></div>
      </div>`;
      await DriverPage.loadPerformance(p.full_name);
      return;
    }

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
    const vague = vagueNum === '1' ? i18n.t('vague_1') : vagueNum === '2' ? i18n.t('vague_2') : vagueNum === '3' ? i18n.t('vague_3') : null;

    const missionAccepted = DriverPage.statut !== 'depart' || sessionStorage.getItem('mission_accepted_' + today());

    document.getElementById('screen-driver').innerHTML = `
    <div class="topbar">
      <div class="logo-mark">🚚 AM Transport 31</div>
      <div class="user-pill">
        <div class="av-sm" style="background:${c.bg};color:${c.color};">${initials(p.full_name)}</div>
        <span>${p.full_name}</span>
        ${DriverPage.renderLangSelector()}
        <button class="btn-link" onclick="App.logout()" style="margin-left:10px;">${i18n.t('logout')}</button>
      </div>
    </div>
    <div class="driver-page">

      ${!missionAccepted ? DriverPage.renderMissionAccept(p.full_name) : `

      ${!plaque ? `<div class="notif warn" style="margin-bottom:14px;">${i18n.t('no_vehicle_warn')}</div>` : ''}

      <div class="vehicle-banner">
        <div class="vb-item">
          <label>${i18n.t('vehicle_today')}</label>
          ${plaque ? `<div class="plate">${plaque}</div>` : `<span class="badge b-red">${i18n.t('not_assigned')}</span>`}
        </div>
        ${tpRef ? `<div class="vb-item"><label>${i18n.t('badge_telepeage')}</label><div class="tp-tag">${tpRef}</div></div>` : ''}
        <div class="vb-item"><label>${i18n.t('route')}</label>${routeBadge(route)}</div>
        ${vague ? `<div class="vb-item"><label>${i18n.t('vague')}</label><span class="badge b-amber" style="font-size:12px;padding:4px 10px;">${vague}</span></div>` : ''}
        <div class="vb-item" style="margin-left:auto;">
          <label>${i18n.t('statut')}</label>
          <div id="statut-badge">${DriverPage.getStatutBadge(DriverPage.statut)}</div>
        </div>
      </div>

      <div class="step-bar">
        <div class="step-item ${DriverPage.statut === 'depart' ? 'active' : 'done'}" id="step-matin-btn">${i18n.t('step_matin')}</div>
        <div class="step-item ${DriverPage.statut === 'en_tournee' ? 'active' : DriverPage.statut === 'cloture' ? 'done' : ''}" id="step-soir-btn">${i18n.t('step_soir')}</div>
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

      <div id="driver-planning-section"></div>
      <div id="driver-perf-section"></div>
    </div>`;

    await DriverPage.loadPerformance(p.full_name);
  },

  renderLangSelector() {
    const langs = [
      { code: 'fr', label: '🇫🇷' },
      { code: 'en', label: '🇬🇧' },
      { code: 'es', label: '🇪🇸' },
      { code: 'ar', label: '🇸🇦' },
    ];
    return `
    <div style="display:flex;gap:4px;margin-left:8px;">
      ${langs.map(l => `
        <button onclick="DriverPage.changeLang('${l.code}')"
          style="padding:3px 7px;border-radius:6px;border:1px solid ${i18n.current === l.code ? '#1a56db' : '#E5E7EB'};background:${i18n.current === l.code ? '#EFF6FF' : '#fff'};cursor:pointer;font-size:14px;line-height:1;">
          ${l.label}
        </button>
      `).join('')}
    </div>`;
  },

  changeLang(lang) {
    i18n.set(lang);
    DriverPage.init();
  },

  renderMissionAccept(name) {
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:32px;direction:${dir};">
      <div style="font-size:72px;margin-bottom:24px;">🎯</div>
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:3px;color:#9CA3AF;margin-bottom:12px;">${i18n.t('mission_from')}</div>
      <div style="font-size:28px;font-weight:800;color:#1a1a1a;margin-bottom:8px;line-height:1.3;">
        ${i18n.t('mission_greeting')} ${name.split(' ')[0]} !
      </div>
      <div style="font-size:20px;font-weight:600;color:#374151;margin-bottom:32px;line-height:1.4;white-space:pre-line;">
        ${i18n.t('mission_text')}
      </div>
      <button onclick="DriverPage.acceptMission()" style="background:linear-gradient(135deg,#1a56db,#0e3fa0);color:#fff;border:none;border-radius:16px;padding:18px 48px;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(26,86,219,0.4);">
        ${i18n.t('mission_btn')}
      </button>
      <div style="margin-top:16px;font-size:12px;color:#9CA3AF;">${i18n.t('mission_autodestruct')}</div>
    </div>`;
  },

  acceptMission() {
    sessionStorage.setItem('mission_accepted_' + today(), '1');
    DriverPage.init();
  },

  renderStatutSpecial(statut, name) {
    const prenom = name.split(' ')[0];
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';
    const configs = {
      repos: { emoji: '😴', titre: `${i18n.t('repos_title')} ${prenom} !`, message: i18n.t('repos_msg'), bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', color: '#166534' },
      cut:   { emoji: '⏳', titre: `${i18n.t('cut_title')} ${prenom} !`,   message: i18n.t('cut_msg'),   bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', color: '#9A3412' },
      mad:   { emoji: '📲', titre: `${i18n.t('mad_title')} ${prenom} !`,   message: i18n.t('mad_msg'),   bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#1E40AF' },
    };
    const cfg = configs[statut] || configs['repos'];
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:32px;direction:${dir};">
      <div style="font-size:80px;margin-bottom:24px;">${cfg.emoji}</div>
      <div style="background:${cfg.bg};border-radius:24px;padding:32px 40px;max-width:480px;width:100%;">
        <div style="font-size:24px;font-weight:800;color:${cfg.color};margin-bottom:12px;">${cfg.titre}</div>
        <div style="font-size:16px;color:${cfg.color};opacity:0.8;line-height:1.6;white-space:pre-line;">${cfg.message}</div>
      </div>
    </div>`;
  },

  async loadPerformance(fullName) {
    const el = document.getElementById('driver-perf-section');
    if (!el) return;

    await DriverPage.loadPlanningDriver();

    try {
      const { data: semaines } = await supabase
        .from('performance_semaines')
        .select('semaine')
        .order('semaine', { ascending: false });

      if (!semaines || semaines.length === 0) {
        el.insertAdjacentHTML('beforeend', DriverPage.renderChangePwd());
        return;
      }

      const uniqueSemaines = [...new Set(semaines.map(s => s.semaine))];
      DriverPage._semaines = uniqueSemaines;
      DriverPage._semaineIdx = 0;
      DriverPage._perfName = fullName;

      await DriverPage.renderPerformance();
    } catch(e) {
      console.error('Erreur performances:', e);
    }

    el.insertAdjacentHTML('beforeend', DriverPage.renderChangePwd());
  },

  async loadPlanningDriver() {
    const p = Auth.currentProfile;
    const el = document.getElementById('driver-planning-section');
    if (!el) return;

    try {
      const startDate = new Date();
      const days = Array.from({length: 7}, (_, i) => {
        const d = new Date(startDate.getTime() + i * 86400000);
        return {
          date: d.toISOString().split('T')[0],
          label: d.toLocaleDateString(i18n.current === 'ar' ? 'ar-SA' : i18n.current === 'es' ? 'es-ES' : i18n.current === 'en' ? 'en-GB' : 'fr-FR', {weekday:'long', day:'numeric', month:'long'})
        };
      });

      const { data: planning } = await supabase
        .from('planning').select('*').eq('profile_id', p.id)
        .gte('date', days[0].date).lte('date', days[6].date).order('date', { ascending: true });

      const icons  = { travail:'🟢', repos:'😴', cut:'✂️', mad:'📲' };
      const colors = {
        travail: 'background:#D1FAE5;color:#166534;border:1px solid #A7F3D0;',
        repos:   'background:#F3F4F6;color:#6B7280;border:1px solid #E5E7EB;',
        cut:     'background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;',
        mad:     'background:#DBEAFE;color:#1E40AF;border:1px solid #BFDBFE;',
      };

      const planningMap = {};
      (planning||[]).forEach(entry => { planningMap[entry.date] = entry; });

      const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';

      el.innerHTML = `
      <div class="card" style="margin-top:16px;direction:${dir};">
        <div class="card-title">${i18n.t('planning_title')}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${days.map(d => {
            const entry = planningMap[d.date];
            const isToday = d.date === today();
            if (!entry) return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;background:#FAFAFA;border:1px solid #F3F4F6;${isToday ? 'border-left:4px solid #6B7280;' : ''}">
                <span style="font-size:13px;color:#9CA3AF;text-transform:capitalize;">${isToday ? '👉 ' : ''}${d.label}</span>
                <span style="font-size:12px;color:#D1D5DB;">${i18n.t('not_planned')}</span>
              </div>`;
            const style = colors[entry.statut] || colors.repos;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;${style}${isToday ? 'outline:3px solid #1a1a1a;' : ''}">
                <span style="font-size:13px;font-weight:${isToday ? '700' : '500'};text-transform:capitalize;">${isToday ? '👉 ' : ''}${d.label}</span>
                <span style="font-size:14px;font-weight:700;">${icons[entry.statut]||''} ${i18n.t(entry.statut)}</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;
    } catch(e) {
      console.error('Erreur planning chauffeur:', e);
    }
  },

  async renderPerformance() {
    const el = document.getElementById('driver-perf-section');
    if (!el) return;

    const semaines = DriverPage._semaines;
    const idx = DriverPage._semaineIdx;
    const semaine = semaines[idx];
    const fullName = DriverPage._perfName;
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';

    const { data: perf } = await supabase
      .from('performance_semaines').select('*').eq('semaine', semaine)
      .eq('transporter_id', Auth.currentProfile.transporter_id || '__none__').maybeSingle();

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

    const pctColor = (v) => { if (v === null || v === undefined) return 'color:#9CA3AF'; const n = parseFloat(v) > 2 ? parseFloat(v) : parseFloat(v) * 100; if (n >= 99) return 'color:#1E7E34;font-weight:700'; if (n >= 97) return 'color:#92400E;font-weight:700'; return 'color:#B91C1C;font-weight:700'; };
    const numColor = (v) => { if (v === null || v === undefined) return 'color:#9CA3AF'; return parseFloat(v) === 0 ? 'color:#1E7E34;font-weight:700' : 'color:#B91C1C;font-weight:700'; };
    const fmtPct = (v) => { if (v === null || v === undefined) return '—'; const n = parseFloat(v); if (isNaN(n)) return '—'; return n > 2 ? n.toFixed(2) + '%' : (n * 100).toFixed(2) + '%'; };

    const hasPrev = idx < semaines.length - 1;
    const hasNext = idx > 0;

    el.innerHTML = `
    <div class="card" style="margin-top:16px;direction:${dir};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div class="card-title" style="margin:0;">${i18n.t('perf_title')}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn sm" onclick="DriverPage._semaineIdx++;DriverPage.renderPerformance()" ${!hasPrev?'disabled':''} style="font-size:16px;padding:4px 10px;">◀</button>
          <span style="font-weight:600;font-size:14px;min-width:40px;text-align:center;">${semaine}</span>
          <button class="btn sm" onclick="DriverPage._semaineIdx--;DriverPage.renderPerformance()" ${!hasNext?'disabled':''} style="font-size:16px;padding:4px 10px;">▶</button>
        </div>
      </div>
      ${!perf ? `<p class="text-muted text-sm">${i18n.t('no_perf')} ${semaine}.</p>` : `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="font-size:32px;font-weight:800;color:#1a1a1a;">#${perf.classement}<span style="font-size:16px;color:#9CA3AF;font-weight:400;">/${perf.total_chauffeurs}</span></div>
        ${statutBadge(perf.statut)}
        <div style="margin-left:auto;text-align:right;">
          <div style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">${i18n.t('score_moyen')}</div>
          <div style="font-size:28px;font-weight:700;color:#1a1a1a;">${perf.moyenne ? Math.round(perf.moyenne * 100) / 100 : '—'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('colis_livres')}</div><div style="font-size:20px;font-weight:700;">${perf.colis_livres ?? '—'}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('reussite')}</div><div style="font-size:20px;font-weight:700;${pctColor(perf.reussite_livraison_pct)}">${fmtPct(perf.reussite_livraison_pct)}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('remboursement')}</div><div style="font-size:20px;font-weight:700;${numColor(perf.remboursement_colis)}">${perf.remboursement_colis ?? '—'}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('lor')}</div><div style="font-size:20px;font-weight:700;${numColor(perf.lor_dpmo)}">${perf.lor_dpmo ?? '—'}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('photo')}</div><div style="font-size:20px;font-weight:700;${pctColor(perf.photo_pct)}">${fmtPct(perf.photo_pct)}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('contact')}</div><div style="font-size:20px;font-weight:700;${pctColor(perf.contact_pct)}">${fmtPct(perf.contact_pct)}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('plainte')}</div><div style="font-size:20px;font-weight:700;${numColor(perf.plainte_client)}">${perf.plainte_client ?? '—'}</div></div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">${i18n.t('note')}</div><div style="font-size:20px;font-weight:700;">${perf.note_client ?? '—'}</div></div>
      </div>
      `}
    </div>`;
  },

  renderChangePwd() {
    return `
    <div class="card" style="margin-top:16px;">
      <div class="card-title">🔑 Changer mon mot de passe</div>
      <div class="form-row">
        <label class="form-label">Nouveau mot de passe</label>
        <input class="form-input" type="password" id="new-pwd" placeholder="Min. 8 caractères">
      </div>
      <div class="form-row">
        <label class="form-label">Confirmer le mot de passe</label>
        <input class="form-input" type="password" id="new-pwd2" placeholder="Répète ton mot de passe">
      </div>
      <div class="flex-end">
        <button class="btn primary" id="btn-change-pwd" onclick="DriverPage.changePassword()">✓ Mettre à jour</button>
      </div>
    </div>`;
  },

  async changePassword() {
    const pwd1 = document.getElementById('new-pwd').value;
    const pwd2 = document.getElementById('new-pwd2').value;
    if (pwd1.length < 8) return toast('Le mot de passe doit faire au moins 8 caractères.');
    if (pwd1 !== pwd2) return toast('Les mots de passe ne correspondent pas.');
    const btn = document.getElementById('btn-change-pwd');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    const { error } = await supabase.auth.updateUser({ password: pwd1 });
    if (error) {
      toast('Erreur : ' + error.message);
    } else {
      toast('Mot de passe mis à jour ✓');
      document.getElementById('new-pwd').value = '';
      document.getElementById('new-pwd2').value = '';
    }
    btn.disabled = false;
    btn.innerHTML = '✓ Mettre à jour';
  },

  getStatutBadge(statut) {
    if (statut === 'depart')     return `<span class="badge b-blue">${i18n.t('statut_depart')}</span>`;
    if (statut === 'en_tournee') return `<span class="badge b-amber">${i18n.t('statut_en_tournee')}</span>`;
    if (statut === 'cloture')    return `<span class="badge b-green">${i18n.t('statut_cloture')}</span>`;
    return '<span class="badge b-gray">—</span>';
  },

  renderMatinForm(t) {
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';
    return `
    <div class="card" style="direction:${dir};">
      <div class="card-title">${i18n.t('matin_title')}</div>
      <div class="form-row">
        <label class="form-label">${i18n.t('km_depart_label')}</label>
        <input class="form-input" type="number" id="km-depart" placeholder="${i18n.t('km_depart_placeholder')}" value="${t?.km_depart || ''}">
      </div>
      <div class="grid-2" style="margin-top:6px;">
        <div>
          <label class="form-label">${i18n.t('photo_camion_matin')}</label>
          <div class="photo-zone" onclick="document.getElementById('f-camion-m').click()">
            <span class="pz-icon">📷</span>
            ${i18n.t('photo_camion_btn')}
            <input type="file" id="f-camion-m" accept="image/*" style="display:none" capture="environment" onchange="DriverPage.previewPhoto(this,'prev-camion-m')">
          </div>
          <div class="photo-thumbs" id="prev-camion-m"></div>
        </div>
        <div>
          <label class="form-label">${i18n.t('mobilic_matin')}</label>
          <div class="photo-zone" onclick="document.getElementById('f-mobilic-m').click()">
            <span class="pz-icon">📱</span>
            ${i18n.t('mobilic_btn')}
            <input type="file" id="f-mobilic-m" accept="image/*" style="display:none" onchange="DriverPage.previewPhoto(this,'prev-mobilic-m')">
          </div>
          <div class="photo-thumbs" id="prev-mobilic-m"></div>
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="form-label">${i18n.t('remarques_depart')}</label>
        <input class="form-input" type="text" id="remarques-depart" placeholder="${i18n.t('remarques_placeholder')}" value="${t?.remarques_depart || ''}">
      </div>
      <div class="flex-end">
        <button class="btn success" id="btn-depart" onclick="DriverPage.submitDepart()">
          ${i18n.t('btn_depart')}
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
          <div style="font-size:13px;font-weight:600;color:var(--green);">${i18n.t('depart_ok')}</div>
          <div class="text-sm" style="color:#639922;margin-top:2px;">
            ${i18n.t('km_depart_info')} : ${t?.km_depart ? fmtNum(t.km_depart) : '—'} · ${i18n.t('photos_sent')}
          </div>
        </div>
      </div>
    </div>`;
  },

  renderSoirForm() {
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';
    return `
    <div class="card" style="direction:${dir};">
      <div class="card-title">${i18n.t('soir_title')}</div>
      <div class="form-row">
        <label class="form-label">${i18n.t('km_retour_label')}</label>
        <input class="form-input" type="number" id="km-retour" placeholder="${i18n.t('km_retour_placeholder')}">
      </div>
      <div class="grid-2" style="margin-top:6px;">
        <div>
          <label class="form-label">${i18n.t('photo_camion_soir')}</label>
          <div class="photo-zone" onclick="document.getElementById('f-camion-s').click()">
            <span class="pz-icon">📷</span>
            ${i18n.t('photo_camion_btn')}
            <input type="file" id="f-camion-s" accept="image/*" style="display:none" capture="environment" onchange="DriverPage.previewPhoto(this,'prev-camion-s')">
          </div>
          <div class="photo-thumbs" id="prev-camion-s"></div>
        </div>
        <div>
          <label class="form-label">${i18n.t('mobilic_soir')}</label>
          <div class="photo-zone" onclick="document.getElementById('f-mobilic-s').click()">
            <span class="pz-icon">📱</span>
            ${i18n.t('mobilic_btn')}
            <input type="file" id="f-mobilic-s" accept="image/*" style="display:none" onchange="DriverPage.previewPhoto(this,'prev-mobilic-s')">
          </div>
          <div class="photo-thumbs" id="prev-mobilic-s"></div>
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="form-label">${i18n.t('remarques_retour')}</label>
        <input class="form-input" type="text" id="remarques-retour" placeholder="${i18n.t('remarques_retour_placeholder')}">
      </div>
      <div class="flex-end">
        <button class="btn primary" id="btn-retour" onclick="DriverPage.submitRetour()">
          ${i18n.t('btn_retour')}
        </button>
      </div>
    </div>`;
  },

  renderCloture(t) {
    const km = t?.km_retour && t?.km_depart ? t.km_retour - t.km_depart : null;
    const dir = i18n.current === 'ar' ? 'rtl' : 'ltr';
    return `
    <div class="success-card" style="direction:${dir};">
      <span class="success-icon">✅</span>
      <div style="font-size:18px;font-weight:600;color:var(--green);margin-bottom:8px;">${i18n.t('cloture_title')}</div>
      <div class="text-sm" style="color:#639922;">
        ${DriverPage.attribution?.plaque ? DriverPage.attribution.plaque+' · ' : ''}
        ${km !== null ? km+' '+i18n.t('km_parcourus')+' · ' : ''}
        4 ${i18n.t('photos_transmises')}
      </div>
      <div class="text-sm text-muted" style="margin-top:12px;">${i18n.t('cloture_msg')}</div>
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
    if (!km) return toast(i18n.t('km_required'));
    const btn = document.getElementById('btn-depart');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${i18n.t('sending')}`;
    try {
      let photoUrl = null, mobilicUrl = null;
      const camionFile = document.getElementById('f-camion-m').files[0];
      const mobilicFile = document.getElementById('f-mobilic-m').files[0];
      if (camionFile)  photoUrl   = await uploadPhoto(camionFile,  `matin/${Auth.currentProfile.id}`);
      if (mobilicFile) mobilicUrl = await uploadPhoto(mobilicFile, `mobilic_matin/${Auth.currentProfile.id}`);
      const remarques = document.getElementById('remarques-depart').value;
      await supabase.from('tournees').update({
        km_depart: parseInt(km), photo_camion_matin: photoUrl, photo_mobilic_matin: mobilicUrl,
        remarques_depart: remarques, heure_depart: new Date().toTimeString().slice(0,8), statut: 'en_tournee'
      }).eq('id', DriverPage.tourneeId);
      document.getElementById('step-depart').style.display = 'none';
      document.getElementById('step-retour').style.display = 'block';
      document.getElementById('step-matin-btn').className = 'step-item done';
      document.getElementById('step-soir-btn').className = 'step-item active';
      document.getElementById('statut-badge').innerHTML = `<span class="badge b-amber">${i18n.t('statut_en_tournee')}</span>`;
      DriverPage.statut = 'en_tournee';
      toast('✓');
    } catch(e) {
      toast('Erreur : ' + e.message);
      btn.disabled = false;
      btn.innerHTML = i18n.t('btn_depart');
    }
  },

  async submitRetour() {
    const km = document.getElementById('km-retour').value;
    if (!km) return toast(i18n.t('km_retour_required'));
    const { data: t } = await supabase.from('tournees').select('km_depart').eq('id', DriverPage.tourneeId).maybeSingle();
    if (t?.km_depart && parseInt(km) <= t.km_depart) return toast(i18n.t('km_retour_error'));
    const btn = document.getElementById('btn-retour');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${i18n.t('closing')}`;
    try {
      let photoUrl = null, mobilicUrl = null;
      const camionFile = document.getElementById('f-camion-s').files[0];
      const mobilicFile = document.getElementById('f-mobilic-s').files[0];
      if (camionFile)  photoUrl   = await uploadPhoto(camionFile,  `soir/${Auth.currentProfile.id}`);
      if (mobilicFile) mobilicUrl = await uploadPhoto(mobilicFile, `mobilic_soir/${Auth.currentProfile.id}`);
      const remarques = document.getElementById('remarques-retour').value;
      await supabase.from('tournees').update({
        km_retour: parseInt(km), photo_camion_soir: photoUrl, photo_mobilic_soir: mobilicUrl,
        remarques_retour: remarques, heure_retour: new Date().toTimeString().slice(0,8), statut: 'cloture'
      }).eq('id', DriverPage.tourneeId);
      document.getElementById('step-retour').style.display = 'none';
      document.getElementById('step-cloture').style.display = 'block';
      document.getElementById('step-soir-btn').className = 'step-item done';
      document.getElementById('statut-badge').innerHTML = `<span class="badge b-green">${i18n.t('statut_cloture')}</span>`;
      const { data: updated } = await supabase.from('tournees').select('*').eq('id', DriverPage.tourneeId).maybeSingle();
      document.getElementById('step-cloture').innerHTML = DriverPage.renderCloture(updated);
      toast('✓');
    } catch(e) {
      toast('Erreur : ' + e.message);
      btn.disabled = false;
      btn.innerHTML = i18n.t('btn_retour');
    }
  }
};
