// ------------- load card metadata ----------------
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

// ------------- main ------------------------------
function init(cards) {
  const poolEl  = document.getElementById('pool');
  const deckEl  = document.getElementById('deck');
  const countEl = document.getElementById('count');

  const deck = { regular: [], legendary: null };

  // render pool
  cards.forEach(card => {
    const el = createCardEl(card);
    el.addEventListener('click', () => addToDeck(card));
    poolEl.appendChild(el);
  });

  // ---------- helper: create DOM node ------------
  function createCardEl(card) {
    const el = document.createElement('div');
    el.className = `card ${card.rarity}`;
    el.innerHTML = `<img src="${card.img}" alt="${card.name}">`;
    return el;
  }

  // ---------- add card with rules + duplicate check ----------
  function addToDeck(card) {
    // no duplicates allowed
    if (card.rarity === 'legendary') {
      if (deck.legendary && deck.legendary.id === card.id) {
        return alert('Legendary already in deck');
      }
      if (deck.legendary) return alert('You already have a legendary!');
      deck.legendary = card;
    } else {
      if (deck.regular.length >= 12) return alert('Maximum 12 regular cards');
      if (deck.regular.some(c => c.id === card.id)) {
        return alert('That card is already in your deck');
      }
      deck.regular.push(card);
    }
    redrawDeck();
  }

  // ---------- remove by clicking in deck ----------
  function removeFromDeck(idx, type) {
    if (type === 'legendary') deck.legendary = null;
    else deck.regular.splice(idx, 1);
    redrawDeck();
  }

  // ---------- refresh deck panel ----------
  function redrawDeck() {
    deckEl.innerHTML = '';

    // legendary first row
    if (deck.legendary) {
      const legEl = createCardEl(deck.legendary);
      legEl.addEventListener('click', () => removeFromDeck(0, 'legendary'));
      deckEl.appendChild(legEl);
    }

    // regular cards fill after legendary
    deck.regular.forEach((card, i) => {
      const regEl = createCardEl(card);
      regEl.addEventListener('click', () => removeFromDeck(i, 'regular'));
      deckEl.appendChild(regEl);
    });

    countEl.textContent = deck.regular.length + (deck.legendary ? 1 : 0);
  }

  // ---------- export deck as PNG ----------
  document.getElementById('export').onclick = () => {
    html2canvas(deckEl).then(canvas => {
      const link = document.createElement('a');
      link.download = 'my_deck.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };
}
