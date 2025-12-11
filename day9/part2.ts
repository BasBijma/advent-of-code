import { getInputFile } from '../globals';
const P = getInputFile(import.meta.url).split('\n').map(l => l.split(',').map(Number));
const S = P.map(([a,b],i) => { const [c,d] = P[(i+1)%P.length]; return [Math.min(a,c),Math.min(b,d),Math.max(a,c),Math.max(b,d),b===d]; });
const inside = (x,y) => S.filter(([a,b,,d,h]) => !h && a>x && y>=b && y<d).length % 2 === 1;
const edge = (x,y) => S.some(([a,b,c,d,h]) => h ? y===b && x>=a && x<=c : x===a && y>=b && y<=d);
const cuts = ([a,b,c,d,h],x1,y1,x2,y2) => h ? b>y1 && b<y2 && a<x2 && c>x1 : a>x1 && a<x2 && b<y2 && d>y1;
const ok = (a,b,c,d) => { const [x1,x2,y1,y2] = [Math.min(a,c),Math.max(a,c),Math.min(b,d),Math.max(b,d)];
  return [[x1,y1],[x2,y1],[x1,y2],[x2,y2]].every(([x,y])=>inside(x,y)||edge(x,y)) && !S.some(s=>cuts(s,x1,y1,x2,y2)); };
let m = 0;
for (let i=0; i<P.length; i++) for (let j=i+1; j<P.length; j++) { const [[a,b],[c,d]] = [P[i],P[j]];
  if (ok(a,b,c,d)) m = Math.max(m, (Math.abs(a-c)+1)*(Math.abs(b-d)+1)); }
console.log(m);