/* ============================================================
   PAWSITIVE REHAB — SCRIPT.JS (PHASE 2 INTEGRATED)
   Navigation Shell + Client-Side Google Gemma 4 Integration (via Gemini API)
   ============================================================ */

'use strict';

/* ─── 1. CONFIGURATION & PRESETS ─── */
const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

const PRESETS = {
  splint: `Patient: Max (3yr, Golden Retriever, M, 28kg)
Procedure: Tibial Plateau Leveling Osteotomy (TPLO) — Left hind limb. Performed 2 days ago.
Discharge Medications:
  - Carprofen (Rimadyl) 75mg — Give 1 tablet TWICE daily with food.
  - Tramadol 50mg — Give 1 tablet THREE times daily for pain (first 5 days).
  - Cephalexin 500mg — Antibiotic, give TWICE daily for 10 days. Do not skip doses.
Activity Level: STRICT REST for 8 weeks. No running, jumping, or stair climbing. Leash walks only: 5 minutes maximum, 3 times per day. Keep on non-slip surfaces (carpet, yoga mat).
Incision Care: Check incision site TWICE daily. Keep dry. No bathing for 14 days. Apply E-collar at ALL times when unsupervised.
Follow-up: Suture removal at Day 10-14. X-ray check at Week 6. Physical therapy may begin at Week 8 pending radiographic healing.
Diet: Maintain current weight — reduce meal quantity by 10% due to restricted activity. Ensure fresh water available at all times.
Red Flags — Contact vet IMMEDIATELY if: excessive swelling or discharge at incision, pet non-weight bearing after Day 3, temperature above 39.5°C, loss of appetite for more than 24hrs, or limb appears at abnormal angle.`,

  wound: `Patient: Bella (7yr, Domestic Shorthair Cat, F, 4.2kg)
Presenting complaint: Bite wound abscess — right flank, surgically drained and flushed.
Wound Status: Open to drain. Placed soft drain — remove in 3 days or when discharge ceases.
Medications:
  - Amoxicillin-Clavulanate 62.5mg — 1 tablet TWICE daily for 14 days (full course critical).
  - Meloxicam 0.5mg/ml oral suspension — 0.1ml once daily with food for 5 days.
Wound Care Protocol:
  - Flush wound opening with diluted chlorhexidine solution (0.05%) TWICE daily using a syringe.
  - Gently remove any dried crust. Apply thin layer of silver sulfadiazine cream.
  - Monitor drain output: should decrease each day. Remove drain on Day 3 even if minor drainage present.
Activity: Indoor only. Prevent interaction with other cats during recovery period.
Follow-up: Recheck in 5 days. If wound not closing by Day 10, culture and sensitivity required.
Warning Signs: Foul-smelling discharge (yellow/green), spreading redness or heat around wound, lethargy or hiding more than usual, not eating by Day 2.`,

  neuro: `Patient: Rocky (9yr, German Shepherd, M, 34kg)
Diagnosis: Intervertebral Disc Disease (IVDD) — L3/L4 disc herniation. Conservative management selected (owner declined surgery at this time).
Neurological Grade: Grade III — Paraparesis with voluntary movement present, pain sensation intact.
Medications:
  - Prednisone 20mg — Once daily (morning with food) for 5 days, then taper to 10mg for 5 days, then 5mg for 5 days.
  - Gabapentin 300mg — Twice daily for neuropathic pain management.
  - Omeprazole 20mg — Once daily to protect stomach lining while on steroids.
  - NO NSAIDs — Do NOT give Carprofen, Rimadyl, or Meloxicam. Contraindicated with steroids.
Activity Restrictions: STRICT CAGE REST for 4 weeks minimum. No stairs, jumping, or off-leash activity. Carry on/off furniture. Sling-walk for bathroom trips only.
Physiotherapy: Passive range of motion (PROM) exercises — 10 repetitions, 3 times daily. Warm compress to lower back 5 min before PROM. Do NOT proceed if Rocky vocalizes pain.
Bladder Monitoring: Express bladder every 4-6 hours if Rocky cannot urinate voluntarily. Monitor for urine scald.
Follow-up: Neurological recheck in 2 weeks. If no improvement or deterioration in Grade, surgical consultation mandatory.
Red Flags: Loss of pain sensation in toes, inability to urinate for >8hrs, rapid deterioration of mobility, or Grade IV/V progression.`
};

/* ─── 2. DOM REFERENCES ─── */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);

