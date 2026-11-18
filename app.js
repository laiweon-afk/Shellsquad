const BLOB_URL = 'https://jsonblob.com/01a1efe3-e112-741f-9111-24955f15a4a3/json';
const HOOK = 'https://discord.com/api/webhooks/1572641039817380003/RwLWlV8XtoHgsT0fKTR-lXcLOapczZ7DhpUCic-izRV8c0YnDING166mJvn6RITba-I6';';
const PASS = 'shell2026';
let tmr = null;

function keyOf(s){return s.trim().toLowerCase()}
function show(id){document.querySelectorAll('.card').forEach(e=>e.classList.add('hidden'));const el=document.getElementById(id);if(el)el.classList.remove('hidden')}
function backP(){show(localStorage.getItem('s_app')?'b-st':'b-app')}

const sky=document.getElementById('sky');
if(sky){for(let i=0;i<6;i++){const b=document.createElement('div');b.className='b-box';b.style.top=(12+Math.random()*28)+'%';b.style.animationDuration=(16+Math.random()*14)+'s';b.style.animationDelay=(-Math.random()*20)+'s';b.innerHTML='<svg class="bird" viewBox="0 0 24 12"><path d="M2 8 Q7 2 12 8 Q17 2 22 8"/></svg>';sky.appendChild(b)}}

async function getDB(){
  const res = await fetch(BLOB_URL);
  if(!res.ok) throw new Error('Ошибка облака HTTP ' + res.status);
  const d = await res.json();
  if(!d.users || Array.isArray(d.users)) d.users = {};
  if(!d.apps || Array.isArray(d.apps)) d.apps = {};
  return d;
}

