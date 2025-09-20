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