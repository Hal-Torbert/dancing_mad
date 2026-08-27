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
  const groups=[...document.querySelectorAll('.gc-select')].map(group=>{
    const values=[...group.querySelectorAll('.choice-row')].map(row=>debuffs[row.dataset.key]).filter(Boolean);
    return values.length?`<p><b>${group.dataset.gc}</b>${values.join('・')}</p>`:'';
  }).join('');
  document.querySelector('#debuff-result').innerHTML=`<span>SELECTED DEBUFFS</span>${groups||'<h3>選択してください</h3>'}`;
}));
document.querySelector('#clear-debuff').addEventListener('click',()=>{
  for(const key of Object.keys(debuffs))delete debuffs[key];
  document.querySelectorAll('.choice-row button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});
  document.querySelector('#debuff-result').innerHTML='<span>SELECTED DEBUFFS</span><h3>選択してください</h3>';
});
document.querySelector('#clear').addEventListener('click',()=>{for(const key of Object.keys(state))state[key]=null;render();});
render();

console.assert(resolveMagicOut({chargeThunder:true,outThunder:false,chargeBlizzard:true,outBlizzard:false})==='両方踏む');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:true,chargeBlizzard:true,outBlizzard:false})==='扇踏む（ブリザガ）');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:false,chargeBlizzard:true,outBlizzard:true})==='ライン踏む（サンダガ）');
console.assert(resolveMagicOut({chargeThunder:true,outThunder:true,chargeBlizzard:false,outBlizzard:false})==='両方踏まない');
