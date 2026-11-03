/**
 * LAB MAYA ALGORITMA PENCARIAN (SEARCHING) & PENGURUTAN (SORTING)
 * Penilaian & Pencatatan Khusus Mode Aktivitas Siswa (Mode Demonstrasi Tidak Dicatat)
 * Pengembang: Andi Wahidin Burhanuddin — SMA Negeri 12 Wajo
 */

const DEBUG_MODE = true;

function debugLog(moduleName, message, data = null) {
  if (!DEBUG_MODE) return;
  const time = new Date().toLocaleTimeString('id-ID');
  if (data !== null) {
    console.log(`[LabMaya][${time}][${moduleName}] ${message}`, data);
  } else {
    console.log(`[LabMaya][${time}][${moduleName}] ${message}`);
  }
}

function debugError(moduleName, err) {
  console.error(`[LabMaya][ERROR][${moduleName}]`, err);
}

function setTextSafe(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHTMLSafe(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function toggleClassSafe(id, className, force) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle(className, force);
}

/* =====================================================
   1. WEB AUDIO API SYNTHESIZER
   ===================================================== */
let audioCtx = null;
let sfxEnabled = true;
let bgmEnabled = false;
let bgmInterval = null;

function initAudioContext() {
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (err) {
    debugError('Audio', err);
  }
}

function playTone(freq = 440, type = 'sine', duration = 0.12, gainLevel = 0.08) {
  if (!sfxEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    debugError('AudioTone', err);
  }
}

function sfxClick() { playTone(580, 'triangle', 0.08, 0.07); }
function sfxCompare() { playTone(510, 'sine', 0.1, 0.06); }
function sfxSwap() {
  playTone(360, 'sawtooth', 0.11, 0.06);
  setTimeout(() => playTone(680, 'triangle', 0.14, 0.07), 65);
}
function sfxSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
    setTimeout(() => playTone(n, 'triangle', 0.18, 0.09), idx * 85);
  });
}
function sfxError() {
  playTone(195, 'sawtooth', 0.25, 0.11);
  setTimeout(() => playTone(165, 'sawtooth', 0.24, 0.1), 110);
}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;
  toggleClassSafe('btnToggleSfx', 'active', sfxEnabled);
  setHTMLSafe('sfxIcon', sfxEnabled ? '&#128266;' : '&#128263;');
  if (sfxEnabled) sfxClick();
}

function toggleBgm() {
  initAudioContext();
  bgmEnabled = !bgmEnabled;
  toggleClassSafe('btnToggleBgm', 'active', bgmEnabled);
  if (bgmEnabled) {
    const arpeggio = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];
    let step = 0;
    bgmInterval = setInterval(() => {
      if (!bgmEnabled || !audioCtx) return;
      playTone(arpeggio[step % arpeggio.length], 'sine', 0.4, 0.025);
      step++;
    }, 480);
  } else {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

/* =====================================================
   2. ANIMASI LATAR CANVAS 2D
   ===================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const symbols = ['0', '1', '[2]', '[3]', '[5]', '[6]', '[7]', 'A>B', 'swap()'];
  const particles = Array.from({ length: 28 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    label: symbols[Math.floor(Math.random() * symbols.length)],
    size: 11 + Math.random() * 3
  }));

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.font = `bold ${p.size}px monospace`;
      ctx.fillText(p.label, p.x, p.y);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* =====================================================
   3. NAVIGASI LAYAR & OVERLAY LOADING
   ===================================================== */
function startLabFromSplash() {
  initAudioContext();
  sfxClick();
  const overlay = document.getElementById('loadingOverlay');
  const bar = document.getElementById('loadingBar');
  const nodes = document.querySelectorAll('.load-node');

  if (overlay) overlay.classList.add('active');
  let progress = 0;
  const messages = [
    'Mengalokasikan ruang pencarian & memori array...',
    'Menyiapkan validator teknik Bubble Sort [2, 3, 7, 6, 5]...',
    'Mengaktifkan pendeteksi penyisipan kartu Insertion Sort...',
    'Mengkalibrasi seleksi nilai minimum Selection Sort...',
    'Menghubungkan pencatat aktivitas siswa ke laporan PDF...'
  ];

  const timer = setInterval(() => {
    progress += 5;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = `${progress}%`;
    setTextSafe('loadingPercentText', `${progress}%`);
    const stageIdx = Math.min(Math.floor(progress / 21), 4);
    setTextSafe('loadingStepText', messages[stageIdx]);
    nodes.forEach((n, idx) => {
      if (idx <= stageIdx) n.classList.add('lit');
    });

    if (progress >= 100) {
      clearInterval(timer);
      sfxSuccess();
      setTimeout(() => {
        if (overlay) overlay.classList.remove('active');
        toggleClassSafe('mainHeader', 'hidden', false);
        navigateTo('home');
      }, 250);
    }
  }, 40);
}

function navigateTo(viewName) {
  sfxClick();
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === viewName);
  });

  if (viewName === 'simulasi') {
    syncPracticeHighlightsAndPrompt();
    renderSimulationStage();
  }
  debugLog('Navigasi', `Berpindah ke layar: ${viewName}`);
}

function playCardClickEffect(el) {
  sfxClick();
  el.classList.add('pulsed');
  setTimeout(() => el.classList.remove('pulsed'), 250);
}

function switchTheoryTab(tabKey, btnEl) {
  sfxClick();
  document.querySelectorAll('.algo-tab-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.algo-tab-content').forEach((c) => c.classList.remove('active'));
  btnEl.classList.add('active');
  const panel = document.getElementById(`theory-tab-${tabKey}`);
  if (panel) panel.classList.add('active');
}

/* =====================================================
   4. MESIN AKTIVITAS SORTING SISWA & VALIDATOR KESALAHAN
   ===================================================== */
let currentMission = 2;
const completedMissions = new Set();
const experimentRecords = []; // Hanya menyimpan hasil Mode Aktivitas Siswa

let simState = {
  executionMode: 'practice', // 'practice' = Mode Aktivitas Siswa (Dinilai) | 'demo' = Mode Demonstrasi (Tidak Dicatat)
  algo: 'bubble',
  initialArray: [2, 3, 7, 6, 5],
  currentArray: [2, 3, 7, 6, 5],
  iterations: 1,
  comparisons: 0,
  swaps: 0,
  correctActions: 0,
  errorCount: 0,
  errorList: [],
  finished: false,
  bubblePass: 1,
  bubbleJ: 0,
  insertionIter: 1,
  insertionCursor: 1,
  selectionI: 0,
  searchCursor: 0,
  activeCompareIndices: [0, 1],
  activeCardIndex: null,
  activeSwapIndices: [],
  sortedIndices: [],
  wrongShakeIndices: [],
  partitionInfo: { sorted: '()', unsorted: '(2, 3, 7, 6, 5)', minVal: '-' },
  stepsQueue: [],
  stepPointer: 0,
  autoTimer: null
};

