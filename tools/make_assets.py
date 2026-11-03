"""Reproducible vector drawing and additive audio synthesis; Python standard library only."""
from pathlib import Path
import math,wave,struct,json
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets/art'; AUDIO=ROOT/'assets/audio'
ART.mkdir(parents=True,exist_ok=True); AUDIO.mkdir(parents=True,exist_ok=True)
manifest=[]
def svg(name,body,role):
 content='<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">'+body+'</svg>'
 (ART/(name+'.svg')).write_text(content)
 manifest.append({'file':'assets/art/'+name+'.svg','type':'vector','role':role,'width':96,'height':96})
# Tile system: shared geometry and palette maintain legibility at small sizes.
for grown in [False,True]:
 name='floor_grown' if grown else 'floor'
 svg(name,f'<rect x="2" y="2" width="92" height="92" rx="9" fill="{"#dbe9c9" if grown else "#e5dfc8"}"/><path d="M6 48H90M48 6V90" stroke="{"#c6d8b1" if grown else "#d3ccb5"}" stroke-width="2"/><path d="M12 15H32M61 77H81" stroke="#f8f5e5" stroke-width="3" stroke-linecap="round"/>'+('<path d="M12 80q0-16 12-17q-2 12-12 17m62-58q0-12 10-14q0 10-10 14" fill="#85ad68"/>' if grown else ''),'restored floor' if grown else 'dry paving')
svg('wall','<rect x="2" y="2" width="92" height="92" rx="9" fill="#637b63"/><path d="M5 34h86M5 66h86M32 4v30M66 34v32M32 66v26" stroke="#81957b" stroke-width="3"/><path d="M22 15q-10 19 4 27M72 48q-22 9-7 28" stroke="#324e3c" stroke-width="4" fill="none"/><g fill="#a0ba77"><ellipse cx="19" cy="22" rx="11" ry="5" transform="rotate(-35 19 22)"/><ellipse cx="29" cy="35" rx="11" ry="5" transform="rotate(30 29 35)"/><ellipse cx="64" cy="60" rx="11" ry="5" transform="rotate(-35 64 60)"/></g>','ivy covered stone wall')
for active in [False,True]:
 svg('plate_on' if active else 'plate_off',f'<rect x="12" y="16" width="72" height="70" rx="13" fill="#86733e"/><rect x="12" y="{19 if active else 10}" width="72" height="66" rx="13" fill="{"#b9d58b" if active else "#edcf7d"}" stroke="#9a8544" stroke-width="3"/><circle cx="48" cy="42" r="12" fill="none" stroke="#68572d" stroke-width="3"/><path d="M48 20v6m0 32v6M26 42h6m32 0h6M32 26l5 5m22 22l5 5M32 58l5-5m22-22l5-5" stroke="#68572d" stroke-width="3" stroke-linecap="round"/>','pressed sun switch' if active else 'unpressed sun switch')
for opened in [False,True]:
 svg('gate_open' if opened else 'gate_closed','<rect x="8" y="12" width="80" height="76" rx="10" fill="#d2c49c"/><path d="M16 84V18h64v66" stroke="#82693c" stroke-width="7" fill="none"/>'+(''.join(f'<path d="M{x} 25v52" stroke="#bb9855" stroke-width="8" stroke-linecap="round"/>' for x in [30,48,66]) if not opened else '<path d="M25 80h46" stroke="#8eab60" stroke-width="7" stroke-linecap="round"/><path d="m36 46 9 9 17-21" stroke="#547840" stroke-width="5" fill="none"/>'),'open sun gate' if opened else 'closed sun gate')
