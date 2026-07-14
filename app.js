/* ==========================================================================
   NIS2Ready — Logique Applicative Complète (Vanilla JS ES6+)
   - Navigation SPA entre étapes
   - Rendu dynamique des domaines NIS2
   - Calcul du score en temps réel
   - Génération PDF avec jsPDF (5 pages professionnelles)
   ========================================================================== */

'use strict';

// ==========================================================================
// DONNÉES MÉTIER — 10 DOMAINES NIS2 (Article 21)
// ==========================================================================
const NIS2_DOMAINS = [
  {
    id: 1,
    title: 'Gouvernance et politique de sécurité',
    subtitle: 'Politique PSSI, rôles et responsabilités',
    description: 'La direction doit piloter activement la cybersécurité et formaliser ses engagements.',
    actionDesc: 'Rédigez une Politique de Sécurité des Systèmes d\'Information (PSSI), désignez un RSSI et tenez des revues de direction annuelles.',
    questions: [
      'Votre entreprise dispose-t-elle d\'une politique de sécurité informatique écrite ?',
      'La direction est-elle impliquée dans les décisions de cybersécurité ?',
      'Un responsable de la sécurité (RSSI ou équivalent) a-t-il été désigné ?'
    ]
  },
  {
    id: 2,
    title: 'Gestion des risques',
    subtitle: 'Analyse, documentation et traitement des risques',
    description: 'Identifier et traiter les risques cyber pesant sur vos actifs les plus critiques.',
    actionDesc: 'Réalisez une cartographie des actifs et une analyse de risques (méthode EBIOS RM recommandée par l\'ANSSI), puis formalisez un plan de traitement des risques.',
    questions: [
      'Avez-vous réalisé une analyse des risques cyber dans les 12 derniers mois ?',
      'Les risques identifiés sont-ils documentés et priorisés ?',
      'Des mesures correctives sont-elles planifiées pour chaque risque majeur ?'
    ]
  },
  {
    id: 3,
    title: 'Gestion des incidents',
    subtitle: 'Procédure de réponse et notification ANSSI',
    description: 'Être capable de détecter, contenir et déclarer un incident de sécurité dans les délais légaux.',
    actionDesc: 'Rédigez un plan de réponse aux incidents, créez un compte sur le portail ANSSI (cyber.gouv.fr) et tenez un registre des incidents.',
    questions: [
      'Disposez-vous d\'une procédure documentée de réponse aux incidents cyber ?',
      'Êtes-vous en mesure de notifier un incident à l\'ANSSI dans les 24 heures ?',
      'Les incidents passés sont-ils consignés dans un registre avec leurs analyses ?'
    ]
  },
  {
    id: 4,
    title: 'Continuité d\'activité et sauvegardes',
    subtitle: 'PCA, sauvegardes et restauration testée',
    description: 'Garantir la reprise d\'activité rapide en cas de sinistre ou d\'attaque ransomware.',
    actionDesc: 'Mettez en place des sauvegardes quotidiennes externalisées (règle 3-2-1), testez la restauration au moins 2 fois par an et rédigez un Plan de Continuité d\'Activité (PCA).',
    questions: [
      'Vos données critiques sont-elles sauvegardées quotidiennement ?',
      'Les sauvegardes sont-elles stockées hors site ou dans le cloud (règle 3-2-1) ?',
      'Avez-vous testé la restauration complète de vos sauvegardes dans les 6 derniers mois ?'
    ]
  },
  {
    id: 5,
    title: 'Sécurité de la chaîne d\'approvisionnement',
    subtitle: 'Évaluation et contractualisation fournisseurs',
    description: 'Maîtriser les risques cyber introduits par vos sous-traitants et prestataires IT.',
    actionDesc: 'Évaluez la maturité cyber de vos fournisseurs critiques, intégrez des clauses cybersécurité dans vos contrats et tenez à jour la liste des tiers ayant accès à votre SI.',
    questions: [
      'Avez-vous évalué le niveau de sécurité de vos fournisseurs IT critiques ?',
      'Vos contrats fournisseurs incluent-ils des clauses de cybersécurité ?',
      'Disposez-vous d\'une liste à jour de vos prestataires ayant accès à votre SI ?'
    ]
  },
  {
    id: 6,
    title: 'Sécurité des réseaux et des systèmes',
    subtitle: 'Segmentation, patchs et outils de protection',
    description: 'Protéger l\'infrastructure réseau et maintenir les systèmes à jour contre les vulnérabilités connues.',
    actionDesc: 'Segmentez votre réseau (bureautique / production), appliquez les correctifs de sécurité sous 30 jours et déployez un pare-feu et un antivirus managé sur tous les postes.',
    questions: [
      'Votre réseau est-il segmenté (séparation bureautique / production / invités) ?',
      'Les mises à jour de sécurité sont-elles appliquées sous 30 jours ?',
      'Disposez-vous d\'un pare-feu et d\'un antivirus actifs et à jour sur tous les postes ?'
    ]
  },
  {
    id: 7,
    title: 'Authentification et contrôle d\'accès (MFA)',
    subtitle: 'Double facteur, gestion des droits et des départs',
    description: 'Sécuriser les accès aux systèmes en appliquant le principe du moindre privilège.',
    actionDesc: 'Activez l\'authentification multi-facteur (MFA) sur tous les accès distants et outils critiques, séparez les comptes admin des comptes utilisateurs et révoquez systématiquement les accès lors des départs.',
    questions: [
      'L\'authentification à double facteur (MFA) est-elle activée pour les accès distants et outils stratégiques ?',
      'Les comptes administrateurs sont-ils distincts et séparés des comptes utilisateurs standards ?',
      'Les accès sont-ils revus et révoqués immédiatement lors des départs de collaborateurs ?'
    ]
  },
  {
    id: 8,
    title: 'Chiffrement et cryptographie',
    subtitle: 'Chiffrement au repos, en transit et des supports',
    description: 'Protéger la confidentialité des données sensibles contre l\'interception ou le vol physique.',
    actionDesc: 'Activez le chiffrement des disques durs (BitLocker/FileVault), imposez HTTPS/TLS pour toutes vos communications et chiffrez tous les supports amovibles.',
    questions: [
      'Les données sensibles sont-elles chiffrées au repos (disques) et en transit (TLS) ?',
      'Vos communications externes utilisent-elles exclusivement le protocole HTTPS/TLS ?',
      'Les supports amovibles (clés USB, disques externes) sont-ils chiffrés ?'
    ]
  },
  {
    id: 9,
    title: 'Sécurité des ressources humaines',
    subtitle: 'Onboarding sécurisé, charte et procédure de départ',
    description: 'Intégrer la cybersécurité dans le cycle de vie des collaborateurs, de l\'arrivée au départ.',
    actionDesc: 'Formalisez une charte informatique annexée au règlement intérieur, créez une procédure de départ sécurisé (révocation des accès sous 24h) et sensibilisez dès l\'intégration.',
    questions: [
      'Les nouveaux employés reçoivent-ils une formation ou une sensibilisation à la cybersécurité lors de leur intégration ?',
      'Une procédure de départ sécurisé existe-t-elle (révocation des accès, restitution du matériel) ?',
      'Les employés ont-ils signé une charte informatique et sont-ils sensibilisés aux risques de phishing ?'
    ]
  },
  {
    id: 10,
    title: 'Formation et sensibilisation',
    subtitle: 'Formations annuelles, obligations NIS2 dirigeants',
    description: 'Former régulièrement tous les collaborateurs pour faire de chacun un acteur de la cybersécurité.',
    actionDesc: 'Organisez au moins une formation cyber par an pour tous les salariés, formez la direction à ses obligations NIS2 et réalisez des simulations de phishing pour mesurer la vigilance.',
    questions: [
      'Une formation cyber a-t-elle été dispensée à l\'ensemble des employés dans les 12 derniers mois ?',
      'La direction a-t-elle suivi une formation spécifique sur ses obligations réglementaires NIS2 ?',
      'Des exercices de simulation (ex : faux phishing, test d\'intrusion) sont-ils organisés régulièrement ?'
    ]
  }
];

