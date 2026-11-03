/**
 * LAB MAYA ALGORITMA PENCARIAN (SEARCHING) & PENGURUTAN (SORTING)
 * Dilengkapi Mode Praktik Mandiri Siswa & Validator Kesalahan Iterasi/Teknik
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
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
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

function sfxClick() {
  playTone(580, 'triangle', 0.08, 0.07);
}

function sfxCompare() {
  playTone(510, 'sine', 0.1, 0.06);
}

function sfxSwap() {
  playTone(360, 'sawtooth', 0.11, 0.06);
  setTimeout(() => playTone(680, 'triangle', 0.14, 0.07), 65);
}

function sfxSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    setTimeout(() => playTone(n, 'triangle', 0.18, 0.09), idx * 85);
  });
}

function sfxError() {
  playTone(195, 'sawtooth', 0.26, 0.11);
  setTimeout(() => playTone(165, 'sawtooth', 0.24, 0.1), 110);
}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById('btnToggleSfx');
  const icon = document.getElementById('sfxIcon');
  btn.classList.toggle('active', sfxEnabled);
  icon.innerHTML = sfxEnabled ? '&#128266;' : '&#128263;';
  if (sfxEnabled) sfxClick();
}

function toggleBgm() {
  initAudioContext();
  bgmEnabled = !bgmEnabled;
  const btn = document.getElementById('btnToggleBgm');
  btn.classList.toggle('active', bgmEnabled);

  if (bgmEnabled) {
    const arpeggio = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];
    let step = 0;
    bgmInterval = setInterval(() => {
      if (!bgmEnabled || !audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(arpeggio[step % arpeggio.length], audioCtx.currentTime);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.44);
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
  const particles = Array.from({ length: 34 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    label: symbols[Math.floor(Math.random() * symbols.length)],
    size: 11 + Math.random() * 4
  }));

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.font = `bold ${p.size}px monospace`;
      ctx.fillText(p.label, p.x, p.y);

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.08 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
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
  const pctText = document.getElementById('loadingPercentText');
  const stepText = document.getElementById('loadingStepText');
  const nodes = document.querySelectorAll('.load-node');

  overlay.classList.add('active');
  let progress = 0;

  const messages = [
    'Mengalokasikan ruang pencarian & memori array...',
    'Menyiapkan validator teknik Bubble Sort [2, 3, 7, 6, 5]...',
    'Mengaktifkan pendeteksi penyisipan kartu Insertion Sort...',
    'Mengkalibrasi seleksi nilai minimum Selection Sort...',
    'Menghubungkan pencatat kesalahan siswa ke laporan PDF...'
  ];

  const timer = setInterval(() => {
    progress += 4;
    if (progress > 100) progress = 100;
    bar.style.width = `${progress}%`;
    pctText.textContent = `${progress}%`;

    const stageIdx = Math.min(Math.floor(progress / 21), 4);
    stepText.textContent = messages[stageIdx];
    nodes.forEach((n, idx) => {
      if (idx <= stageIdx) n.classList.add('lit');
    });

    if (progress % 20 === 0) playTone(420 + progress * 3, 'sine', 0.06, 0.04);

    if (progress >= 100) {
      clearInterval(timer);
      sfxSuccess();
      setTimeout(() => {
        overlay.classList.remove('active');
        document.getElementById('mainHeader').classList.remove('hidden');
        navigateTo('home');
      }, 300);
    }
  }, 45);
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
   4. MESIN PRAKTIK SORTING SISWA & PENCATAT KESALAHAN
   ===================================================== */
let currentMission = 1;
const completedMissions = new Set();
const experimentRecords = [];

let simState = {
  executionMode: 'practice', // 'practice' (siswa melakukan sendiri) atau 'demo'
  algo: 'bubble',
  initialArray: [2, 3, 7, 6, 5],
  currentArray: [2, 3, 7, 6, 5],

  // Telemetri & Pencatat Kesalahan Siswa
  iterations: 1,
  comparisons: 0,
  swaps: 0,
  correctActions: 0,
  errorCount: 0,
  errorList: [], // Menyimpan objek { iter, type, detail }
  finished: false,

  // State Khusus Praktik Mandiri Bubble Sort
  bubblePass: 1, // Iterasi 1 .. n-1
  bubbleJ: 0,    // Indeks pasangan j dan j+1 yang sedang dibandingkan

  // State Khusus Praktik Mandiri Insertion Sort
  insertionIter: 1, // Iterasi 1 .. n-1 (mengambil kartu ke-insertionIter)
  insertionCursor: 1, // Posisi kartu yang sedang disisipkan ke kiri

  // State Khusus Praktik Mandiri Selection Sort
  selectionI: 0, // Batas awal Bagian Belum Terurut (Iterasi = selectionI + 1)

  // State Khusus Searching
  searchCursor: 0,

  // Visual Highlight
  activeCompareIndices: [],
  activeCardIndex: null,
  activeSwapIndices: [],
  sortedIndices: [],
  wrongShakeIndices: [],
  partitionInfo: { sorted: '()', unsorted: '(2, 3, 7, 6, 5)', minVal: '-' },

  // Antrean untuk Mode Demo Otomatis
  stepsQueue: [],
  stepPointer: 0,
  autoTimer: null
};

