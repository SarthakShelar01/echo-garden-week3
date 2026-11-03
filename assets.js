/* File-based vector art and audio. All runtime URLs are relative and work offline. */
const ART_NAMES=['floor','floor_grown','wall','plate_on','plate_off','gate_open','gate_closed','terminal_on','terminal_off',...Array.from({length:4},(_,i)=>'pip_'+i),...Array.from({length:4},(_,i)=>'echo_'+i)];
const art={};let assetFailures=0;
for(const name of ART_NAMES){const image=new Image();image.onload=()=>draw();image.onerror=()=>{assetFailures++;$('asset-status').textContent='Some artwork could not load. Extract the entire ZIP, keeping the assets folder beside index.html.';};image.src='assets/art/'+name+'.svg';art[name]=image;}
const sounds={};for(const name of ['move','record','gate','reset','restore','garden_loop']){const a=new Audio('assets/audio/'+name+'.wav');a.preload='auto';a.volume=name==='garden_loop'?.18:.35;sounds[name]=a;}
sounds.garden_loop.loop=true;
let soundEnabled=false,musicEnabled=false;
function playSound(name){if(!soundEnabled)return;try{const a=sounds[name];a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{$('asset-status').textContent='Audio could not play. You can continue with visual feedback.';});}catch{/* Optional audio must never interrupt a puzzle. */}}
function setSound(){soundEnabled=!soundEnabled;$('sound').textContent='Effects: '+(soundEnabled?'on':'off');$('sound').setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)playSound('record');else for(const [n,a]of Object.entries(sounds))if(n!=='garden_loop')a.pause();}
function setMusic(){musicEnabled=!musicEnabled;$('music').textContent='Music: '+(musicEnabled?'on':'off');$('music').setAttribute('aria-pressed',String(musicEnabled));if(musicEnabled){const p=sounds.garden_loop.play();if(p&&p.catch)p.catch(()=>{musicEnabled=false;$('music').textContent='Music: off';$('music').setAttribute('aria-pressed','false');$('asset-status').textContent='Music could not start. Try the button again after checking your browser audio settings.';});}else sounds.garden_loop.pause();}
$('sound').onclick=setSound;$('music').onclick=setMusic;