// ==========================================================================
// ÉTAT GLOBAL DE L'APPLICATION (window.NIS2State)
// ==========================================================================
window.NIS2State = {
  currentStep: 1,            // Étape SPA courante (1 à 4)
  company: {                 // Données entreprise (Étape 1)
    name: '',
    sector: '',
    sectorLabel: '',
    employees: '',
    employeesLabel: '',
    revenue: '',
    revenueLabel: '',
    responsibleName: '',
    responsibleRole: '',
    evalDate: '',
    reportNumber: ''
  },
  answers: {},               // Réponses aux questions — clé : "domainId_questionIndex" — valeur : "oui" | "en_cours" | "non"
  domainScores: {},          // Score (0-6) par domaine, calculé dynamiquement
  globalScore: 0,            // Score global en %
  globalLevel: ''            // "Critique" | "En progression" | "Avancé" | "Conforme"
};

// ==========================================================================
// UTILITAIRES DE NAVIGATION SPA
// ==========================================================================

/**
 * Affiche l'écran correspondant à l'étape donnée
 * @param {number} step - numéro de l'étape (1 à 4)
 */
function showStep(step) {
  // Masquer tous les écrans
  document.querySelectorAll('.step-screen').forEach(s => s.classList.remove('active'));

  // Afficher l'écran cible
  const target = document.getElementById(`screen-step${step}`);
  if (target) target.classList.add('active');

  // Mettre à jour la barre de progression en haut
  updateStepsNav(step);

  // Remonter en haut de page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  window.NIS2State.currentStep = step;
}

/**
 * Met à jour l'état visuel de la barre de navigation des étapes
 * @param {number} currentStep - étape active
 */
function updateStepsNav(currentStep) {
  for (let i = 1; i <= 4; i++) {
    const item = document.getElementById(`step-nav-${i}`);
    if (!item) continue;

    item.classList.remove('active', 'completed');

    if (i < currentStep)       item.classList.add('completed');
    else if (i === currentStep) item.classList.add('active');
  }

  // Lignes entre les étapes
  document.querySelectorAll('.step-line').forEach((line, idx) => {
    line.classList.toggle('completed', idx + 1 < currentStep);
  });
}

// ==========================================================================
// ÉTAPE 1 — VALIDATION DU FORMULAIRE ET PASSAGE À L'ÉTAPE 2
// ==========================================================================

/**
 * Valide les champs required du formulaire entreprise
 * Retourne true si tout est valide, false sinon
 */
function validateCompanyForm() {
  const fields = [
    { id: 'company-name',     errId: 'err-company-name',     label: 'Le nom de l\'entreprise est requis.' },
    { id: 'sector',           errId: 'err-sector',           label: 'Veuillez sélectionner un secteur.' },
    { id: 'employees',        errId: 'err-employees',        label: 'Veuillez sélectionner le nombre de salariés.' },
    { id: 'revenue',          errId: 'err-revenue',          label: 'Veuillez sélectionner votre chiffre d\'affaires.' },
    { id: 'responsible-name', errId: 'err-responsible-name', label: 'Le nom du responsable est requis.' }
  ];

  let valid = true;

  fields.forEach(({ id, errId, label }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    const val = el ? el.value.trim() : '';

    if (!val) {
      if (err) err.textContent = label;
      if (el)  el.classList.add('is-invalid');
      valid = false;
    } else {
      if (err) err.textContent = '';
      if (el)  el.classList.remove('is-invalid');
    }
  });

  return valid;
}

/**
 * Collecte les données du formulaire dans NIS2State.company
 */
function collectCompanyData() {
  const s = window.NIS2State.company;

  s.name            = document.getElementById('company-name').value.trim();
  s.responsibleName = document.getElementById('responsible-name').value.trim();
  s.responsibleRole = document.getElementById('responsible-role').value.trim() || 'Responsable';
  s.evalDate        = document.getElementById('eval-date').value;

  // Secteur
  const sectorSel  = document.getElementById('sector');
  s.sector         = sectorSel.value;
  s.sectorLabel    = sectorSel.options[sectorSel.selectedIndex]?.text || s.sector;

  // Effectif
  const empSel     = document.getElementById('employees');
  s.employees      = empSel.value;
  s.employeesLabel = empSel.options[empSel.selectedIndex]?.text || s.employees;

  // CA
  const revSel     = document.getElementById('revenue');
  s.revenue        = revSel.value;
  s.revenueLabel   = revSel.options[revSel.selectedIndex]?.text || s.revenue;

  // Numéro de rapport unique : NIS2-AAAA-XXXXXX
  const year       = new Date().getFullYear();
  const rand       = Math.floor(100000 + Math.random() * 900000);
  s.reportNumber   = `NIS2-${year}-${rand}`;
}

