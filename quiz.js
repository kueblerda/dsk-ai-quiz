(function () {

  // ─── Apply DSK Brand Colors ─────────────────────────────────────────────────
  document.documentElement.style.setProperty('--color-primary', CONFIG.colorPrimary);
  document.documentElement.style.setProperty('--color-dark', CONFIG.colorDark);
  document.documentElement.style.setProperty('--color-secondary', CONFIG.colorSecondary);
  document.documentElement.style.setProperty('--color-depth', CONFIG.colorDepth);
  document.documentElement.style.setProperty('--color-background', CONFIG.colorBackground);
  document.documentElement.style.setProperty('--color-white', CONFIG.colorWhite);
  document.documentElement.style.setProperty('--color-muted', CONFIG.colorMuted);
  document.documentElement.style.setProperty('--color-accent', CONFIG.colorAccent);

  // ─── URL Params ─────────────────────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const fname = params.get('fname') || 'there';
  const email = params.get('email') || null;

  // ─── Questions ──────────────────────────────────────────────────────────────
  const QUESTIONS = [
    {
      id: 'q1',
      text: 'How long has your business been open?',
      options: [
        { label: 'Less than 12 months', score: 1 },
        { label: '1–3 years', score: 2 },
        { label: 'More than 3 years', score: 3 },
      ],
    },
    {
      id: 'q2',
      text: 'Do you have a written, step-by-step process for how a job moves from first contact to final invoice?',
      options: [
        { label: 'No — we figure it out as we go', score: 1 },
        { label: "It's in my head, but not written down", score: 2 },
        { label: "Yes — it's documented and my team follows it", score: 3 },
      ],
    },
    {
      id: 'q3',
      text: 'How many paid software tools or subscriptions does your business currently use? (scheduling, invoicing, CRM, communication, etc.)',
      options: [
        { label: 'None or just one', score: 1 },
        { label: 'Two or three', score: 2 },
        { label: 'Four or more', score: 3 },
      ],
    },
    {
      id: 'q4',
      text: 'When you use more than one tool, how does information get from one to the other?',
      options: [
        { label: 'We only use one tool', score: 1 },
        { label: 'We manually copy or re-enter data between them', score: 3 },
        { label: 'Most of our tools connect automatically', score: 1 },
      ],
    },
    {
      id: 'q5',
      text: "What happens when a potential customer contacts you after hours or while you're on a job?",
      options: [
        { label: 'We miss most of them and hope they call back', score: 3 },
        { label: 'We follow up manually the next morning', score: 2 },
        { label: 'We have a consistent process — every lead gets captured', score: 2 },
      ],
    },
    {
      id: 'q6',
      text: "How often does someone in your business say 'we need a better system for this'?",
      options: [
        { label: 'Rarely — things run pretty smoothly', score: 1 },
        { label: 'Occasionally — a few times a month', score: 2 },
        { label: "Multiple times a week — it's a constant problem", score: 3 },
      ],
    },
  ];

  const Q4_INDEX = 3;

  // ─── State ──────────────────────────────────────────────────────────────────
  const state = {
    view: 'intro',
    qIndex: 0,
    selected: null,
    skipQ4: false,
    answers: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null },
    painPoints: [],
    maturity: null,
    chaos: null,
    outcome: null,
  };

  const app = document.getElementById('app');

  // ─── Scoring ────────────────────────────────────────────────────────────────
  function computeScores(answers) {
    return {
      maturity: answers.q1 + answers.q2 + answers.q5,
      chaos: answers.q3 + answers.q4 + answers.q6,
    };
  }

  function computeOutcome(maturity, chaos) {
    const highMaturity = maturity >= 6;
    const highChaos = chaos >= 6;
    if (!highMaturity && !highChaos) return 1;
    if (!highMaturity && highChaos) return 2;
    if (highMaturity && !highChaos) return 3;
    return 4;
  }

  function computePainPoints(answers) {
    const pts = [];
    if (answers.q2 < 3) pts.push('no-documented-process');
    if (answers.q3 === 3) pts.push('tool-sprawl');
    if (answers.q4 === 3) pts.push('manual-data-entry');
    if (answers.q5 === 3) pts.push('missing-after-hours-leads');
    if (answers.q6 === 3) pts.push('constant-system-gaps');
    return pts;
  }

  function effectiveStepNumber(qIndex, skipQ4) {
    let count = 0;
    for (let i = 0; i <= qIndex; i++) {
      if (i === Q4_INDEX && skipQ4) continue;
      count++;
    }
    return count;
  }

  // ─── Webhook ────────────────────────────────────────────────────────────────
  function buildPayload(outcomeNum, maturity, chaos, painPoints, resourceAssistance) {
    return {
      firstName: fname,
      email: email,
      outcome: String(outcomeNum),
      outcomeLabel: OUTCOMES[outcomeNum].label,
      maturityScore: maturity,
      chaosScore: chaos,
      painPoints: painPoints,
      resourceAssistance: resourceAssistance,
      completedAt: new Date().toISOString(),
    };
  }

  async function fireWebhook(payload) {
    try {
      await fetch(CONFIG.ghlWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Never surface webhook errors to the user.
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function logoHeader() {
    return `<div class="logo-header"><img src="${CONFIG.logoUrl}" alt="${escapeHtml(CONFIG.businessName)}" /></div>`;
  }

  function logoFooter() {
    return `
      <div class="logo-footer">
        <img src="${CONFIG.logoUrl}" alt="${escapeHtml(CONFIG.businessName)}" />
        <div class="tagline">${escapeHtml(CONFIG.businessTagline)}</div>
      </div>
    `;
  }

  // ─── Render: Intro ──────────────────────────────────────────────────────────
  function renderIntro() {
    app.innerHTML = `
      ${logoHeader()}
      <div class="view">
        <div class="intro-wrap">
          <div class="intro-hero-icon">🤖</div>
          <h1>Hey ${escapeHtml(fname)}, let's find out where you actually stand with AI.</h1>
          <p>Answer 6 honest questions. Get a free, personalized assessment. No hype — just clarity.</p>
          <div class="intro-features">
            <div class="feature-chip">⏱️ 2 minutes</div>
            <div class="feature-chip">🎯 Personalized results</div>
            <div class="feature-chip">🙅 No sales pitch</div>
          </div>
          <button class="btn btn-primary" id="start-btn">Start the Assessment →</button>
        </div>
      </div>
      ${logoFooter()}
    `;

    document.getElementById('start-btn').addEventListener('click', () => {
      state.view = 'question';
      state.qIndex = 0;
      render();
    });
  }

  // ─── Render: Question ───────────────────────────────────────────────────────
  function renderQuestion() {
    const q = QUESTIONS[state.qIndex];
    const total = state.skipQ4 ? 5 : 6;
    const stepNum = effectiveStepNumber(state.qIndex, state.skipQ4);
    const pct = Math.round((stepNum / total) * 100);

    const optionsHtml = q.options.map((opt, i) => `
      <button class="answer-btn${state.selected === i ? ' selected' : ''}" data-index="${i}">
        <span>${opt.label}</span>
        <span class="check">✓</span>
      </button>
    `).join('');

    app.innerHTML = `
      ${logoHeader()}
      <div class="view">
        <div class="progress-label">Question ${stepNum} of ${total}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <h2 class="question-text">${q.text}</h2>
        <div class="answers">${optionsHtml}</div>
        <div class="question-actions">
          <button class="btn btn-primary" id="next-btn" ${state.selected === null ? 'disabled' : ''}>Next →</button>
        </div>
      </div>
    `;

    app.querySelectorAll('.answer-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selected = parseInt(btn.dataset.index, 10);
        renderQuestion();
      });
    });

    document.getElementById('next-btn').addEventListener('click', onNext);
  }

  function onNext() {
    if (state.selected === null) return;

    const q = QUESTIONS[state.qIndex];
    const opt = q.options[state.selected];
    state.answers[q.id] = opt.score;

    if (q.id === 'q3' && state.selected === 0) {
      state.skipQ4 = true;
      state.answers.q4 = 1;
    }

    state.selected = null;

    let nextIndex = state.qIndex + 1;
    if (nextIndex === Q4_INDEX && state.skipQ4) {
      nextIndex += 1;
    }

    if (nextIndex >= QUESTIONS.length) {
      goToProcessing();
    } else {
      state.qIndex = nextIndex;
      render();
    }
  }

  // ─── Render: Processing ─────────────────────────────────────────────────────
  function goToProcessing() {
    state.view = 'processing';

    const { maturity, chaos } = computeScores(state.answers);
    state.maturity = maturity;
    state.chaos = chaos;
    state.outcome = computeOutcome(maturity, chaos);
    state.painPoints = computePainPoints(state.answers);

    render();

    setTimeout(() => {
      if (state.outcome !== 1) {
        const payload = buildPayload(state.outcome, maturity, chaos, state.painPoints, null);
        fireWebhook(payload);
      }
      state.view = 'results';
      render();
    }, 1500);
  }

  function renderProcessing() {
    app.innerHTML = `
      ${logoHeader()}
      <div class="view">
        <div class="processing-wrap">
          <div class="spinner"></div>
          <p>Analyzing your results...</p>
        </div>
      </div>
    `;
  }

  // ─── Render: Results ────────────────────────────────────────────────────────
  function renderResults() {
    const outcome = OUTCOMES[state.outcome];

    const needsHtml = (outcome.needsList && outcome.needsList.length)
      ? `<ul class="needs-list">${outcome.needsList.map((n) => `<li>${n}</li>`).join('')}</ul>`
      : '';

    const calloutKeys = Object.keys(outcome.painCallouts || {}).filter((k) => state.painPoints.includes(k));
    const calloutsHtml = calloutKeys.length
      ? `<div class="pain-callouts">${calloutKeys.map((k) => `<div class="pain-callout">${outcome.painCallouts[k]}</div>`).join('')}</div>`
      : '';

    let ctaHtml;
    if (outcome.ctaType === 'choice') {
      ctaHtml = `
        <div class="choice-wrap" id="choice-wrap">
          <p class="choice-prompt">${outcome.choicePrompt}</p>
          <div class="choice-buttons">
            <button class="btn btn-primary" id="choice-yes">${outcome.choiceYesLabel}</button>
            <button class="btn btn-secondary" id="choice-no">${outcome.choiceNoLabel}</button>
          </div>
        </div>
      `;
    } else {
      ctaHtml = `
        <p class="cta-blurb">${outcome.ctaBlurb}</p>
        <div class="cta-wrap">
          <a class="btn btn-primary" href="${outcome.ctaUrl}" target="_blank" rel="noopener">${outcome.ctaLabel}</a>
        </div>
        <div class="secondary-wrap" id="secondary-wrap">
          <button class="btn-link" id="secondary-btn">${outcome.secondaryLabel}</button>
        </div>
      `;
    }

    app.innerHTML = `
      ${logoHeader()}
      <div class="view">
        <div class="outcome-badge">Result ${state.outcome} of 4</div>
        <p class="results-lead">${escapeHtml(fname)}, here's what your results say:</p>
        <h2 class="results-headline">${outcome.headline}</h2>
        <p class="diagnosis">${outcome.diagnosis}</p>
        ${needsHtml}
        ${calloutsHtml}
        ${ctaHtml}
      </div>
      ${logoFooter()}
    `;

    if (outcome.ctaType === 'choice') {
      document.getElementById('choice-yes').addEventListener('click', () => onChoice(true));
      document.getElementById('choice-no').addEventListener('click', () => onChoice(false));
    } else {
      document.getElementById('secondary-btn').addEventListener('click', onSecondaryDismiss);
    }
  }

  function onChoice(resourceAssistance) {
    const payload = buildPayload(1, state.maturity, state.chaos, state.painPoints, resourceAssistance);
    fireWebhook(payload);

    const outcome = OUTCOMES[1];
    const msg = resourceAssistance ? outcome.choiceYesConfirm : outcome.choiceNoConfirm;
    document.getElementById('choice-wrap').innerHTML = `<p class="confirmation-msg">${msg}</p>`;
  }

  function onSecondaryDismiss() {
    const outcome = OUTCOMES[state.outcome];
    document.getElementById('secondary-wrap').innerHTML = `<p class="confirmation-msg">${outcome.secondaryConfirm}</p>`;
  }

  // ─── Main Render Dispatcher ─────────────────────────────────────────────────
  function render() {
    switch (state.view) {
      case 'intro': renderIntro(); break;
      case 'question': renderQuestion(); break;
      case 'processing': renderProcessing(); break;
      case 'results': renderResults(); break;
    }
  }

  render();

})();