for active in [False,True]:
 svg('terminal_on' if active else 'terminal_off',f'<rect x="14" y="18" width="68" height="68" rx="15" fill="#446e6b"/><rect x="21" y="14" width="54" height="53" rx="12" fill="{"#b7e2ba" if active else "#a4cac3"}" stroke="#436d66" stroke-width="3"/><path d="M48 25C42 35 34 42 37 49a12 12 0 0 0 22 0c3-7-5-14-11-24Z" fill="{"#418e69" if active else "#487b82"}"/><path d="M31 77h34" stroke="#d4d9ae" stroke-width="4" stroke-linecap="round"/>'+('<path d="M13 30H5m78 0h8M48 4v-3" stroke="#8aaf64" stroke-width="3"/>' if active else ''),'flowing water terminal' if active else 'inactive water terminal')
for ghost in [False,True]:
 for frame in range(4):
  wheel=3 if frame%2 else 0;eye=2 if frame==3 else 7
  color='#b4e1d9' if ghost else '#fff8dd';outline='#2f8f89' if ghost else '#355943'
  body=f'<ellipse cx="48" cy="85" rx="29" ry="6" fill="#355943" opacity=".15"/><g '+('opacity=".72"' if ghost else '')+f'><path d="M48 26V12" stroke="{outline}" stroke-width="4"/><ellipse cx="57" cy="11" rx="13" ry="6" transform="rotate(-30 57 11)" fill="{"#69c1b0" if ghost else "#8eae60"}"/><rect x="21" y="66" width="17" height="18" rx="6" fill="{outline}"/><rect x="58" y="66" width="17" height="18" rx="6" fill="{outline}"/><path d="M25 {73+wheel}h9m28 {-wheel+78}h9" stroke="#b7c58a" stroke-width="2"/><rect x="16" y="25" width="64" height="50" rx="18" fill="{color}" stroke="{outline}" stroke-width="3" '+('stroke-dasharray="6 4"' if ghost else '')+f'/><rect x="26" y="38" width="44" height="22" rx="8" fill="{outline}"/><rect x="36" y="{45 if eye==7 else 48}" width="5" height="{eye}" rx="2" fill="#e2f2bd"/><rect x="55" y="{45 if eye==7 else 48}" width="5" height="{eye}" rx="2" fill="#e2f2bd"/><path d="M40 67h16" stroke="#b8c98b" stroke-width="3" stroke-linecap="round"/></g>'
  svg(('echo_' if ghost else 'pip_')+str(frame),body,'Echo animation frame' if ghost else 'Pip animation frame')
# Mono PCM audio with gentle attack/release. No sampled or external audio.
RATE=22050
def write(name,notes,duration,role,music=False):
 samples=[]
 for i in range(int(RATE*duration)):
  t=i/RATE;v=0
  for start,freq,length,amp in notes:
   u=t-start
   if 0<=u<length:
    envelope=min(1,u/.02)*min(1,(length-u)/.08)
    v+=amp*envelope*math.exp(-u*(1.2 if music else 5))* (math.sin(2*math.pi*freq*u)+.2*math.sin(2*math.pi*freq*2*u))
  samples.append(int(max(-.92,min(.92,v))*32767))
 with wave.open(str(AUDIO/(name+'.wav')),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(struct.pack('<'+'h'*len(samples),*samples))
 manifest.append({'file':'assets/audio/'+name+'.wav','type':'audio','role':role,'duration':duration,'sample_rate':RATE,'channels':1,'bit_depth':16})
write('move',[(0,330,.12,.16)],.16,'movement click')
write('record',[(0,440,.18,.15),(.1,660,.22,.15)],.36,'record start or rewind')
write('gate',[(0,392,.22,.16),(.12,587.33,.24,.13)],.42,'gate opening chime')
write('reset',[(0,440,.2,.13),(.12,293.66,.22,.13)],.4,'reset descending cue')
write('restore',[(i*.14,f,.5,.16) for i,f in enumerate([261.63,329.63,392,523.25])],1.2,'restoration arpeggio')
write('garden_loop',[(i*.5,f,.8,.07) for i,f in enumerate([261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,523.25,293.66,349.23])],8,'quiet repeating garden melody',True)
(ROOT/'assets/manifest.json').write_text(json.dumps(manifest,indent=2))
print('Created',len(manifest),'assets')
