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
const baseDebuffKeys=['gc1-truth','gc2-truth','fire-truth','tsunami-truth'];
document.querySelectorAll('.choice-row button').forEach(button=>button.addEventListener('click',()=>{
  const row=button.closest('.choice-row'),key=row.dataset.key;
  debuffs[key]=button.dataset.value;
  row.querySelectorAll('button').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',item===button);});
  if(key==='gc2-truth')syncElementInputs();
  if(isDebuffComplete())showTimeline();
}));
document.querySelectorAll('.element-choice button').forEach(button=>button.addEventListener('click',()=>{
  const gc=button.closest('.element-choice').dataset.gc;
  debuffs.elementGc=gc;debuffs.elementKind=button.dataset.kind;debuffs.elementTiming=button.dataset.timing;
  document.querySelectorAll('.element-choice button').forEach(item=>item.classList.toggle('selected',item===button));
  syncElementInputs();
  if(isDebuffComplete())showTimeline();
}));
function syncElementInputs(){
  const gc2Choice=document.querySelector('.element-choice[data-gc="gc2"]'),gc2Auto=document.querySelector('#gc2-auto');
  if(!debuffs['gc2-truth']){gc2Choice.hidden=true;gc2Auto.hidden=true;return;}
  gc2Choice.hidden=debuffs.elementGc==='gc1';gc2Auto.hidden=debuffs.elementGc!=='gc1';
}
function isDebuffComplete(){return baseDebuffKeys.every(key=>debuffs[key])&&debuffs.elementGc;}
function resetDebuffs(){
  for(const key of Object.keys(debuffs))delete debuffs[key];
  document.querySelectorAll('.choice-row button,.element-choice button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
  document.querySelector('.element-choice[data-gc="gc2"]').hidden=true;
  document.querySelector('#gc2-auto').hidden=true;
  document.querySelector('#debuff-input').hidden=false;
  document.querySelector('#debuff-result').hidden=true;
}
function resolveElement(truth,kind){
  const spread=(truth==='ほんと'&&kind==='雷')||(truth==='うそ'&&kind==='水');
  return {icons:`<i class="sprite ${kind==='雷'?'lightning':'water'}"></i>`,action:spread?'離れる':'頭割り'};
}
function resolveGaze(truth){return truth==='ほんと'?'見ない':'見る';}
function resolveAcceleration(truth){return truth==='ほんと'?'止まる':'動く';}
function resolveChaos(kind,truth){return kind==='ほのお'?(truth==='ほんと'?'外安置':'中安置'):(truth==='ほんと'?'中安置':'外安置');}
function showTimeline(){
  const elementGc=debuffs.elementGc,otherGc=elementGc==='gc1'?'gc2':'gc1';
  const element=resolveElement(debuffs[`${elementGc}-truth`],debuffs.elementKind);
  const elementTiming=debuffs.elementTiming;
  const otherTruth=debuffs[`${otherGc}-truth`];
  const actionRow=(icons,action)=>`<div class="timeline-action"><div class="timeline-icons">${icons}</div><strong>${action}</strong></div>`;
  const timedActions=timing=>elementTiming===timing?actionRow(element.icons,element.action):actionRow('<i class="sprite gc-true"></i><i class="sprite acceleration"></i>',`頭割り・${resolveAcceleration(otherTruth)}`);
  const gazeAction=gc=>actionRow('<i class="sprite gaze"></i>',resolveGaze(debuffs[`${gc}-truth`]));
  document.querySelector('#debuff-result').innerHTML=`
    <article class="timeline-step"><b>①</b><div class="timeline-copy"><small>早処理＋加速度</small>${timedActions('早')}</div></article>
    <article class="timeline-step"><b>②</b><div class="timeline-copy"><small>視線①</small>${gazeAction('gc1')}</div></article>
    <article class="timeline-step"><b>③</b><div class="timeline-copy"><small>ほのお</small>${actionRow('<i class="sprite fire"></i>',resolveChaos('ほのお',debuffs['fire-truth']))}</div></article>
    <article class="timeline-step"><b>④</b><div class="timeline-copy"><small>遅処理＋加速度</small>${timedActions('遅')}</div></article>
    <article class="timeline-step"><b>⑤</b><div class="timeline-copy"><small>視線②</small>${gazeAction('gc2')}</div></article>
    <article class="timeline-step"><b>⑥</b><div class="timeline-copy"><small>つなみ</small>${actionRow('<i class="sprite chaos-water"></i>',resolveChaos('つなみ',debuffs['tsunami-truth']))}</div></article>
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
console.assert(resolveElement('うそ','雷').action==='頭割り');
console.assert(resolveElement('ほんと','水').action==='頭割り');
console.assert(resolveGaze('ほんと')==='見ない');
console.assert(resolveAcceleration('うそ')==='動く');
console.assert(resolveChaos('ほのお','ほんと')==='外安置');
console.assert(resolveChaos('つなみ','ほんと')==='中安置');
