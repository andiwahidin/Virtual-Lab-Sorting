/**
 * LAB MAYA ALGORITMA PENCARIAN (SEARCHING) & PENGURUTAN (SORTING)
 * Mata Pelajaran: Informatika Kelas X (Bab 2 Algoritma dan Struktur Data)
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
   1. WEB AUDIO API SYNTHESIZER (SFX & BGM)
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
      debugLog('Audio', 'AudioContext berhasil dibuat.');
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
  playTone(480, 'sine', 0.1, 0.06);
}

function sfxSwap() {
  playTone(340, 'sawtooth', 0.12, 0.06);
  setTimeout(() => playTone(660, 'triangle', 0.14, 0.07), 70);
}

function sfxSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    setTimeout(() => playTone(n, 'triangle', 0.18, 0.09), idx * 90);
  });
}

function sfxError() {
  playTone(210, 'sawtooth', 0.22, 0.09);
}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById('btnToggleSfx');
  const icon = document.getElementById('sfxIcon');
  btn.classList.toggle('active', sfxEnabled);
  icon.innerHTML = sfxEnabled ? '&#128266;' : '&#128263;';
  if (sfxEnabled) sfxClick();
  debugLog('Audio', `SFX diubah ke: ${sfxEnabled}`);
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
    debugLog('Audio', 'BGM Ambient dimulai.');
  } else {
    clearInterval(bgmInterval);
    bgmInterval = null;
    debugLog('Audio', 'BGM Ambient dihentikan.');
  }
}

/* =====================================================
   2. ANIMASI LATAR CANVAS 2D (NODE & BIT KOMPUTASI)
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

  const symbols = ['0', '1', '[2]', '[3]', '[5]', '[6]', '[7]', '<>', '=='];
  const particles = Array.from({ length: 34 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
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
        if (dist < 135) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.09 * (1 - dist / 135)})`;
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
   3. NAVIGASI 7 LAYAR & OVERLAY LOADING
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
    'Mengalokasikan ruang pencarian & kriteria objek...',
    'Memuat komparator algoritma Bubble Sort [2, 3, 7, 6, 5]...',
    'Menyiapkan modul penyisipan kartu Insertion Sort...',
    'Mengkalibrasi partisi terurut Selection Sort...',
    'Menghubungkan Tabel Percobaan & generator PDF A4...'
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
      }, 320);
    }
  }, 45);
}

function navigateTo(viewName) {
  sfxClick();
  const views = document.querySelectorAll('.view');
  views.forEach((v) => v.classList.remove('active'));

  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === viewName);
  });

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
  debugLog('Teori', `Tab algoritma dipilih: ${tabKey}`);
}

/* =====================================================
   4. MESIN SIMULASI SEARCHING & SORTING
   ===================================================== */
let currentMission = 1;
const completedMissions = new Set();
const experimentRecords = [];

let simState = {
  algo: 'bubble',
  initialArray: [2, 3, 7, 6, 5],
  currentArray: [2, 3, 7, 6, 5],
  stepsQueue: [],
  stepPointer: 0,
  iterations: 0,
  comparisons: 0,
  swaps: 0,
  finished: false,
  autoTimer: null,
  manualSelectedIdx: null,
  activeCompareIndices: [],
  activeSwapIndices: [],
  sortedIndices: [],
  partitionInfo: { sorted: '()', unsorted: '(2, 3, 7, 6, 5)', minVal: '-' }
};

