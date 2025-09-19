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
