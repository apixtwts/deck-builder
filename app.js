// ───────────────────────────────────
// Load card data
// ───────────────────────────────────
fetch('cards.json')
  .then(r => {
    if (!r.ok) throw new Error('cards.json not found');
    return r.json();
  })
  .then(cards => init(cards))
  .catch(err => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<p style="color:red">⚠️ ${err.message}</p>`
    );
    console.error(err);
  });

// ───────────────────────────────────
// Main
// ───────────────────────────────────
function init(cards) {
  const poolEl  = document.getElementById('pool');
  const deckEl  = document.getElementById('deck');
  const countEl = document.getElementById('count');
  const tipEl   = document.getElementById('tooltip');

  // lookup table for hover previews
  const byId = Object.fromEntries(cards.map(c => [c.id, c]));

  const deck = { regular: [], legendary: null };

  // ── 1. render pool (skip rarity = summon) ──────────────────────
  cards
    .filter(c => c.rarity !== 'summon')
    .forEach(card => {
      const el = createCardEl(card);
      el.addEventListener('click', () => addToDeck(card));
      poolEl.appendChild(el);
    });

  // ── helper: build <div class="card"> ───────────────────────────
  function createCardEl(card) {
    const el = document.createElement('div');
    el.className = `card ${card.rarity}`;
    el.innerHTML = `<img src="${card.img}" alt="${card.name}">`;

    // hover preview
    el.addEventListener('mouseenter', e => showPreview(card, e));
    el.addEventListener('mousemove',  movePreview);
    el.addEventListener('mouseleave', hidePreview);

    return el;
  }

  // ── hover tooltip handlers ────────────────────────────────────
  function showPreview(card, evt) {
    if (!card.spawns) return;

    tipEl.innerHTML = '';
    card.spawns.forEach(id => {
      const spawned = byId[id];
      if (spawned) {
        const img = document.createElement('img');
        img.src = spawned.img;
        img.alt = spawned.name;
        tipEl.appendChild(img);
      }
    });
    if (tipEl.childElementCount) {
      tipEl.style.display = 'block';
      movePreview(evt);
    }
  }
  function movePreview(evt) {
    if (tipEl.style.display === 'block') {
      tipEl.style.left = evt.pageX + 15 + 'px';
      tipEl.style.top  = evt.pageY + 15 + 'px';
    }
  }
  function hidePreview() { tipEl.style.display = 'none'; }

  // ── add / remove deck cards (ignore rarity = summon) ───────────
  function addToDeck(card) {
    if (card.rarity === 'summon') return;                      // cannot add
    if (card.rarity === 'legendary') {
      if (deck.legendary && deck.legendary.id === card.id) return alert('Legendary already in deck');
      if (deck.legendary) return alert('You already have a legendary!');
      deck.legendary = card;
    } else {                                                  // regular
      if (deck.regular.length >= 12) return alert('Maximum 12 regular cards');
      if (deck.regular.some(c => c.id === card.id)) return alert('That card is already in your deck');
      deck.regular.push(card);
    }
    redrawDeck();
  }

  function removeFromDeck(idx, type) {
    if (type === 'legendary') deck.legendary = null;
    else deck.regular.splice(idx, 1);
    redrawDeck();
  }

  // ── redraw deck panel ─────────────────────────────────────────
  function redrawDeck() {
    deckEl.innerHTML = '';

    if (deck.legendary) {
      const leg = createCardEl(deck.legendary);
      leg.addEventListener('click', () => removeFromDeck(0, 'legendary'));
      deckEl.appendChild(leg);
    }
    deck.regular.forEach((card, i) => {
      const reg = createCardEl(card);
      reg.addEventListener('click', () => removeFromDeck(i, 'regular'));
      deckEl.appendChild(reg);
    });

    countEl.textContent = deck.regular.length + (deck.legendary ? 1 : 0);
  }

  // ── export deck as PNG ────────────────────────────────────────
  document.getElementById('export').onclick = () => {
    html2canvas(deckEl).then(canvas => {
      const link = document.createElement('a');
      link.download = 'my_deck.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };
}