const missionDescriptions = {
  1: '<strong>Target Misi 1 (Eksplorasi Pencarian):</strong> Pilih mode <em>Searching: Ruang Data Acak</em> atau <em>Ruang Data Rapi (Sudah Terurut)</em>, temukan angka target hingga selesai, lalu klik <strong>Catat Data &amp; Verifikasi Misi</strong>.',
  2: '<strong>Target Misi 2 (Bubble Sort Kasus Buku):</strong> Pilih algoritma <em>Bubble Sort</em> dengan preset deret <code>[2, 3, 7, 6, 5]</code>, jalankan hingga terurut menaik <code>[2, 3, 5, 6, 7]</code>, lalu klik <strong>Catat Data &amp; Verifikasi Misi</strong>.',
  3: '<strong>Target Misi 3 (Insertion Sort Kasus Kartu):</strong> Pilih algoritma <em>Insertion Sort</em> dengan preset deret <code>[2, 3, 7, 6, 5]</code>, amati penyisipan kartu 6 dan 5 hingga selesai, lalu klik <strong>Catat Data &amp; Verifikasi Misi</strong>.',
  4: '<strong>Target Misi 4 (Selection Sort &amp; Partisi):</strong> Pilih algoritma <em>Selection Sort</em> dengan preset deret <code>[2, 3, 7, 6, 5]</code>, amati perubahan tabel Bagian Terurut vs Belum Terurut hingga tuntas, lalu klik <strong>Catat Data &amp; Verifikasi Misi</strong>.',
  5: '<strong>Target Misi 5 (Uji Efisiensi Data Terbalik):</strong> Pilih preset <em>Kasus Terbalik [9, 7, 5, 3, 1]</em> pada salah satu algoritma pengurutan, jalankan sampai terurut menaik, lalu klik <strong>Catat Data &amp; Verifikasi Misi</strong>.'
};

function selectMission(mNum) {
  sfxClick();
  currentMission = mNum;
  document.querySelectorAll('.mission-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.mission) === mNum);
  });
  document.getElementById('missionStatusBadge').textContent = `Misi Aktif: #${mNum}`;
  document.getElementById('missionInstructionBox').innerHTML = missionDescriptions[mNum];

  // Otomatis sesuaikan pengaturan awal agar memudahkan siswa
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
  debugLog('Simulasi', `Misi dipilih: Misi #${mNum}`);
}

