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