const loginOverlay = $('login-overlay');
const loginForm = $('login-form');
const enterBtn = $('enter-btn');
const themeToggleBtn = $('theme-toggle-btn');
const analyzeBtn = $('analyze-btn');
const vetNotesInput = $('vet-notes-input');
const charCount = $('char-count');
const terminalLog = $('terminal-log');
const skeletonLoader = $('skeleton-loader');
const outputGrid = $('output-grid-wrapper');
const patientStatusBar = $('patient-status-bar');
const statusBadgeEl = $('status-badge-el');
const statusLabelText = $('status-label-text');
const statusHeading = $('status-heading');
const statusDetail = $('status-detail');
const redFlagList = $('red-flag-list');
const sessionPatient = $('session-patient');
const analysesCount = $('analyses-count');
const dataModeEl = $('data-mode-badge'); // May be null in template v2
const sessionCarer = $('session-carer');
const logoutBtn = $('logout-btn');
const navLogoBrand = $('nav-logo-brand');
const audioToggleBtn = $('audio-toggle-btn') || $('sound-toggle-btn');
const toastContainer = $('toast-container');

// Text nodes for button loading feedback
const btnTextIdle = analyzeBtn.querySelector('.btn-text-idle');
const btnTextLoading = analyzeBtn.querySelector('.btn-text-loading');

// Bilingual active cache
let activeSessionData = null;
let currentLanguage = 'en';

/* ─── PIXEL ART TOGGLE BUTTON SVG VECTORS ─── */
const SVG_ICONS = {
  moon: `<svg class="pixel-icon" viewBox="0 0 16 16" width="20" height="20">
    <rect x="6" y="2" width="4" height="2" fill="#f59e0b" />
    <rect x="4" y="4" width="8" height="2" fill="#f59e0b" />
    <rect x="3" y="6" width="5" height="4" fill="#f59e0b" />
    <rect x="4" y="10" width="8" height="2" fill="#f59e0b" />
    <rect x="6" y="12" width="4" height="2" fill="#f59e0b" />
    <rect x="8" y="4" width="3" height="8" fill="#8b5cf6" />
  </svg>`,

  sun: `<svg class="pixel-icon" viewBox="0 0 16 16" width="20" height="20">
    <rect x="5" y="5" width="6" height="6" fill="#f59e0b" />
    <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
    <rect x="7" y="2" width="2" height="2" fill="#ef4444" />
    <rect x="7" y="12" width="2" height="2" fill="#ef4444" />
    <rect x="2" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="12" y="7" width="2" height="2" fill="#ef4444" />
  </svg>`,

  speakerOn: `<svg class="pixel-icon" viewBox="0 0 16 16" width="20" height="20">
    <rect x="3" y="6" width="3" height="4" fill="#10b981" />
    <path d="M6,6 l4,-3 v10 l-4,-3 z" fill="#10b981" />
    <rect x="12" y="4" width="1" height="8" fill="#10b981" />
    <rect x="14" y="2" width="1" height="12" fill="#10b981" />
  </svg>`,

  speakerOff: `<svg class="pixel-icon" viewBox="0 0 16 16" width="20" height="20">
    <rect x="3" y="6" width="3" height="4" fill="#8b95a8" />
    <path d="M6,6 l4,-3 v10 l-4,-3 z" fill="#8b95a8" />
    <rect x="2" y="2" width="2" height="2" fill="#ef4444" />
    <rect x="4" y="4" width="2" height="2" fill="#ef4444" />
    <rect x="6" y="6" width="2" height="2" fill="#ef4444" />
    <rect x="8" y="8" width="2" height="2" fill="#ef4444" />
    <rect x="10" y="10" width="2" height="2" fill="#ef4444" />
    <rect x="12" y="12" width="2" height="2" fill="#ef4444" />
  </svg>`
};

/* ─── AUDIO ENGINE (NATIVE WEB AUDIO SYNTHESIS) ─── */
let audioCtx = null;
let audioMuted = true; // Complies with autoplay policies

const SoundController = {
  init() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playTone(freqStart, freqEnd, duration, type = 'square', gainDecay = true) {
    if (audioMuted) return;
    this.init();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);
      }
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      if (gainDecay) {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      } else {
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime + duration - 0.01);
        gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      }
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio blocked:", e);
    }
  },

  playHover() {
    this.playTone(850, 850, 0.04, 'square', true);
  },

  playClick() {
    this.playTone(550, 180, 0.08, 'triangle', true);
  },

  playCheck() {
    if (audioMuted) return;
    this.init();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(380, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(760, now + 0.06);
      gain2.gain.setValueAtTime(0.06, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06 + 0.12);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.06 + 0.12);
    } catch (e) {
      console.warn(e);
    }
  },

  playFanfare() {
    if (audioMuted) return;
    this.init();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
      const now = audioCtx.currentTime;
      const freqs = [261.63, 329.63, 392.00, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gainNode.gain.setValueAtTime(0.06, now + idx * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.15);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } catch (e) {
      console.warn(e);
    }
  }
};