function handleAlgoChange() {
  const algo = document.getElementById('simAlgoSelect').value;
  const searchWrap = document.getElementById('searchTargetWrap');
  searchWrap.style.display = algo.startsWith('search_') ? 'block' : 'none';
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

/**
 * Membangun antrean langkah (stepsQueue) sesuai buku teks Informatika Kelas X hal. 80-89
 */
function buildAlgorithmSteps(algo, baseArray) {
  const arr = [...baseArray];
  const n = arr.length;
  const steps = [];
  let compCount = 0;
  let swapCount = 0;

  if (algo === 'bubble') {
    for (let iter = 1; iter <= n - 1; iter++) {
      let swappedInPass = false;
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
          message: `Iterasi ${iter}: Bandingkan data ke-${j + 1} (${a}) dan data ke-${j + 2} (${b}).`
        });

        if (a > b) {
          arr[j] = b;
          arr[j + 1] = a;
          swapCount++;
          swappedInPass = true;
          steps.push({
            type: 'swap',
            iter,
            compCount,
            swapCount,
            arraySnapshot: [...arr],
            compareIndices: [],
            swapIndices: [j, j + 1],
            sortedIndices: Array.from({ length: iter - 1 }, (_, k) => n - 1 - k),
            message: `Iterasi ${iter}: Karena ${a} > ${b}, tukar posisi (${a} ↔ ${b}) menjadi [${arr.join(', ')}].`
          });
        }
      }
      steps.push({
        type: 'iter_end',
        iter,
        compCount,
        swapCount,
        arraySnapshot: [...arr],
        compareIndices: [],
        swapIndices: [],
        sortedIndices: Array.from({ length: iter }, (_, k) => n - 1 - k),
        message: `Akhir Iterasi ${iter}: Urutan saat ini [${arr.join(', ')}] (${swappedInPass ? 'terjadi pertukaran' : 'tetap, tidak ada pertukaran'}).`
      });
    }
  } else if (algo === 'insertion') {
    for (let iter = 1; iter < n; iter++) {
      let curIdx = iter;
      const pickedVal = arr[curIdx];
      steps.push({
        type: 'pick',
        iter,
        compCount,
        swapCount,
        arraySnapshot: [...arr],
        compareIndices: [curIdx],
        swapIndices: [],
        sortedIndices: Array.from({ length: iter }, (_, k) => k),
        message: `Iterasi ${iter}: Ambil bilangan ke-${iter + 1} yaitu kartu ${pickedVal}.`
      });

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
          message: `Iterasi ${iter}: Bandingkan kartu ${pickedVal} dengan bilangan sebelumnya (${leftVal}).`
        });

        if (leftVal > arr[curIdx]) {
          const temp = arr[curIdx - 1];
          arr[curIdx - 1] = arr[curIdx];
          arr[curIdx] = temp;
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
            message: `Iterasi ${iter}: Karena ${leftVal} > ${pickedVal}, tukar ${pickedVal} dengan ${leftVal} menjadi [${arr.join(', ')}].`
          });
          curIdx--;
        } else {
          steps.push({
            type: 'stay',
            iter,
            compCount,
            swapCount,
            arraySnapshot: [...arr],
            compareIndices: [curIdx - 1, curIdx],
            swapIndices: [],
            sortedIndices: Array.from({ length: iter + 1 }, (_, k) => k),
            message: `Iterasi ${iter}: Karena ${pickedVal} tidak lebih kecil dari ${leftVal}, posisi sudah benar di [${arr.join(', ')}].`
          });
          break;
        }
      }
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n; i++) {
      const iter = i + 1;
      let minIdx = i;
      const sortedPart = arr.slice(0, i);
      const unsortedPart = arr.slice(i);

      for (let j = i + 1; j < n; j++) {
        compCount++;
        steps.push({
          type: 'compare',
          iter,
          compCount,
          swapCount,
          arraySnapshot: [...arr],
          compareIndices: [minIdx, j],
          swapIndices: [],
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          partition: {
            sorted: `(${sortedPart.join(',')})`,
            unsorted: `(${unsortedPart.join(',')})`,
            minVal: arr[minIdx]
          },
          message: `Iterasi ${iter}: Seleksi nilai terkecil pada Bagian Belum Terurut (${unsortedPart.join(',')}) — bandingkan ${arr[minIdx]} dengan ${arr[j]}.`
        });
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      const foundMin = arr[minIdx];
      if (minIdx !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        swapCount++;
      }

      const nextSorted = arr.slice(0, i + 1);
      const nextUnsorted = arr.slice(i + 1);

      steps.push({
        type: minIdx !== i ? 'swap' : 'stay',
        iter,
        compCount,
        swapCount,
        arraySnapshot: [...arr],
        compareIndices: [],
        swapIndices: minIdx !== i ? [i, minIdx] : [i],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        partition: {
          sorted: `(${nextSorted.join(',')})`,
          unsorted: `(${nextUnsorted.join(',')})`,
          minVal: foundMin
        },
        message: `Iterasi ${iter}: Nilai terkecil adalah ${foundMin}. Masukkan ke Bagian Terurut menjadi (${nextSorted.join(',')}).`
      });
    }
  } else if (algo.startsWith('search_')) {
    const target = Number(document.getElementById('searchTargetInput').value) || 6;
    let found = false;
    for (let i = 0; i < n; i++) {
      compCount++;
      const cur = arr[i];
      const match = cur === target;
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
          ? `Langkah ${i + 1}: Pengecekan indeks [${i + 1}] bernilai ${cur} == Kriteria (${target}). Objek DITEMUKAN!`
          : `Langkah ${i + 1}: Pengecekan indeks [${i + 1}] bernilai ${cur} != Kriteria (${target}). Lanjut periksa objek berikutnya.`
      });
      if (match) {
        found = true;
        break;
      }
      if (algo === 'search_sorted' && cur > target) {
        steps.push({
          type: 'iter_end',
          iter: i + 1,
          compCount,
          swapCount: 0,
          arraySnapshot: [...arr],
          compareIndices: [],
          swapIndices: [],
          sortedIndices: [],
          message: `Pencarian Berhenti Cepat: Karena data sudah terurut dan ${cur} > ${target}, target ${target} dipastikan tidak ada di sisa kanan!`
        });
        found = true;
        break;
      }
    }
    if (!found) {
      steps.push({
        type: 'iter_end',
        iter: n,
        compCount,
        swapCount: 0,
        arraySnapshot: [...arr],
        compareIndices: [],
        swapIndices: [],
        sortedIndices: [],
        message: `Seluruh ruang pencarian telah diperiksa. Objek dengan kriteria ${target} tidak ditemukan.`
      });
    }
  }

  return steps;
}

