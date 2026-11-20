(() => {
  const tg = window.Telegram?.WebApp;
  try { tg?.ready(); tg?.expand(); tg?.setHeaderColor?.('#10131b'); tg?.setBackgroundColor?.('#10131b'); } catch (_) {}
  const {SCHEDULE, BELLS_WEEKDAY, BELLS_SATURDAY, WEEKS} = window.APP_DATA;
  const $ = id => document.getElementById(id);
  const content = $('content');
  let activeView = 'today';
  let selectedDate = new Date();
  let bellsMode = 'weekday';
  const minDate = '2026-11-23', maxDate = '2026-12-26';
  const weekdays = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  const shortDays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const pad = n => String(n).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parse = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const ruDate = d => d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
  const inRange = s => s >= minDate && s <= maxDate;
  const bellsFor = s => parse(s).getDay() === 6 ? BELLS_SATURDAY : BELLS_WEEKDAY;
  const safe = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function lessonMarkup(item, bells) {
    const [num, subject, teacher, room] = item;
    const times = bells[num] || ['—','—'];
    return `<div class="lesson"><div class="lesson-num">${num}</div><div><div class="lesson-time">${times[0]} — ${times[1]}</div><p class="lesson-title">${safe(subject)}</p><div class="lesson-meta"><span>Преподаватель: ${safe(teacher)}</span><span>Аудитория: ${safe(room)}</span></div></div></div>`;
  }
  function dayMarkup(s, compact=false) {
    const d = parse(s), lessons = SCHEDULE[s] || [];
    const title = `${shortDays[d.getDay()]}, ${pad(d.getDate())}.${pad(d.getMonth()+1)}`;
    if (!inRange(s)) return `<div class="empty"><strong>На эту дату расписания нет</strong>В загруженном файле данные есть только с 23.11.2026 по 26.12.2026.</div>`;
    if (!lessons.length) return `<div class="day-card"><div class="day-card-head"><span class="day-name">${title}</span><span class="day-date">${weekdays[d.getDay()]}</span></div><div class="empty"><strong>Пар нет</strong>Выходной или расписание не заполнено.</div></div>`;
    return `<div class="day-card"><div class="day-card-head"><span class="day-name">${title}</span><span class="day-date">${lessons.length} ${lessonWord(lessons.length)}</span></div>${lessons.map(x=>lessonMarkup(x,bellsFor(s))).join('')}</div>`;
  }
  function lessonWord(n){ return n===1?'пара':n>=2&&n<=4?'пары':'пар'; }
  function showDay(s, kicker='ВАШ ДЕНЬ') {
    const d=parse(s); $('view-kicker').textContent=kicker; $('date-title').textContent=ruDate(d); $('date-subtitle').textContent=weekdays[d.getDay()]; content.innerHTML=dayMarkup(s);
    $('date-picker').value=inRange(s)?s:'';
  }
  function showWeek(s) {
    const d=parse(s); const week=WEEKS.find(([,dates])=>dates.includes(s)) || WEEKS.find(([,dates])=>dates.some(x=>x.slice(0,7)===s.slice(0,7)));
    $('view-kicker').textContent='УЧЕБНАЯ НЕДЕЛЯ'; $('date-title').textContent=week?week[0]:'Календарь'; $('date-subtitle').textContent='Выберите день или дату в календаре';
    if(!week){content.innerHTML=dayMarkup(s);return;}
    content.innerHTML=week[1].map(x=>`<div class="week-day">${dayMarkup(x,true)}</div>`).join('');
  }
  function render() {
    $('schedule-view').classList.toggle('hidden',activeView==='bells'); $('bells-view').classList.toggle('hidden',activeView!=='bells');
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===activeView));
    $('calendar-panel').classList.add('hidden');
    const now=new Date(); const today=iso(now);
    if(activeView==='today'){selectedDate=now;showDay(today,'СЕГОДНЯ');}
    else if(activeView==='tomorrow'){const t=new Date(now);t.setDate(t.getDate()+1);selectedDate=t;showDay(iso(t),'ЗАВТРА');}
    else if(activeView==='week'){const s=inRange(iso(selectedDate))?iso(selectedDate):minDate;selectedDate=parse(s);showWeek(s);}
    else renderBells();
  }
  function renderBells(){
    const data=bellsMode==='saturday'?BELLS_SATURDAY:BELLS_WEEKDAY;
    $('bells-content').innerHTML=Object.entries(data).map(([n,t])=>`<div class="bell-row"><div class="bell-n">${n}</div><div><div class="bell-times"><span>${t[0]}</span><span>${t[1]}</span></div><div class="bell-caption">${n} пара · первая и вторая половина</div></div></div>`).join('');
    document.querySelectorAll('.segment').forEach(b=>b.classList.toggle('active',b.dataset.bells===bellsMode));
  }
  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{activeView=b.dataset.view;render();}));
  $('calendar-toggle').addEventListener('click',()=>{$('calendar-panel').classList.toggle('hidden');$('date-picker').value=inRange(iso(selectedDate))?iso(selectedDate):'';});
  $('date-picker').addEventListener('change',e=>{if(!e.target.value)return;selectedDate=parse(e.target.value);activeView='week';render();$('calendar-panel').classList.remove('hidden');showDay(e.target.value,'ВЫБРАННАЯ ДАТА');document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view==='week'));});
  document.querySelectorAll('.segment').forEach(b=>b.addEventListener('click',()=>{bellsMode=b.dataset.bells;renderBells();}));
  render();
})();
