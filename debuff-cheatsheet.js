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
document.querySelectorAll('.choice-row button').forEach(button=>button.addEventListener('click',()=>{
  const row=button.closest('.choice-row');
  debuffs[row.dataset.key]=button.dataset.value;
  row.querySelectorAll('button').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',item===button);});
  if(Object.keys(debuffs).length===6)showTimeline();
}));
function resetDebuffs(){
  for(const key of Object.keys(debuffs))delete debuffs[key];
  document.querySelectorAll('.choice-row button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
  document.querySelector('#debuff-input').hidden=false;
  document.querySelector('#debuff-result').hidden=true;
}
function resolveGc(truth,element,timing){return {element,timing,position:element==='雷'?'離れる':'近づく',motion:truth==='ほんと'?'見ない・止まる':'見る・動く'};}
function opposite(value,a,b){return value===a?b:a;}
function resolveFire(truth){return truth==='ほんと'?'外':'内';}
function resolveWave(truth){return truth==='ほんと'?'内':'外';}
function showTimeline(){
  const gc1=resolveGc(debuffs['gc-truth'],debuffs['gc-element'],debuffs['gc-timing']);
  const gc2=resolveGc(opposite(debuffs['gc-truth'],'うそ','ほんと'),opposite(debuffs['gc-element'],'雷','水'),opposite(debuffs['gc-timing'],'早','遅'));
  const gc3Icon=debuffs['gc3-debuff']==='アラガン異色'?'allagan':'transcendence';
  const gcRows=gc=>`<div class="timeline-action"><div class="timeline-icons"><i class="sprite ${gc.element==='雷'?'lightning':'water'}"></i></div><strong>${gc.position}（${gc.timing}処理）</strong></div><div class="timeline-action"><div class="timeline-icons"><i class="sprite gaze"></i><i class="sprite acceleration"></i></div><strong>${gc.motion}</strong></div>`;
  document.querySelector('#debuff-result').innerHTML=`
    <article class="timeline-step"><b>①</b><div class="timeline-copy"><small>GC1</small>${gcRows(gc1)}</div></article>
    <article class="timeline-step"><b>②</b><div class="timeline-copy"><small>ほのおつなみ 1回目</small><div class="timeline-action"><div class="timeline-icons"><i class="sprite fire"></i></div><strong>${resolveFire(debuffs.fire)}安置</strong></div></div></article>
    <article class="timeline-step"><b>③</b><div class="timeline-copy"><small>GC2</small>${gcRows(gc2)}</div></article>
    <article class="timeline-step"><b>④</b><div class="timeline-copy"><small>ほのおつなみ 2回目</small><div class="timeline-action"><div class="timeline-icons"><i class="sprite chaos-water"></i></div><strong>${resolveWave(debuffs.water)}安置</strong></div></div></article>
    <article class="timeline-step"><b>⑤</b><div class="timeline-copy"><small>GC3</small><div class="timeline-action"><div class="timeline-icons"><i class="sprite ${gc3Icon}"></i></div><strong>${debuffs['gc3-debuff']==='アラガン異色'?'異色を受ける':'同色を受ける'}</strong></div></div></article>
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
console.assert(resolveGc('ほんと','雷','早').motion==='見ない・止まる');
console.assert(resolveGc('うそ','水','遅').motion==='見る・動く');
console.assert(resolveGc('ほんと','雷','早').timing==='早');
console.assert(opposite('早','早','遅')==='遅');
console.assert(resolveFire('ほんと')==='外'&&resolveFire('うそ')==='内');
console.assert(resolveWave('ほんと')==='内'&&resolveWave('うそ')==='外');