const missionDescriptions = {
  1: '<strong>Target Misi 1 (Praktik Pencarian / Searching):</strong> Pilih mode <em>Searching</em>, periksa elemen dari kiri ke kanan dengan mengklik elemen sesuai urutan hingga angka target ditemukan, lalu klik <strong>Catat Data &amp; Verifikasi</strong>.',
  2: '<strong>Target Misi 2 (Praktik Mandiri Bubble Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Praktik Siswa</em>, lakukan perbandingan berdekatan pada deret <code>[2, 3, 7, 6, 5]</code> dengan menekan tombol <strong>Tukar Posisi</strong> atau <strong>Urutan Tetap</strong> hingga selesai, lalu klik <strong>Catat Data &amp; Verifikasi</strong>.',
  3: '<strong>Target Misi 3 (Praktik Mandiri Insertion Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Praktik Siswa</em>, sisipkan kartu ke-(i+1) pada deret <code>[2, 3, 7, 6, 5]</code> menggunakan tombol <strong>Tukar ke Kiri</strong> atau <strong>Posisi Sudah Tepat</strong>, lalu klik <strong>Catat Data &amp; Verifikasi</strong>.',
  4: '<strong>Target Misi 4 (Praktik Mandiri Selection Sort [2, 3, 7, 6, 5]):</strong> Dalam <em>Mode Praktik Siswa</em>, klik langsung <strong>bilangan terkecil</strong> pada <em>Bagian Belum Terurut</em> di setiap iterasi hingga selesai, lalu klik <strong>Catat Data &amp; Verifikasi</strong>.',
  5: '<strong>Target Misi 5 (Praktik Sorting Data Terbalik [9, 7, 5, 3, 1]):</strong> Pilih preset <code>[9, 7, 5, 3, 1]</code> dan selesaikan pengurutan menggunakan salah satu teknik (Bubble / Insertion / Selection), lalu klik <strong>Catat Data &amp; Verifikasi</strong>.'
};

function setExecutionMode(mode) {
  sfxClick();
  simState.executionMode = mode;
  document.getElementById('modeBtnPractice').classList.toggle('active', mode === 'practice');
  document.getElementById('modeBtnDemo').classList.toggle('active', mode === 'demo');

  document.getElementById('practiceDecisionPanel').classList.toggle('hidden', mode !== 'practice');
  document.getElementById('btnStep').classList.toggle('hidden', mode !== 'demo');
  document.getElementById('btnAuto').classList.toggle('hidden', mode !== 'demo');
  document.getElementById('speedControlWrap').classList.toggle('hidden', mode !== 'demo');

  resetSimulationState();
  debugLog('Mode', `Mode eksekusi diubah ke: ${mode}`);
}

function selectMission(mNum) {
  sfxClick();
  currentMission = mNum;
  document.querySelectorAll('.mission-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.mission) === mNum);
  });
  document.getElementById('missionStatusBadge').textContent = `Misi Aktif: #${mNum}`;
  document.getElementById('missionInstructionBox').innerHTML = missionDescriptions[mNum];

  const algoSelect = document.getElementById('simAlgoSelect');
  const presetSelect = document.getElementById('simPresetSelect');
  if (mNum === 1) {
    algoSelect.value = 'search_sorted';
    presetSelect.value = '2,3,7,6,5';
  } else if (mNum === 2) {
    algoSelect.value = 'bubble';
    presetSelect.value = '2,3,7,6,5';
  } else if (mNum === 3) {
    algoSelect.value = 'insertion';
    presetSelect.value = '2,3,7,6,5';
  } else if (mNum === 4) {
    algoSelect.value = 'selection';
    presetSelect.value = '2,3,7,6,5';
  } else if (mNum === 5) {
    algoSelect.value = 'bubble';
    presetSelect.value = '9,7,5,3,1';
  }
  handleAlgoChange();
}

function handleAlgoChange() {
  const algo = document.getElementById('simAlgoSelect').value;
  document.getElementById('searchTargetWrap').style.display = algo.startsWith('search_') ? 'block' : 'none';
  resetSimulationState();
}

function handlePresetChange() {
  sfxClick();
  resetSimulationState();
}

function getSelectedPresetArray() {
  const val = document.getElementById('simPresetSelect').value;
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
  const btnAuto = document.getElementById('btnAuto');
  if (btnAuto) btnAuto.innerHTML = '&#9654; Jalankan Demo Otomatis';
}

