// --- helpers ---
const qs = (s, el = document) => el.querySelector(s);
const randArray = (n, min = 5, max = 300) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);

// --- algorithms ---
function* bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', i: j, j: j + 1 };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        yield { type: 'swap', i: j, j: j + 1 };
      }
    }
    yield { type: 'mark', i: n - 1 - i };
    if (!swapped) break;
  }
  yield { type: 'mark', i: 0 };
}

function* insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    yield { type: 'compare', i: j, j: i };
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      yield { type: 'overwrite', i: j + 1, value: a[j] };
      j--;
      if (j >= 0) yield { type: 'compare', i: j, j: i };
    }
    a[j + 1] = key;
    yield { type: 'overwrite', i: j + 1, value: key };
    yield { type: 'mark', i };
  }
  yield { type: 'mark', i: 0 };
}

function* selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', i: min, j };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { type: 'swap', i, j: min };
    }
    yield { type: 'mark', i };
  }
  yield { type: 'mark', i: n - 1 };
}

function* mergeSort(a) {
  const aux = a.slice();
  function* merge(lo, mid, hi) {
    for (let k = lo; k <= hi; k++) aux[k] = a[k];
    let i = lo, j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) {
        a[k] = aux[j++];
        yield { type: 'overwrite', i: k, value: a[k] };
      } else if (j > hi) {
        a[k] = aux[i++];
        yield { type: 'overwrite', i: k, value: a[k] };
      } else {
        yield { type: 'compare', i, j };
        if (aux[j] < aux[i]) {
          a[k] = aux[j++];
          yield { type: 'overwrite', i: k, value: a[k] };
        } else {
          a[k] = aux[i++];
          yield { type: 'overwrite', i: k, value: a[k] };
        }
      }
    }
  }
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    yield* sort(lo, mid);
    yield* sort(mid + 1, hi);
    yield* merge(lo, mid, hi);
    yield { type: 'mark', i: hi };
  }
  yield* sort(0, a.length - 1);
}


function* quickSort(a) {
  function* partition(lo, hi) {
    const pivot = a[hi];
    yield { type: 'pivot', i: hi };
    let p = lo;
    for (let j = lo; j < hi; j++) {
      yield { type: 'compare', i: j, j: hi };
      if (a[j] < pivot) {
        if (j !== p) {
          [a[p], a[j]] = [a[j], a[p]];
          yield { type: 'swap', i: p, j };
        }
        p++;
      }
    }
    if (p !== hi) {
      [a[p], a[hi]] = [a[hi], a[p]];
      yield { type: 'swap', i: p, j: hi };
    }
    yield { type: 'mark', i: p };
    return p;
  }
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const p = yield* partition(lo, hi);
    yield* sort(lo, p - 1);
    yield* sort(p + 1, hi);
  }
  yield* sort(0, a.length - 1);
}

const ALGOS = {
  Bubble: bubbleSort,
  Insertion: insertionSort,
  Selection: selectionSort,
  Merge: mergeSort,
  Quick: quickSort
};

// --- state ---
let size = 40, speed = 50, arr = randArray(40);
let playing = false, stepCount = 0;
let workArr = [], gen = null, timer = null, highlights = {};

// --- dom ---
const $bars = qs('#bars'),
  $algo = qs('#algo'),
  $new = qs('#newArray'),
  $play = qs('#playPause'),
  $step = qs('#step'),
  $reset = qs('#resetSteps'),
  $size = qs('#size'),
  $speed = qs('#speed'),
  $sizeLabel = qs('#sizeLabel'),
  $speedLabel = qs('#speedLabel'),
  $stepLabel = qs('#stepCount');

function delayMs() {
  const min = 5, max = 400;
  const ratio = 1 - (speed - 1) / 99;
  return Math.floor(min + ratio * (max - min));
}

function renderBars() {
  const max = Math.max(...arr, 1);
  $bars.innerHTML = '';
  arr.forEach((v, idx) => {
    const d = document.createElement('div');
    d.className = 'bar';
    if (highlights[idx]) d.classList.add(highlights[idx]);
    d.style.height = Math.max(4, Math.round((v / max) * 360)) + 'px';
    d.title = String(v);
    $bars.appendChild(d);
  });
}

function resetArray(n = size) {
  stop();
  arr = randArray(n);
  workArr = arr.slice();
  gen = null;
  highlights = {};
  stepCount = 0;
  updateStepLabel();
  renderBars();
}

function buildGenerator() {
  const a = workArr.slice();
  const g = ALGOS[$algo.value](a);
  g._copy = a; // for potential debugging
  return g;
}

function applyAction(act) {
  const a = workArr;
  const h = {};
  switch (act?.type) {
    case 'compare':
      if (act.i != null) h[act.i] = 'compare';
      if (act.j != null) h[act.j] = 'compare';
      break;
    case 'swap':
      if (act.i != null && act.j != null) {
        [a[act.i], a[act.j]] = [a[act.j], a[act.i]];
        h[act.i] = h[act.j] = 'swap';
      }
      break;
    case 'overwrite':
      if (act.i != null && act.value != null) {
        a[act.i] = act.value;
        h[act.i] = 'overwrite';
      }
      break;
    case 'pivot':
      if (act.i != null) h[act.i] = 'pivot';
      break;
    case 'mark':
      if (act.i != null) h[act.i] = 'mark';
      break;
    default:
      break;
  }
  highlights = h;
  arr = a.slice();
  stepCount++;
  updateStepLabel();
  renderBars();
}

function nextStep() {
  if (!gen) gen = buildGenerator();
  const { value, done } = gen.next();
  if (done) {
    applyAction({});
    stop();
    return true;
  }
  applyAction(value);
  return false;
}

function tick() {
  const finished = nextStep();
  if (!finished && playing) timer = setTimeout(tick, delayMs());
}

function start() {
  if (!gen) gen = buildGenerator();
  if (playing) return;
  playing = true;
  $play.textContent = 'Pause';
  tick();
}

function stop() {
  playing = false;
  $play.textContent = 'Play';
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function updateStepLabel() { $stepLabel.textContent = String(stepCount); }

// events
$new.addEventListener('click', () => resetArray());
$play.addEventListener('click', () => (playing ? stop() : start()));
$step.addEventListener('click', () => nextStep());
$reset.addEventListener('click', () => {
  stop();
  workArr = arr.slice();
  gen = null;
  highlights = {};
  stepCount = 0;
  updateStepLabel();
  renderBars();
});
$size.addEventListener('input', e => {
  size = parseInt(e.target.value, 10);
  $sizeLabel.textContent = String(size);
  resetArray(size);
});
$speed.addEventListener('input', e => {
  speed = parseInt(e.target.value, 10);
  $speedLabel.textContent = String(speed);
});

resetArray(size);
