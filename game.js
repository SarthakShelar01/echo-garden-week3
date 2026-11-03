'use strict';
function render(){const l=LEVELS[game.level];$('room-number').textContent='TERRACE 0'+(game.level+1);$('room-title').textContent=l.name;$('room-subtitle').textContent=l.subtitle;$('mode').textContent=game.complete?'RESTORED':game.mode.toUpperCase();$('status').textContent=game.note;$('turns').textContent=game.turns;$('resets').textContent=game.resets;$('progress').textContent=Object.keys(progress).length+' / 3';$('hint').textContent=l.hint;
 $('memory-help').textContent=!l.echo?'First, get to know Pip. Walk to the water terminal and activate it.':game.mode==='recording'?'Every move becomes a memory. Finish to rewind Pip to the start.':'Record up to eight commands. Your Echo replays them, then holds its last position.';
 $('trail').replaceChildren();for(let i=0;i<LIMIT;i++){const li=document.createElement('li');li.dataset.step=i+1;li.textContent=ARROWS[game.commands[i]]||'·';li.className=!game.commands[i]?'empty':game.mode==='replay'&&i<game.index?'played':'';$('trail').append(li);}
 $('record').disabled=!l.echo||game.complete||game.mode==='replay';$('record').innerHTML=(game.mode==='recording'?'Finish recording':game.mode==='replay'?'Echo is replaying':'Start recording')+' <kbd>E</kbd>';
 $('save-note').textContent=storageOK?'Completed rooms save on this browser when storage is available.':'Browser storage is unavailable. You can still play; progress lasts for this session.';
 $('levels').replaceChildren();LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.setAttribute('aria-current',String(i===game.level));b.innerHTML='<span class="num">0'+(i+1)+'</span>'+l.name+(progress[i]?' ✓':'');b.onclick=()=>{if($('done').open)$('done').close();game.load(i);movement=null;render();};$('levels').append(b);});draw();}
function actImpl(command){if($('done').open)return;if(command==='record')game.record();else if(command==='reset')game.reset();else if(command==='activate'){if(game.interact()){progress[game.level]=Math.max(progress[game.level]||0,game.score());save();$('done-title').textContent=game.level===2?'The rooftop is waking up.':'Water finds its way.';$('done-copy').textContent='Terrace '+(game.level+1)+' restored in '+game.turns+' turns with '+game.resets+' resets.';$('score').textContent=game.score()+' restoration points';$('next').textContent=game.level===2?'Back to the first terrace →':'Next terrace →';$('done').showModal();}}else game.step(command);render();}
function act(command){
 if($('done').open)return;
 const oldPlayer={...game.player},oldEcho=game.echo?{...game.echo}:null,oldGate=game.gateOpen(),oldMode=game.mode,oldComplete=game.complete;
 actImpl(command);
 if(['up','down','left','right','wait'].includes(command)){
  movement={player:oldPlayer,echo:oldEcho,start:performance.now(),level:game.level};
  if(oldPlayer.x!==game.player.x||oldPlayer.y!==game.player.y)playSound('move');
 }else movement=null;
 if(oldMode==='recording'&&game.mode==='replay')movement=null;
 if(command==='record'&&oldMode!==game.mode)playSound('record');
 if(command==='reset')playSound('reset');
 if(!oldGate&&game.gateOpen()){gateFlash=performance.now();playSound('gate');}
 if(!oldComplete&&game.complete){restoredAt=performance.now();playSound('restore');}
}
$('record').onclick=()=>act('record');$('reset').onclick=()=>act('reset');$('activate').onclick=()=>act('activate');document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>act(b.dataset.move));$('next').onclick=()=>{$('done').close();game.load((game.level+1)%LEVELS.length);render();};$('replay').onclick=()=>{$('done').close();game.reset();render();};
const KEYS={ArrowUp:'up',w:'up',ArrowRight:'right',d:'right',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',' ':'wait',e:'record',r:'reset',Backspace:'reset',Enter:'activate'};
document.addEventListener('keydown',ev=>{if($('done').open||ev.ctrlKey||ev.metaKey||ev.altKey)return;const tag=ev.target.tagName;if(['INPUT','TEXTAREA','SELECT','SUMMARY'].includes(tag)||((tag==='BUTTON')&&(ev.key==='Enter'||ev.key===' ')))return;const k=KEYS[ev.key]||KEYS[ev.key.toLowerCase()];if(k){ev.preventDefault();if(!ev.repeat)act(k);}});
render();
requestAnimationFrame(tick);