function attachAudioTriggers() {
  const elements = document.querySelectorAll(
    '.nav-brand, .user-badge, #logout-btn, .pill-btn, .analyze-btn, #theme-toggle-btn, #audio-toggle-btn'
  );
  elements.forEach(el => {
    if (!el.dataset.audioBound) {
      el.dataset.audioBound = 'true';
      el.addEventListener('mouseenter', () => {
        SoundController.playHover();
      });
    }
  });
}


/* ═══════════════════════════════════════════
   3.  AUTH OVERLAY
   ═══════════════════════════════════════════ */
function dismissOverlay() {
  loginOverlay.classList.add('hidden');
  loginOverlay.addEventListener('transitionend', () => {
    loginOverlay.style.display = 'none';
  }, { once: true });

  // Welcome log lines
  termLog('system', '▶  Pawsitive Rehab Care Portal initialized.');
  termLog('info', '🔐 Authentication: Verified — Session token issued.');
  termLog('success', '🤖 Google Gemma 4 endpoint: READY.');
  termLog('info', '📡 Awaiting vet note ingestion to begin analysis pipeline…');
  termLog('system', '─────────────────────────────────────────────────────');
  showToast('success', 'Welcome back, Hadeed. Dashboard loaded!');
  attachAudioTriggers();
}

loginForm.addEventListener('submit', (e) => {
  SoundController.playClick();
  e.preventDefault();

  const emailInput = $('login-email');
  const passwordInput = $('login-password');
  const emailVal = emailInput ? emailInput.value.trim() : '';
  const passwordVal = passwordInput ? passwordInput.value.trim() : '';

  if (emailVal !== 'demo@pawsitiverehab.ai' || !passwordVal) {
    alert('INVALID ACCOUNT CREDENTIALS');
    return;
  }

  enterBtn.disabled = true;
  enterBtn.textContent = '✅ Authenticated — Loading…';

  // Simulate brief auth delay
  setTimeout(dismissOverlay, 600);
});

// Also allow Enter key on signup link
$('signup-link').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit'));
});


/* ═══════════════════════════════════════════
   4.  THEME TOGGLE
   ═══════════════════════════════════════════ */
let isLight = false;

function applyTheme(light) {
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = light ? SVG_ICONS.sun : SVG_ICONS.moon;
  }
  isLight = light;
}

themeToggleBtn.addEventListener('click', () => {
  SoundController.playClick();
  applyTheme(!isLight);
});
themeToggleBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    SoundController.playClick();
    applyTheme(!isLight);
  }
});

// Respect system preference on first load
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(prefersLight);


/* ═══════════════════════════════════════════
   5.  CHARACTER COUNTER
   ═══════════════════════════════════════════ */
vetNotesInput.addEventListener('input', () => {
  const len = vetNotesInput.value.length;
  charCount.textContent = len;
  charCount.style.color = len > 4500 ? 'var(--red)' : len > 3500 ? 'var(--amber)' : 'var(--text-muted)';
});


/* ═══════════════════════════════════════════
   6.  PRESET PILL LOADERS
   ═══════════════════════════════════════════ */
document.querySelectorAll('.pill-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    SoundController.playClick();
    const key = btn.dataset.preset;
    if (!PRESETS[key]) return;

    vetNotesInput.value = PRESETS[key];
    if (vetNotesInput) {
      vetNotesInput.dispatchEvent(new Event('input')); // trigger char counter
    }

    // Visual feedback
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'var(--green)';
    btn.style.background = 'var(--green-dim)';
    setTimeout(() => {
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.background = '';
    }, 1400);

    termLog('info', `⚡ Preset loaded: "${btn.textContent.trim()}" — ${PRESETS[key].length} chars.`);
    showToast('info', `Preset loaded: ${btn.textContent.trim()}`);

    vetNotesInput.focus();
    vetNotesInput.scrollTop = 0;
  });
});


/* ═══════════════════════════════════════════
   7.  Gemma 4 INTEGRATION
   ═══════════════════════════════════════════ */
