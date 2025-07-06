// 5-1  Load cards.json and render pool
fetch('cards.json')
  .then(r => r.json())
  .then(cards => init(cards));

function init(cards) {
  const poolEl  = document.getElementById('pool');
  const deckEl  = document.getElementById('deck');
  const countEl = document.getElementById('count');

  const deck = { regular: [], legendary: null };

  // --- render pool cards
  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = `card ${card.rarity}`;
    el.innerHTML = `<img src="${card.img}" alt="${card.name}">`;
    el.addEventListener('click', () => addToDeck(card));
    poolEl.appendChild(el);
  });

  function addToDeck(card) {
    if (card.rarity === 'legendary') {
      if (deck.legendary) return alert('You already have a legendary!');
      deck.legendary = card;
    } else {
      if (deck.regular.length >= 12) return alert('Maximum 12 regular cards');
      deck.regular.push(card);
    }
    redrawDeck();
  }

  function removeFromDeck(idx, type) {
    if (type === 'legendary') deck.legendary = null;
    else deck.regular.splice(idx, 1);
    redrawDeck();
  }

  function redrawDeck() {
    deckEl.innerHTML = '';       // clear grid
    if (deck.legendary) {
      addCardEl(deck.legendary, 'legendary', 0);
    }
    deck.regular.forEach((c, i) => addCardEl(c, 'regular', i));
    countEl.textContent = deck.regular.length + (deck.legendary ? 1 : 0);
  }

  function addCardEl(card, type, index) {
    const el = document.createElement('div');
    el.className = `card ${card.rarity}`;
    el.innerHTML = `<img src="${card.img}" alt="${card.name}">`;
    el.addEventListener('click', () => removeFromDeck(index, type));
    deckEl.appendChild(el);
  }

  // --- export deck as PNG
  document.getElementById('export').onclick = () => {
    html2canvas(deckEl).then(canvas => {
      const link = document.createElement('a');
      link.download = 'my_deck.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };
}
