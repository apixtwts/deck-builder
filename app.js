/* ─── load cards ───────────────────────────── */
fetch('cards.json')
  .then(r => r.ok ? r.json() : Promise.reject('cards.json not found'))
  .then(init)
  .catch(msg => document.body.insertAdjacentHTML('beforeend', `<p style="color:red">⚠️ ${msg}</p>`));

/* ─── main ─────────────────────────────────── */
function init(cards){
  const pool   = document.getElementById('pool');
  const deckEl = document.getElementById('deck');
  const count  = document.getElementById('count');

  /* build the pool exactly in JSON order */
  cards.forEach(card=>{
    const el=createCard(card);
    el.addEventListener('click',()=>addToDeck(card));
    pool.appendChild(el);
  });

  /* deck state */
  const deck={legendary:null,regular:[]};

  function addToDeck(card){
    if(card.rarity==="summon")
      return alert("This card is summoned or added to your hand by another card and can't be placed in your deck.");

    if(card.rarity==="legendary"){
      if(deck.legendary && deck.legendary.id===card.id) return alert("Legendary already in deck");
      if(deck.legendary) return alert("You already have a legendary!");
      deck.legendary=card;
    }else{
      if(deck.regular.length>=12) return alert("Maximum 12 regular cards");
      if(deck.regular.some(c=>c.id===card.id)) return alert("That card is already in your deck");
      deck.regular.push(card);
    }
    redraw();
  }

  function remove(idx,type){
    if(type==="legendary") deck.legendary=null;
    else deck.regular.splice(idx,1);
    redraw();
  }

  function redraw(){
    deckEl.innerHTML="";
    if(deck.legendary){
      const l=createCard(deck.legendary);
      l.addEventListener('click',()=>remove(0,"legendary"));
      deckEl.appendChild(l);
    }
    deck.regular.forEach((c,i)=>{
      const r=createCard(c);
      r.addEventListener('click',()=>remove(i,"regular"));
      deckEl.appendChild(r);
    });
    count.textContent=deck.regular.length + (deck.legendary?1:0);
  }

  function createCard(card){
    const div=document.createElement('div');
    div.className=`card ${card.rarity}`;
    div.innerHTML=`<img src="${card.img}" alt="${card.name}">`;
    return div;
  }

  document.getElementById('export').onclick=()=>{
    html2canvas(deckEl).then(cv=>{
      const a=document.createElement('a');
      a.download='my_deck.png';
      a.href=cv.toDataURL();
      a.click();
    });
  };
}