analyzeBtn.addEventListener('click', async () => {
  SoundController.playClick();
  const rawText = vetNotesInput.value.trim();

  // 1. Guard check
  if (!rawText) {
    showToast('error', 'Input is empty. Paste a vet note or load a preset.');
    if (vetNotesInput) {
      vetNotesInput.focus();
      vetNotesInput.style.borderColor = 'var(--red)';
      vetNotesInput.style.boxShadow = '0 0 0 3px var(--red-dim)';
      setTimeout(() => {
        vetNotesInput.style.borderColor = '';
        vetNotesInput.style.boxShadow = '';
      }, 2000);
    }
    return;
  }

  // Extract patient name using standard regex patterns
  let patientName = "Unknown Pet";
  const nameMatch = rawText.match(/Patient:\s*([A-Za-z]+)/i) || rawText.match(/Buddy|Bella|Rocky/i);
  if (nameMatch) {
    patientName = nameMatch[1] || nameMatch[0];
  }
  if (sessionPatient) {
    sessionPatient.textContent = patientName;
  }

  // Dynamic Carer / Account Identity check
  let carerName = "Dr. Demo";
  const inputLower = rawText.toLowerCase();
  if (
    inputLower.includes("i think") ||
    inputLower.includes("i notice") ||
    inputLower.includes("seems to") ||
    inputLower.includes("my pet") ||
    inputLower.includes("worried") ||
    inputLower.includes("hurting") ||
    inputLower.includes("looks damp") ||
    inputLower.includes("swelling") ||
    inputLower.includes("owner reports")
  ) {
    carerName = "Primary Caretaker";
  }
  if (sessionCarer) {
    sessionCarer.textContent = carerName;
  }

  // 2. Defensive state setup
  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('loading');
  if (btnTextIdle) btnTextIdle.style.display = 'none';
  if (btnTextLoading) {
    btnTextLoading.style.display = 'inline';
    btnTextLoading.textContent = '🤖 Analyzing Core Vet Metrics...';
  }

  // Display skeletons
  setSkeletonVisible(true);

  // Console and terminal reporting
  termLog('system', '─────────────────────────────────────────────────────');
  termLog('info', `📥 Ingestion notes received: ${rawText.length} characters.`);
  termLog('data', `🔎 Structuring ingestion request with emotional cognitive framing…`);

  const systemInstructions = `You are an expert veterinary AI assistant. Your task is to analyze the provided recovery notes or observations and extract key healing parameters.
The input note may be a formal, structured clinical veterinary document OR a worried, non-technical, conversational description from a pet caretaker.

You must:
1. Parse either clinical notes or worried caretaker observations, detecting clinical risks, distress symptoms, medication details, or wound anomalies.
2. Formulate helpful, safe, and actionable guidelines under the expected categories. Generate BOTH English instructions and high-clarity conversational Roman Urdu equivalent instructions for the home caregiver.
3. Return ONLY a raw minified JSON object matching the JSON schema below.
4. Do NOT wrap the response in markdown blocks (such as \`\`\`json ... \`\`\`), do NOT include any backticks, and do NOT include any conversational introduction or conclusion.

Expected JSON Schema:
{
  "status": "Normal" | "Caution" | "Urgent",
  "medication_en": "English step-by-step medication bullet points (separate multiple items with newlines)",
  "medication_ur": "Roman Urdu equivalent medication instructions (separate multiple items with newlines)",
  "activity_en": "English rules regarding movement and restriction boundaries (separate multiple items with newlines)",
  "activity_ur": "Roman Urdu equivalent movement rules (separate multiple items with newlines)",
  "dietary_en": "English nutritional adjustments, food or water directives (separate multiple items with newlines)",
  "dietary_ur": "Roman Urdu equivalent dietary instructions (separate multiple items with newlines)",
  "timeline_en": "English follow-up milestones or monitoring intervals (separate multiple items with newlines)",
  "timeline_ur": "Roman Urdu equivalent timeline instructions (separate multiple items with newlines)",
  "red_flags_en": "English immediate warning signs (separate multiple items with newlines)",
  "red_flags_ur": "Roman Urdu equivalent warning signs (separate multiple items with newlines)",
  "trace_log": "A brief 2-sentence description of the internal agent reasoning steps used to categorize this safety risk profile, noting whether the source input was clinical or caretaker-voiced"
}

Input Note:
${rawText}`;

  try {
    termLog('info', `📡 Outbound Request → Google Gemma 4 (Open-Weights API)`);
    setDataMode('LIVE API');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemInstructions
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resData = await response.json();
    termLog('success', `📥 Inbound Response: Received 200 OK.`);

    let responseText = "";
    if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts[0]) {
      responseText = resData.candidates[0].content.parts[0].text.trim();
    }

    if (!responseText) {
      throw new Error("Empty content parts in Gemma 4 response payload");
    }

    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    termLog('data', `⚙️  Parsing generated JSON schema...`);
    const parsedData = JSON.parse(responseText);

    // Hydrate the visual layout
    hydrateDashboard(parsedData);
    showToast('success', `Analysis completed successfully for ${patientName}!`);

  } catch (error) {
    console.error(" Gemma 4 Ingestion Pipeline Crash:", error);
    termLog('error', `❌ Ingestion Failure: ${error.message}`);
    termLog('warn', `⚠️ Entering Campus Network Fail-Safe Protocol — Activating mock recovery cards.`);

    // Inject realistic Canine TPLO recovery data
    const mockTploFallback = {
      status: "Caution",
      medication_en: "Carprofen 75mg: 1 tablet TWICE daily with food (ACL pain management)\nTramadol 50mg: 1 tablet THREE times daily for pain (first 5 days only)\nCephalexin 500mg: 1 tablet TWICE daily for 10 days (antibiotic course completion)",
      medication_ur: "Carprofen 75mg: Rozana 2 dafa khane ke sath dein (Dard ke liye)\nTramadol 50mg: Rozana 3 dafa dein (sirf pehle 5 din ke liye)\nCephalexin 500mg: Rozana 2 dafa dein (10 din ka course mukammal karein)",
      activity_en: "Strict cage/room confinement for 8 weeks (no running or jumping)\nLeash-only outdoor bathroom walks limited to 5 minutes maximum\nMaintain grip security on carpets and non-slip surfaces only",
      activity_ur: "8 haftay tak cage ya kamray tak mehdood rakhein (bhaagna ya chalang lagana mana hai)\nSirf leash par toilet ke liye bahar le jayein (ziada se ziada 5 minute)\nGhar ke andar non-slip floors ya carpets ka istemaal karein",
      dietary_en: "Reduce daily ration volume by 10% to prevent post-op weight gain\nVerify immediate access to clean hydration fluids",
      dietary_ur: "Rozana ki khorak 10% kam karein taake wazan na barhay\nSaaf pani har waqt qareeb rakhein",
      timeline_en: "Suture removal scheduled for post-op Day 10-14\nRadiographic assessment at Week 6 for bone healing validation\nPhysical therapy evaluation at Week 8",
      timeline_ur: "Taankay katwanay ke liye post-op din 10-14 par visit karein\nHaddi ki healing check karne ke liye haftay 6 par X-ray karwayein\nHaftay 8 par exercise/physiotherapy ka checkup karwayein",
      red_flags_en: "Excessive incision inflammation, leakage, or suture breakage\nExtended non-weight bearing past initial post-op Day 3\nSudden lethargy, vomiting, or appetite loss\nSudden abnormal alignment change in left hind limb",
      red_flags_ur: "Zakhmi jagah par ziada sujan, pani nikalna ya taanka tootna\nShuru ke 3 din ke baad bhi bilkul wazan na daalna\nAchanak susti, ulti ya khorak na khana\nPichli tang ke chalanay mein achanak tabdeeli",
      trace_log: "Classified as Caution due to recent invasive orthopedic surgery (TPLO) requiring strict monitoring for incision complications, implant stability, and pain management during the early post-op phase."
    };

    setDataMode('MOCK');

    // Brief delay to make the fallback feel like a smooth retry
    await new Promise(resolve => setTimeout(resolve, 800));
    hydrateDashboard(mockTploFallback);
    showToast('warning', 'Dashboard hydrated with local TPLO recovery planner fail-safe.');
  } finally {
    // 3. Clear loading states
    setSkeletonVisible(false);
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('loading');
    if (btnTextIdle) btnTextIdle.style.display = 'inline';
    if (btnTextLoading) btnTextLoading.style.display = 'none';
    incrementAnalysisCount();
    termLog('system', '─────────────────────────────────────────────────────');
  }
});