async function saveDB(data){
  const res = await fetch(BLOB_URL, {
    method: 'PUT',
    headers: {'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify(data)
  });
  if(!res.ok) throw new Error('Ошибка сохранения HTTP ' + res.status);
}

async function startAll(){
  const k=localStorage.getItem('s_key');
  if(k){
    try{
      const db=await getDB();
      const u=db.users[k];
      if(u){
        localStorage.setItem('s_nick',u.displayNick||u.login);
        localStorage.setItem('s_login',u.login);
        localStorage.setItem('s_ds',u.discord||'');
        if(u.appId)localStorage.setItem('s_app',u.appId);else localStorage.removeItem('s_app');
      }else{localStorage.clear()}
    }catch(e){}
  }

  if(document.getElementById('hBtn')){
    const n=localStorage.getItem('s_nick'),app=localStorage.getItem('s_app');
    if(n){
      document.getElementById('gNav').classList.add('hidden');
      document.getElementById('uNav').classList.remove('hidden');
      document.getElementById('uName').textContent=n;
      document.getElementById('hSub').innerHTML='Добро пожаловать, <strong style="color:#fff">'+n+'</strong>! Аккаунт синхронизирован.';
      document.getElementById('hBtn').textContent=app?'Статус моей заявки →':'Подать заявку на 3 лвл →';
    }
    return;
  }

  const m=new URLSearchParams(location.search).get('mode');
  if(m==='admin'){show('b-adm');return}
  const n=localStorage.getItem('s_nick');
  if(n){
    ui();
    const app=localStorage.getItem('s_app');
    if(app)watch(app);
    if(m==='profile'){show('b-prof');return}
    show(app?'b-st':'b-app');
  }else{
    show(m==='login'?'b-log':'b-reg');
  }
}

function ui(){
  const n=localStorage.getItem('s_nick'),l=localStorage.getItem('s_login')||n,d=localStorage.getItem('s_ds')||'';
  document.getElementById('navU').classList.remove('hidden');
  document.getElementById('uNick').textContent=n;
  document.getElementById('p-log-inp').value=l;
  document.getElementById('p-nick').value=n;
  document.getElementById('p-ds').value=d;
  document.getElementById('a-user').textContent=n;
  document.getElementById('st-user').textContent=n;
  if(d&&!document.getElementById('f-ds').value)document.getElementById('f-ds').value=d;
}

window.addEventListener('DOMContentLoaded',startAll);
function logout(){localStorage.clear();if(tmr)clearInterval(tmr);location.href='index.html'}

async function reg(e){
  e.preventDefault();
  const l=document.getElementById('r-l').value.trim(),p=document.getElementById('r-p').value,k=keyOf(l),b=document.getElementById('r-btn');
  b.disabled=true;b.textContent='Создание аккаунта...';
  try{
    const db=await getDB();
    if(db.users[k]){alert('Этот логин уже занят! Войдите в аккаунт.');b.disabled=false;b.textContent='Зарегистрироваться и продолжить';show('b-log');return}
    db.users[k]={login:l,displayNick:l,discord:'',pass:p,appId:''};
    await saveDB(db);
    localStorage.setItem('s_key',k);localStorage.setItem('s_nick',l);localStorage.setItem('s_login',l);localStorage.removeItem('s_app');
    location.href='index.html';
  }catch(err){
    alert('Ошибка: '+err.message);
    b.disabled=false;b.textContent='Зарегистрироваться и продолжить';
  }
}

async function log(e){
  e.preventDefault();
  const l=document.getElementById('l-l').value.trim(),p=document.getElementById('l-p').value,k=keyOf(l),b=document.getElementById('l-btn');
  b.disabled=true;b.textContent='Вход...';
  try{
    const db=await getDB();
    const u=db.users[k];
    if(!u||u.pass!==p){alert('Неверный логин или пароль!');b.disabled=false;b.textContent='Войти';return}
    localStorage.setItem('s_key',k);localStorage.setItem('s_nick',u.displayNick||u.login);localStorage.setItem('s_login',u.login);localStorage.setItem('s_ds',u.discord||'');
    if(u.appId)localStorage.setItem('s_app',u.appId);else localStorage.removeItem('s_app');
    location.href='index.html';
  }catch(err){
    alert('Ошибка: '+err.message);
    b.disabled=false;b.textContent='Войти';
  }
}

async function saveP(e){
  e.preventDefault();
  const k=localStorage.getItem('s_key'),n=document.getElementById('p-nick').value.trim(),d=document.getElementById('p-ds').value.trim();
  const db=await getDB();
  if(db.users[k]){db.users[k].displayNick=n;db.users[k].discord=d;await saveDB(db);}
  localStorage.setItem('s_nick',n);localStorage.setItem('s_ds',d);ui();alert('Профиль обновлен!');
}

async function sendApp(e){
  e.preventDefault();
  const u=localStorage.getItem('s_nick'),l=localStorage.getItem('s_login')||u,k=localStorage.getItem('s_key'),b=document.getElementById('s-btn');
  b.disabled=true;b.textContent='Отправка...';
  const id='app_'+Date.now();
  const app={login:u+' ('+l+')',userKey:k,name:document.getElementById('f-name').value.trim(),age:document.getElementById('f-age').value.trim(),why:document.getElementById('f-why').value.trim(),exp:document.getElementById('f-exp').value.trim(),soft:document.getElementById('f-soft').value.trim(),discord:document.getElementById('f-ds').value.trim(),status:'wait',reviewer:''};
  try{
    const db=await getDB();
    db.apps[id]=app;
    if(db.users[k])db.users[k].appId=id;
    await saveDB(db);
    localStorage.setItem('s_app',id);
    fetch(HOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Shell Squad',embeds:[{title:'🌿 Новая заявка на 3 ЛВЛ!',description:'[Открыть панель проверки]('+location.origin+location.pathname+'?mode=admin)',color:9055202,fields:[{name:'Игрок',value:app.login,inline:true},{name:'Имя/Возраст',value:app.name+' ('+app.age+')',inline:true},{name:'Discord',value:app.discord,inline:true},{name:'Опыт',value:app.exp,inline:true},{name:'Чит',value:app.soft,inline:true},{name:'Почему он',value:app.why}]}]})}).catch(()=>{});
    location.href='index.html';
  }catch(err){
    alert('Ошибка отправки: '+err.message);
    b.disabled=false;b.textContent='Отправить заявку';
  }
}

function watch(id){once(id);if(tmr)clearInterval(tmr);tmr=setInterval(()=>once(id),4000)}
async function once(id){
  try{
    const db=await getDB();
    const d=db.apps[id];if(!d)return;
    const cls=d.status==='review'?'st-review':d.status==='accept'?'st-accept':d.status==='reject'?'st-reject':'st-wait';
    const bTxt=d.status==='review'?'👀 Взято на рассмотрение':d.status==='accept'?'✅ Вы взяты!':d.status==='reject'?'❌ Вы отклонены':'⏳ Ожидает рассмотрения';
    const mTxt=d.status==='review'?'Администратор проверяет вашу анкету.':d.status==='accept'?'Поздравляем! С вами свяжутся в ДС, ждите.':d.status==='reject'?'Ваша заявка отклонена. С вами свяжутся в ДС при необходимости, ждите.':'Ваша анкета отправлена. Ожидайте.';
    const rTxt=d.reviewer?(d.status==='review'?'Взял: <b>'+d.reviewer+'</b>':'Рассмотрел: <b>'+d.reviewer+'</b>'):'';
    ['st-badge','p-badge'].forEach(el=>{const x=document.getElementById(el);if(x){x.className='badge '+cls;x.textContent=bTxt}});
    ['st-txt','p-st-txt'].forEach(el=>{const x=document.getElementById(el);if(x)x.textContent=mTxt});
    ['st-rev','p-st-rev'].forEach(el=>{const x=document.getElementById(el);if(x)x.innerHTML=rTxt});
  }catch(e){}
}

function admLog(e){
  e.preventDefault();
  if(document.getElementById('a-pass').value!==PASS){alert('Неверный пароль!');return}
  const n=document.getElementById('a-nick').value.trim();
  localStorage.setItem('s_adm',n);document.getElementById('a-cur').textContent=n;
  document.getElementById('adm-f').classList.add('hidden');document.getElementById('adm-box').classList.remove('hidden');loadAdm();
}

async function loadAdm(){
  const l=document.getElementById('a-list');l.innerHTML='Загрузка...';
  const db=await getDB(),d=db.apps;
  if(!d||!Object.keys(d).length){l.innerHTML='Заявок нет.';return}
  l.innerHTML='';
  for(const[id,a]of Object.entries(d).reverse()){
    let st='⏳ Ожидает';
    if(a.status==='review')st='👀 На рассмотрении ('+a.reviewer+')';
    if(a.status==='accept')st='✅ Взят ('+a.reviewer+')';
    if(a.status==='reject')st='❌ Отклонен ('+a.reviewer+')';
    l.innerHTML+='<div class="item"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>'+a.login+' ('+a.name+', '+a.age+')</strong><span style="color:#c4b5fd">'+st+'</span></div><p>Discord: '+a.discord+' | Опыт: '+a.exp+' | Чит: '+a.soft+'</p><p>'+a.why+'</p><div class="acts"><button class="abtn" style="background:#3b82f6" onclick="setA(\''+id+'\',\'review\')">👀 Взять на рассмотрение</button><button class="abtn" style="background:#10b981" onclick="setA(\''+id+'\',\'accept\')">✅ Взять</button><button class="abtn" style="background:#ef4444" onclick="setA(\''+id+'\',\'reject\')">❌ Отклонить</button></div></div>';
  }
}

async function setA(id,status){
  const db=await getDB();