function stopAutoPlay() {
  if (simState.autoTimer) {
    clearInterval(simState.autoTimer);
    simState.autoTimer = null;
  }
  const btnAuto = document.getElementById('btnAuto');
  if (btnAuto) btnAuto.innerHTML = '&#9654; Jalankan Otomatis';
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
  simState.stepsQueue = buildAlgorithmSteps(algo, base);
  simState.stepPointer = 0;
  simState.iterations = 0;
  simState.comparisons = 0;
  simState.swaps = 0;
  simState.finished = false;
  simState.manualSelectedIdx = null;
  simState.activeCompareIndices = [];
  simState.activeSwapIndices = [];
  simState.sortedIndices = [];
  simState.partitionInfo = {
    sorted: '()',
    unsorted: `(${base.join(', ')})`,
    minVal: '-'
  };

  const modeLabels = {
    bubble: 'VISUALISASI BUBBLE SORT (GELEMBUNG BERDEKATAN)',
    insertion: 'VISUALISASI INSERTION SORT (PENYISIPAN KARTU)',
    selection: 'VISUALISASI SELECTION SORT (SELEKSI NILAI TERKECIL)',
    search_unsorted: 'SIMULASI SEARCHING — RUANG DATA ACAK',
    search_sorted: 'SIMULASI SEARCHING — RUANG DATA RAPI (TERURUT)'
  };
  document.getElementById('stageModeLabel').textContent = modeLabels[algo] || 'SIMULASI';
  document.getElementById('stageActionBanner').textContent = `Siap memulai percobaan pada deret [${base.join(', ')}].`;

  const spBox = document.getElementById('selectionPartitionBox');
  spBox.classList.toggle('hidden', algo !== 'selection');

  clearStepLog();
  appendStepLog(`Deret awal disiapkan: [${base.join(', ')}].`);
  renderSimulationStage();
}

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
    if (simState.activeSwapIndices.includes(idx)) el.classList.add('swapping');
    if (simState.sortedIndices.includes(idx)) el.classList.add('sorted-done');
    if (simState.manualSelectedIdx === idx) el.classList.add('selected-manual');

    el.textContent = val;
    el.title = `Klik untuk memilih/menukar elemen pada posisi [${idx + 1}]`;
    el.onclick = () => handleManualElementClick(idx);
    container.appendChild(el);

    const idxCell = document.createElement('div');
    idxCell.className = 'idx-cell';
    idxCell.textContent = `[${idx + 1}]`;
    idxRow.appendChild(idxCell);
  });

  // Update Partition Box untuk Selection Sort
  if (simState.algo === 'selection') {
    document.getElementById('spSortedText').textContent = simState.partitionInfo.sorted;
    document.getElementById('spUnsortedText').textContent = simState.partitionInfo.unsorted;
    document.getElementById('spMinText').textContent = simState.partitionInfo.minVal;
  }

  // Update Telemetri
  document.getElementById('metricIteration').textContent = simState.iterations;
  document.getElementById('metricComparisons').textContent = simState.comparisons;
  document.getElementById('metricSwaps').textContent = simState.swaps;

  const statusEl = document.getElementById('metricStatus');
  if (simState.finished) {
    statusEl.textContent = simState.algo.startsWith('search_') ? 'Pencarian Selesai' : 'Terurut Menaik';
    statusEl.className = 'm-val status-done';
  } else {
    statusEl.textContent = 'Dalam Proses';
    statusEl.className = 'm-val status-wait';
  }

  document.getElementById('summaryInitial').textContent = `[${simState.initialArray.join(', ')}]`;
  document.getElementById('summaryCurrent').textContent = `[${simState.currentArray.join(', ')}]`;
}