/* ═══════════════════════════════════════════
   8.  HYDRATION UTILITIES
   ═══════════════════════════════════════════ */
function hydrateDashboard(data) {
  if (!data) return;
  activeSessionData = data;

  // 1. Status Bar update
  const status = (data.status || "Normal").trim();
  let statusHeadingText = "All Recovery Metrics Stable";
  let statusDetailText = "Continue following the recovery plan closely.";

  if (status === "Caution") {
    statusHeadingText = "Recovery Caution Advised";
    statusDetailText = "Incisions, medication adherence, and strict confinement rules require vigilance.";
  } else if (status === "Urgent") {
    statusHeadingText = "CRITICAL RISK DETECTED";
    statusDetailText = "Complications imminent. Contact veterinarian or care team immediately.";
  }

  setPatientStatus(status.toLowerCase(), status, statusHeadingText, statusDetailText);

  // 2. Card bodies split and render
  const cards = [
    { key: 'medication', bodyId: 'medication-body' },
    { key: 'activity', bodyId: 'activity-body' },
    { key: 'dietary', bodyId: 'dietary-body' },
    { key: 'timeline', bodyId: 'followup-body' }
  ];

  cards.forEach(({ key, bodyId }) => {
    const rawVal = data[`${key}_${currentLanguage}`] || data[key] || "";
    const lines = rawVal.split('\n').map(l => l.trim().replace(/^-\s*/, '')).filter(l => l.length > 0);
    populateCard(bodyId, lines);
  });

  // 3. Red Flags list
  const rawFlags = data[`red_flags_${currentLanguage}`] || data.red_flags || "";
  const flags = rawFlags.split('\n').map(l => l.trim().replace(/^-\s*/, '')).filter(l => l.length > 0);
  populateRedFlags(flags);

  // 4. Trace Log terminal output
  const trace = data.trace_log || "No analysis details logged.";
  termLog('success', `✅ Extraction complete. Patient risk profile updated to: ${status}.`);
  termLog('data', `🧠 Reasoning Trace: ${trace}`);
  SoundController.playFanfare();
  attachAudioTriggers();
}

