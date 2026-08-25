const state={chargeThunder:null,chargeBlizzard:null,outThunder:null,outBlizzard:null};
document.querySelectorAll('.truth-input').forEach(row=>{row.querySelector('div').innerHTML='<button class="truth true" data-value="true">真</button><button class="truth false" data-value="false">偽</button>';});

function render(){
  document.querySelectorAll('.truth-input').forEach(row=>row.querySelectorAll('.truth').forEach(button=>button.classList.toggle('selected',String(state[row.dataset.key])===button.dataset.value)));
  const ready=Object.values(state).every(value=>value!==null),result=document.querySelector('#result');
  result.classList.toggle('pending',!ready);
  if(!ready){result.innerHTML='<span>FINAL ACTION</span><h2>4項目を入力</h2>';return;}
  const thunder=state.chargeThunder===state.outThunder,blizzard=state.chargeBlizzard===state.outBlizzard;
  result.innerHTML=`<span>FINAL ACTION</span><div class="final-actions"><div class="final-action"><i>⚡</i><strong>直線を${thunder?'踏まない':'踏む'}</strong><small>最終サンダガ</small></div><div class="final-action"><i>❄</i><strong>扇を${blizzard?'踏まない':'踏む'}</strong><small>最終ブリザガ</small></div></div>`;
}
document.addEventListener('click',event=>{const button=event.target.closest('.truth');if(button){state[button.closest('.truth-input').dataset.key]=button.dataset.value==='true';render();}});
document.querySelector('#clear').addEventListener('click',()=>{for(const key of Object.keys(state))state[key]=null;render();});
render();

console.assert((true===false)===false);
console.assert((false===false)===true);