/**
 * Détermine le statut réglementaire NIS2 de l'entreprise
 * Retourne une chaîne descriptive
 */
function getRegStatus() {
  const { employees, revenue } = window.NIS2State.company;

  // Secteurs hautement critiques
  const highCritical = ['energie','transports','banque','marches-financiers','sante',
                         'eau-potable','eaux-usees','infra-numerique','gestion-tic',
                         'admin-publique','espace'];

  const sectorHighCrit = highCritical.includes(window.NIS2State.company.sector);

  if (employees === 'large' || revenue === 'large') {
    return sectorHighCrit ? 'Entité Essentielle (EE)' : 'Entité Importante (EI)';
  } else if (employees === 'medium' || revenue === 'medium') {
    return sectorHighCrit ? 'Entité Importante (EI)' : 'Non concernée directement (application recommandée)';
  }
  return 'Non concernée directement (application recommandée)';
}

// ==========================================================================
// ÉTAPE 2 — RENDU DYNAMIQUE DES DOMAINES ET CALCUL DE SCORE
// ==========================================================================

/**
 * Crée et injecte dans le DOM les cartes des 10 domaines NIS2
 */
function renderDomains() {
  const container = document.getElementById('domains-container');
  if (!container) return;

  container.innerHTML = '';

  NIS2_DOMAINS.forEach((domain) => {
    const card = document.createElement('div');
    card.className = 'domain-card open'; // Ouvert par défaut
    card.id = `domain-card-${domain.id}`;

    // En-tête cliquable de la carte
    const header = document.createElement('div');
    header.className = 'domain-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'true');
    header.setAttribute('tabindex', '0');
    header.innerHTML = `
      <div class="domain-header-left">
        <div class="domain-num">${domain.id}</div>
        <div>
          <div class="domain-title">${domain.title}</div>
          <div class="domain-subtitle">${domain.subtitle}</div>
        </div>
      </div>
      <div class="domain-header-right">
        <span class="domain-score-mini" id="domain-score-mini-${domain.id}">0 / 6</span>
        <span class="domain-toggle-icon">▾</span>
      </div>
    `;

    // Clic pour ouvrir / fermer la carte
    header.addEventListener('click', () => {
      card.classList.toggle('open');
      const expanded = card.classList.contains('open');
      header.setAttribute('aria-expanded', String(expanded));
    });

    // Touche Entrée / Espace pour accessibilité clavier
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });

    // Corps de la carte : questions
    const body = document.createElement('div');
    body.className = 'domain-body';

    // Construction des questions
    const questionsHtml = domain.questions.map((q, qi) => `
      <div class="question-item">
        <p class="question-text">${qi + 1}. ${q}</p>
        <div class="question-options">
          <div class="radio-option">
            <input type="radio" name="q_${domain.id}_${qi}" id="q_${domain.id}_${qi}_oui" value="oui" />
            <label for="q_${domain.id}_${qi}_oui" class="radio-label oui">✅ Oui</label>
          </div>
          <div class="radio-option">
            <input type="radio" name="q_${domain.id}_${qi}" id="q_${domain.id}_${qi}_en_cours" value="en_cours" />
            <label for="q_${domain.id}_${qi}_en_cours" class="radio-label en-cours">🔄 En cours</label>
          </div>
          <div class="radio-option">
            <input type="radio" name="q_${domain.id}_${qi}" id="q_${domain.id}_${qi}_non" value="non" />
            <label for="q_${domain.id}_${qi}_non" class="radio-label non">❌ Non</label>
          </div>
        </div>
      </div>
    `).join('');

    // Mini barre de progression par domaine
    body.innerHTML = `
      ${questionsHtml}
      <div class="domain-progress">
        <span class="domain-progress-label">Progression :</span>
        <div class="domain-progress-bar">
          <div class="domain-progress-fill" id="domain-progress-fill-${domain.id}" style="width: 0%; background: var(--color-warning);"></div>
        </div>
        <span class="domain-score-mini" id="domain-score-pct-${domain.id}">0%</span>
      </div>
    `;

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);

    // Écouter les changements de réponse pour mettre à jour le score en temps réel
    body.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        const key = `${domain.id}_${input.name.split('_')[2]}`; // ex: "1_0"
        window.NIS2State.answers[key] = input.value;
        updateAllScores();
      });
    });
  });
}

/**
 * Recalcule les scores de tous les domaines et le score global
 * Puis met à jour tous les indicateurs visuels de l'étape 2
 */
function updateAllScores() {
  let totalPoints  = 0;
  let totalMax     = 0;
  let answeredCount = 0;

  NIS2_DOMAINS.forEach(domain => {
    let domainPoints = 0;
    const domainMax  = domain.questions.length * 2;

    domain.questions.forEach((_, qi) => {
      const key  = `${domain.id}_${qi}`;
      const val  = window.NIS2State.answers[key];

      if (val === 'oui')      { domainPoints += 2; answeredCount++; }
      else if (val === 'en_cours') { domainPoints += 1; answeredCount++; }
      else if (val === 'non') { answeredCount++; }
    });

    window.NIS2State.domainScores[domain.id] = domainPoints;
    totalPoints += domainPoints;
    totalMax    += domainMax;

    // Mettre à jour la mini barre et le score par domaine
    const pct       = Math.round((domainPoints / domainMax) * 100);
    const fillEl    = document.getElementById(`domain-progress-fill-${domain.id}`);
    const pctEl     = document.getElementById(`domain-score-pct-${domain.id}`);
    const miniEl    = document.getElementById(`domain-score-mini-${domain.id}`);

    if (fillEl) {
      fillEl.style.width = `${pct}%`;
      // Couleur dynamique selon le score
      if (pct >= 80) fillEl.style.background = 'var(--color-success)';
      else if (pct >= 40) fillEl.style.background = 'var(--color-warning)';
      else fillEl.style.background = 'var(--color-danger)';
    }
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (miniEl) miniEl.textContent = `${domainPoints} / ${domainMax}`;
  });

  // Score global
  const globalPct = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;
  window.NIS2State.globalScore = globalPct;
  window.NIS2State.globalLevel = getScoreLevel(globalPct);

  // Barre de progression et score live
  const totalQuestions = NIS2_DOMAINS.reduce((sum, d) => sum + d.questions.length, 0);
  const progressEl     = document.getElementById('eval-progress-bar');
  const progressTxtEl  = document.getElementById('eval-progress-text');
  const liveScoreEl    = document.getElementById('eval-live-score');

  if (progressEl)    progressEl.style.width    = `${(answeredCount / totalQuestions) * 100}%`;
  if (progressTxtEl) progressTxtEl.textContent = `${answeredCount} / ${totalQuestions} réponses`;
  if (liveScoreEl)   liveScoreEl.textContent   = `Score : ${globalPct}%`;
}