function stepSimulation() {
  if (simState.finished) {
    sfxSuccess();
    return;
  }

  if (simState.stepPointer >= simState.stepsQueue.length) {
    finishSimulation();
    return;
  }

  const step = simState.stepsQueue[simState.stepPointer];
  simState.stepPointer++;

  simState.currentArray = [...step.arraySnapshot];
  simState.iterations = step.iter;
  simState.comparisons = step.compCount;
  simState.swaps = step.swapCount;
  simState.activeCompareIndices = step.compareIndices || [];
  simState.activeSwapIndices = step.swapIndices || [];
  simState.sortedIndices = step.sortedIndices || [];

  if (step.partition) {
    simState.partitionInfo = step.partition;
  }

  document.getElementById('stageActionBanner').textContent = step.message;
  appendStepLog(step.message);

  if (step.type === 'swap') {
    sfxSwap();
  } else {
    sfxCompare();
  }

  if (simState.stepPointer >= simState.stepsQueue.length) {
    finishSimulation();
  } else {
    renderSimulationStage();
  }
}

function finishSimulation() {
  stopAutoPlay();
  simState.finished = true;
  simState.activeCompareIndices = [];
  simState.activeSwapIndices = [];
  if (!simState.algo.startsWith('search_')) {
    simState.sortedIndices = simState.currentArray.map((_, i) => i);
    document.getElementById('stageActionBanner').textContent = `Proses pengurutan selesai! Deret akhir: [${simState.currentArray.join(', ')}].`;
    appendStepLog(`SELESAI: Hasil akhir pengurutan menaik adalah [${simState.currentArray.join(', ')}].`);
  }
  sfxSuccess();
  renderSimulationStage();
}

function toggleAutoPlay() {
  sfxClick();
  if (simState.autoTimer) {
    stopAutoPlay();
    return;
  }
  if (simState.finished) {
    resetSimulationState();
  }
  const speed = Number(document.getElementById('speedRange').value) || 750;
  document.getElementById('btnAuto').innerHTML = '&#9208; Jeda Otomatis';
  simState.autoTimer = setInterval(() => {
    stepSimulation();
  }, speed);
}

/**
 * Interaksi Pertukaran Manual: Siswa dapat mengklik 2 elemen untuk menukarnya sendiri
 */
