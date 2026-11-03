/* SVG frame animation and visual interpolation never alter the turn-based rules. */
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let movement=null,gateFlash=0,restoredAt=0;
function picture(name,x,y,size){const image=art[name];if(image&&image.complete&&image.naturalWidth){ctx.drawImage(image,x,y,size,size);return;}ctx.fillStyle=name==='wall'?'#637b63':'#e2e2cf';ctx.fillRect(x+2,y+2,size-4,size-4);if(!['wall','floor','floor_grown'].includes(name)){ctx.fillStyle='#173e32';ctx.font=(size*.23)+'px system-ui';ctx.textAlign='center';const text=name.startsWith('pip')?'P':name.startsWith('echo')?'E':name.startsWith('gate')?'G':name.startsWith('plate')?'S':'T';ctx.fillText(text,x+size/2,y+size*.6);}}
function robot(p,ghost,cell,ox,oy,time){if(!p)return;let x=p.x,y=p.y;const from=movement&&(ghost?movement.echo:movement.player);const active=movement&&movement.level===game.level&&time-movement.start<150;
 if(active&&from&&!reducedMotion){let u=Math.min(1,(time-movement.start)/150);u=1-Math.pow(1-u,3);x=from.x+(x-from.x)*u;y=from.y+(y-from.y)*u;}
 const frame=reducedMotion?0:active?Math.floor(time/70)%3:Math.floor(time/550)%8===7?3:0;
 picture((ghost?'echo_':'pip_')+frame,ox+x*cell,oy+y*cell,cell);
}
function draw(time=performance.now()){if(typeof art==='undefined')return;ctx.clearRect(0,0,canvas.width,canvas.height);const rows=game.map.length,cols=game.map[0].length;const cell=Math.min((canvas.width-80)/cols,(canvas.height-70)/rows),ox=(canvas.width-cols*cell)/2,oy=(canvas.height-rows*cell)/2;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const t=game.map[y][x],a=ox+x*cell,b=oy+y*cell;picture(game.complete?'floor_grown':'floor',a,b,cell);if(t==='#')picture('wall',a,b,cell);if(t==='S')picture(game.gateOpen()?'plate_on':'plate_off',a,b,cell);if(t==='G')picture(game.gateOpen()?'gate_open':'gate_closed',a,b,cell);if(t==='T')picture(game.complete?'terminal_on':'terminal_off',a,b,cell);}
 if(game.snapshot&&game.commands.length){let p={...game.snapshot};ctx.strokeStyle='#2b887d';ctx.lineWidth=3;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(ox+(p.x+.5)*cell,oy+(p.y+.5)*cell);for(const c of game.commands){p=game.move(p,c,false);ctx.lineTo(ox+(p.x+.5)*cell,oy+(p.y+.5)*cell);}ctx.stroke();ctx.setLineDash([]);}
 robot(game.echo,true,cell,ox,oy,time);robot(game.player,false,cell,ox,oy,time);
 if(game.echo&&game.echo.x===game.player.x&&game.echo.y===game.player.y){ctx.strokeStyle='#27867b';ctx.setLineDash([5,4]);ctx.lineWidth=3;ctx.strokeRect(ox+game.player.x*cell+4,oy+game.player.y*cell+4,cell-8,cell-8);ctx.setLineDash([]);}
 if(!reducedMotion&&game.gateOpen()&&time-gateFlash<500){const g=game.find('G');if(g){ctx.strokeStyle='#eac46c';ctx.lineWidth=4;ctx.globalAlpha=Math.max(0,1-(time-gateFlash)/500);ctx.strokeRect(ox+g.x*cell+3,oy+g.y*cell+3,cell-6,cell-6);ctx.globalAlpha=1;}}
 if(!reducedMotion&&game.complete&&time-restoredAt<2200){const t=game.find('T'),u=(time-restoredAt)/2200;ctx.fillStyle='#72a9a0';ctx.globalAlpha=1-u;for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.beginPath();ctx.arc(ox+(t.x+.5)*cell+Math.cos(a)*u*cell*1.5,oy+(t.y+.5)*cell+Math.sin(a)*u*cell*1.5,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
}
function tick(time){draw(time);requestAnimationFrame(tick);}