/**
 * Retourne le libellé du niveau NIS2 selon le score global
 * @param {number} pct - score en %
 * @returns {string}
 */
function getScoreLevel(pct) {
  if (pct <= 30) return 'Critique';
  if (pct <= 60) return 'En progression';
  if (pct <= 85) return 'Avancé';
  return 'Conforme';
}

/**
 * Retourne la couleur CSS associée au niveau
 * @param {string} level
 * @returns {string} code couleur hex
 */
function getLevelColor(level) {
  switch (level) {
    case 'Critique':       return '#E53E3E';
    case 'En progression': return '#D69E2E';
    case 'Avancé':         return '#3182CE';
    case 'Conforme':       return '#1D9E75';
    default:               return '#718096';
  }
}

/**
 * Retourne la classe CSS du badge selon le niveau
 * @param {string} level
 * @returns {string}
 */
function getLevelBadgeClass(level) {
  switch (level) {
    case 'Critique':       return 'badge-red';
    case 'En progression': return 'badge-orange';
    case 'Avancé':         return 'badge-blue';
    case 'Conforme':       return 'badge-green';
    default:               return 'badge-gray';
  }
}

// ==========================================================================
// ÉTAPE 3 — AFFICHAGE DES RÉSULTATS
// ==========================================================================

/**
 * Remplit et affiche l'écran de résultats (Étape 3)
 */