const missionDescriptions = {
  1: '<strong>Target Misi 1 (Aktivitas Pencarian / Searching):</strong> Pastikan berada di <em>Mode Aktivitas Siswa</em>, klik elemen secara berurutan dari kiri ke kanan hingga angka target ditemukan, lalu klik <strong>Catat Aktivitas Siswa &amp; Verifikasi Misi</strong>.',
  2: '<strong>Target Misi 2 (Aktivitas Mandiri Bubble Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Aktivitas Siswa</em>, bandingkan pasangan berdekatan pada deret <code>[2, 3, 7, 6, 5]</code> dengan menekan tombol <strong>Tukar Posisi</strong> atau <strong>Urutan Tetap</strong> hingga selesai, lalu klik <strong>Catat Aktivitas Siswa &amp; Verifikasi Misi</strong>.',
  3: '<strong>Target Misi 3 (Aktivitas Mandiri Insertion Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Aktivitas Siswa</em>, sisipkan kartu ke-(i+1) pada deret <code>[2, 3, 7, 6, 5]</code> menggunakan tombol <strong>Tukar ke Kiri</strong> atau <strong>Posisi Sudah Tepat</strong> hingga selesai, lalu klik <strong>Catat Aktivitas Siswa &amp; Verifikasi Misi</strong>.',
  4: '<strong>Target Misi 4 (Aktivitas Mandiri Selection Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Aktivitas Siswa</em>, klik langsung <strong>bilangan terkecil</strong> pada <em>Bagian Belum Terurut</em> di setiap iterasi hingga selesai, lalu klik <strong>Catat Aktivitas Siswa &amp; Verifikasi Misi</strong>.',
  5: '<strong>Target Misi 5 (Aktivitas Sorting Data Terbalik [9, 7, 5, 3, 1]):</strong> Dalam <em>Mode Aktivitas Siswa</em>, selesaikan pengurutan deret terbalik <code>[9, 7, 5, 3, 1]</code> lalu klik <strong>Catat Aktivitas Siswa &amp; Verifikasi Misi</strong>.'
};

function setExecutionMode(mode) {
  sfxClick();
  simState.executionMode = mode;
  const isPractice = mode === 'practice';

  toggleClassSafe('modeBtnPractice', 'active', isPractice);
  toggleClassSafe('modeBtnDemo', 'active', !isPractice);
  toggleClassSafe('practiceDecisionPanel', 'hidden', !isPractice);
  toggleClassSafe('btnStep', 'hidden', isPractice);
  toggleClassSafe('btnAuto', 'hidden', isPractice);
  toggleClassSafe('speedControlWrap', 'hidden', isPractice);

  // Kunci tampilan tombol pencatatan saat di Mode Demonstrasi
  toggleClassSafe('btnRecordVerify', 'locked-demo', !isPractice);
  setTextSafe(
    'btnRecordVerifyText',
    isPractice
      ? 'Catat Aktivitas Siswa & Verifikasi Misi'
      : '🔒 Pencatatan Nonaktif di Mode Demonstrasi (Khusus Mode Aktivitas Siswa)'
  );

  resetSimulationState();
  debugLog('Mode', `Mode eksekusi diubah ke: ${mode}`);
}

function selectMission(mNum) {
  sfxClick();
  currentMission = mNum;
  document.querySelectorAll('.mission-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.mission) === mNum);
  });
  setTextSafe('missionStatusBadge', `Misi Aktif: #${mNum}`);
  setHTMLSafe('missionInstructionBox', missionDescriptions[mNum] || '');

  const algoSelect = document.getElementById('simAlgoSelect');
  const presetSelect = document.getElementById('simPresetSelect');
  if (algoSelect && presetSelect) {
    if (mNum === 1) { algoSelect.value = 'search_sorted'; presetSelect.value = '2,3,7,6,5'; }
    else if (mNum === 2) { algoSelect.value = 'bubble'; presetSelect.value = '2,3,7,6,5'; }
    else if (mNum === 3) { algoSelect.value = 'insertion'; presetSelect.value = '2,3,7,6,5'; }
    else if (mNum === 4) { algoSelect.value = 'selection'; presetSelect.value = '2,3,7,6,5'; }
    else if (mNum === 5) { algoSelect.value = 'bubble'; presetSelect.value = '9,7,5,3,1'; }
  }
  handleAlgoChange();
}

function handleAlgoChange() {
  const algoEl = document.getElementById('simAlgoSelect');
  const algo = algoEl ? algoEl.value : 'bubble';
  const searchWrap = document.getElementById('searchTargetWrap');
  if (searchWrap) searchWrap.style.display = algo.startsWith('search_') ? 'block' : 'none';
  resetSimulationState();
}

function handlePresetChange() {
  sfxClick();
  resetSimulationState();
}

function getSelectedPresetArray() {
  const presetEl = document.getElementById('simPresetSelect');
  const val = presetEl ? presetEl.value : '2,3,7,6,5';
  if (val === 'random') {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const picked = [];
    while (picked.length < 5) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }
  return val.split(',').map((n) => Number(n.trim()));
}

function stopAutoPlay() {
  if (simState.autoTimer) {
    clearInterval(simState.autoTimer);
    simState.autoTimer = null;
  }
  setHTMLSafe('btnAuto', '&#9654; Jalankan Demo Otomatis');
}