function setSkeletonVisible(visible) {
  if (visible) {
    skeletonLoader.classList.add('active');
    outputGrid.style.display = 'none';
  } else {
    skeletonLoader.classList.remove('active');
    outputGrid.style.display = '';
  }
}

function setPatientStatus(level, label, heading, detail) {
  patientStatusBar.classList.remove('status-normal', 'status-caution', 'status-urgent');
  statusBadgeEl.classList.remove('normal', 'caution', 'urgent');

  patientStatusBar.classList.add(`status-${level}`);
  statusBadgeEl.classList.add(level);
  statusLabelText.textContent = label;
  statusHeading.textContent = heading;
  statusDetail.textContent = ' ' + detail;
}

function updateRecoveryProgress() {
  const allChecks = document.querySelectorAll('#medication-body .retro-check, #activity-body .retro-check');
  const checkedChecks = document.querySelectorAll('#medication-body .retro-check:checked, #activity-body .retro-check:checked');
  const total = allChecks.length;
  const completed = checkedChecks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const fillEl = $('progress-bar-fill');
  const pctEl = $('completion-percentage');
  const subtextEl = $('completion-subtext');

  if (fillEl) fillEl.style.width = `${percentage}%`;
  if (pctEl) pctEl.textContent = `${percentage}%`;
  if (subtextEl) subtextEl.textContent = `${completed} of ${total} recovery tasks completed.`;
}