function renderResults() {
  const score = window.NIS2State.globalScore;
  const level = window.NIS2State.globalLevel;
  const color = getLevelColor(level);

  // --- Jauge circulaire SVG ---
  const gaugeFill = document.getElementById('gauge-fill-circle');
  const gaugeText = document.getElementById('gauge-percent-text');

  if (gaugeFill) {
    const circumference = 2 * Math.PI * 80; // 502.65
    const offset = circumference - (score / 100) * circumference;
    gaugeFill.style.strokeDashoffset = String(circumference); // Départ à 0%
    gaugeFill.style.stroke = color;

    // Anime la jauge après un court délai (ressenti premium)
    setTimeout(() => {
      gaugeFill.style.strokeDashoffset = String(offset);
    }, 150);
  }
  if (gaugeText) gaugeText.textContent = `${score}%`;

  // --- Badge de statut ---
  const badgeEl = document.getElementById('results-status-badge');
  const descEl  = document.getElementById('results-status-desc');

  const levelDescriptions = {
    'Critique':       'Votre niveau de protection expose sérieusement votre entreprise. Des mesures urgentes doivent être prises immédiatement.',
    'En progression': 'Des bases existent, mais des lacunes importantes subsistent sur des piliers fondamentaux de NIS2.',
    'Avancé':         'Vous avez déjà une bonne maturité cyber. Quelques domaines restent à consolider pour atteindre la conformité totale.',
    'Conforme':       'Félicitations ! Votre entreprise répond aux exigences principales de la directive NIS2. Maintenez cet excellent niveau.'
  };

  if (badgeEl) {
    badgeEl.textContent = level;
    badgeEl.className = `status-badge-large badge ${getLevelBadgeClass(level)}`;
    badgeEl.style.fontSize = '18px';
    badgeEl.style.padding = '10px 22px';
  }
  if (descEl) descEl.textContent = levelDescriptions[level] || '';

  // --- Tableau des 10 domaines ---
  const tbody = document.getElementById('results-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    NIS2_DOMAINS.forEach(domain => {
      const domScore = window.NIS2State.domainScores[domain.id] || 0;
      const domMax   = domain.questions.length * 2;
      const domPct   = Math.round((domScore / domMax) * 100);
      const domLevel = getScoreLevel(domPct);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${domain.id}. ${domain.title}</td>
        <td class="score-cell" style="color: ${getLevelColor(domLevel)};">${domPct}%</td>
        <td><span class="badge ${getLevelBadgeClass(domLevel)}">${domLevel}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Points forts (domaines > 80%) ---
  const strengthsEl = document.getElementById('results-strengths');
  if (strengthsEl) {
    const strengths = NIS2_DOMAINS.filter(d => {
      const s = window.NIS2State.domainScores[d.id] || 0;
      return Math.round((s / (d.questions.length * 2)) * 100) > 80;
    }).slice(0, 3);

    if (strengths.length === 0) {
      strengthsEl.innerHTML = '<li><span class="insight-icon">—</span> Aucun domaine n\'atteint encore 80%. Continuez à progresser !</li>';
    } else {
      strengthsEl.innerHTML = strengths.map(d =>
        `<li><span class="insight-icon">✅</span> ${d.title}</li>`
      ).join('');
    }
  }

  // --- Actions prioritaires (domaines < 40%) ---
  const actionsEl = document.getElementById('results-actions');
  if (actionsEl) {
    const priorities = NIS2_DOMAINS.filter(d => {
      const s = window.NIS2State.domainScores[d.id] || 0;
      return Math.round((s / (d.questions.length * 2)) * 100) < 40;
    }).slice(0, 3);

    if (priorities.length === 0) {
      actionsEl.innerHTML = '<li><span class="insight-icon">🎉</span> Aucun domaine critique. Excellent travail !</li>';
    } else {
      actionsEl.innerHTML = priorities.map(d =>
        `<li><span class="insight-icon">🚨</span><div><strong>${d.title}</strong><br><small>${d.actionDesc}</small></div></li>`
      ).join('');
    }
  }
}

// ==========================================================================
// ÉTAPE 4 — GÉNÉRATION DU RAPPORT PDF AVEC jsPDF
// ==========================================================================

/**
 * Génère le rapport PDF complet (5 pages) en utilisant jsPDF
 * et le télécharge automatiquement
 */
async function generatePDF() {
  // Afficher l'overlay de chargement (ressenti pro de 1.5s)
  showLoader('Génération de votre rapport PDF en cours…');

  await delay(1500);

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const state   = window.NIS2State;
    const company = state.company;
    const score   = state.globalScore;
    const level   = state.globalLevel;
    const color   = getLevelColor(level);

    // Dimensions A4
    const PW = 210; // Largeur page (mm)
    const PH = 297; // Hauteur page (mm)
    const M  = 20;  // Marge
    const CW = PW - M * 2; // Largeur utile

    // Conversion couleur hex → [r,g,b] pour jsPDF
    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return [r, g, b];
    }

    // Couleurs définies
    const colorNavy   = hexToRgb('#1A2B4A');
    const colorGreen  = hexToRgb('#1D9E75');
    const colorLevel  = hexToRgb(color);
    const colorGray   = hexToRgb('#718096');
    const colorLight  = hexToRgb('#F4F7FA');
    const colorBorder = hexToRgb('#E2E8F0');

    // Utilitaire : dessiner un rectangle coloré
    function fillRect(x, y, w, h, r, g, b, opacity = 1) {
      doc.setFillColor(r, g, b);
      doc.rect(x, y, w, h, 'F');
    }

    // Utilitaire : texte centré
    function centeredText(text, y, size, r, g, b, style = 'normal') {
      doc.setFontSize(size);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', style);
      doc.text(text, PW / 2, y, { align: 'center' });
    }

    // Utilitaire : texte aligné à gauche
    function leftText(text, x, y, size, r, g, b, style = 'normal') {
      doc.setFontSize(size);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', style);
      doc.text(text, x, y);
    }

    // Utilitaire : texte multi-lignes dans une largeur donnée
    function wrapText(text, x, y, maxWidth, size, r, g, b, style = 'normal', lineH = 6) {
      doc.setFontSize(size);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', style);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineH;
    }

    // Utilitaire : ligne horizontale
    function hLine(y, r, g, b) {
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);
      doc.line(M, y, PW - M, y);
    }

    // =============================
    // PAGE 1 — PAGE DE GARDE
    // =============================

    // Fond couleur bleu marine en haut (bandeau logo)
    fillRect(0, 0, PW, 40, ...colorNavy);

    // Logo NIS2Ready
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('NIS2', M, 25);
    doc.setTextColor(...colorGreen);
    doc.text('Ready', M + 26, 25);

    // N° de rapport
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapport n° ${company.reportNumber}`, PW - M, 25, { align: 'right' });

    // Bande colorée selon le niveau (sous le header)
    fillRect(0, 40, PW, 8, ...colorLevel);

    // Titre principal
    let yPos = 75;
    centeredText('RAPPORT D\'ÉVALUATION', yPos, 24, ...colorNavy, 'bold');
    yPos += 10;
    centeredText('DE CONFORMITÉ NIS2', yPos, 24, ...colorNavy, 'bold');
    yPos += 10;
    centeredText('Directive (UE) 2022/2555 — Article 21', yPos, 11, ...colorGray, 'italic');

    // Séparateur
    yPos += 18;
    hLine(yPos, ...colorBorder);

    // Informations entreprise (encadré)
    yPos += 14;
    fillRect(M, yPos - 6, CW, 58, ...colorLight);
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.3);
    doc.rect(M, yPos - 6, CW, 58);

    // Nom entreprise
    centeredText(company.name, yPos + 5, 20, ...colorNavy, 'bold');

    // Secteur
    centeredText(company.sectorLabel, yPos + 14, 11, ...colorGray, 'italic');

    // Responsable
    yPos += 27;
    centeredText(`Préparé par : ${company.responsibleName}`, yPos, 11, ...colorGray);
    yPos += 7;
    centeredText(`Fonction : ${company.responsibleRole}`, yPos, 11, ...colorGray);
    yPos += 7;
    centeredText(`Date d'évaluation : ${formatDate(company.evalDate)}`, yPos, 11, ...colorGray);

    // Score global — gros chiffre au centre
    yPos = 205;
    centeredText(`Score global de conformité`, yPos, 12, ...colorGray);
    yPos += 12;
    centeredText(`${score}%`, yPos, 52, ...colorLevel, 'bold');
    yPos += 8;
    centeredText(level, yPos, 14, ...colorLevel, 'bold');

    // Bandeau bas de page
    fillRect(0, PH - 18, PW, 18, ...colorNavy);
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('NIS2Ready — Conformité NIS2 pour PME', M, PH - 8);
    doc.text(`Généré le ${formatDate(company.evalDate)}`, PW - M, PH - 8, { align: 'right' });

    // =============================
    // PAGE 2 — RÉSUMÉ EXÉCUTIF
    // =============================
    doc.addPage();

    // En-tête de page interne
    fillRect(0, 0, PW, 20, ...colorNavy);
    leftText('NIS2Ready', M, 13, 11, 255, 255, 255, 'bold');
    leftText('— Résumé exécutif', M + 22, 13, 11, ...colorGreen, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 220);
    doc.text(`Page 2 / 5  |  ${company.reportNumber}`, PW - M, 13, { align: 'right' });

    yPos = 38;
    leftText('Résumé exécutif', M, yPos, 18, ...colorNavy, 'bold');
    yPos += 4;
    hLine(yPos, ...colorBorder);

    // Paragraphe d'introduction dynamique selon le score
    yPos += 12;
    const introTexts = {
      'Critique':       `L'évaluation conduite par ${company.responsibleName} (${company.responsibleRole}) démontre un niveau de maturité cybersécurité insuffisant au regard des exigences de la directive NIS2. Des lacunes significatives ont été identifiées dans plusieurs domaines fondamentaux de l'Article 21. Une démarche de mise en conformité urgente doit être initiée sans délai.`,
      'En progression': `L'évaluation conduite par ${company.responsibleName} (${company.responsibleRole}) révèle un niveau de maturité en progression, avec des premiers éléments de conformité en place. Cependant, des efforts importants restent nécessaires pour atteindre le niveau requis par la directive NIS2 sur plusieurs piliers fondamentaux.`,
      'Avancé':         `L'évaluation conduite par ${company.responsibleName} (${company.responsibleRole}) reflète un niveau de maturité cybersécurité avancé. L'entreprise a déjà déployé la majorité des mesures requises par l'Article 21 de NIS2. Des ajustements ciblés permettront d'atteindre une conformité complète.`,
      'Conforme':       `L'évaluation conduite par ${company.responsibleName} (${company.responsibleRole}) démontre un excellent niveau de maturité cybersécurité, conforme aux exigences de la directive NIS2. L'entreprise a mis en œuvre l'ensemble des mesures préconisées par l'Article 21.`
    };

    yPos = wrapText(introTexts[level] || '', M, yPos, CW, 10, ...colorGray, 'normal', 5.5);

    // Statut réglementaire
    yPos += 10;
    leftText('Statut réglementaire', M, yPos, 13, ...colorNavy, 'bold');
    yPos += 6;
    fillRect(M, yPos - 4, CW, 16, ...hexToRgb('#F0FBF7'));
    doc.setDrawColor(...colorGreen);
    doc.setLineWidth(0.5);
    doc.line(M, yPos - 4, M, yPos + 12);
    leftText(getRegStatus(), M + 5, yPos + 5, 11, ...colorNavy, 'bold');

    // Tableau de synthèse
    yPos += 22;
    leftText('Tableau de synthèse par domaine', M, yPos, 13, ...colorNavy, 'bold');
    yPos += 8;

    // En-tête du tableau
    fillRect(M, yPos, CW, 9, ...colorNavy);
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Domaine (Article 21)', M + 3, yPos + 6);
    doc.text('Score', M + CW - 40, yPos + 6);
    doc.text('Statut', M + CW - 22, yPos + 6);

    yPos += 9;

    NIS2_DOMAINS.forEach((domain, idx) => {
      const ds    = window.NIS2State.domainScores[domain.id] || 0;
      const dMax  = domain.questions.length * 2;
      const dPct  = Math.round((ds / dMax) * 100);
      const dLvl  = getScoreLevel(dPct);
      const dCol  = hexToRgb(getLevelColor(dLvl));

      // Alternance de fond de ligne
      if (idx % 2 === 0) fillRect(M, yPos, CW, 8, ...hexToRgb('#F8FAFC'));

      doc.setFontSize(8.5);
      doc.setTextColor(...colorNavy);
      doc.setFont('helvetica', 'normal');

      // Tronquer le nom si trop long
      const shortTitle = domain.title.length > 45
        ? domain.title.substring(0, 42) + '...'
        : domain.title;

      doc.text(`${domain.id}. ${shortTitle}`, M + 3, yPos + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...dCol);
      doc.text(`${dPct}%`, M + CW - 40, yPos + 5.5);

      // Badge statut coloré
      fillRect(M + CW - 28, yPos + 1.5, 26, 5.5, ...dCol);
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(dLvl, M + CW - 15, yPos + 5.5, { align: 'center' });

      doc.setDrawColor(...colorBorder);
      doc.setLineWidth(0.2);
      doc.line(M, yPos + 8, PW - M, yPos + 8);

      yPos += 8;
    });

    // Pied de page
    fillRect(0, PH - 18, PW, 18, ...colorNavy);
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce rapport est confidentiel et nominatif.', M, PH - 8);
    doc.text('Page 2 / 5', PW - M, PH - 8, { align: 'right' });

    // =============================
    // PAGE 3 — DÉTAIL PAR DOMAINE
    // =============================
    doc.addPage();

    fillRect(0, 0, PW, 20, ...colorNavy);
    leftText('NIS2Ready', M, 13, 11, 255, 255, 255, 'bold');
    leftText('— Détail par domaine', M + 22, 13, 11, ...colorGreen, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 220);
    doc.text(`Page 3 / 5  |  ${company.reportNumber}`, PW - M, 13, { align: 'right' });

    yPos = 36;
    leftText('Détail des évaluations par domaine (Article 21)', M, yPos, 14, ...colorNavy, 'bold');
    yPos += 4;
    hLine(yPos, ...colorBorder);
    yPos += 8;

    const labelMap = { oui: 'OUI', en_cours: 'EN COURS', non: 'NON' };
    const colorMap = {
      oui:      hexToRgb('#1D9E75'),
      en_cours: hexToRgb('#D69E2E'),
      non:      hexToRgb('#E53E3E')
    };

    NIS2_DOMAINS.forEach((domain) => {
      const ds   = window.NIS2State.domainScores[domain.id] || 0;
      const dMax = domain.questions.length * 2;
      const dPct = Math.round((ds / dMax) * 100);
      const dLvl = getScoreLevel(dPct);
      const dCol = hexToRgb(getLevelColor(dLvl));

      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > PH - 60) {
        // Pied de page avant saut
        fillRect(0, PH - 18, PW, 18, ...colorNavy);
        doc.setFontSize(8);
        doc.setTextColor(200, 210, 220);
        doc.setFont('helvetica', 'normal');
        doc.text('Page 3 / 5', PW - M, PH - 8, { align: 'right' });

        doc.addPage();
        // Ré-en-tête
        fillRect(0, 0, PW, 20, ...colorNavy);
        leftText('NIS2Ready', M, 13, 11, 255, 255, 255, 'bold');
        leftText('— Détail par domaine (suite)', M + 22, 13, 11, ...colorGreen, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 220);
        doc.text(`Page 3 / 5  |  ${company.reportNumber}`, PW - M, 13, { align: 'right' });
        yPos = 32;
      }

      // Titre du domaine avec barre colorée
      fillRect(M, yPos, 3, 9, ...dCol);
      doc.setFontSize(10);
      doc.setTextColor(...colorNavy);
      doc.setFont('helvetica', 'bold');
      doc.text(`${domain.id}. ${domain.title}`, M + 6, yPos + 6.5);

      // Score du domaine
      doc.setTextColor(...dCol);
      doc.setFont('helvetica', 'bold');
      doc.text(`${dPct}%  (${ds}/${dMax} pts)  — ${dLvl}`, PW - M, yPos + 6.5, { align: 'right' });
      yPos += 12;

      // Réponses aux questions
      domain.questions.forEach((q, qi) => {
        const key = `${domain.id}_${qi}`;
        const ans = window.NIS2State.answers[key] || 'non';
        const [ar, ag, ab] = colorMap[ans] || colorGray;
        const aLabel = labelMap[ans] || 'NON';

        doc.setFontSize(8.5);
        doc.setTextColor(...colorGray);
        doc.setFont('helvetica', 'normal');

        // Texte de la question (tronqué si trop long)
        const shortQ = q.length > 80 ? q.substring(0, 77) + '…' : q;
        doc.text(`• ${shortQ}`, M + 4, yPos);

        // Badge de réponse
        fillRect(PW - M - 22, yPos - 4, 22, 5.5, ar, ag, ab);
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(aLabel, PW - M - 11, yPos, { align: 'center' });

        yPos += 7;
      });

      yPos += 5;
      hLine(yPos - 2, ...colorBorder);
      yPos += 5;
    });

    // Pied de page 3
    fillRect(0, PH - 18, PW, 18, ...colorNavy);
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce rapport est confidentiel et nominatif.', M, PH - 8);
    doc.text('Page 3 / 5', PW - M, PH - 8, { align: 'right' });

    // =============================
    // PAGE 4 — PLAN D'ACTION PRIORITAIRE
    // =============================
    doc.addPage();

    fillRect(0, 0, PW, 20, ...colorNavy);
    leftText('NIS2Ready', M, 13, 11, 255, 255, 255, 'bold');
    leftText('— Plan d\'action', M + 22, 13, 11, ...colorGreen, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 220);
    doc.text(`Page 4 / 5  |  ${company.reportNumber}`, PW - M, 13, { align: 'right' });

    yPos = 36;
    leftText('Plan d\'action priorisé', M, yPos, 14, ...colorNavy, 'bold');
    yPos += 4;
    hLine(yPos, ...colorBorder);
    yPos += 10;

    // Actions urgentes (domaines < 40%)
    const urgentDomains = NIS2_DOMAINS.filter(d => {
      const s = window.NIS2State.domainScores[d.id] || 0;
      return Math.round((s / (d.questions.length * 2)) * 100) < 40;
    }).slice(0, 3);

    // Actions importantes (domaines 40-70%)
    const importantDomains = NIS2_DOMAINS.filter(d => {
      const s = window.NIS2State.domainScores[d.id] || 0;
      const pct = Math.round((s / (d.questions.length * 2)) * 100);
      return pct >= 40 && pct <= 70;
    }).slice(0, 3);

    function renderActionBlock(domains, label, r, g, b) {
      if (domains.length === 0) return;

      // Titre de section
      fillRect(M, yPos, CW, 9, r, g, b);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(label, M + 4, yPos + 6.5);
      yPos += 12;

      domains.forEach((d, idx) => {
        if (yPos > PH - 50) return; // Éviter le débordement

        // Numéro et titre
        doc.setFontSize(10);
        doc.setTextColor(r, g, b);
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}. ${d.title}`, M + 3, yPos);
        yPos += 6;

        // Description de l'action recommandée
        yPos = wrapText(d.actionDesc, M + 6, yPos, CW - 6, 9, ...colorGray, 'normal', 5);
        yPos += 6;

        // Ligne de séparation
        doc.setDrawColor(...hexToRgb('#E2E8F0'));
        doc.setLineWidth(0.2);
        doc.line(M + 3, yPos - 3, PW - M - 3, yPos - 3);
      });

      yPos += 4;
    }

    // Rendu des blocs d'action
    renderActionBlock(urgentDomains,   '🚨 ACTIONS URGENTES — Score < 40%',    229, 62, 62);
    renderActionBlock(importantDomains, '⚠️  ACTIONS IMPORTANTES — Score 40-70%', 214, 158, 46);

    if (urgentDomains.length === 0 && importantDomains.length === 0) {
      fillRect(M, yPos, CW, 20, ...hexToRgb('#E8F5F0'));
      doc.setDrawColor(...colorGreen);
      doc.setLineWidth(0.4);
      doc.rect(M, yPos, CW, 20);
      doc.setFontSize(11);
      doc.setTextColor(...colorGreen);
      doc.setFont('helvetica', 'bold');
      centeredText('🎉 Félicitations ! Aucune action urgente identifiée.', yPos + 13, 11, ...colorGreen, 'bold');
      yPos += 28;
    }

    // Encadré de génération du rapport
    yPos = Math.max(yPos, 230);
    fillRect(M, yPos, CW, 26, ...hexToRgb('#F0F4F8'));
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.3);
    doc.rect(M, yPos, CW, 26);
    doc.setFontSize(9.5);
    doc.setTextColor(...colorNavy);
    doc.setFont('helvetica', 'bold');
    centeredText('Récapitulatif d\'évaluation', yPos + 9, 9.5, ...colorNavy, 'bold');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorGray);
    centeredText(`Ce rapport a été généré le ${formatDate(company.evalDate)} via NIS2Ready`, yPos + 16, 8.5, ...colorGray, 'normal');
    centeredText(`Entreprise : ${company.name}  |  Responsable : ${company.responsibleName}  |  Score global : ${score}%`, yPos + 22, 8.5, ...colorGray, 'normal');

    // Pied de page 4
    fillRect(0, PH - 18, PW, 18, ...colorNavy);
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce rapport est confidentiel et nominatif.', M, PH - 8);
    doc.text('Page 4 / 5', PW - M, PH - 8, { align: 'right' });

    // =============================
    // PAGE 5 — MENTIONS LÉGALES
    // =============================
    doc.addPage();

    fillRect(0, 0, PW, 20, ...colorNavy);
    leftText('NIS2Ready', M, 13, 11, 255, 255, 255, 'bold');
    leftText('— Mentions légales', M + 22, 13, 11, ...colorGreen, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 220);
    doc.text(`Page 5 / 5  |  ${company.reportNumber}`, PW - M, 13, { align: 'right' });

    yPos = 38;
    leftText('Mentions légales et avertissement', M, yPos, 14, ...colorNavy, 'bold');
    yPos += 4;
    hLine(yPos, ...colorBorder);
    yPos += 14;

    const legalClauses = [
      {
        title: 'Nature du document',
        text: 'Ce rapport est généré sur la base d\'une auto-évaluation déclarative effectuée par un représentant habilité de l\'entreprise. Il constitue un document de travail interne destiné à guider la démarche de mise en conformité avec la directive NIS2.'
      },
      {
        title: 'Portée et limites',
        text: 'Ce rapport ne remplace pas un audit de conformité certifié réalisé par un prestataire qualifié (PASSI). NIS2Ready recommande vivement de faire valider les résultats par un expert en cybersécurité qualifié avant toute présentation formelle aux autorités de contrôle.'
      },
      {
        title: 'Base réglementaire',
        text: 'Ce rapport s\'appuie sur la Directive (UE) 2022/2555 du Parlement européen et du Conseil (NIS 2), publiée au Journal officiel de l\'Union européenne le 27 décembre 2022. Il intègre également les recommandations du guide de référence de l\'ANSSI (Référentiel de Cybersécurité et de Fiabilité — ReCyF, mars 2026).'
      },
      {
        title: 'Responsabilité',
        text: 'NIS2Ready décline toute responsabilité quant aux décisions prises sur la base de ce rapport. L\'exactitude des informations déclarées relève de la seule responsabilité du signataire de l\'évaluation. Toute représentation inexacte des données pourrait invalider les conclusions du rapport.'
      },
      {
        title: 'Confidentialité',
        text: 'Ce document est strictement confidentiel. Il est destiné exclusivement aux personnes désignées par l\'entreprise pour conduire sa démarche NIS2 et ne doit pas être diffusé à des tiers sans l\'accord préalable de la direction.'
      },
      {
        title: 'Contact et support',
        text: 'Pour tout accompagnement dans votre mise en conformité NIS2, consultez le site officiel de l\'ANSSI (cyber.gouv.fr) ou faites appel à un prestataire référencé sur le catalogue SecNumCloud.'
      }
    ];

    legalClauses.forEach(clause => {
      if (yPos > PH - 50) return;

      doc.setFontSize(10);
      doc.setTextColor(...colorNavy);
      doc.setFont('helvetica', 'bold');
      doc.text(clause.title, M, yPos);
      yPos += 6;

      yPos = wrapText(clause.text, M, yPos, CW, 9, ...colorGray, 'normal', 5.5);
      yPos += 10;
    });

    // Encadré final de certification
    yPos = PH - 60;
    fillRect(M, yPos, CW, 36, ...hexToRgb('#1A2B4A'));
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    centeredText('NIS2Ready', yPos + 11, 13, 255, 255, 255, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...hexToRgb('#A0C4B8'));
    doc.setFont('helvetica', 'normal');
    centeredText('La solution de conformité NIS2 pour les PME françaises', yPos + 18, 8.5, ...hexToRgb('#A0C4B8'), 'normal');
    centeredText(`Rapport n° ${company.reportNumber} — ${formatDate(company.evalDate)}`, yPos + 25, 8, ...hexToRgb('#718096'), 'normal');
    centeredText('Conforme à la Directive (UE) 2022/2555 — ANSSI ReCyF 2026', yPos + 31, 7.5, ...hexToRgb('#718096'), 'italic');

    // Pied de page 5
    fillRect(0, PH - 18, PW, 18, ...colorNavy);
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce rapport est confidentiel et nominatif.', M, PH - 8);
    doc.text('Page 5 / 5', PW - M, PH - 8, { align: 'right' });

    // =============================
    // TÉLÉCHARGEMENT DU PDF
    // =============================
    const fileName = `NIS2Ready_Rapport_${company.name.replace(/\s+/g, '_')}_${company.reportNumber}.pdf`;
    doc.save(fileName);

  } catch (err) {
    console.error('Erreur lors de la génération du PDF :', err);
    alert('Une erreur est survenue lors de la génération du PDF. Vérifiez que jsPDF est bien chargé (connexion internet requise).');
  } finally {
    hideLoader();
  }
}

// ==========================================================================
// UTILITAIRES
// ==========================================================================

/**
 * Formate une date ISO (YYYY-MM-DD) en format lisible français
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(isoDate + 'T12:00:00'); // Évite le décalage de timezone
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Promesse de délai (pour le ressenti pro du spinner)
 * @param {number} ms
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Affiche l'overlay de chargement avec un texte personnalisé
 * @param {string} text
 */
function showLoader(text = 'Chargement…') {
  const overlay = document.getElementById('loading-overlay');
  const textEl  = document.getElementById('loading-text');
  if (overlay) overlay.classList.remove('hidden');
  if (textEl)  textEl.textContent = text;
}

/**
 * Masque l'overlay de chargement
 */
function hideLoader() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ==========================================================================
// INITIALISATION — DOMContentLoaded
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- Auto-remplissage de la date du jour ---
  const dateInput = document.getElementById('eval-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('readonly', 'true');
  }

  // --- Rendu des domaines de l'étape 2 ---
  renderDomains();

  // --- Afficher l'étape 1 ---
  showStep(1);

  // =======================================================================
  // EVENT LISTENERS DE NAVIGATION
  // =======================================================================

  // Soumission du formulaire Étape 1 → Étape 2
  const form = document.getElementById('form-company');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateCompanyForm()) {
        collectCompanyData();
        showStep(2);
      }
    });
  }

  // Retour étape 2 → 1
  document.getElementById('btn-back-step1')?.addEventListener('click', () => showStep(1));

  // Étape 2 → Résultats (Étape 3)
  document.getElementById('btn-to-results')?.addEventListener('click', () => {
    renderResults();
    showStep(3);
  });

  // Retour étape 3 → 2
  document.getElementById('btn-back-step2')?.addEventListener('click', () => showStep(2));

  // Recommencer depuis zéro
  document.getElementById('btn-restart')?.addEventListener('click', () => {
    // Réinitialiser l'état
    window.NIS2State.answers = {};
    window.NIS2State.domainScores = {};
    window.NIS2State.globalScore = 0;

    // Vider les radios du formulaire
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('.domain-card').forEach(c => c.classList.remove('open'));

    // Réinitialiser les indicateurs de score
    updateAllScores();

    // Retour au formulaire
    showStep(1);
  });

  // Générer le rapport PDF
  document.getElementById('btn-generate-pdf')?.addEventListener('click', () => {
    generatePDF();
  });

  // Navigation via la barre des étapes (optionnel mais pratique pour debug)
  for (let i = 1; i <= 4; i++) {
    const navItem = document.getElementById(`step-nav-${i}`);
    if (navItem && i === 1) {
      navItem.style.cursor = 'pointer';
      navItem.addEventListener('click', () => {
        if (window.NIS2State.currentStep > 1) showStep(1);
      });
    }
  }

  // Nettoyage des erreurs de formulaire à la saisie
  ['company-name', 'sector', 'employees', 'revenue', 'responsible-name'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const errEl = document.getElementById(`err-${id}`);
      const el    = document.getElementById(id);
      if (errEl) errEl.textContent = '';
      if (el)    el.classList.remove('is-invalid');
    });
  });

});