function resetSimulationState() {
  stopAutoPlay();
  const algoEl = document.getElementById('simAlgoSelect');
  const algo = algoEl ? algoEl.value : 'bubble';
  let base = getSelectedPresetArray();

  if (algo === 'search_sorted') {
    base = [...base].sort((a, b) => a - b);
  }

  simState.algo = algo;
  simState.initialArray = [...base];
  simState.currentArray = [...base];
  simState.iterations = 1;
  simState.comparisons = 0;
  simState.swaps = 0;
  simState.correctActions = 0;
  simState.errorCount = 0;
  simState.errorList = [];
  simState.finished = false;

  simState.bubblePass = 1;
  simState.bubbleJ = 0;
  simState.insertionIter = 1;
  simState.insertionCursor = 1;
  simState.selectionI = 0;
  simState.searchCursor = 0;

  simState.activeCompareIndices = [];
  simState.activeCardIndex = null;
  simState.activeSwapIndices = [];
  simState.sortedIndices = [];
  simState.wrongShakeIndices = [];
  simState.partitionInfo = {
    sorted: '()',
    unsorted: `(${base.join(', ')})`,
    minVal: '-'
  };

  simState.stepsQueue = buildAlgorithmSteps(algo, base);
  simState.stepPointer = 0;

  const modeLabels = {
    bubble: 'TEKNIK BUBBLE SORT (GELEMBUNG BERDEKATAN)',
    insertion: 'TEKNIK INSERTION SORT (PENYISIPAN KARTU)',
    selection: 'TEKNIK SELECTION SORT (SELEKSI NILAI TERKECIL)',
    search_unsorted: 'TEKNIK SEARCHING — RUANG DATA ACAK',
    search_sorted: 'TEKNIK SEARCHING — RUANG DATA TERURUT'
  };
  setTextSafe('stageModeLabel', modeLabels[algo] || 'SIMULASI');

  toggleClassSafe('bubbleActionGroup', 'hidden', algo !== 'bubble');
  toggleClassSafe('insertionActionGroup', 'hidden', algo !== 'insertion');
  toggleClassSafe('clickElementHintGroup', 'hidden', algo !== 'selection' && !algo.startsWith('search_'));
  toggleClassSafe('selectionPartitionBox', 'hidden', algo !== 'selection');
  toggleClassSafe('verifyFeedbackBox', 'hidden', true);

  hideInstantFeedback();
  clearStepLog();
  renderErrorLog();
  appendStepLog(
    simState.executionMode === 'practice'
      ? `Sesi Aktivitas Siswa dimulai dengan deret awal [${base.join(', ')}].`
      : `Mode Demonstrasi (Tidak Dicatat) dimulai dengan deret [${base.join(', ')}].`
  );

  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

function syncPracticeHighlightsAndPrompt() {
  const arr = simState.currentArray;
  const n = arr.length;

  if (simState.finished) {
    setTextSafe('stageIterBadge', 'Selesai ✓');
    if (simState.executionMode === 'practice') {
      setHTMLSafe(
        'studentPromptBox',
        `&#127881; <strong>Aktivitas Siswa Selesai!</strong> Deret akhir: <code>[${arr.join(', ')}]</code>. Total kesalahan teknik Anda: <strong>${simState.errorCount}</strong> (Akurasi: <strong>${computeAccuracyPercent()}%</strong>). Klik tombol <strong>"Catat Aktivitas Siswa &amp; Verifikasi Misi"</strong> di panel kanan!`
      );
    } else {
      setHTMLSafe(
        'studentPromptBox',
        `&#128065;&#65039; <strong>Demonstrasi Selesai!</strong> Hasil akhir: <code>[${arr.join(', ')}]</code>. Karena ini adalah <em>Mode Demonstrasi</em>, data tidak dapat dicatat ke Tabel Percobaan. Silakan beralih ke <strong>Mode Aktivitas Siswa</strong> untuk dinilai!`
      );
    }
    return;
  }

  if (simState.executionMode === 'demo') {
    setTextSafe('stageIterBadge', `Demo Iterasi Ke-${simState.iterations}`);
    setHTMLSafe(
      'studentPromptBox',
      `<strong>Mode Demonstrasi (Hanya Observasi — Tidak Dicatat):</strong> Tekan tombol <em>Langkah Demo Berikutnya</em> atau <em>Jalankan Demo Otomatis</em> di bawah untuk mengamati cara kerja algoritma.`
    );
    return;
  }

  if (simState.algo === 'bubble') {
    const pass = simState.bubblePass;
    const j = simState.bubbleJ;
    simState.iterations = pass;
    simState.activeCompareIndices = [j, j + 1];
    simState.activeCardIndex = null;
    simState.sortedIndices = Array.from({ length: pass - 1 }, (_, k) => n - 1 - k);

    setTextSafe('stageIterBadge', `Iterasi Ke-${pass} (Banding ${j + 1}/${n - pass})`);
    setHTMLSafe(
      'studentPromptBox',
      `<strong>Langkah Bubble Sort (Iterasi ${pass}):</strong> Bandingkan elemen berdekatan pada indeks <strong>[${j + 1}] (nilai ${arr[j]})</strong> dan <strong>[${j + 2}] (nilai ${arr[j + 1]})</strong>. Pilih tombol <strong>Tukar Posisi</strong> atau <strong>Urutan Tetap</strong> di bawah!`
    );
  } else if (simState.algo === 'insertion') {
    const iter = simState.insertionIter;
    const cur = simState.insertionCursor;
    simState.iterations = iter;
    simState.activeCardIndex = cur;
    simState.activeCompareIndices = cur > 0 ? [cur - 1, cur] : [cur];
    simState.sortedIndices = [];

    setTextSafe('stageIterBadge', `Iterasi Ke-${iter} (Kartu ke-${iter + 1})`);
    setHTMLSafe(
      'studentPromptBox',
      `<strong>Langkah Insertion Sort (Iterasi ${iter}):</strong> Kartu yang sedang disisipkan adalah indeks <strong>[${cur + 1}] (nilai ${arr[cur]})</strong>, dibandingkan dengan bilangan di sebelah kirinya yaitu indeks <strong>[${cur}] (nilai ${arr[cur - 1]})</strong>. Pilih tombol di bawah!`
    );
  } else if (simState.algo === 'selection') {
    const i = simState.selectionI;
    const iter = i + 1;
    simState.iterations = iter;
    simState.activeCompareIndices = [];
    simState.activeCardIndex = null;
    simState.sortedIndices = Array.from({ length: i }, (_, k) => k);

    const sortedPart = arr.slice(0, i);
    const unsortedPart = arr.slice(i);
    simState.partitionInfo = {
      sorted: `(${sortedPart.join(', ')})`,
      unsorted: `(${unsortedPart.join(', ')})`,
      minVal: '?'
    };

    setTextSafe('stageIterBadge', `Iterasi Ke-${iter}`);
    setHTMLSafe(
      'studentPromptBox',
      `<strong>Langkah Selection Sort (Iterasi ${iter}):</strong> Pada <em>Bagian Belum Terurut</em> indeks <strong>[${i + 1}] s.d. [${n}]</strong> yaitu <code>(${unsortedPart.join(', ')})</code>, <strong>klik langsung pada elemen dengan NILAI TERKECIL</strong>!`
    );
  } else if (simState.algo.startsWith('search_')) {
    const targetEl = document.getElementById('searchTargetInput');
    const target = targetEl ? Number(targetEl.value) || 6 : 6;
    const cur = simState.searchCursor;
    simState.iterations = cur + 1;
    simState.activeCompareIndices = [cur];
    setTextSafe('stageIterBadge', `Pengecekan Ke-${cur + 1}`);
    setHTMLSafe(
      'studentPromptBox',
      `<strong>Langkah Pencarian (Searching):</strong> Kriteria angka yang dicari adalah <strong>${target}</strong>. Klik elemen pada indeks <strong>[${cur + 1}]</strong> untuk memeriksa nilainya!`
    );
  }
}

function recordStudentError(errorType, detailMessage, wrongIndices = []) {
  simState.errorCount++;
  simState.errorList.unshift({
    iter: simState.iterations,
    type: errorType,
    detail: detailMessage
  });
  simState.wrongShakeIndices = wrongIndices;

  sfxError();
  showInstantFeedback(false, `Kesalahan Terdeteksi (${errorType}): ${detailMessage}`);
  appendStepLog(`[KESALAHAN ITERASI ${simState.iterations}] ${errorType}: ${detailMessage}`);
  renderErrorLog();
  renderSimulationStage();

  setTimeout(() => {
    simState.wrongShakeIndices = [];
    renderSimulationStage();
  }, 450);
  debugLog('KesalahanSiswa', `${errorType}: ${detailMessage}`);
}

function recordStudentSuccessStep(message) {
  simState.correctActions++;
  showInstantFeedback(true, message);
  appendStepLog(message);
}

function showInstantFeedback(isOk, text) {
  const box = document.getElementById('instantStepFeedback');
  if (!box) return;
  box.classList.remove('hidden', 'step-ok', 'step-err');
  box.classList.add(isOk ? 'step-ok' : 'step-err');
  box.innerHTML = isOk ? `&#10004; ${text}` : `&#9888;&#65039; ${text}`;
}

function hideInstantFeedback() {
  toggleClassSafe('instantStepFeedback', 'hidden', true);
}

function computeAccuracyPercent() {
  const total = simState.correctActions + simState.errorCount;
  if (total === 0) return 100;
  return Math.round((simState.correctActions / total) * 100);
}

/* =====================================================
   LOGIKA VALIDASI AKTIVITAS SISWA: BUBBLE, INSERTION, SELECTION, SEARCHING
   ===================================================== */
function handleBubbleDecision(studentChoseSwap) {
  if (simState.finished || simState.executionMode !== 'practice' || simState.algo !== 'bubble') return;
  const arr = simState.currentArray;
  const n = arr.length;
  const pass = simState.bubblePass;
  const j = simState.bubbleJ;
  const leftVal = arr[j];
  const rightVal = arr[j + 1];
  const shouldSwap = leftVal > rightVal;

  if (studentChoseSwap !== shouldSwap) {
    if (studentChoseSwap) {
      recordStudentError(
        'Salah Tukar Bubble Sort',
        `Iterasi ${pass}: Anda memilih TUKAR pada (${leftVal}, ${rightVal}), padahal ${leftVal} ≤ ${rightVal} sehingga posisi seharusnya tetap.`,
        [j, j + 1]
      );
    } else {
      recordStudentError(
        'Terlewat Tukar Bubble Sort',
        `Iterasi ${pass}: Anda memilih TETAP pada (${leftVal}, ${rightVal}), padahal ${leftVal} > ${rightVal} sehingga wajib ditukar.`,
        [j, j + 1]
      );
    }
    return;
  }

  simState.comparisons++;
  if (shouldSwap) {
    arr[j] = rightVal;
    arr[j + 1] = leftVal;
    simState.swaps++;
    simState.activeSwapIndices = [j, j + 1];
    sfxSwap();
    recordStudentSuccessStep(`Iterasi ${pass}: Tepat! Karena ${leftVal} > ${rightVal}, ditukar menjadi [${arr.join(', ')}].`);
  } else {
    simState.activeSwapIndices = [];
    sfxCompare();
    recordStudentSuccessStep(`Iterasi ${pass}: Tepat! Karena ${leftVal} ≤ ${rightVal}, urutan tetap [${arr.join(', ')}].`);
  }

  simState.bubbleJ++;
  if (simState.bubbleJ >= n - pass) {
    simState.bubblePass++;
    simState.bubbleJ = 0;
    if (simState.bubblePass >= n) {
      simState.finished = true;
      simState.sortedIndices = arr.map((_, idx) => idx);
      simState.activeCompareIndices = [];
      sfxSuccess();
    }
  }
  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

function handleInsertionDecision(decision) {
  if (simState.finished || simState.executionMode !== 'practice' || simState.algo !== 'insertion') return;
  const arr = simState.currentArray;
  const n = arr.length;
  const iter = simState.insertionIter;
  const cur = simState.insertionCursor;
  const cardVal = arr[cur];
  const leftVal = arr[cur - 1];
  const shouldSwapLeft = leftVal > cardVal;

  if (decision === 'swap_left' && !shouldSwapLeft) {
    recordStudentError(
      'Salah Geser Insertion Sort',
      `Iterasi ${iter}: Kartu ${cardVal} tidak lebih kecil daripada ${leftVal}, sehingga tidak boleh ditukar melewati ${leftVal}!`,
      [cur - 1, cur]
    );
    return;
  }

  if (decision === 'place_here' && shouldSwapLeft) {
    recordStudentError(
      'Berhenti Terlalu Cepat (Insertion Sort)',
      `Iterasi ${iter}: Bilangan di kiri (${leftVal}) masih lebih besar daripada kartu ${cardVal}. Geser kartu ${cardVal} ke kiri terlebih dahulu!`,
      [cur - 1, cur]
    );
    return;
  }

  simState.comparisons++;
  if (decision === 'swap_left') {
    arr[cur - 1] = cardVal;
    arr[cur] = leftVal;
    simState.swaps++;
    simState.insertionCursor--;
    sfxSwap();
    recordStudentSuccessStep(`Iterasi ${iter}: Tepat! Karena ${cardVal} < ${leftVal}, kartu ${cardVal} digeser ke kiri menjadi [${arr.join(', ')}].`);
    if (simState.insertionCursor === 0) advanceInsertionNextCard(n);
  } else {
    sfxCompare();
    recordStudentSuccessStep(`Iterasi ${iter}: Tepat! Karena ${cardVal} ≥ ${leftVal}, posisi kartu ${cardVal} sudah benar.`);
    advanceInsertionNextCard(n);
  }
  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

function advanceInsertionNextCard(n) {
  simState.insertionIter++;
  if (simState.insertionIter >= n) {
    simState.finished = true;
    simState.sortedIndices = simState.currentArray.map((_, idx) => idx);
    simState.activeCompareIndices = [];
    simState.activeCardIndex = null;
    sfxSuccess();
  } else {
    simState.insertionCursor = simState.insertionIter;
  }
}

function handleElementClickInPractice(clickedIdx) {
  if (simState.finished || simState.executionMode === 'demo') return;
  const arr = simState.currentArray;
  const n = arr.length;

  if (simState.algo === 'selection') {
    const i = simState.selectionI;
    const iter = i + 1;
    if (clickedIdx < i) {
      recordStudentError(
        'Pelanggaran Partisi Selection Sort',
        `Iterasi ${iter}: Indeks [${clickedIdx + 1}] (${arr[clickedIdx]}) sudah berada di Bagian Terurut! Pilihlah dari Bagian Belum Terurut [${i + 1}..${n}].`,
        [clickedIdx]
      );
      return;
    }

    const unsortedSlice = arr.slice(i);
    const minVal = Math.min(...unsortedSlice);
    const clickedVal = arr[clickedIdx];

    if (clickedVal !== minVal) {
      recordStudentError(
        'Salah Seleksi Nilai Terkecil',
        `Iterasi ${iter}: Anda mengklik ${clickedVal} pada (${unsortedSlice.join(', ')}), padahal nilai terkecil yang wajib diseleksi adalah ${minVal}!`,
        [clickedIdx]
      );
      return;
    }

    simState.comparisons += Math.max(1, n - 1 - i);
    if (clickedIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[clickedIdx];
      arr[clickedIdx] = temp;
      simState.swaps++;
      simState.activeSwapIndices = [i, clickedIdx];
      sfxSwap();
    } else {
      simState.activeSwapIndices = [i];
      sfxCompare();
    }

    simState.selectionI++;
    const sortedNow = arr.slice(0, simState.selectionI);
    recordStudentSuccessStep(`Iterasi ${iter}: Tepat! Nilai terkecil ${minVal} dimasukkan ke Bagian Terurut menjadi (${sortedNow.join(', ')}).`);

    if (simState.selectionI >= n) {
      simState.finished = true;
      simState.sortedIndices = arr.map((_, idx) => idx);
      simState.partitionInfo = { sorted: `(${arr.join(', ')})`, unsorted: '()', minVal };
      sfxSuccess();
    } else {
      syncPracticeHighlightsAndPrompt();
      simState.partitionInfo.minVal = minVal;
    }
    renderSimulationStage();
    return;
  }

  if (simState.algo === 'bubble') {
    const j = simState.bubbleJ;
    if (clickedIdx !== j && clickedIdx !== j + 1) {
      recordStudentError(
        'Salah Urutan Indeks Bubble Sort',
        `Iterasi ${simState.bubblePass}: Pasangan berdekatan saat ini adalah indeks [${j + 1}] dan [${j + 2}], bukan indeks [${clickedIdx + 1}]!`,
        [clickedIdx]
      );
      return;
    }
    sfxClick();
    showInstantFeedback(true, `Gunakan tombol "Tukar Posisi" atau "Urutan Tetap" di bawah untuk pasangan (${arr[j]}, ${arr[j + 1]})!`);
    return;
  }

  if (simState.algo === 'insertion') {
    const cur = simState.insertionCursor;
    if (clickedIdx !== cur && clickedIdx !== cur - 1) {
      recordStudentError(
        'Salah Pilih Kartu Insertion Sort',
        `Iterasi ${simState.insertionIter}: Kartu aktif berada di indeks [${cur + 1}] (${arr[cur]}), bukan indeks [${clickedIdx + 1}]!`,
        [clickedIdx]
      );
      return;
    }
    sfxClick();
    showInstantFeedback(true, `Gunakan tombol "Tukar / Geser Kartu ke Kiri" atau "Posisi Sudah Tepat" di bawah!`);
    return;
  }

  if (simState.algo.startsWith('search_')) {
    const targetEl = document.getElementById('searchTargetInput');
    const target = targetEl ? Number(targetEl.value) || 6 : 6;
    const expectedIdx = simState.searchCursor;

    if (clickedIdx !== expectedIdx) {
      recordStudentError(
        'Pengecekan Pencarian Melompat',
        `Periksa secara berurutan mulai dari indeks [${expectedIdx + 1}], jangan melompat ke indeks [${clickedIdx + 1}]!`,
        [clickedIdx]
      );
      return;
    }

    simState.comparisons++;
    const val = arr[clickedIdx];
    if (val === target) {
      simState.sortedIndices = [clickedIdx];
      simState.finished = true;
      sfxSuccess();
      recordStudentSuccessStep(`Langkah ${clickedIdx + 1}: Indeks [${clickedIdx + 1}] bernilai ${val} == Kriteria (${target}). DITEMUKAN!`);
    } else if (simState.algo === 'search_sorted' && val > target) {
      simState.finished = true;
      sfxSuccess();
      recordStudentSuccessStep(`Langkah ${clickedIdx + 1}: Karena data terurut dan ${val} > ${target}, pencarian berhenti cepat.`);
    } else {
      sfxCompare();
      recordStudentSuccessStep(`Langkah ${clickedIdx + 1}: Indeks [${clickedIdx + 1}] bernilai ${val} != ${target}. Lanjut ke elemen berikutnya.`);
      simState.searchCursor++;
      if (simState.searchCursor >= n) {
        simState.finished = true;
        sfxSuccess();
      }
    }
    syncPracticeHighlightsAndPrompt();
    renderSimulationStage();
  }
}

/* =====================================================
   RENDER VISUAL, TELEMETRI, DAN LOG KESALAHAN SISWA
   ===================================================== */
function renderSimulationStage() {
  const container = document.getElementById('arrayVisualContainer');
  const idxRow = document.getElementById('arrayIndexRow');
  if (!container || !idxRow) return;

  container.innerHTML = '';
  idxRow.innerHTML = '';

  const maxVal = Math.max(...simState.currentArray, 9);

  simState.currentArray.forEach((val, idx) => {
    const el = document.createElement('div');
    let styleClass = 'style-bubble';
    if (simState.algo === 'insertion') styleClass = 'style-insertion';
    if (simState.algo === 'selection') styleClass = 'style-selection';

    el.className = `arr-item ${styleClass}`;
    if (styleClass === 'style-selection') {
      const h = 42 + Math.round((val / maxVal) * 78);
      el.style.height = `${h}px`;
    }

    if (simState.activeCompareIndices.includes(idx)) el.classList.add('comparing');
    if (simState.activeCardIndex === idx) el.classList.add('active-card');
    if (simState.activeSwapIndices.includes(idx)) el.classList.add('swapping');
    if (simState.sortedIndices.includes(idx)) el.classList.add('sorted-done');
    if (simState.wrongShakeIndices.includes(idx)) el.classList.add('wrong-shake');

    el.textContent = val;
    el.onclick = () => handleElementClickInPractice(idx);
    container.appendChild(el);

    const idxCell = document.createElement('div');
    idxCell.className = 'idx-cell';
    idxCell.textContent = `[${idx + 1}]`;
    idxRow.appendChild(idxCell);
  });

  if (simState.algo === 'selection') {
    setTextSafe('spSortedText', simState.partitionInfo.sorted);
    setTextSafe('spUnsortedText', simState.partitionInfo.unsorted);
    setTextSafe('spMinText', simState.partitionInfo.minVal);
  }

  setTextSafe('metricIteration', simState.iterations);
  setTextSafe('metricComparisons', simState.comparisons);
  setTextSafe('metricSwaps', simState.swaps);
  setTextSafe('metricErrors', simState.errorCount);
  setTextSafe('metricAccuracy', simState.executionMode === 'practice' ? `${computeAccuracyPercent()}%` : '-');

  const statusEl = document.getElementById('metricStatus');
  if (statusEl) {
    if (simState.executionMode === 'demo') {
      statusEl.textContent = 'Demo (Tak Dinilai)';
      statusEl.className = 'm-val status-wait';
    } else if (simState.finished) {
      statusEl.textContent = simState.algo.startsWith('search_') ? 'Selesai Cari ✓' : 'Terurut Menaik ✓';
      statusEl.className = 'm-val status-done';
    } else {
      statusEl.textContent = 'Aktivitas Siswa';
      statusEl.className = 'm-val status-wait';
    }
  }

  setTextSafe('summaryInitial', `[${simState.initialArray.join(', ')}]`);
  setTextSafe('summaryCurrent', `[${simState.currentArray.join(', ')}]`);
}

function renderErrorLog() {
  const ul = document.getElementById('studentErrorLog');
  setTextSafe('errorCountBadge', simState.errorCount);
  if (!ul) return;
  if (simState.errorList.length === 0) {
    ul.innerHTML = `<li class="no-err-item">&#10004; Belum ada kesalahan teknik yang tercatat pada sesi ini.</li>`;
    return;
  }
  ul.innerHTML = simState.errorList
    .map((err, idx) => `<li><strong>#${simState.errorList.length - idx} [Iterasi ${err.iter} — ${err.type}]:</strong> ${err.detail}</li>`)
    .join('');
}

function clearErrorLog() {
  sfxClick();
  simState.errorList = [];
  simState.errorCount = 0;
  renderErrorLog();
  renderSimulationStage();
}

function appendStepLog(text) {
  const ul = document.getElementById('simStepLog');
  if (!ul) return;
  const li = document.createElement('li');
  li.textContent = text;
  ul.prepend(li);
}

function clearStepLog() {
  const ul = document.getElementById('simStepLog');
  if (ul) ul.innerHTML = '';
}

/* =====================================================
   MODE DEMONSTRASI OTOMATIS (HANYA OBSERVASI — TIDAK DICATAT)
   ===================================================== */
function buildAlgorithmSteps(algo, baseArray) {
  const arr = [...baseArray];
  const n = arr.length;
  const steps = [];
  let compCount = 0;
  let swapCount = 0;

  if (algo === 'bubble') {
    for (let iter = 1; iter <= n - 1; iter++) {
      for (let j = 0; j < n - iter; j++) {
        compCount++;
        const a = arr[j], b = arr[j + 1];
        steps.push({
          type: 'compare', iter, compCount, swapCount, arraySnapshot: [...arr],
          compareIndices: [j, j + 1], swapIndices: [],
          sortedIndices: Array.from({ length: iter - 1 }, (_, k) => n - 1 - k),
          message: `Demo Iterasi ${iter}: Bandingkan [${j + 1}]=${a} dan [${j + 2}]=${b}.`
        });
        if (a > b) {
          arr[j] = b; arr[j + 1] = a; swapCount++;
          steps.push({
            type: 'swap', iter, compCount, swapCount, arraySnapshot: [...arr],
            compareIndices: [], swapIndices: [j, j + 1],
            sortedIndices: Array.from({ length: iter - 1 }, (_, k) => n - 1 - k),
            message: `Demo Iterasi ${iter}: Karena ${a} > ${b}, tukar menjadi [${arr.join(', ')}].`
          });
        }
      }
    }
  } else if (algo === 'insertion') {
    for (let iter = 1; iter < n; iter++) {
      let curIdx = iter;
      const pickedVal = arr[curIdx];
      while (curIdx > 0) {
        compCount++;
        const leftVal = arr[curIdx - 1];
        steps.push({
          type: 'compare', iter, compCount, swapCount, arraySnapshot: [...arr],
          compareIndices: [curIdx - 1, curIdx], swapIndices: [], sortedIndices: [],
          message: `Demo Iterasi ${iter}: Bandingkan kartu ${pickedVal} dengan ${leftVal}.`
        });
        if (leftVal > arr[curIdx]) {
          arr[curIdx - 1] = arr[curIdx]; arr[curIdx] = leftVal; swapCount++;
          steps.push({
            type: 'swap', iter, compCount, swapCount, arraySnapshot: [...arr],
            compareIndices: [], swapIndices: [curIdx - 1, curIdx], sortedIndices: [],
            message: `Demo Iterasi ${iter}: Geser ${pickedVal} ke kiri menjadi [${arr.join(', ')}].`
          });
          curIdx--;
        } else break;
      }
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n; i++) {
      const iter = i + 1;
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        compCount++;
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      const foundMin = arr[minIdx];
      if (minIdx !== i) {
        const tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp; swapCount++;
      }
      steps.push({
        type: 'swap', iter, compCount, swapCount, arraySnapshot: [...arr],
        compareIndices: [], swapIndices: [i, minIdx],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        partition: {
          sorted: `(${arr.slice(0, i + 1).join(', ')})`,
          unsorted: `(${arr.slice(i + 1).join(', ')})`,
          minVal: foundMin
        },
        message: `Demo Iterasi ${iter}: Seleksi nilai terkecil ${foundMin} ke Bagian Terurut.`
      });
    }
  } else if (algo.startsWith('search_')) {
    const targetEl = document.getElementById('searchTargetInput');
    const target = targetEl ? Number(targetEl.value) || 6 : 6;
    for (let i = 0; i < n; i++) {
      compCount++;
      const match = arr[i] === target;
      steps.push({
        type: match ? 'swap' : 'compare', iter: i + 1, compCount, swapCount: 0,
        arraySnapshot: [...arr], compareIndices: [i], swapIndices: match ? [i] : [],
        sortedIndices: match ? [i] : [],
        message: match ? `Demo Langkah ${i + 1}: Indeks [${i + 1}]=${arr[i]} cocok!` : `Demo Langkah ${i + 1}: Indeks [${i + 1}]=${arr[i]} != ${target}.`
      });
      if (match) break;
    }
  }
  return steps;
}

function stepSimulation() {
  if (simState.finished) return;
  if (simState.stepPointer >= simState.stepsQueue.length) {
    simState.finished = true;
    simState.sortedIndices = simState.currentArray.map((_, i) => i);
    syncPracticeHighlightsAndPrompt();
    renderSimulationStage();
    sfxSuccess();
    return;
  }
  const step = simState.stepsQueue[simState.stepPointer++];
  simState.currentArray = [...step.arraySnapshot];
  simState.iterations = step.iter;
  simState.comparisons = step.compCount;
  simState.swaps = step.swapCount;
  simState.activeCompareIndices = step.compareIndices || [];
  simState.activeSwapIndices = step.swapIndices || [];
  simState.sortedIndices = step.sortedIndices || [];
  if (step.partition) simState.partitionInfo = step.partition;
  appendStepLog(step.message);
  if (step.type === 'swap') sfxSwap(); else sfxCompare();
  if (simState.stepPointer >= simState.stepsQueue.length) {
    simState.finished = true;
    if (!simState.algo.startsWith('search_')) simState.sortedIndices = simState.currentArray.map((_, i) => i);
    sfxSuccess();
  }
  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

function toggleAutoPlay() {
  sfxClick();
  if (simState.autoTimer) { stopAutoPlay(); return; }
  if (simState.finished) resetSimulationState();
  const speedEl = document.getElementById('speedRange');
  const speed = speedEl ? Number(speedEl.value) || 750 : 750;
  setHTMLSafe('btnAuto', '&#9208; Jeda Demo');
  simState.autoTimer = setInterval(stepSimulation, speed);
}

/* =====================================================
   5. PENCATATAN TABEL PERCOBAAN (HANYA MODE AKTIVITAS SISWA)
   ===================================================== */
function recordAndVerifyExperiment() {
  const fb = document.getElementById('verifyFeedbackBox');
  if (fb) fb.classList.remove('hidden', 'ok', 'warn');

  // BLOKIR PENCATATAN JIKA SEDANG DI MODE DEMONSTRASI
  if (simState.executionMode !== 'practice') {
    sfxError();
    if (fb) {
      fb.classList.add('warn');
      fb.innerHTML = `&#128683; <strong>Mode Demonstrasi Tidak Dicatat!</strong> Penilaian hanya berlaku untuk aktivitas mandiri siswa. Silakan klik tombol <strong>"&#9997;&#65039; Mode Aktivitas Siswa (Dinilai &amp; Dicatat)"</strong> di bagian atas meja kerja lalu lakukan pengurutan sendiri.`;
    }
    debugLog('PencatatanDitolak', 'Percobaan mencatat dari Mode Demonstrasi ditolak.');
    return;
  }

  // WAJIBKAN SISWA MENYELESAIKAN AKTIVITAS PRAKTIK SEBELUM DICATAT
  if (!simState.finished) {
    sfxError();
    if (fb) {
      fb.classList.add('warn');
      fb.innerHTML = `&#9888;&#65039; <strong>Aktivitas Belum Selesai!</strong> Selesaikan seluruh langkah iterasi pada <em>Mode Aktivitas Siswa</em> hingga berstatus <strong>Selesai / Terurut Menaik</strong> sebelum mencatat data ke tabel.`;
    }
    return;
  }

  const algoNames = {
    bubble: 'Bubble Sort',
    insertion: 'Insertion Sort',
    selection: 'Selection Sort',
    search_unsorted: 'Searching (Data Acak)',
    search_sorted: 'Searching (Data Terurut)'
  };

  const errorSummary =
    simState.errorList.length === 0
      ? '0 Kesalahan (Sempurna)'
      : simState.errorList.map((e) => `[Iter ${e.iter}] ${e.type}: ${e.detail}`).join(' | ');

  const record = {
    no: experimentRecords.length + 1,
    algo: `${algoNames[simState.algo] || simState.algo} (Aktivitas Siswa)`,
    initial: `[${simState.initialArray.join(', ')}]`,
    final: `[${simState.currentArray.join(', ')}]`,
    iterations: simState.iterations,
    comparisons: simState.comparisons,
    swaps: simState.swaps,
    errorCount: simState.errorCount,
    accuracy: `${computeAccuracyPercent()}%`,
    errorDetails: errorSummary
  };

  experimentRecords.push(record);
  renderExperimentTable();

  const initStr = simState.initialArray.join(',');
  let missionPassed = false;
  if (currentMission === 1 && simState.algo.startsWith('search_') && simState.finished) missionPassed = true;
  else if (currentMission === 2 && simState.algo === 'bubble' && initStr === '2,3,7,6,5' && simState.finished) missionPassed = true;
  else if (currentMission === 3 && simState.algo === 'insertion' && initStr === '2,3,7,6,5' && simState.finished) missionPassed = true;
  else if (currentMission === 4 && simState.algo === 'selection' && initStr === '2,3,7,6,5' && simState.finished) missionPassed = true;
  else if (currentMission === 5 && initStr === '9,7,5,3,1' && simState.finished) missionPassed = true;

  if (missionPassed) {
    completedMissions.add(currentMission);
    const btn = document.querySelector(`.mission-btn[data-mission="${currentMission}"]`);
    if (btn) {
      btn.classList.add('done');
      if (!btn.textContent.includes('✓')) btn.textContent += ' ✓';
    }
    sfxSuccess();
    if (fb) {
      fb.classList.add('ok');
      fb.innerHTML = `&#9989; <strong>Aktivitas Siswa &amp; Catatan Kesalahan (${simState.errorCount} kesalahan, Akurasi ${record.accuracy}) berhasil direkam! Misi #${currentMission} Terverifikasi Tuntas!</strong>`;
    }
  } else {
    sfxSuccess();
    if (fb) {
      fb.classList.add('ok');
      fb.innerHTML = `&#9989; <strong>Data Aktivitas Siswa (${simState.errorCount} kesalahan, Akurasi ${record.accuracy}) berhasil dimasukkan ke Tabel!</strong> (Untuk menandai Misi #${currentMission} tuntas, gunakan algoritma dan deret sesuai instruksi misi).`;
    }
  }
  debugLog('TabelAktivitasSiswa', 'Data berhasil dicatat:', record);
}

function renderExperimentTable() {
  const tbody = document.getElementById('experimentTableBody');
  if (!tbody) return;
  if (experimentRecords.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">Belum ada data aktivitas siswa yang dicatat. Selesaikan pengurutan pada <strong>Mode Aktivitas Siswa</strong> lalu klik <strong>"Catat Aktivitas Siswa &amp; Verifikasi Misi"</strong>.</td></tr>`;
    return;
  }
  tbody.innerHTML = experimentRecords
    .map((r) => `
      <tr>
        <td>${r.no}</td>
        <td><strong>${r.algo}</strong></td>
        <td><code>${r.initial}</code></td>
        <td><code>${r.final}</code></td>
        <td>${r.iterations}</td>
        <td>${r.comparisons}</td>
        <td>${r.swaps}</td>
        <td><strong style="color:${r.errorCount > 0 ? '#fb7185' : '#34d399'}">${r.errorCount}</strong></td>
        <td><strong>${r.accuracy}</strong></td>
        <td style="font-size:0.78rem; max-width:300px;">${r.errorDetails}</td>
      </tr>
    `)
    .join('');
}

function clearExperimentTable() {
  sfxClick();
  experimentRecords.length = 0;
  renderExperimentTable();
}

/* =====================================================
   6. DIAGNOSTIK LKPD & EKSPOR PDF A4
   ===================================================== */
function checkDiagnostic(qNum) {
  const inputEl = document.getElementById(`lkpd_q${qNum}`);
  const fbEl = document.getElementById(`diag_fb_${qNum}`);
  if (!inputEl || !fbEl) return;
  const raw = (inputEl.value || '').trim().toLowerCase();

  let isCorrect = false, msg = '';
  if (qNum === 5) {
    isCorrect = raw === '1' || raw.includes('satu');
    msg = isCorrect ? '✓ Tepat! Deret [1, 2, 4, 3, 5] hanya memerlukan 1 kali pertukaran antara nilai 4 dan 3.' : '✗ Kurang tepat. Perhatikan posisi angka 4 dan 3 pada deret [1, 2, 4, 3, 5].';
  } else if (qNum === 6) {
    isCorrect = raw === '7' || raw.includes('tujuh');
    msg = isCorrect ? '✓ Benar! Setelah Iterasi Pertama Bubble Sort selesai, angka 7 berada di ujung paling kanan.' : '✗ Belum tepat. Nilai terbesar akan mengapung ke ujung kanan di akhir iterasi pertama.';
  } else if (qNum === 7) {
    isCorrect = raw.includes('insertion');
    msg = isCorrect ? '✓ Tepat sekali! Insertion Sort bekerja dengan menyisipkan kartu satu per satu.' : '✗ Kurang tepat. Ingat istilah pengurutan dengan cara penyisipan (Insertion Sort).';
  } else if (qNum === 8) {
    isCorrect = raw === '5' || raw.includes('lima');
    msg = isCorrect ? '✓ Tepat! Dari bagian belum terurut (7, 6, 5), nilai terkecil yang diseleksi adalah 5.' : '✗ Belum tepat. Bandingkan angka di dalam (7, 6, 5)—manakah yang paling kecil?';
  }

  fbEl.className = `diag-feedback ${isCorrect ? 'correct' : 'wrong'}`;
  fbEl.textContent = msg;
  if (isCorrect) sfxSuccess(); else sfxError();
}

function exportLKPDToPDF() {
  try {
    sfxClick();
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('Pustaka jsPDF belum termuat. Pastikan koneksi internet aktif.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const studentName = (document.getElementById('studentName')?.value || '').trim() || 'Siswa_Tanpa_Nama';
    const studentClass = (document.getElementById('studentClass')?.value || '').trim() || 'X';
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    let y = 18;
    const leftMargin = 16;
    const maxWidth = 178;

    function checkPageBreak(extra = 12) {
      if (y + extra > 268) { doc.addPage(); y = 18; }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('LAPORAN PRAKTIKUM LAB MAYA INFORMATIKA KELAS X', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(11);
    doc.text('Topik: Algoritma Pencarian (Searching) & Pengurutan (Sorting)', 105, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('UPT SMA Negeri 12 Wajo — Pengembang: Andi Wahidin Burhanuddin', 105, y, { align: 'center' });
    y += 4;
    doc.line(leftMargin, y, leftMargin + maxWidth, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Nama Siswa : ${studentName}`, leftMargin, y);
    doc.text(`Tanggal : ${dateStr}`, 130, y);
    y += 6;
    doc.text(`Kelas      : ${studentClass}`, leftMargin, y);
    y += 8;

    doc.text('I. REKAPITULASI AKTIVITAS PRAKTIK & DIAGNOSTIK KESALAHAN TEKNIK SISWA', leftMargin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    if (experimentRecords.length === 0) {
      doc.text('- Belum ada rekaman aktivitas siswa yang dicatat pada sesi simulasi.', leftMargin, y);
      y += 7;
    } else {
      experimentRecords.forEach((rec) => {
        checkPageBreak(14);
        const line1 = `${rec.no}. ${rec.algo} | Awal: ${rec.initial} -> Akhir: ${rec.final} | Iterasi: ${rec.iterations}, Banding: ${rec.comparisons}, Tukar: ${rec.swaps} | Kesalahan: ${rec.errorCount} (Akurasi: ${rec.accuracy})`;
        const line2 = `   Rincian Diagnostik Kesalahan: ${rec.errorDetails}`;
        doc.setFont('helvetica', 'bold');
        const w1 = doc.splitTextToSize(line1, maxWidth);
        doc.text(w1, leftMargin, y);
        y += w1.length * 4.5;
        doc.setFont('helvetica', 'normal');
        const w2 = doc.splitTextToSize(line2, maxWidth);
        checkPageBreak(w2.length * 4.5 + 2);
        doc.text(w2, leftMargin, y);
        y += w2.length * 4.5 + 2.5;
      });
      y += 2;
    }

    const questions = [
      '1. Jelaskan 3 elemen formal pada masalah pencarian beserta alasan mengapa mencari buku di lemari yang sudah terurut lebih cepat dibandingkan yang berantakan!',
      '2. Berdasarkan aktivitas praktik Bubble Sort pada deret [2, 3, 7, 6, 5], jelaskan apa yang terjadi pada Iterasi Pertama dan Iterasi Kedua serta mengapa Iterasi 3 & 4 tidak boleh ditukar!',
      '3. Pada aktivitas praktik Insertion Sort untuk deret kartu [2, 3, 7, 6, 5], jelaskan proses penyisipan kartu 6 (Iterasi 3) dan kartu 5 (Iterasi 4)!',
      '4. Pada aktivitas praktik Selection Sort untuk deret (2, 3, 7, 6, 5), bagaimana perubahan isi Bagian Terurut dan Bagian Belum Terurut dari awal hingga selesai?',
      '5. Berapa kali pertukaran posisi yang diperlukan untuk mengurutkan deret [1, 2, 4, 3, 5] menjadi [1, 2, 3, 4, 5]?',
      '6. Pada Bubble Sort deret [2, 3, 7, 6, 5], berapakah nilai tertinggi yang menempati ujung kanan setelah Iterasi Pertama selesai?',
      '7. Algoritma pengurutan apakah yang bekerja dengan menyisipkan elemen ke-(i+1) ke posisi yang tepat seperti menyusun kartu?',
      '8. Pada tabel Selection Sort ketika Bagian Belum Terurut berisi (7, 6, 5), berapakah Nilai Terkecil yang wajib diseleksi?',
      '9. Bandingkan efisiensi ketiga algoritma pada deret hampir terurut [2, 3, 7, 6, 5] vs deret terbalik [9, 7, 5, 3, 1]!',
      '10. Buatlah kesimpulan akhir mengenai hubungan antara Pengurutan dan Pencarian serta refleksi dari catatan kesalahan teknik selama praktikum!'
    ];

    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('II. JAWABAN EVALUASI LKPD (NOMOR 1 - 10)', leftMargin, y);
    y += 6;

    for (let i = 1; i <= 10; i++) {
      checkPageBreak(18);
      const ans = (document.getElementById(`lkpd_q${i}`)?.value || '').trim() || '(Belum diisi)';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      const qLines = doc.splitTextToSize(questions[i - 1], maxWidth);
      doc.text(qLines, leftMargin, y);
      y += qLines.length * 4.5 + 1;

      doc.setFont('helvetica', 'normal');
      const aLines = doc.splitTextToSize(`Jawaban: ${ans}`, maxWidth - 4);
      checkPageBreak(aLines.length * 4.5 + 3);
      doc.text(aLines, leftMargin + 3, y);
      y += aLines.length * 4.5 + 3.5;
    }

    const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`LKPD_Searching_Sorting_${cleanName}.pdf`);
    sfxSuccess();
  } catch (err) {
    debugError('PDF', err);
    alert('Terjadi kendala saat mengekspor PDF.');
  }
}

/* =====================================================
   INISIALISASI APLIKASI
   ===================================================== */
function bootApp() {
  initBackgroundCanvas();
  selectMission(2);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
