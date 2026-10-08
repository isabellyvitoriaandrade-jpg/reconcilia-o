
const SETTINGS = {
  name: 'EU',
  question: 'voce aceita ter uma conversa dificil comigo? ',
  foods: [
    { id: 'casa', emoji: '🏠', label: 'casa' },
    { id: 'bar', emoji: '🍺', label: 'boteco' },
    { id: 'sushi', emoji: '🍣', label: 'rodízio' },
    { id: 'pasta', emoji: '🍝', label: 'italiano' },
    { id: 'coco', emoji: '🍤', label: 'coco bambu' },
    { id: 'movie', emoji: '🎥', label: 'cinema... após a conversa' }
  ],
  times: ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','18:30','19:00','19:30','20:00','20:30']
};

const app = document.getElementById('app');
const state = { step: 0, food: null, date: null, time: null, month: new Date(new Date().getFullYear(), new Date().getMonth(), 1), noCount: 0 };
const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const pad = n => String(n).padStart(2,'0');
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const today = new Date(); today.setHours(0,0,0,0);

const firstAvailableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
state.month = new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
  app.className = 'card ' + (state.step === 0 ? 'intro-card' : 'date-card');
  if (state.step===0) return renderIntro();
  if (state.step===1) return renderFood();
  if (state.step===2) return renderCalendar();
  return renderSuccess();
}
function renderIntro(){
  app.innerHTML = `<div class="heart">🆘</div><h1>${escapeHtml(SETTINGS.question)}</h1><div class="choice-row" id="choices"><button class="btn btn-primary" id="yes">sim!</button><button class="btn btn-outline no-btn" id="no">não!</button></div><p class="tiny">se negar, vai apanhar</p>`;
  document.getElementById('yes').addEventListener('click',()=>{ state.step=1;burst();render(); });
  const no = document.getElementById('no');
  function dodge(){
    state.noCount++;
    no.style.transform = `translate(${(state.noCount%2 ? 1:-1)*(55+Math.random()*60)}px,${(Math.random()-.5)*90}px)`;
    if(state.noCount>3) no.textContent='tem certeza, rapariga?';
  }
  no.addEventListener('mouseenter',dodge); no.addEventListener('click',dodge);
}
function renderFood(){
  app.innerHTML = `<div class="mini-top">vamos la, xu</div><h2>voce prefere...</h2><span class="sparkle">✧</span><div class="food-grid">${SETTINGS.foods.map(f=>`<button class="food ${state.food===f.id?'selected':''}" data-food="${f.id}" aria-pressed="${state.food===f.id}"><span class="emoji">${f.emoji}</span>${escapeHtml(f.label)}</button>`).join('')}</div><button class="btn btn-primary btn-wide" id="next">bora p proximo</button><button class="back" id="back">voltar</button><div id="message"></div>`;
  app.querySelectorAll('[data-food]').forEach(el=>el.addEventListener('click',()=>{state.food=el.dataset.food;render()}));
  document.getElementById('next').addEventListener('click',()=>{if(!state.food){document.getElementById('message').innerHTML='<p class="error">escolhe primeiro cachorra</p>';return;}state.step=2;render()});
  document.getElementById('back').addEventListener('click',()=>{state.step=0;render()});
}
function renderCalendar(){
  const year=state.month.getFullYear(),month=state.month.getMonth();
  const first = new Date(year,month,1).getDay();
  const count = new Date(year,month+1,0).getDate();
  const earliestMonth = new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);
  let days = '<span></span>'.repeat(first);
  for(let d=1;d<=count;d++){
    const date=new Date(year,month,d),key=dateKey(date),disabled=date<firstAvailableDate;
    days += `<button class="date-cell ${key===state.date?'selected':''}" ${disabled?'disabled':''} data-date="${key}" aria-label="${d} de ${months[month]} de ${year}">${d}</button>`;
  }
  app.innerHTML = `<h2>quando em?</h2><p class="subtle">hoje e amanha talvez não...</p><div class="calendar-header"><button class="arrow" id="prev" ${state.month<=earliestMonth?'disabled':''} aria-label="Mês anterior">‹</button><strong>${months[month]} ${year}</strong><button class="arrow" id="nextMonth" aria-label="Próximo mês">›</button></div><div class="days-grid">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(w=>`<span class="weekday">${w}</span>`).join('')}${days}</div><p class="label">Qual horário?</p><div class="time-grid">${SETTINGS.times.map(t=>`<button class="time-cell ${state.time===t?'selected':''}" data-time="${t}">${t}</button>`).join('')}</div><button class="btn btn-primary btn-wide" id="confirm">confirmar!</button><button class="back" id="back">voltar</button><div id="message"></div>`;
  app.querySelectorAll('[data-date]').forEach(el=>el.addEventListener('click',()=>{state.date=el.dataset.date;render()}));
  app.querySelectorAll('[data-time]').forEach(el=>el.addEventListener('click',()=>{state.time=el.dataset.time;render()}));
  document.getElementById('prev').addEventListener('click',()=>{state.month=new Date(year,month-1,1);render()});
  document.getElementById('nextMonth').addEventListener('click',()=>{state.month=new Date(year,month+1,1);render()});
  document.getElementById('back').addEventListener('click',()=>{state.step=1;render()});
  document.getElementById('confirm').addEventListener('click',()=>{if(!state.date||!state.time || new Date(`${state.date}T00:00:00`) < firstAvailableDate){document.getElementById('message').innerHTML='<p class="error">escolhe primeiro cachorra</p>';return;}state.step=3;burst();render()});
}
function renderSuccess(){
  const food=SETTINGS.foods.find(f=>f.id===state.food);
  const date = new Date(`${state.date}T12:00:00`);
  const pretty=date.toLocaleDateString('pt-BR',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  app.innerHTML=`<div class="success-icon">💖</div><h2 class="success-title">conversa marcada!</h2><p class="subtle">mente aberta, sem medo e sem ressentimentos, ESCUTOU?</p><div class="detail-box"><div class="detail"><span>Nosso programa</span><strong>${food.emoji} ${escapeHtml(food.label)}</strong></div><div class="detail"><span>Dia</span><strong>${pretty}</strong></div><div class="detail"><span>Horário</span><strong>${escapeHtml(state.time)}</strong></div></div><button class="btn btn-primary btn-wide" id="share">📋 Copiar detalhes do encontro</button><button class="back" id="restart">↻ Recomeçar</button>`;
  document.getElementById('share').addEventListener('click',async()=>{
    const message=`💗 Encontro marcado!\n${food.emoji} ${food.label}\n📅 ${pretty}\n⏰ ${state.time}`;
    try{await navigator.clipboard.writeText(message);document.getElementById('share').textContent='✓ Copiado!';}
    catch{window.prompt('Copie os detalhes do encontro:',message)}
  });
  document.getElementById('restart').addEventListener('click',()=>{state.step=0;state.food=null;state.date=null;state.time=null;state.month=new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);render()});
}
function burst(){
  const layer=document.getElementById('confetti');layer.replaceChildren();
  for(let i=0;i<45;i++){
    const e=document.createElement('span');e.className='piece';e.textContent=['💗','💕','✨','🌸'][i%4];
    e.style.left=`${Math.random()*100}%`;e.style.fontSize=`${10+Math.random()*15}px`;e.style.animationDuration=`${2.6+Math.random()*2.2}s`;e.style.animationDelay=`${Math.random()*.8}s`;
    layer.append(e);e.addEventListener('animationend',()=>e.remove());
  }
}
render();
