"""Validate asset inventory, parse vectors, and inspect PCM audio data."""
from pathlib import Path
import json,wave,struct,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1];items=json.loads((root/'assets/manifest.json').read_text())
assert len(items)==23
checks=[]
for item in items:
 p=root/item['file'];assert p.is_file()
 if item['type']=='vector':
  e=ET.parse(p).getroot();assert e.attrib['viewBox']=='0 0 96 96';assert not list(e.iter('{http://www.w3.org/2000/svg}script'))
  checks.append(p.name+': valid self-contained 96x96 SVG')
 else:
  with wave.open(str(p),'rb') as w:
   assert w.getnchannels()==1 and w.getsampwidth()==2 and w.getframerate()==22050
   values=struct.unpack('<'+'h'*w.getnframes(),w.readframes(w.getnframes()))
   assert any(values) and max(abs(v) for v in values)<32767
   assert values[0]==0 and abs(values[-1])<100
   checks.append(p.name+': mono 16-bit 22050 Hz PCM, non-silent, no full-scale clipping, quiet endpoints')
(root/'ASSET_VALIDATION.txt').write_text('\n'.join(checks)+'\n23 assets validated. This is structural validation, not listening or real-browser playback testing.\n')
print('23 assets validated')