function handleManualElementClick(idx) {
  stopAutoPlay();
  if (simState.algo.startsWith('search_')) {
    const target = Number(document.getElementById('searchTargetInput').value) || 6;
    simState.iterations++;
    simState.comparisons++;
    const val = simState.currentArray[idx];
    if (val === target) {
      simState.sortedIndices = [idx];
      simState.finished = true;
      const msg = `Pengecekan Manual: Indeks [${idx + 1}] bernilai ${val} sesuai kriteria (${target}). Ditemukan!`;
      document.getElementById('stageActionBanner').textContent = msg;
      appendStepLog(msg);
      sfxSuccess();
    } else {
      simState.activeCompareIndices = [idx];
      const msg = `Pengecekan Manual: Indeks [${idx + 1}] bernilai ${val} != kriteria (${target}).`;
      document.getElementById('stageActionBanner').textContent = msg;
      appendStepLog(msg);
      sfxCompare();
    }
    renderSimulationStage();
    return;
  }

  if (simState.manualSelectedIdx === null) {
    simState.manualSelectedIdx = idx;
    sfxClick();
    document.getElementById('stageActionBanner').textContent = `Elemen [${idx + 1}] (nilai ${simState.currentArray[idx]}) dipilih. Klik elemen kedua untuk menukar posisinya.`;
    renderSimulationStage();
  } else if (simState.manualSelectedIdx === idx) {
    simState.manualSelectedIdx = null;
    sfxClick();
    renderSimulationStage();
  } else {
    const firstIdx = simState.manualSelectedIdx;
    const a = simState.currentArray[firstIdx];
    const b = simState.currentArray[idx];
    simState.currentArray[firstIdx] = b;
    simState.currentArray[idx] = a;
    simState.manualSelectedIdx = null;
    simState.iterations++;
    simState.comparisons++;
    simState.swaps++;
    simState.activeSwapIndices = [firstIdx, idx];

    // Cek apakah sudah terurut menaik
    const isNowSorted = simState.currentArray.every((v, i, arr) => i === 0 || arr[i - 1] <= v);
    const msg = `Pertukaran Manual: Menukar nilai ${a} dan ${b} → [${simState.currentArray.join(', ')}].`;
    document.getElementById('stageActionBanner').textContent = msg;
    appendStepLog(msg);

    if (isNowSorted) {
      simState.finished = true;
      simState.sortedIndices = simState.currentArray.map((_, i) => i);
      sfxSuccess();
      appendStepLog('Hebat! Deret telah terurut menaik secara manual.');
    } else {
      sfxSwap();
    }
    // Bangun ulang antrean langkah dari posisi terbaru
    simState.stepsQueue = buildAlgorithmSteps(simState.algo, simState.currentArray);
    simState.stepPointer = 0;
    renderSimulationStage();
  }
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
   5. PENCATATAN TABEL PERCOBAAN & VERIFIKASI MISI
   ===================================================== */
function recordAndVerifyExperiment() {
  const fb = document.getElementById('verifyFeedbackBox');
  fb.classList.remove('hidden', 'ok', 'warn');

  const algoNames = {
    bubble: 'Bubble Sort',
    insertion: 'Insertion Sort',
    selection: 'Selection Sort',
    search_unsorted: 'Searching (Data Acak)',
    search_sorted: 'Searching (Data Terurut)'
  };

  const record = {
    no: experimentRecords.length + 1,
    algo: algoNames[simState.algo] || simState.algo,
    initial: `[${simState.initialArray.join(', ')}]`,
    final: simState.algo.startsWith('search_')
      ? `Target ${document.getElementById('searchTargetInput').value} (${simState.finished ? 'Selesai' : 'Proses'})`
      : `[${simState.currentArray.join(', ')}]`,
    iterations: simState.iterations,
    comparisons: simState.comparisons,
    swaps: simState.swaps,
    status: simState.finished ? 'Tuntas / Terurut' : 'Belum Tuntas'
  };

  experimentRecords.push(record);
  renderExperimentTable();

  // Verifikasi Misi Aktif
  const initStr = simState.initialArray.join(',');
  let missionPassed = false;

  if (currentMission === 1 && simState.algo.startsWith('search_') && simState.comparisons > 0) {
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
    fb.innerHTML = `&#9989; <strong>Data berhasil dicatat &amp; Misi #${currentMission} Terverifikasi Tuntas!</strong> Silakan lanjut ke misi berikutnya atau buka menu LKPD.`;
  } else {
    sfxClick();
    fb.classList.add('warn');
    fb.innerHTML = `&#128221; <strong>Data berhasil dimasukkan ke Tabel Percobaan!</strong> Untuk menuntaskan Misi #${currentMission}, pastikan algoritma, deret uji, dan status akhir sesuai instruksi misi.`;
  }

  debugLog('TabelPercobaan', 'Data dicatat:', record);
}

function renderExperimentTable() {
  const tbody = document.getElementById('experimentTableBody');
  if (!tbody) return;
  if (experimentRecords.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Belum ada data percobaan yang dicatat. Jalankan simulasi di atas lalu klik <strong>"Catat Data &amp; Verifikasi Misi"</strong>.</td></tr>`;
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
        <td>${r.status}</td>
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
   6. DIAGNOSTIK OTOMATIS LKPD (SOAL 5-8) & EKSPOR PDF A4
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

    // Kop Judul Laporan
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

    // Identitas Siswa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Nama Siswa : ${studentName}`, leftMargin, y);
    doc.text(`Tanggal : ${dateStr}`, 130, y);
    y += 6;
    doc.text(`Kelas      : ${studentClass}`, leftMargin, y);
    y += 8;

    // Rekap Tabel Data Hasil Percobaan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('I. REKAPITULASI DATA HASIL PERCOBAAN SIMULASI', leftMargin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (experimentRecords.length === 0) {
      doc.text('- Belum ada rekaman tabel percobaan yang dicatat pada sesi simulasi.', leftMargin, y);
      y += 7;
    } else {
      experimentRecords.forEach((rec) => {
        checkPageBreak(10);
        const line = `${rec.no}. ${rec.algo} | Awal: ${rec.initial} -> Akhir: ${rec.final} | Iterasi: ${rec.iterations}, Banding: ${rec.comparisons}, Tukar: ${rec.swaps} (${rec.status})`;
        const wrapped = doc.splitTextToSize(line, maxWidth);
        doc.text(wrapped, leftMargin, y);
        y += wrapped.length * 4.8 + 1.5;
      });
      y += 3;
    }

    // Daftar 10 Soal & Jawaban
    const questions = [
      {
        no: 1,
        q: 'Jelaskan 3 elemen formal pada masalah pencarian beserta alasan mengapa mencari buku di lemari yang sudah terurut lebih cepat dibandingkan yang berantakan!',
        a: document.getElementById('lkpd_q1').value.trim() || '(Belum diisi)'
      },
      {
        no: 2,
        q: 'Berdasarkan hasil percobaan algoritma Bubble Sort pada deret [2, 3, 7, 6, 5], jelaskan apa yang terjadi pada Iterasi Pertama dan Iterasi Kedua serta mengapa Iterasi 3 & 4 tetap!',
        a: document.getElementById('lkpd_q2').value.trim() || '(Belum diisi)'
      },
      {
        no: 3,
        q: 'Pada algoritma Insertion Sort untuk deret kartu [2, 3, 7, 6, 5], jelaskan bagaimana proses penyisipan kartu 6 (Iterasi 3) dan kartu 5 (Iterasi 4)!',
        a: document.getElementById('lkpd_q3').value.trim() || '(Belum diisi)'
      },
      {
        no: 4,
        q: 'Pada algoritma Selection Sort untuk deret (2, 3, 7, 6, 5), bagaimana perubahan isi Bagian Terurut, Bagian Belum Terurut, dan Nilai Terkecil di tiap tahap?',
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
        q: 'Buatlah kesimpulan akhir mengenai hubungan antara Pengurutan (Sorting) dan Pencarian (Searching) dalam kehidupan sehari-hari!',
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
      y += qLines.length * 4.6 + 1.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      const aLines = doc.splitTextToSize(`Jawaban: ${item.a}`, maxWidth - 4);
      checkPageBreak(aLines.length * 4.6 + 4);
      doc.text(aLines, leftMargin + 3, y);
      y += aLines.length * 4.6 + 4;
    });

    const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `LKPD_Searching_Sorting_${cleanName}.pdf`;
    doc.save(fileName);
    sfxSuccess();
    debugLog('PDF', `Berhasil mengekspor PDF: ${fileName}`);
  } catch (err) {
    debugError('PDF', err);
    alert('Terjadi kendala saat membuat PDF. Periksa Console (F12) untuk rincian.');
  }
}

/* =====================================================
   INISIALISASI SAAT HALAMAN DIMUAT
   ===================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  resetSimulationState();
  debugLog('Init', 'Lab Maya Searching & Sorting siap digunakan.');
});