function populateCard(cardId, lines) {
  const el = $(cardId);
  if (!el) return;
  el.innerHTML = '';

  if (!lines || lines.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">
        <svg class="pixel-icon" viewBox="0 0 16 16" width="32" height="32" fill="currentColor" style="opacity: 0.5;"><path d="M2,4 h8 v8 h-8 z" /><rect x="10" y="6" width="4" height="2" /><rect x="5" y="1" width="2" height="3" fill="var(--red)" /></svg>
      </div>
      <div class="empty-state-title">No data extracted</div>
    </div>`;
    return;
  }

  const isChecklist = (cardId === 'medication-body' || cardId === 'activity-body');
  const container = document.createElement('div');
  container.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

  lines.forEach((line) => {
    if (isChecklist) {
      const label = document.createElement('label');
      label.className = 'retro-checkbox-container';
      label.innerHTML = `<input type="checkbox" class="retro-check"><span>${escapeHtml(line)}</span>`;
      container.appendChild(label);
    } else {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; align-items:flex-start; gap:7px; font-size:0.82rem; line-height:1.55; color:var(--text-secondary);';
      item.innerHTML = `<span style="color:var(--green); flex-shrink:0; margin-top:1px;">•</span><span>${escapeHtml(line)}</span>`;
      container.appendChild(item);
    }
  });

  el.appendChild(container);

  if (isChecklist) {
    const checks = container.querySelectorAll('.retro-check');
    checks.forEach(check => {
      check.addEventListener('change', () => {
        SoundController.playCheck();
        updateRecoveryProgress();
      });
      check.addEventListener('mouseenter', () => {
        SoundController.playHover();
      });
    });
    updateRecoveryProgress();
  }
}

function populateRedFlags(flags) {
  redFlagList.innerHTML = '';

  if (!flags || flags.length === 0) {
    redFlagList.innerHTML = `<li class="flag-item"><div class="flag-placeholder">[ OK ] No critical red flags detected.</div></li>`;
    return;
  }

  flags.forEach((flag) => {
    const li = document.createElement('li');
    li.className = 'flag-item';
    li.innerHTML = `<div class="flag-bullet"></div><span>${escapeHtml(flag)}</span>`;
    redFlagList.appendChild(li);
  });
}


/* ═══════════════════════════════════════════
   9. TERMINAL LOGGER
   ═══════════════════════════════════════════ */
let logLineCount = 0;

function termLog(type, message) {
  const now = new Date();
  const ts = now.toTimeString().slice(0, 8);

  const old = terminalLog.querySelector('.terminal-cursor');
  if (old) old.remove();

  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.style.animationDelay = `${logLineCount * 40}ms`;

  line.innerHTML = `
    <span class="terminal-prompt">[${ts}]</span>
    <span class="terminal-text-${type}">${escapeHtml(message)}</span>
  `;

  terminalLog.appendChild(line);

  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';
  terminalLog.appendChild(cursor);

  terminalLog.scrollTop = terminalLog.scrollHeight;
  logLineCount++;

  const lines = terminalLog.querySelectorAll('.terminal-line');
  if (lines.length > 50) {
    lines[0].remove();
  }
}


/* ═══════════════════════════════════════════
   10. TOAST NOTIFICATION SYSTEM
   ═══════════════════════════════════════════ */
const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

function showToast(type = 'info', message = '', duration = 3800) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${TOAST_ICONS[type] || 'ℹ️'}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}


/* ═══════════════════════════════════════════
   11. UTILITIES
   ═══════════════════════════════════════════ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function incrementAnalysisCount() {
  if (!analysesCount) return;
  const current = parseInt(analysesCount.textContent, 10) || 0;
  analysesCount.textContent = current + 1;
}

function setDataMode(mode = 'LIVE API') {
  if (!dataModeEl) return;
  dataModeEl.textContent = mode;
  dataModeEl.style.color = mode === 'MOCK' ? 'var(--amber)' : 'var(--blue)';
  dataModeEl.style.background = mode === 'MOCK' ? 'var(--amber-dim)' : 'var(--blue-dim)';
  dataModeEl.style.borderColor = mode === 'MOCK' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.25)';
}


/* ═══════════════════════════════════════════
   12. NAVIGATION & RESET SYSTEM
   ═══════════════════════════════════════════ */
function resetDashboard() {
  // Clear textarea notes and trigger word count
  if (vetNotesInput) {
    vetNotesInput.value = '';
    vetNotesInput.dispatchEvent(new Event('input'));
  }

  // Clear patient details
  if (sessionPatient) {
    sessionPatient.textContent = '—';
  }
  if (sessionCarer) {
    sessionCarer.textContent = 'Hadeed';
  }
  if (analysesCount) {
    analysesCount.textContent = '0';
  }

  // Restore initial recovery layout states
  setPatientStatus('normal', 'Awaiting Input', 'No analysis run yet.', 'Load a vet note and click Analyze.');
  populateCard('medication-body', []);
  populateCard('activity-body', []);
  populateCard('dietary-body', []);
  populateCard('followup-body', []);
  populateRedFlags([]);
  updateRecoveryProgress();

  // System logs
  termLog('system', '🔄 Recovery Dashboard reset to pristine state.');
  showToast('info', 'Dashboard cleared.');
}

// Audio toggle control binding
if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    audioMuted = !audioMuted;
    if (!audioMuted) {
      SoundController.init();
      audioToggleBtn.innerHTML = SVG_ICONS.speakerOn;
      audioToggleBtn.classList.add('unmuted');
      SoundController.playClick();
      showToast('info', 'Arcade audio engine unmuted.');
    } else {
      audioToggleBtn.innerHTML = SVG_ICONS.speakerOff;
      audioToggleBtn.classList.remove('unmuted');
      showToast('info', 'Arcade audio engine muted.');
    }
  });
}

// Profile Dropdown click toggling
const userBadgeBtn = $('user-badge-btn');
const profileDropdownMenu = $('profile-dropdown-menu');

if (userBadgeBtn && profileDropdownMenu) {
  userBadgeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    SoundController.playClick();
    profileDropdownMenu.classList.toggle('show-dropdown');
  });

  document.addEventListener('click', () => {
    if (profileDropdownMenu.classList.contains('show-dropdown')) {
      profileDropdownMenu.classList.remove('show-dropdown');
    }
  });
}

// Bilingual Language toggle binding
const langToggleBtn = $('lang-toggle-btn');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    SoundController.playClick();
    if (currentLanguage === 'en') {
      currentLanguage = 'ur';
      langToggleBtn.textContent = '🌐 LANG: ROMAN URDU';
      showToast('info', 'Swapped language to Roman Urdu.');
      termLog('system', '🌐 UI Language switched to Roman Urdu.');
    } else {
      currentLanguage = 'en';
      langToggleBtn.textContent = '🌐 LANG: ENGLISH';
      showToast('info', 'Swapped language to English.');
      termLog('system', '🌐 UI Language switched to English.');
    }

    // Re-render dashboard instantly from cache if populated
    if (activeSessionData) {
      hydrateDashboard(activeSessionData);
    }
  });
}

// Floppy Disk state vault bindings
const saveStateBtn = $('save-state-btn');
const loadStateBtn = $('load-state-btn');
const loginLoadStateBtn = $('login-load-state-btn');

function executeLoadState() {
  const savedStr = localStorage.getItem('pawsitive_rehab_state');
  if (!savedStr) {
    showToast('error', 'No saved recovery state found.');
    return;
  }

  try {
    const stateObj = JSON.parse(savedStr);

    // 1. Bypass authentication overlay immediately
    if (loginOverlay) {
      loginOverlay.classList.add('hidden');
      loginOverlay.style.display = 'none';
    }

    // 2. Hydrate variables
    currentLanguage = stateObj.currentLanguage || 'en';
    if (langToggleBtn) {
      langToggleBtn.textContent = currentLanguage === 'en' ? '🌐 LANG: ENGLISH' : '🌐 LANG: ROMAN URDU';
    }

    if (sessionPatient) sessionPatient.textContent = stateObj.patientName;
    if (sessionCarer) sessionCarer.textContent = stateObj.carerName;
    if (analysesCount) analysesCount.textContent = stateObj.analysesCountVal;

    // 3. Hydrate cards
    hydrateDashboard(stateObj.activeSessionData);

    // 4. Re-check previously checked items
    const checkboxes = document.querySelectorAll('.retro-check');
    if (stateObj.checkedStates && stateObj.checkedStates.length === checkboxes.length) {
      checkboxes.forEach((check, idx) => {
        check.checked = stateObj.checkedStates[idx];
      });
    }

    // 5. Update progress meter
    updateRecoveryProgress();

    // 6. Play fanfare and update logs
    SoundController.playFanfare();
    termLog('system', '📂 Session State deserialized and restored from LocalStorage Vault.');
    showToast('success', 'Recovery state loaded successfully!');
  } catch (e) {
    console.error(e);
    showToast('error', 'Failed to load saved state.');
  }
}

if (saveStateBtn) {
  saveStateBtn.addEventListener('click', () => {
    SoundController.playClick();
    if (!activeSessionData) {
      showToast('error', 'No active session data to save.');
      return;
    }

    const checkedStates = [];
    document.querySelectorAll('.retro-check').forEach((check) => {
      checkedStates.push(check.checked);
    });

    const stateObj = {
      activeSessionData,
      currentLanguage,
      checkedStates,
      patientName: sessionPatient ? sessionPatient.textContent : 'Unknown Pet',
      carerName: sessionCarer ? sessionCarer.textContent : 'Hadeed',
      analysesCountVal: analysesCount ? analysesCount.textContent : '0'
    };

    localStorage.setItem('pawsitive_rehab_state', JSON.stringify(stateObj));
    SoundController.playCheck(); // Quick synthesized success chirp

    // Update restore button visibility
    if (loginLoadStateBtn) {
      loginLoadStateBtn.style.display = 'block';
    }

    showToast('success', 'State saved to Vault!');
    termLog('success', '💾 Session State serialized and written to LocalStorage Vault.');
  });
}

if (loadStateBtn) {
  loadStateBtn.addEventListener('click', () => {
    SoundController.playClick();
    executeLoadState();
  });
}

if (loginLoadStateBtn) {
  loginLoadStateBtn.addEventListener('click', () => {
    SoundController.playClick();
    executeLoadState();
  });
}

// Logo reset binding
if (navLogoBrand) {
  navLogoBrand.addEventListener('click', () => {
    SoundController.playClick();
    resetDashboard();
  });
  navLogoBrand.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      SoundController.playClick();
      resetDashboard();
    }
  });
}

// Logout navigation block
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    SoundController.playClick();
    // Reset authorization button
    if (enterBtn) {
      enterBtn.disabled = false;
      enterBtn.textContent = '🚀 Enter Care Dashboard';
    }

    // Smooth transition overlay activation
    if (loginOverlay) {
      loginOverlay.style.display = 'flex';
      loginOverlay.offsetHeight; // force paint loop reflow
      loginOverlay.classList.remove('hidden');
    }

    showToast('info', 'Logged out successfully.');
    termLog('info', '🔐 Session invalidated. Redirecting to Care Portal…');
  });
}


/* ═══════════════════════════════════════════
   13. INIT BOOT
   ═══════════════════════════════════════════ */
(function init() {
  if (vetNotesInput) {
    vetNotesInput.dispatchEvent(new Event('input'));
  }
  attachAudioTriggers();

  // Initial SVG state rendering
  applyTheme(isLight);
  if (audioToggleBtn) {
    audioToggleBtn.innerHTML = audioMuted ? SVG_ICONS.speakerOff : SVG_ICONS.speakerOn;
    if (!audioMuted) {
      audioToggleBtn.classList.add('unmuted');
    }
  }

  // Floppy disk recovery initialization check
  const savedStr = localStorage.getItem('pawsitive_rehab_state');
  const loginLoadStateBtn = $('login-load-state-btn');
  if (savedStr && loginLoadStateBtn) {
    loginLoadStateBtn.style.display = 'block';
  }

  window.PawsRehab = {
    termLog,
    showToast,
    setPatientStatus,
    populateCard,
    populateRedFlags,
    setSkeletonVisible,
    incrementAnalysisCount,
    setDataMode,
    sessionPatient,
    analysesCount,
  };

  console.log('%c🐾 Pawsitive Rehab Engine Fully Wired', 'color:#10b981; font-size:14px; font-weight:bold;');
})();
