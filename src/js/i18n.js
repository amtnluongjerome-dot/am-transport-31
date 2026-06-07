// ─────────────────────────────────────────────
//  INTERNATIONALISATION (i18n)
// ─────────────────────────────────────────────

const i18n = {
  current: localStorage.getItem('lang') || 'fr',

  set(lang) {
    this.current = lang;
    localStorage.setItem('lang', lang);
  },

  t(key) {
    const translations = i18n.translations[i18n.current] || i18n.translations['fr'];
    return translations[key] || i18n.translations['fr'][key] || key;
  },

  translations: {
    fr: {
      // Topbar
      logout: '⬅ Déconnexion',
      lang_label: '🌐 Langue',

      // Statuts planning
      travail: 'Travail',
      repos: 'Repos',
      cut: 'Cut',
      mad: 'MAD',

      // Mission accept
      mission_greeting: 'Bonjour',
      mission_text: "Une mission t'attend...\nsi tu l'acceptes. 🚚",
      mission_btn: "✅ J'accepte la mission !",
      mission_autodestruct: "Ce message s'autodétruira après votre tournée 💥",
      mission_from: 'Message de votre responsable',

      // Statuts spéciaux
      repos_title: 'Repose-toi bien',
      repos_msg: 'Profite de ta journée, recharge les batteries 🔋\nLa route peut attendre !',
      cut_title: 'Reste dans le coin',
      cut_msg: 'Tu pourrais être rappelé à tout moment... ✂️\nGarde ton téléphone près de toi !',
      mad_title: 'En attente de mission',
      mad_msg: "Tiens-toi prêt, on peut t'appeler à tout moment 🔵\nReste disponible et réactif !",

      // Vehicle banner
      vehicle_today: 'Votre camion aujourd\'hui',
      not_assigned: 'Non attribué',
      badge_telepeage: 'Badge télépéage',
      route: 'Route',
      vague: 'Vague',
      statut: 'Statut',
      no_vehicle_warn: '⚠️ Aucun véhicule attribué aujourd\'hui. Contactez votre responsable.',
      vague_1: '1ère vague — 12h10',
      vague_2: '2ème vague — 12h20',
      vague_3: '3ème vague',

      // Steps
      step_matin: '☀️ Matin — Départ',
      step_soir: '🌙 Soir — Retour',

      // Matin form
      matin_title: '☀️ Début de tournée — Matin',
      km_depart_label: 'Kilométrage de départ (compteur)',
      km_depart_placeholder: 'Ex: 45 230',
      photo_camion_matin: '📸 Photo du camion (état départ)',
      photo_camion_btn: 'Appuyer pour photographier',
      mobilic_matin: '📋 Capture Mobilic (début)',
      mobilic_btn: 'Importer capture écran',
      remarques_depart: 'Remarques départ (optionnel)',
      remarques_placeholder: 'RAS ou description d\'un problème...',
      btn_depart: '✈️ Enregistrer le départ',
      km_required: 'Merci de saisir le kilométrage de départ.',

      // Retour confirm
      depart_ok: 'Départ enregistré avec succès',
      km_depart_info: 'Km départ',
      photos_sent: 'Photos matin transmises',

      // Soir form
      soir_title: '🌙 Fin de tournée — Soir',
      km_retour_label: 'Kilométrage de retour (compteur)',
      km_retour_placeholder: 'Ex: 45 458',
      photo_camion_soir: '📸 Photo du camion (état retour)',
      mobilic_soir: '📋 Capture Mobilic (fin)',
      remarques_retour: 'Remarques retour (optionnel)',
      remarques_retour_placeholder: 'Incidents, dégâts, livraisons non effectuées...',
      btn_retour: '🔒 Clôturer la tournée',
      km_retour_required: 'Merci de saisir le kilométrage de retour.',
      km_retour_error: 'Le km de retour doit être supérieur au km de départ.',

      // Clôture
      cloture_title: 'Tournée clôturée !',
      cloture_msg: 'Toutes vos données ont été transmises au responsable. À demain ! 👋',
      km_parcourus: 'km parcourus',
      photos_transmises: 'photos transmises',

      // Planning
      planning_title: '📅 Mon planning — 7 prochains jours',
      not_planned: '—',
      prochains_jours: '📅 Mes prochains jours',

      // Performances
      perf_title: '🏆 Mes performances',
      classement: 'Classement',
      score_moyen: 'Score moyen',
      colis_livres: '📦 Colis livrés',
      reussite: '✅ Réussite livraison',
      remboursement: '💸 Remboursement',
      lor: '🛣️ LOR DPMO',
      photo: '📸 Photo',
      contact: '📞 Contact',
      plainte: '⚠️ Plainte client',
      note: '⭐ Note client',
      no_perf: 'Aucune donnée disponible pour',

      // Statut badges
      statut_depart: 'Départ à enregistrer',
      statut_en_tournee: 'En tournée',
      statut_cloture: 'Clôturé ✓',

      // Sending
      sending: 'Envoi...',
      closing: 'Clôture...',
    },

    en: {
      logout: '⬅ Logout',
      lang_label: '🌐 Language',

      travail: 'Work',
      repos: 'Rest',
      cut: 'Cut',
      mad: 'On call',

      mission_greeting: 'Hello',
      mission_text: "A mission awaits you...\nif you choose to accept it. 🚚",
      mission_btn: "✅ I accept the mission!",
      mission_autodestruct: "This message will self-destruct after your shift 💥",
      mission_from: 'Message from your manager',

      repos_title: 'Rest well',
      repos_msg: 'Enjoy your day, recharge your batteries 🔋\nThe road can wait!',
      cut_title: 'Stay nearby',
      cut_msg: 'You could be called back at any time... ✂️\nKeep your phone close!',
      mad_title: 'Awaiting mission',
      mad_msg: "Stay ready, you could be called at any time 🔵\nRemain available and responsive!",

      vehicle_today: 'Your vehicle today',
      not_assigned: 'Not assigned',
      badge_telepeage: 'Toll badge',
      route: 'Route',
      vague: 'Wave',
      statut: 'Status',
      no_vehicle_warn: '⚠️ No vehicle assigned today. Contact your manager.',
      vague_1: '1st wave — 12:10',
      vague_2: '2nd wave — 12:20',
      vague_3: '3rd wave',

      step_matin: '☀️ Morning — Start',
      step_soir: '🌙 Evening — Return',

      matin_title: '☀️ Start of shift — Morning',
      km_depart_label: 'Starting mileage (odometer)',
      km_depart_placeholder: 'e.g. 45,230',
      photo_camion_matin: '📸 Vehicle photo (start)',
      photo_camion_btn: 'Tap to take photo',
      mobilic_matin: '📋 Mobilic screenshot (start)',
      mobilic_btn: 'Import screenshot',
      remarques_depart: 'Departure notes (optional)',
      remarques_placeholder: 'All good or describe a problem...',
      btn_depart: '✈️ Record departure',
      km_required: 'Please enter the starting mileage.',

      depart_ok: 'Departure recorded successfully',
      km_depart_info: 'Starting km',
      photos_sent: 'Morning photos sent',

      soir_title: '🌙 End of shift — Evening',
      km_retour_label: 'Return mileage (odometer)',
      km_retour_placeholder: 'e.g. 45,458',
      photo_camion_soir: '📸 Vehicle photo (return)',
      mobilic_soir: '📋 Mobilic screenshot (end)',
      remarques_retour: 'Return notes (optional)',
      remarques_retour_placeholder: 'Incidents, damage, undelivered packages...',
      btn_retour: '🔒 Close shift',
      km_retour_required: 'Please enter the return mileage.',
      km_retour_error: 'Return mileage must be greater than departure mileage.',

      cloture_title: 'Shift closed!',
      cloture_msg: 'All your data has been sent to your manager. See you tomorrow! 👋',
      km_parcourus: 'km driven',
      photos_transmises: 'photos sent',

      planning_title: '📅 My schedule — next 7 days',
      not_planned: '—',
      prochains_jours: '📅 My upcoming days',

      perf_title: '🏆 My performance',
      classement: 'Ranking',
      score_moyen: 'Average score',
      colis_livres: '📦 Packages delivered',
      reussite: '✅ Delivery success',
      remboursement: '💸 Reimbursement',
      lor: '🛣️ LOR DPMO',
      photo: '📸 Photo',
      contact: '📞 Contact',
      plainte: '⚠️ Customer complaint',
      note: '⭐ Customer rating',
      no_perf: 'No data available for',

      statut_depart: 'Departure to record',
      statut_en_tournee: 'On shift',
      statut_cloture: 'Closed ✓',

      sending: 'Sending...',
      closing: 'Closing...',
    },

    es: {
      logout: '⬅ Cerrar sesión',
      lang_label: '🌐 Idioma',

      travail: 'Trabajo',
      repos: 'Descanso',
      cut: 'Corte',
      mad: 'Disponible',

      mission_greeting: '¡Hola',
      mission_text: "Una misión te espera...\nsi decides aceptarla. 🚚",
      mission_btn: "✅ ¡Acepto la misión!",
      mission_autodestruct: "Este mensaje se autodestruirá después de tu turno 💥",
      mission_from: 'Mensaje de tu responsable',

      repos_title: 'Descansa bien',
      repos_msg: 'Disfruta tu día, recarga las pilas 🔋\n¡La carretera puede esperar!',
      cut_title: 'Quédate cerca',
      cut_msg: 'Te podrían llamar en cualquier momento... ✂️\n¡Mantén el teléfono cerca!',
      mad_title: 'Esperando misión',
      mad_msg: "Mantente listo, pueden llamarte en cualquier momento 🔵\n¡Permanece disponible y reactivo!",

      vehicle_today: 'Tu vehículo hoy',
      not_assigned: 'No asignado',
      badge_telepeage: 'Tarjeta de peaje',
      route: 'Ruta',
      vague: 'Oleada',
      statut: 'Estado',
      no_vehicle_warn: '⚠️ Ningún vehículo asignado hoy. Contacta a tu responsable.',
      vague_1: '1ª oleada — 12:10',
      vague_2: '2ª oleada — 12:20',
      vague_3: '3ª oleada',

      step_matin: '☀️ Mañana — Salida',
      step_soir: '🌙 Tarde — Regreso',

      matin_title: '☀️ Inicio de turno — Mañana',
      km_depart_label: 'Kilometraje de salida (contador)',
      km_depart_placeholder: 'Ej: 45 230',
      photo_camion_matin: '📸 Foto del vehículo (salida)',
      photo_camion_btn: 'Toca para fotografiar',
      mobilic_matin: '📋 Captura Mobilic (inicio)',
      mobilic_btn: 'Importar captura de pantalla',
      remarques_depart: 'Notas de salida (opcional)',
      remarques_placeholder: 'Todo bien o describe un problema...',
      btn_depart: '✈️ Registrar salida',
      km_required: 'Por favor ingresa el kilometraje de salida.',

      depart_ok: 'Salida registrada con éxito',
      km_depart_info: 'Km salida',
      photos_sent: 'Fotos de la mañana enviadas',

      soir_title: '🌙 Fin de turno — Tarde',
      km_retour_label: 'Kilometraje de regreso (contador)',
      km_retour_placeholder: 'Ej: 45 458',
      photo_camion_soir: '📸 Foto del vehículo (regreso)',
      mobilic_soir: '📋 Captura Mobilic (fin)',
      remarques_retour: 'Notas de regreso (opcional)',
      remarques_retour_placeholder: 'Incidentes, daños, entregas no realizadas...',
      btn_retour: '🔒 Cerrar turno',
      km_retour_required: 'Por favor ingresa el kilometraje de regreso.',
      km_retour_error: 'El km de regreso debe ser mayor que el de salida.',

      cloture_title: '¡Turno cerrado!',
      cloture_msg: 'Todos tus datos han sido enviados al responsable. ¡Hasta mañana! 👋',
      km_parcourus: 'km recorridos',
      photos_transmises: 'fotos enviadas',

      planning_title: '📅 Mi planificación — próximos 7 días',
      not_planned: '—',
      prochains_jours: '📅 Mis próximos días',

      perf_title: '🏆 Mi rendimiento',
      classement: 'Clasificación',
      score_moyen: 'Puntuación media',
      colis_livres: '📦 Paquetes entregados',
      reussite: '✅ Éxito de entrega',
      remboursement: '💸 Reembolso',
      lor: '🛣️ LOR DPMO',
      photo: '📸 Foto',
      contact: '📞 Contacto',
      plainte: '⚠️ Queja de cliente',
      note: '⭐ Valoración del cliente',
      no_perf: 'No hay datos disponibles para',

      statut_depart: 'Salida por registrar',
      statut_en_tournee: 'En turno',
      statut_cloture: 'Cerrado ✓',

      sending: 'Enviando...',
      closing: 'Cerrando...',
    },

    ar: {
      logout: '⬅ تسجيل الخروج',
      lang_label: '🌐 اللغة',

      travail: 'عمل',
      repos: 'راحة',
      cut: 'قطع',
      mad: 'متاح',

      mission_greeting: 'مرحباً',
      mission_text: "مهمة تنتظرك...\nإذا قبلت. 🚚",
      mission_btn: "✅ أقبل المهمة!",
      mission_autodestruct: "ستتدمر هذه الرسالة بعد ورديتك 💥",
      mission_from: 'رسالة من مسؤولك',

      repos_title: 'استرح جيداً',
      repos_msg: 'استمتع بيومك، اشحن طاقتك 🔋\nالطريق يمكن أن ينتظر!',
      cut_title: 'ابق قريباً',
      cut_msg: 'قد يتصلون بك في أي وقت... ✂️\nاحتفظ بهاتفك قريباً!',
      mad_title: 'في انتظار مهمة',
      mad_msg: "كن مستعداً، قد يتصلون بك في أي وقت 🔵\nابق متاحاً ومستجيباً!",

      vehicle_today: 'سيارتك اليوم',
      not_assigned: 'غير مخصص',
      badge_telepeage: 'بطاقة الرسوم',
      route: 'المسار',
      vague: 'الموجة',
      statut: 'الحالة',
      no_vehicle_warn: '⚠️ لا توجد سيارة مخصصة اليوم. تواصل مع مسؤولك.',
      vague_1: 'الموجة الأولى — 12:10',
      vague_2: 'الموجة الثانية — 12:20',
      vague_3: 'الموجة الثالثة',

      step_matin: '☀️ الصباح — المغادرة',
      step_soir: '🌙 المساء — العودة',

      matin_title: '☀️ بداية الوردية — الصباح',
      km_depart_label: 'عداد الكيلومترات (المغادرة)',
      km_depart_placeholder: 'مثال: 45 230',
      photo_camion_matin: '📸 صورة السيارة (المغادرة)',
      photo_camion_btn: 'اضغط للتصوير',
      mobilic_matin: '📋 لقطة Mobilic (البداية)',
      mobilic_btn: 'استيراد لقطة الشاشة',
      remarques_depart: 'ملاحظات المغادرة (اختياري)',
      remarques_placeholder: 'كل شيء على ما يرام أو صف مشكلة...',
      btn_depart: '✈️ تسجيل المغادرة',
      km_required: 'يرجى إدخال عداد الكيلومترات عند المغادرة.',

      depart_ok: 'تم تسجيل المغادرة بنجاح',
      km_depart_info: 'كم المغادرة',
      photos_sent: 'تم إرسال صور الصباح',

      soir_title: '🌙 نهاية الوردية — المساء',
      km_retour_label: 'عداد الكيلومترات (العودة)',
      km_retour_placeholder: 'مثال: 45 458',
      photo_camion_soir: '📸 صورة السيارة (العودة)',
      mobilic_soir: '📋 لقطة Mobilic (النهاية)',
      remarques_retour: 'ملاحظات العودة (اختياري)',
      remarques_retour_placeholder: 'حوادث، أضرار، توصيلات لم تتم...',
      btn_retour: '🔒 إغلاق الوردية',
      km_retour_required: 'يرجى إدخال عداد الكيلومترات عند العودة.',
      km_retour_error: 'كيلومترات العودة يجب أن تكون أكبر من كيلومترات المغادرة.',

      cloture_title: 'تم إغلاق الوردية!',
      cloture_msg: 'تم إرسال جميع بياناتك إلى المسؤول. إلى الغد! 👋',
      km_parcourus: 'كم مقطوعة',
      photos_transmises: 'صور مُرسلة',

      planning_title: '📅 جدولي — 7 أيام القادمة',
      not_planned: '—',
      prochains_jours: '📅 أيامي القادمة',

      perf_title: '🏆 أدائي',
      classement: 'الترتيب',
      score_moyen: 'متوسط النقاط',
      colis_livres: '📦 الطرود المسلمة',
      reussite: '✅ نجاح التسليم',
      remboursement: '💸 استرداد',
      lor: '🛣️ LOR DPMO',
      photo: '📸 صورة',
      contact: '📞 تواصل',
      plainte: '⚠️ شكوى عميل',
      note: '⭐ تقييم العميل',
      no_perf: 'لا توجد بيانات متاحة لـ',

      statut_depart: 'المغادرة للتسجيل',
      statut_en_tournee: 'في الوردية',
      statut_cloture: 'مغلق ✓',

      sending: 'جاري الإرسال...',
      closing: 'جاري الإغلاق...',
    }
  }
};
