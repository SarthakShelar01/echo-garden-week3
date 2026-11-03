'use strict';
const {Game,LEVELS,LIMIT}=EchoGarden;
const game=new Game();
const $=id=>document.getElementById(id);
const canvas=$('board'),ctx=canvas.getContext('2d');
const ARROWS={up:'↑',right:'→',down:'↓',left:'←',wait:'•'};
let progress={},storageOK=true;
try{const saved=JSON.parse(localStorage.getItem('echo-garden-v1')||'{}');for(const [k,v]of Object.entries(saved)){if(LEVELS[k]&&Number.isFinite(v))progress[k]=v;}}catch{storageOK=false;}
function save(){try{localStorage.setItem('echo-garden-v1',JSON.stringify(progress));}catch{storageOK=false;}}
