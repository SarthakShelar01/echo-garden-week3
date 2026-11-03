/* Pure game rules. Shared by the browser and automated tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EchoGarden=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LIMIT=8;
const LEVELS=[
 {name:'First steps',subtitle:'Wake the first water terminal.',echo:false,map:['#########','#...#...#','#P..#..T#','#.......#','#########'],hint:'Go below the stone divider, then return to the terminal.'},
 {name:'A helping echo',subtitle:'Let your Echo hold the sun plate.',echo:true,map:['#########','#..S.#..#','#P...G.T#','#....#..#','#########'],hint:'Record Up, Right, Right. Finish recording. Move Right six times, then activate the terminal.'},
 {name:'The long way round',subtitle:'Take separate routes to restore the terrace.',echo:true,map:['###########','#...S.#...#','#..#..#...#','#..#..G...#','#P....#..T#','#.....#...#','###########'],hint:'Record Up, Up, Up, Right, Right, Right. Replay with six waits, then Right ×4, Up, Right ×4, Down. Activate the terminal.'}
];
const DELTA={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0],wait:[0,0]};
const copy=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y;
class Game{
 constructor(level=0){this.load(level);}
 load(level){if(!Number.isInteger(level)||!LEVELS[level])throw Error('Invalid level');this.level=level;this.resets=0;this.reset(false);}
 reset(count=true){if(count)this.resets++;const l=LEVELS[this.level];this.map=l.map;this.player=this.find('P');this.echo=null;this.commands=[];this.index=0;this.turns=0;this.mode='planning';this.complete=false;this.snapshot=null;this.note='Explore the room. '+(l.echo?'Record a route to make an Echo.':'Find the water terminal.');}
 find(ch){for(let y=0;y<this.map.length;y++){const x=this.map[y].indexOf(ch);if(x>=0)return{x,y};}return null;}
 tile(p){return this.map[p.y]?.[p.x]||'#';}
 gateOpen(){const s=this.find('S');return !!s&&(same(s,this.player)||same(s,this.echo));}
 move(pos,command,open){const [dx,dy]=DELTA[command];const n={x:pos.x+dx,y:pos.y+dy};const t=this.tile(n);return t==='#'||(t==='G'&&!open&&!same(n,pos))?copy(pos):n;}
 record(){if(this.complete)return false;if(!LEVELS[this.level].echo){this.note='This room teaches movement. Echo recording starts in room 2.';return false;}
  if(this.mode==='planning'){this.snapshot=copy(this.player);this.commands=[];this.mode='recording';this.note='Recording. Use up to eight moves or waits, then finish.';return true;}
  if(this.mode==='recording'){if(!this.commands.length){this.note='Record at least one command first.';return false;}this.player=copy(this.snapshot);this.echo=copy(this.snapshot);this.index=0;this.turns=0;this.mode='replay';this.note='Rewound. Each move also advances your Echo.';return true;}
  this.note='Reset the room before making a new recording.';return false;
 }
 step(command){if(!DELTA[command]||this.complete)return false;const open=this.gateOpen();this.player=this.move(this.player,command,open);
  if(this.mode==='recording'){this.commands.push(command);this.note='Recorded '+this.commands.length+' / '+LIMIT+' commands.';if(this.commands.length===LIMIT)this.record();}
  else{if(this.mode==='replay'&&this.index<this.commands.length){this.echo=this.move(this.echo,this.commands[this.index],open);this.index++;}this.turns++;this.note=this.gateOpen()?'Sun gate open. Reach the terminal.':(this.mode==='replay'?'Echo step '+this.index+' / '+this.commands.length+'.':'Find a route to the terminal.');}return true;
 }
 interact(){if(this.complete)return false;if(this.mode==='recording'){this.note='Finish recording before restoring the terminal.';return false;}if(same(this.player,this.find('T'))){this.complete=true;this.note='Water restored. This terrace is growing again.';return true;}this.note='Stand on the water terminal, then activate it.';return false;}
 score(){return Math.max(100,1000-this.turns*10-this.resets*20);}
}
return {Game,LEVELS,LIMIT};
});
