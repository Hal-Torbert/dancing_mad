const state={chargeThunder:null,chargeBlizzard:null,outThunder:null,outBlizzard:null};
const debuffs={};
document.querySelectorAll('.truth-input').forEach(row=>{row.querySelector('div').innerHTML='<button class="truth true" data-value="true">真</button><button class="truth false" data-value="false">偽</button>';});

function render(){
  document.querySelectorAll('.truth-input').forEach(row=>row.querySelectorAll('.truth').forEach(button=>button.classList.toggle('selected',String(state[row.dataset.key])===button.dataset.value)));
  const ready=Object.values(state).every(value=>value!==null),result=document.querySelector('#result');
  result.classList.toggle('pending',!ready);
  if(!ready){result.innerHTML='<span>FINAL ACTION</span><h2>4項目を入力</h2>';return;}
  result.innerHTML=`<span>FINAL ACTION</span><h2>${resolveMagicOut(state)}</h2>`;
}
function resolveMagicOut({chargeThunder,chargeBlizzard,outThunder,outBlizzard}){
  const line=chargeThunder!==outThunder,fan=chargeBlizzard!==outBlizzard;
  return line&&fan?'両方踏む':fan?'扇踏む（ブリザガ）':line?'ライン踏む（サンダガ）':'両方踏まない';
}
document.addEventListener('click',event=>{const button=event.target.closest('.truth');if(button){state[button.closest('.truth-input').dataset.key]=button.dataset.value==='true';render();}});
const elementKinds=['雷','水'];
const otherKinds=['視線＋加速度','加速度のみ'];
const baseDebuffKeys=['gc1-truth','gc1-kind','chaos1-truth','chaos1-kind','gc2-truth','gc2-kind','chaos2-truth','gc3-debuff','beam-truth'];
document.querySelectorAll('.choice-row button').forEach(button=>button.addEventListener('click',()=>{
  const row=button.closest('.choice-row'),key=row.dataset.key;
  debuffs[key]=button.dataset.value;
  row.querySelectorAll('button').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',item===button);});
  if(key==='gc1-kind'){toggleTiming('gc1');limitGc2Kinds();}
  if(key==='gc2-kind')toggleTiming('gc2');
  if(key==='chaos1-kind')document.querySelector('#chaos2-kind').textContent=`2回目：${opposite(button.dataset.value,'ほのお','つなみ')}（自動）`;
  if(isDebuffComplete())showTimeline();
}));
function clearRow(key){
  delete debuffs[key];
  document.querySelector(`[data-key="${key}"]`).querySelectorAll('button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
}
function toggleTiming(gc){
  const row=document.querySelector(`[data-key="${gc}-timing"]`),needsTiming=elementKinds.includes(debuffs[`${gc}-kind`]);
  row.hidden=!needsTiming;
  if(!needsTiming)clearRow(`${gc}-timing`);
}
function limitGc2Kinds(){
  const allowed=allowedGc2Kinds(debuffs['gc1-kind']);
  const row=document.querySelector('[data-key="gc2-kind"]');
  row.querySelectorAll('button').forEach(button=>button.hidden=!allowed.includes(button.dataset.value));
  if(debuffs['gc2-kind']&&!allowed.includes(debuffs['gc2-kind'])){clearRow('gc2-kind');clearRow('gc2-timing');document.querySelector('[data-key="gc2-timing"]').hidden=true;}
}
function allowedGc2Kinds(gc1Kind){return elementKinds.includes(gc1Kind)?otherKinds:elementKinds;}
function isDebuffComplete(){
  const required=[...baseDebuffKeys];
  if(elementKinds.includes(debuffs['gc1-kind']))required.push('gc1-timing');
  if(elementKinds.includes(debuffs['gc2-kind']))required.push('gc2-timing');
  return required.every(key=>debuffs[key]);
}
function resetDebuffs(){
  for(const key of Object.keys(debuffs))delete debuffs[key];
  document.querySelectorAll('.choice-row button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
  document.querySelectorAll('.timing-row').forEach(row=>row.hidden=true);
  document.querySelectorAll('[data-key="gc2-kind"] button').forEach(button=>button.hidden=false);
  document.querySelector('#chaos2-kind').textContent='種類は1回目の反対を自動選択';
  document.querySelector('#debuff-input').hidden=false;
  document.querySelector('#debuff-result').hidden=true;
}
function opposite(value,a,b){return value===a?b:a;}
function resolveElement(truth,kind){
  const spread=(truth==='ほんと'&&kind==='雷')||(truth==='うそ'&&kind==='水');
  return {icons:`<i class="sprite ${kind==='雷'?'lightning':'water'}"></i>`,action:spread?'離れる':'近づく'};
}
function resolveGaze(truth){return truth==='ほんと'?'見ない':'見る';}
function resolveAcceleration(truth){return truth==='ほんと'?'止まる':'動く';}
function resolveChaos(kind,truth){return kind==='ほのお'?(truth==='ほんと'?'外安置':'中安置'):(truth==='ほんと'?'中安置':'外安置');}
function resolveBeam(debuff,truth){const different=(debuff==='アラガン異色')===(truth==='ほんと');return different?'異色を受ける':'同色を受ける';}
function showTimeline(){
  const elementGc=elementKinds.includes(debuffs['gc1-kind'])?'gc1':'gc2',otherGc=elementGc==='gc1'?'gc2':'gc1';
  const element=resolveElement(debuffs[`${elementGc}-truth`],debuffs[`${elementGc}-kind`]);
  const elementTiming=debuffs[`${elementGc}-timing`];
  const otherTruth=debuffs[`${otherGc}-truth`];
  const fireTruth=debuffs['chaos1-kind']==='ほのお'?debuffs['chaos1-truth']:debuffs['chaos2-truth'];
  const waterTruth=debuffs['chaos1-kind']==='つなみ'?debuffs['chaos1-truth']:debuffs['chaos2-truth'];
  const gc3Icon=debuffs['gc3-debuff']==='アラガン異色'?'allagan':'transcendence';
  const actionRow=(icons,action)=>`<div class="timeline-action"><div class="timeline-icons">${icons}</div><strong>${action}</strong></div>`;
  const timedActions=timing=>elementTiming===timing?actionRow(element.icons,element.action):actionRow('<i class="sprite gc-true"></i><i class="sprite acceleration"></i>',`頭割り・${resolveAcceleration(otherTruth)}`);
  const gazeAction=gc=>actionRow('<i class="sprite gaze"></i>',resolveGaze(debuffs[`${gc}-truth`]));
  document.querySelector('#debuff-result').innerHTML=`
    <article class="timeline-step"><b>①</b><div class="timeline-copy"><small>無の氾濫＋GC3ビーム</small>${actionRow(`<i class="sprite ${gc3Icon}"></i>`,resolveBeam(debuffs['gc3-debuff'],debuffs['beam-truth']))}</div></article>
    <article class="timeline-step"><b>②</b><div class="timeline-copy"><small>散開／頭割り①＋早い加速度</small>${timedActions('早')}</div></article>
    <article class="timeline-step"><b>③</b><div class="timeline-copy"><small>視線①</small>${gazeAction('gc1')}</div></article>
    <article class="timeline-step"><b>④</b><div class="timeline-copy"><small>ほのお</small>${actionRow('<i class="sprite fire"></i>',resolveChaos('ほのお',fireTruth))}</div></article>
    <article class="timeline-step"><b>⑤</b><div class="timeline-copy"><small>散開／頭割り②＋遅い加速度</small>${timedActions('遅')}</div></article>
    <article class="timeline-step"><b>⑥</b><div class="timeline-copy"><small>視線②</small>${gazeAction('gc2')}</div></article>
    <article class="timeline-step"><b>⑦</b><div class="timeline-copy"><small>つなみ</small>${actionRow('<i class="sprite chaos-water"></i>',resolveChaos('つなみ',waterTruth))}</div></article>
    <div class="timeline-controls"><button id="edit-debuff">入力へ戻る</button><button id="reset-left">左側をリセット</button></div>`;
  document.querySelector('#debuff-input').hidden=true;
  document.querySelector('#debuff-result').hidden=false;
}
document.querySelector('#clear-debuff').addEventListener('click',resetDebuffs);
document.querySelector('#debuff-result').addEventListener('click',event=>{if(event.target.id==='edit-debuff'){event.currentTarget.hidden=true;document.querySelector('#debuff-input').hidden=false;}if(event.target.id==='reset-left')resetDebuffs();});
document.querySelector('#clear').addEventListener('click',()=>{for(const key of Object.keys(state))state[key]=null;render();});
document.querySelector('#reset-all').addEventListener('click',()=>{resetDebuffs();for(const key of Object.keys(state))state[key]=null;render();});
render();

console.assert(resolveMagicOut({chargeThunder:true,outThunder:false,chargeBlizzard:true,outBlizzard:false})==='両方踏む');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:true,chargeBlizzard:true,outBlizzard:false})==='扇踏む（ブリザガ）');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:false,chargeBlizzard:true,outBlizzard:true})==='ライン踏む（サンダガ）');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:true,chargeBlizzard:false,outBlizzard:false})==='両方踏まない');
console.assert(resolveElement('ほんと','雷').action==='離れる');
console.assert(resolveElement('うそ','水').action==='離れる');
console.assert(resolveGaze('ほんと')==='見ない');
console.assert(resolveAcceleration('うそ')==='動く');
console.assert(allowedGc2Kinds('雷').join(',')==='視線＋加速度,加速度のみ');
console.assert(allowedGc2Kinds('加速度のみ').join(',')==='雷,水');
console.assert(resolveChaos('ほのお','ほんと')==='外安置');
console.assert(resolveChaos('つなみ','ほんと')==='中安置');
console.assert(resolveBeam('アラガン異色','うそ')==='同色を受ける');