function resetSimulationState() {
  stopAutoPlay();
  const algo = document.getElementById('simAlgoSelect').value;
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

  // Reset pointer praktik mandiri
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

  // Siapkan antrean demo jika siswa beralih ke mode Demo
  simState.stepsQueue = buildAlgorithmSteps(algo, base);
  simState.stepPointer = 0;

  const modeLabels = {
    bubble: 'TEKNIK BUBBLE SORT (GELEMBUNG BERDEKATAN)',
    insertion: 'TEKNIK INSERTION SORT (PENYISIPAN KARTU)',
    selection: 'TEKNIK SELECTION SORT (SELEKSI NILAI TERKECIL)',
    search_unsorted: 'TEKNIK SEARCHING — RUANG DATA ACAK',
    search_sorted: 'TEKNIK SEARCHING — RUANG DATA TERURUT'
  };
  document.getElementById('stageModeLabel').textContent = modeLabels[algo] || 'SIMULASI';

  // Atur visibilitas tombol aksi praktik sesuai algoritma
  document.getElementById('bubbleActionGroup').classList.toggle('hidden', algo !== 'bubble');
  document.getElementById('insertionActionGroup').classList.toggle('hidden', algo !== 'insertion');
  document.getElementById('clickElementHintGroup').classList.toggle(
    'hidden',
    algo !== 'selection' && !algo.startsWith('search_')
  );
  document.getElementById('selectionPartitionBox').classList.toggle('hidden', algo !== 'selection');

  hideInstantFeedback();
  clearStepLog();
  renderErrorLog();
  appendStepLog(`Sesi dimulai dengan deret awal [${base.join(', ')}].`);

  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

/**
 * Mengatur sorotan (highlight) pasangan elemen dan kalimat instruksi langkah praktik siswa
 */
function syncPracticeHighlightsAndPrompt() {
  const arr = simState.currentArray;
  const n = arr.length;
  const promptBox = document.getElementById('studentPromptBox');
  const iterBadge = document.getElementById('stageIterBadge');

  if (simState.finished) {
    iterBadge.textContent = 'Selesai ✓';
    promptBox.innerHTML = `&#127881; <strong>Praktik Selesai!</strong> Deret akhir: <code>[${arr.join(', ')}]</code>. Total kesalahan teknik Anda: <strong>${simState.errorCount}</strong>. Klik tombol <strong>"Catat Data &amp; Verifikasi"</strong> di panel kanan!`;
    return;
  }

  if (simState.executionMode === 'demo') {
    iterBadge.textContent = `Iterasi Ke-${simState.iterations}`;
    promptBox.innerHTML = `<strong>Mode Demonstrasi Aktif:</strong> Tekan tombol <em>Langkah Demo Berikutnya</em> atau <em>Jalankan Demo Otomatis</em> di bawah.`;
    return;
  }

  if (simState.algo === 'bubble') {
    const pass = simState.bubblePass;
    const j = simState.bubbleJ;
    simState.iterations = pass;
    simState.activeCompareIndices = [j, j + 1];
    simState.activeCardIndex = null;
    simState.sortedIndices = Array.from({ length: pass - 1 }, (_, k) => n - 1 - k);

    iterBadge.textContent = `Iterasi Ke-${pass} (Banding ke-${j + 1} dari ${n - pass})`;
    promptBox.innerHTML = `<strong>Langkah Bubble Sort (Iterasi ${pass}):</strong> Bandingkan elemen berdekatan pada indeks <strong>[${j + 1}] (nilai ${arr[j]})</strong> dan <strong>[${j + 2}] (nilai ${arr[j + 1]})</strong>. Apakah perlu ditukar atau tetap? Pilih tombol di bawah atau klik salah satu dari kedua elemen tersebut!`;
  } else if (simState.algo === 'insertion') {
    const iter = simState.insertionIter;
    const cur = simState.insertionCursor;
    simState.iterations = iter;
    simState.activeCardIndex = cur;
    simState.activeCompareIndices = cur > 0 ? [cur - 1, cur] : [cur];
    simState.sortedIndices = [];

    iterBadge.textContent = `Iterasi Ke-${iter} (Kartu ke-${iter + 1})`;
    const cardVal = arr[cur];
    const leftVal = arr[cur - 1];
    promptBox.innerHTML = `<strong>Langkah Insertion Sort (Iterasi ${iter}):</strong> Kartu yang sedang disisipkan berada di indeks <strong>[${cur + 1}] (nilai ${cardVal})</strong>, dibandingkan dengan bilangan di sebelah kirinya yaitu indeks <strong>[${cur}] (nilai ${leftVal})</strong>. Apakah kartu <strong>${cardVal}</strong> perlu ditukar ke kiri atau posisinya sudah tepat?`;
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

    iterBadge.textContent = `Iterasi Ke-${iter}`;
    promptBox.innerHTML = `<strong>Langkah Selection Sort (Iterasi ${iter}):</strong> Perhatikan <em>Bagian Belum Terurut</em> pada indeks <strong>[${i + 1}] s.d. [${n}]</strong> yaitu <code>(${unsortedPart.join(', ')})</code>. <strong>Klik langsung pada elemen dengan NILAI TERKECIL</strong> dari bagian belum terurut tersebut!`;
  } else if (simState.algo.startsWith('search_')) {
    const target = Number(document.getElementById('searchTargetInput').value) || 6;
    const cur = simState.searchCursor;
    simState.iterations = cur + 1;
    simState.activeCompareIndices = [cur];
    iterBadge.textContent = `Pengecekan Ke-${cur + 1}`;
    promptBox.innerHTML = `<strong>Langkah Pencarian (Searching):</strong> Kriteria angka yang dicari adalah <strong>${target}</strong>. Klik elemen pada indeks <strong>[${cur + 1}]</strong> untuk memeriksa apakah nilainya memenuhi kriteria pencarian!`;
  }
}

/**
 * Mencatat kesalahan iterasi / teknik sorting yang dilakukan siswa
 */
function recordStudentError(errorType, detailMessage, wrongIndices = []) {
  simState.errorCount++;
  const entry = {
    iter: simState.iterations,
    type: errorType,
    detail: detailMessage
  };
  simState.errorList.unshift(entry);
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

  debugLog('ValidasiKesalahan', `${errorType} - ${detailMessage}`);
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
  const box = document.getElementById('instantStepFeedback');
  if (box) box.classList.add('hidden');
}

function computeAccuracyPercent() {
  const totalAttempts = simState.correctActions + simState.errorCount;
  if (totalAttempts === 0) return 100;
  return Math.round((simState.correctActions / totalAttempts) * 100);
}

/* =====================================================
   LOGIKA VALIDASI PRAKTIK SISWA: BUBBLE SORT
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
        `Pada Iterasi ${pass}, Anda memilih TUKAR pada pasangan (${leftVal}, ${rightVal}), padahal ${leftVal} ≤ ${rightVal} sehingga urutannya sudah benar (tetap).`,
        [j, j + 1]
      );
    } else {
      recordStudentError(
        'Terlewat Tukar Bubble Sort',
        `Pada Iterasi ${pass}, Anda memilih TETAP pada pasangan (${leftVal}, ${rightVal}), padahal ${leftVal} > ${rightVal} sehingga wajib ditukar agar bilangan lebih besar naik ke kanan.`,
        [j, j + 1]
      );
    }
    return;
  }

  // Langkah Siswa Benar
  simState.comparisons++;
  if (shouldSwap) {
    arr[j] = rightVal;
    arr[j + 1] = leftVal;
    simState.swaps++;
    simState.activeSwapIndices = [j, j + 1];
    sfxSwap();
    recordStudentSuccessStep(
      `Iterasi ${pass}: Tepat! Karena ${leftVal} > ${rightVal}, posisi ditukar menjadi [${arr.join(', ')}].`
    );
  } else {
    simState.activeSwapIndices = [];
    sfxCompare();
    recordStudentSuccessStep(
      `Iterasi ${pass}: Tepat! Karena ${leftVal} ≤ ${rightVal}, posisi tetap [${arr.join(', ')}].`
    );
  }

  // Lanjut ke pasangan berikutnya dalam iterasi yang sama atau naik iterasi
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

/* =====================================================
   LOGIKA VALIDASI PRAKTIK SISWA: INSERTION SORT
   ===================================================== */
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
      `Pada Iterasi ${iter}, kartu ${cardVal} tidak lebih kecil daripada bilangan di kirinya (${leftVal}). Kartu ${cardVal} tidak boleh ditukar melewati ${leftVal}!`,
      [cur - 1, cur]
    );
    return;
  }

  if (decision === 'place_here' && shouldSwapLeft) {
    recordStudentError(
      'Berhenti Terlalu Cepat (Insertion Sort)',
      `Pada Iterasi ${iter}, bilangan di sebelah kiri (${leftVal}) masih lebih besar daripada kartu ${cardVal}. Anda wajib menukar/menggeser kartu ${cardVal} ke kiri terlebih dahulu!`,
      [cur - 1, cur]
    );
    return;
  }

  // Langkah Siswa Benar
  simState.comparisons++;
  if (decision === 'swap_left') {
    arr[cur - 1] = cardVal;
    arr[cur] = leftVal;
    simState.swaps++;
    simState.insertionCursor--;
    sfxSwap();
    recordStudentSuccessStep(
      `Iterasi ${iter}: Tepat! Karena ${cardVal} < ${leftVal}, kartu ${cardVal} ditukar ke kiri menjadi [${arr.join(', ')}].`
    );

    // Jika sudah sampai di ujung paling kiri (indeks 0), otomatis lanjut ke iterasi berikutnya
    if (simState.insertionCursor === 0) {
      advanceInsertionNextCard(n);
    }
  } else {
    sfxCompare();
    recordStudentSuccessStep(
      `Iterasi ${iter}: Tepat! Karena ${cardVal} ≥ ${leftVal}, kartu ${cardVal} sudah berada pada posisi yang benar.`
    );
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

/* =====================================================
   LOGIKA KLIK ELEMEN OLEH SISWA (SELECTION, BUBBLE, INSERTION, SEARCHING)
   ===================================================== */
function handleElementClickInPractice(clickedIdx) {
  if (simState.finished) return;

  if (simState.executionMode === 'demo') {
    sfxClick();
    return;
  }

  const arr = simState.currentArray;
  const n = arr.length;

  // 1. Jika sedang praktik Selection Sort
  if (simState.algo === 'selection') {
    const i = simState.selectionI;
    const iter = i + 1;

    if (clickedIdx < i) {
      recordStudentError(
        'Pelanggaran Partisi Selection Sort',
        `Pada Iterasi ${iter}, Anda mengklik indeks [${clickedIdx + 1}] (nilai ${arr[clickedIdx]}) yang sudah berada di Bagian Terurut! Pilihlah dari Bagian Belum Terurut [${i + 1}..${n}].`,
        [clickedIdx]
      );
      return;
    }

    // Cari nilai terkecil di Bagian Belum Terurut [i .. n-1]
    const unsortedSlice = arr.slice(i);
    const minVal = Math.min(...unsortedSlice);
    const clickedVal = arr[clickedIdx];

    if (clickedVal !== minVal) {
      recordStudentError(
        'Salah Seleksi Nilai Terkecil',
        `Pada Iterasi ${iter}, Anda memilih angka ${clickedVal} pada Bagian Belum Terurut (${unsortedSlice.join(', ')}), padahal nilai terkecil yang seharusnya diseleksi adalah ${minVal}!`,
        [clickedIdx]
      );
      return;
    }

    // Siswa memilih nilai terkecil dengan benar!
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
    const unsortedNow = arr.slice(simState.selectionI);

    recordStudentSuccessStep(
      `Iterasi ${iter}: Tepat! Nilai terkecil ${minVal} diseleksi ke Bagian Terurut menjadi (${sortedNow.join(', ')}).`
    );

    if (simState.selectionI >= n) {
      simState.finished = true;
      simState.sortedIndices = arr.map((_, idx) => idx);
      simState.partitionInfo = {
        sorted: `(${arr.join(', ')})`,
        unsorted: '()',
        minVal
      };
      sfxSuccess();
    } else {
      syncPracticeHighlightsAndPrompt();
      simState.partitionInfo.minVal = minVal;
    }
    renderSimulationStage();
    return;
  }

  // 2. Jika sedang praktik Bubble Sort dan siswa mengklik salah satu elemen di luar pasangan aktif
  if (simState.algo === 'bubble') {
    const j = simState.bubbleJ;
    if (clickedIdx !== j && clickedIdx !== j + 1) {
      recordStudentError(
        'Salah Urutan Indeks Bubble Sort',
        `Pada Iterasi ${simState.bubblePass}, pasangan berdekatan yang wajib dibandingkan saat ini adalah indeks [${j + 1}] dan [${j + 2}], bukan indeks [${clickedIdx + 1}]!`,
        [clickedIdx]
      );
      return;
    }
    // Jika mengklik pasangan aktif, bantu beri tahu untuk menggunakan tombol keputusan
    sfxClick();
    showInstantFeedback(
      true,
      `Indeks [${j + 1}] (${arr[j]}) & [${j + 2}] (${arr[j + 1]}) sedang dibandingkan. Tekan tombol "Tukar Posisi" atau "Urutan Tetap" di bawah!`
    );
    return;
  }

  // 3. Jika sedang praktik Insertion Sort dan siswa mengklik elemen yang salah
  if (simState.algo === 'insertion') {
    const cur = simState.insertionCursor;
    if (clickedIdx !== cur && clickedIdx !== cur - 1) {
      recordStudentError(
        'Salah Pilih Kartu Insertion Sort',
        `Pada Iterasi ${simState.insertionIter}, kartu yang sedang disisipkan adalah indeks [${cur + 1}] (nilai ${arr[cur]}) terhadap indeks [${cur}] (nilai ${arr[cur - 1]}), bukan indeks [${clickedIdx + 1}]!`,
        [clickedIdx]
      );
      return;
    }
    sfxClick();
    showInstantFeedback(
      true,
      `Gunakan tombol "Tukar / Geser Kartu ke Kiri" atau "Posisi Sudah Tepat" di bawah untuk menyisipkan kartu ${arr[cur]}!`
    );
    return;
  }

  // 4. Jika sedang praktik Pencarian (Searching)
  if (simState.algo.startsWith('search_')) {
    const target = Number(document.getElementById('searchTargetInput').value) || 6;
    const expectedIdx = simState.searchCursor;

    if (clickedIdx !== expectedIdx) {
      recordStudentError(
        'Pengecekan Pencarian Melompat',
        `Strategi pencarian berurutan memeriksa dari indeks [${expectedIdx + 1}] terlebih dahulu, tetapi Anda melompat ke indeks [${clickedIdx + 1}]!`,
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
      recordStudentSuccessStep(
        `Langkah ${clickedIdx + 1}: Indeks [${clickedIdx + 1}] bernilai ${val} == Kriteria (${target}). Objek DITEMUKAN!`
      );
    } else if (simState.algo === 'search_sorted' && val > target) {
      simState.finished = true;
      sfxSuccess();
      recordStudentSuccessStep(
        `Langkah ${clickedIdx + 1}: Indeks [${clickedIdx + 1}] bernilai ${val} > ${target}. Karena data terurut, pencarian selesai (target tidak ada di kanan).`
      );
    } else {
      sfxCompare();
      recordStudentSuccessStep(
        `Langkah ${clickedIdx + 1}: Indeks [${clickedIdx + 1}] bernilai ${val} != Kriteria (${target}). Lanjut ke indeks berikutnya.`
      );
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
      const h = 42 + Math.round((val / maxVal) * 85);
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
    document.getElementById('spSortedText').textContent = simState.partitionInfo.sorted;
    document.getElementById('spUnsortedText').textContent = simState.partitionInfo.unsorted;
    document.getElementById('spMinText').textContent = simState.partitionInfo.minVal;
  }

  document.getElementById('metricIteration').textContent = simState.iterations;
  document.getElementById('metricComparisons').textContent = simState.comparisons;
  document.getElementById('metricSwaps').textContent = simState.swaps;
  document.getElementById('metricErrors').textContent = simState.errorCount;
  document.getElementById('metricAccuracy').textContent = `${computeAccuracyPercent()}%`;

  const statusEl = document.getElementById('metricStatus');
  if (simState.finished) {
    statusEl.textContent = simState.algo.startsWith('search_') ? 'Selesai Cari' : 'Terurut Menaik';
    statusEl.className = 'm-val status-done';
  } else {
    statusEl.textContent = simState.executionMode === 'practice' ? 'Praktik Siswa' : 'Mode Demo';
    statusEl.className = 'm-val status-wait';
  }

  document.getElementById('summaryInitial').textContent = `[${simState.initialArray.join(', ')}]`;
  document.getElementById('summaryCurrent').textContent = `[${simState.currentArray.join(', ')}]`;
}

function renderErrorLog() {
  const ul = document.getElementById('studentErrorLog');
  const badge = document.getElementById('errorCountBadge');
  if (!ul || !badge) return;

  badge.textContent = simState.errorCount;
  if (simState.errorList.length === 0) {
    ul.innerHTML = `<li class="no-err-item">&#10004; Belum ada kesalahan teknik yang tercatat pada sesi ini.</li>`;
    return;
  }

  ul.innerHTML = simState.errorList
    .map(
      (err, idx) =>
        `<li><strong>#${simState.errorList.length - idx} [Iterasi ${err.iter} — ${err.type}]:</strong> ${err.detail}</li>`
    )
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
   MODE DEMONSTRASI OTOMATIS (UNTUK PERBANDINGAN)
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
        const a = arr[j];
        const b = arr[j + 1];
        steps.push({
          type: 'compare',
          iter,
          compCount,
          swapCount,
          arraySnapshot: [...arr],
          compareIndices: [j, j + 1],
          swapIndices: [],
          sortedIndices: Array.from({ length: iter - 1 }, (_, k) => n - 1 - k),
          message: `Demo Iterasi ${iter}: Bandingkan [${j + 1}]=${a} dan [${j + 2}]=${b}.`
        });
        if (a > b) {
          arr[j] = b;
          arr[j + 1] = a;
          swapCount++;
          steps.push({
            type: 'swap',
            iter,
            compCount,
            swapCount,
            arraySnapshot: [...arr],
            compareIndices: [],
            swapIndices: [j, j + 1],
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
          type: 'compare',
          iter,
          compCount,
          swapCount,
          arraySnapshot: [...arr],
          compareIndices: [curIdx - 1, curIdx],
          swapIndices: [],
          sortedIndices: [],
          message: `Demo Iterasi ${iter}: Bandingkan kartu ${pickedVal} dengan ${leftVal}.`
        });
        if (leftVal > arr[curIdx]) {
          arr[curIdx - 1] = arr[curIdx];
          arr[curIdx] = leftVal;
          swapCount++;
          steps.push({
            type: 'swap',
            iter,
            compCount,
            swapCount,
            arraySnapshot: [...arr],
            compareIndices: [],
            swapIndices: [curIdx - 1, curIdx],
            sortedIndices: [],
            message: `Demo Iterasi ${iter}: Geser ${pickedVal} ke kiri menjadi [${arr.join(', ')}].`
          });
          curIdx--;
        } else {
          break;
        }
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
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        swapCount++;
      }
      steps.push({
        type: 'swap',
        iter,
        compCount,
        swapCount,
        arraySnapshot: [...arr],
        compareIndices: [],
        swapIndices: [i, minIdx],
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
    const target = Number(document.getElementById('searchTargetInput').value) || 6;
    for (let i = 0; i < n; i++) {
      compCount++;
      const match = arr[i] === target;
      steps.push({
        type: match ? 'swap' : 'compare',
        iter: i + 1,
        compCount,
        swapCount: 0,
        arraySnapshot: [...arr],
        compareIndices: [i],
        swapIndices: match ? [i] : [],
        sortedIndices: match ? [i] : [],
        message: match
          ? `Demo Langkah ${i + 1}: Indeks [${i + 1}]=${arr[i]} cocok dengan target ${target}!`
          : `Demo Langkah ${i + 1}: Indeks [${i + 1}]=${arr[i]} != ${target}.`
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
  if (step.type === 'swap') sfxSwap();
  else sfxCompare();

  if (simState.stepPointer >= simState.stepsQueue.length) {
    simState.finished = true;
    if (!simState.algo.startsWith('search_')) {
      simState.sortedIndices = simState.currentArray.map((_, i) => i);
    }
    sfxSuccess();
  }
  syncPracticeHighlightsAndPrompt();
  renderSimulationStage();
}

function toggleAutoPlay() {
  sfxClick();
  if (simState.autoTimer) {
    stopAutoPlay();
    return;
  }
  if (simState.finished) resetSimulationState();
  const speed = Number(document.getElementById('speedRange').value) || 750;
  document.getElementById('btnAuto').innerHTML = '&#9208; Jeda Demo';
  simState.autoTimer = setInterval(stepSimulation, speed);
}

/* =====================================================
   5. PENCATATAN TABEL PERCOBAAN BESERTA KESALAHAN SISWA
   ===================================================== */
function recordAndVerifyExperiment() {
  const fb = document.getElementById('verifyFeedbackBox');
  fb.classList.remove('hidden', 'ok', 'warn');

  const algoNames = {
    bubble: 'Bubble Sort',
    insertion: 'Insertion Sort',
    selection: 'Selection Sort',
    search_unsorted: 'Searching (Acak)',
    search_sorted: 'Searching (Terurut)'
  };

  const errorSummary =
    simState.errorList.length === 0
      ? '0 Kesalahan (Sempurna)'
      : simState.errorList.map((e) => `[Iter ${e.iter}] ${e.type}: ${e.detail}`).join(' | ');

  const record = {
    no: experimentRecords.length + 1,
    algo: `${algoNames[simState.algo] || simState.algo} (${simState.executionMode === 'practice' ? 'Praktik' : 'Demo'})`,
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

  if (currentMission === 1 && simState.algo.startsWith('search_') && simState.finished) {
    missionPassed = true;
  } else if (currentMission === 2 && simState.algo === 'bubble' && initStr === '2,3,7,6,5' && simState.finished) {
    missionPassed = true;
  } else if (currentMission === 3 && simState.algo === 'insertion' && initStr === '2,3,7,6,5' && simState.finished) {
    missionPassed = true;
  } else if (currentMission === 4 && simState.algo === 'selection' && initStr === '2,3,7,6,5' && simState.finished) {
    missionPassed = true;
  } else if (currentMission === 5 && initStr === '9,7,5,3,1' && simState.finished) {
    missionPassed = true;
  }

  if (missionPassed) {
    completedMissions.add(currentMission);
    const btn = document.querySelector(`.mission-btn[data-mission="${currentMission}"]`);
    if (btn) {
      btn.classList.add('done');
      if (!btn.textContent.includes('✓')) btn.textContent += ' ✓';
    }
    sfxSuccess();
    fb.classList.add('ok');
    fb.innerHTML = `&#9989; <strong>Data &amp; Catatan Kesalahan (${simState.errorCount} kesalahan, Akurasi ${record.accuracy}) berhasil direkam! Misi #${currentMission} Tuntas!</strong>`;
  } else {
    sfxClick();
    fb.classList.add('warn');
    fb.innerHTML = `&#128221; <strong>Data &amp; Catatan Kesalahan (${simState.errorCount} kesalahan) berhasil dimasukkan ke Tabel!</strong> Selesaikan pengurutan sesuai instruksi misi untuk menandai Misi #${currentMission} tuntas.`;
  }
}

function renderExperimentTable() {
  const tbody = document.getElementById('experimentTableBody');
  if (!tbody) return;
  if (experimentRecords.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">Belum ada data percobaan yang dicatat. Lakukan praktik sorting di atas lalu klik <strong>"Catat Data &amp; Verifikasi"</strong>.</td></tr>`;
    return;
  }

  tbody.innerHTML = experimentRecords
    .map(
      (r) => `
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
    `
    )
    .join('');
}

function clearExperimentTable() {
  sfxClick();
  experimentRecords.length = 0;
  renderExperimentTable();
}

/* =====================================================
   6. DIAGNOSTIK LKPD & EKSPOR PDF A4 BESERTA LOG KESALAHAN
   ===================================================== */
function checkDiagnostic(qNum) {
  const inputEl = document.getElementById(`lkpd_q${qNum}`);
  const fbEl = document.getElementById(`diag_fb_${qNum}`);
  const raw = (inputEl.value || '').trim().toLowerCase();

  let isCorrect = false;
  let msg = '';

  if (qNum === 5) {
    isCorrect = raw === '1' || raw.includes('satu');
    msg = isCorrect
      ? '✓ Tepat! Deret [1, 2, 4, 3, 5] hanya memerlukan 1 kali pertukaran antara nilai 4 dan 3.'
      : '✗ Kurang tepat. Perhatikan posisi angka 4 dan 3 pada deret [1, 2, 4, 3, 5] (Buku hal. 82).';
  } else if (qNum === 6) {
    isCorrect = raw === '7' || raw.includes('tujuh');
    msg = isCorrect
      ? '✓ Benar! Setelah Iterasi Pertama Bubble Sort selesai, bilangan tertinggi yaitu 7 berada di ujung paling kanan [2, 3, 6, 5, 7].'
      : '✗ Belum tepat. Ingat prinsip Bubble Sort: nilai terbesar akan mengapung ke ujung kanan di akhir iterasi pertama.';
  } else if (qNum === 7) {
    isCorrect = raw.includes('insertion');
    msg = isCorrect
      ? '✓ Tepat sekali! Insertion Sort bekerja dengan menyisipkan (insertion) kartu satu per satu ke posisi yang benar.'
      : '✗ Kurang tepat. Ingat istilah bahasa Inggris untuk pengurutan dengan cara penyisipan (Buku hal. 86-88).';
  } else if (qNum === 8) {
    isCorrect = raw === '5' || raw.includes('lima');
    msg = isCorrect
      ? '✓ Tepat! Dari bagian belum terurut (7, 6, 5), nilai terkecil yang diseleksi adalah 5 (Buku hal. 89).'
      : '✗ Belum tepat. Bandingkan angka di dalam (7, 6, 5)—manakah bilangan yang paling kecil?';
  }

  fbEl.className = `diag-feedback ${isCorrect ? 'correct' : 'wrong'}`;
  fbEl.textContent = msg;
  if (isCorrect) sfxSuccess();
  else sfxError();
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

    const studentName = document.getElementById('studentName').value.trim() || 'Siswa_Tanpa_Nama';
    const studentClass = document.getElementById('studentClass').value.trim() || 'X';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let y = 18;
    const leftMargin = 16;
    const maxWidth = 178;

    function checkPageBreak(extraHeight = 12) {
      if (y + extraHeight > 268) {
        doc.addPage();
        y = 18;
      }
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
    doc.setLineWidth(0.5);
    doc.line(leftMargin, y, leftMargin + maxWidth, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Nama Siswa : ${studentName}`, leftMargin, y);
    doc.text(`Tanggal : ${dateStr}`, 130, y);
    y += 6;
    doc.text(`Kelas      : ${studentClass}`, leftMargin, y);
    y += 8;

    // Bagian I: Rekap Tabel Percobaan & Diagnostik Kesalahan Siswa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('I. REKAPITULASI DATA PERCOBAAN & DIAGNOSTIK KESALAHAN TEKNIK SISWA', leftMargin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    if (experimentRecords.length === 0) {
      doc.text('- Belum ada rekaman tabel percobaan yang dicatat pada sesi simulasi.', leftMargin, y);
      y += 7;
    } else {
      experimentRecords.forEach((rec) => {
        checkPageBreak(14);
        const line1 = `${rec.no}. ${rec.algo} | Awal: ${rec.initial} -> Akhir: ${rec.final} | Iterasi: ${rec.iterations}, Banding: ${rec.comparisons}, Tukar: ${rec.swaps} | Kesalahan: ${rec.errorCount} (Akurasi: ${rec.accuracy})`;
        const line2 = `   Rincian Diagnostik Kesalahan: ${rec.errorDetails}`;
        const wrap1 = doc.splitTextToSize(line1, maxWidth);
        doc.setFont('helvetica', 'bold');
        doc.text(wrap1, leftMargin, y);
        y += wrap1.length * 4.5;

        doc.setFont('helvetica', 'normal');
        const wrap2 = doc.splitTextToSize(line2, maxWidth);
        checkPageBreak(wrap2.length * 4.5 + 2);
        doc.text(wrap2, leftMargin, y);
        y += wrap2.length * 4.5 + 2.5;
      });
      y += 2;
    }

    const questions = [
      {
        no: 1,
        q: 'Jelaskan 3 elemen formal pada masalah pencarian beserta alasan mengapa mencari buku di lemari yang sudah terurut lebih cepat dibandingkan yang berantakan!',
        a: document.getElementById('lkpd_q1').value.trim() || '(Belum diisi)'
      },
      {
        no: 2,
        q: 'Berdasarkan praktik Bubble Sort pada deret [2, 3, 7, 6, 5], jelaskan apa yang terjadi pada Iterasi Pertama dan Iterasi Kedua serta mengapa Iterasi 3 & 4 tidak boleh ditukar!',
        a: document.getElementById('lkpd_q2').value.trim() || '(Belum diisi)'
      },
      {
        no: 3,
        q: 'Pada praktik Insertion Sort untuk deret kartu [2, 3, 7, 6, 5], jelaskan proses penyisipan kartu 6 (Iterasi 3) dan kartu 5 (Iterasi 4) serta kesalahan yang perlu dihindari!',
        a: document.getElementById('lkpd_q3').value.trim() || '(Belum diisi)'
      },
      {
        no: 4,
        q: 'Pada praktik Selection Sort untuk deret (2, 3, 7, 6, 5), bagaimana perubahan isi Bagian Terurut, Bagian Belum Terurut, dan Nilai Terkecil di tiap tahap?',
        a: document.getElementById('lkpd_q4').value.trim() || '(Belum diisi)'
      },
      {
        no: 5,
        q: 'Berapa kali pertukaran posisi yang diperlukan untuk mengurutkan deret [1, 2, 4, 3, 5] menjadi [1, 2, 3, 4, 5]?',
        a: document.getElementById('lkpd_q5').value.trim() || '(Belum diisi)'
      },
      {
        no: 6,
        q: 'Pada Bubble Sort deret [2, 3, 7, 6, 5], berapakah nilai tertinggi yang menempati ujung kanan setelah Iterasi Pertama selesai?',
        a: document.getElementById('lkpd_q6').value.trim() || '(Belum diisi)'
      },
      {
        no: 7,
        q: 'Algoritma pengurutan apakah yang bekerja dengan menyisipkan elemen ke-(i+1) ke posisi yang tepat seperti menyusun kartu?',
        a: document.getElementById('lkpd_q7').value.trim() || '(Belum diisi)'
      },
      {
        no: 8,
        q: 'Pada tabel Selection Sort ketika Bagian Belum Terurut berisi (7, 6, 5), berapakah Nilai Terkecil yang diseleksi?',
        a: document.getElementById('lkpd_q8').value.trim() || '(Belum diisi)'
      },
      {
        no: 9,
        q: 'Bandingkan efisiensi ketiga algoritma pada deret hampir terurut [2, 3, 7, 6, 5] vs deret terbalik [9, 7, 5, 3, 1]!',
        a: document.getElementById('lkpd_q9').value.trim() || '(Belum diisi)'
      },
      {
        no: 10,
        q: 'Buatlah kesimpulan akhir mengenai hubungan antara Pengurutan dan Pencarian serta evaluasi dari catatan kesalahan teknik selama praktikum!',
        a: document.getElementById('lkpd_q10').value.trim() || '(Belum diisi)'
      }
    ];

    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('II. JAWABAN EVALUASI LKPD (NOMOR 1 - 10)', leftMargin, y);
    y += 6;

    questions.forEach((item) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const qLines = doc.splitTextToSize(`${item.no}. ${item.q}`, maxWidth);
      doc.text(qLines, leftMargin, y);
      y += qLines.length * 4.5 + 1.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      const aLines = doc.splitTextToSize(`Jawaban: ${item.a}`, maxWidth - 4);
      checkPageBreak(aLines.length * 4.5 + 4);
      doc.text(aLines, leftMargin + 3, y);
      y += aLines.length * 4.5 + 4;
    });

    const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`LKPD_Searching_Sorting_${cleanName}.pdf`);
    sfxSuccess();
  } catch (err) {
    debugError('PDF', err);
    alert('Terjadi kendala saat membuat PDF.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  selectMission(1);
});
