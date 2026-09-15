import test from 'node:test';
import assert from 'node:assert/strict';
import {localRound,runOperation,operationOptions,parseKeys} from '../dist/splay-proof-engine.js';
import {rotationTrees,proofMarkdown,treeSVG} from '../dist/splay-proof.js';
const eps=1e-9;
let seed=42601;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
function keys(t){return t?[...keys(t.left),t.key,...keys(t.right)]:[]}
function verify(t,min=-Infinity,max=Infinity){if(!t)return{n:0,phi:0};assert.ok(t.key>min&&t.key<max,'BST ordering');const l=verify(t.left,min,t.key),r=verify(t.right,t.key,max);assert.equal(t.size,l.n+r.n+1,'cached size');return{n:t.size,phi:Math.log2(t.size)+l.phi+r.phi}}
function audit(trace){let c=0,amortized=0;for(const f of trace.frames){const phi=f.trees.reduce((v,t)=>v+verify(t).phi,0),all=f.trees.flatMap(keys);assert.equal(new Set(all).size,all.length,'one node belongs to exactly one forest component');assert.ok(Math.abs(phi-f.phi)<eps);c+=f.c;amortized+=f.amortized;assert.ok(Math.abs(c+phi-trace.initialPhi-amortized)<eps,'potential telescoping at every step');if(f.phase==='断边 / Split')assert.ok(f.delta<=eps);if(f.phase==='插入叶节点')assert.ok(f.delta<=Math.log2(all.length)+eps)}assert.equal(c,trace.rotations);assert.ok(Math.abs(amortized-trace.amortized)<eps);return trace.frames.at(-1).trees.flatMap(keys).sort((a,b)=>a-b)}
test('weighted local inequalities and illustrated subtree sums, including empty subtrees',()=>{
 for(let i=0;i<1600;i++)for(const kind of ['zig','zigzig','zigzag']){const w={a:Math.floor(random()*80),b:Math.floor(random()*80),c:Math.floor(random()*80),d:Math.floor(random()*80),x:.01+random()*100,p:.01+random()*100,g:.01+random()*100},r=localRound(kind,w);assert.ok(r.amortized<=r.bound+eps,kind);rotationTrees(kind).forEach((tree,j)=>{const sums={};function sum(n){const v=/^[A-D]$/.test(n.label)?w[n.label.toLowerCase()]:w[n.label]+(n.left?sum(n.left):0)+(n.right?sum(n.right):0);sums[n.label]=v;return v}sum(tree);for(const [k,v]of Object.entries(j?r.after:r.before))assert.ok(Math.abs(v-sums[k])<eps,kind+' '+k)});}
 assert.throws(()=>localRound('zig',{a:0,b:0,c:0,d:0,x:0,p:1,g:1}));
});
test('all operation implementations preserve BST/size/forest invariants and match a sorted-set oracle',()=>{
 for(let iteration=0;iteration<75;iteration++){
  const a=[...new Set(Array.from({length:Math.floor(random()*17)},()=>Math.floor(random()*65)-30))],sorted=[...a].sort((x,y)=>x-y),k=Math.floor(random()*80)-40,h=k+Math.floor(random()*45),right=[100,90,110];
  for(const [op]of operationOptions){const tr=runOperation(op,a,k,right,h),final=audit(tr);let expected=[...sorted];
   if(op==='insert'||op==='insert-root')expected=[...new Set([...a,k])].sort((x,y)=>x-y);
   if(op==='delete')expected=sorted.filter(x=>x!==k);
   if(op==='join')expected=[...sorted,...right].sort((x,y)=>x-y);
   assert.deepEqual(final,expected,op+' key preservation');
   if(op==='access')assert.equal(tr.result,a.includes(k)?k:null);
   if(op==='min')assert.equal(tr.result,sorted[0]??null);
   if(op==='max')assert.equal(tr.result,sorted.at(-1)??null);
   if(op==='rank')assert.equal(tr.result,sorted.filter(x=>x<k).length);
   if(op==='pred')assert.equal(tr.result,sorted.filter(x=>x<k).at(-1)??null);
   if(op==='succ')assert.equal(tr.result,sorted.find(x=>x>k)??null);
   if(op==='lower')assert.equal(tr.result,sorted.find(x=>x>=k)??null);
   if(op==='select')assert.equal(tr.result,k<1||k>sorted.length?'k 越界（O(1) 检查）':sorted[k-1]);
   if(op==='range')assert.deepEqual(tr.result,sorted.filter(x=>x>=k&&x<=h));
   if(op.startsWith('split')){assert.deepEqual(keys(tr.frames.at(-1).trees[0]),sorted.filter(x=>op==='split-lt'?x<k:x<=k));assert.deepEqual(keys(tr.frames.at(-1).trees[1]),sorted.filter(x=>op==='split-lt'?x>=k:x>k))}
   assert.ok(tr.amortized<=16*Math.log2(a.length+right.length+2)+5+eps,op+' conservative composition bound');
  }
 }
});
test('exact structural charges and deletion edge cases',()=>{
 const leaf=runOperation('insert',[7,6,5,4,3,2,1],0);assert.ok(Math.abs(leaf.frames.find(f=>f.phase==='插入叶节点').delta-3)<eps);audit(leaf);
 const root=runOperation('insert-root',[2,1,3],4);assert.ok(Math.abs(root.frames.find(f=>f.phase==='新根连接').delta-2)<eps);audit(root);
 const join=runOperation('join',[1,2],0,[6,4,3,5,7,8]);assert.ok(Math.abs(join.frames.find(f=>f.phase==='接边 / Join').delta-2)<eps);
 for(const a of [[],[1],[2,1],[1,2],[2,1,3],[50,30,70,20,40,60,80]])for(const k of [...a,999]){const tr=runOperation('delete',a,k);audit(tr);const f=tr.frames.find(f=>f.phase==='删除根 / 分离森林');if(f)assert.ok(Math.abs(f.delta+Math.log2(a.length))<eps)}
 assert.throws(()=>runOperation('join',[2],0,[1]),/Join/);assert.throws(()=>runOperation('range',[1],3,[],2));assert.throws(()=>parseKeys('1 1'));assert.deepEqual(parseKeys(''),[]);
});
test('successful order statistics and failed searches actually splay the endpoint',()=>{
 for(let k=1;k<=15;k++){const tr=runOperation('select',Array.from({length:15},(_,i)=>i+1),k);audit(tr);assert.equal(tr.result,k);assert.equal(tr.frames.at(-1).trees[0].key,k)}
 const tr=runOperation('access',[1,2,3,4,5],6);assert.equal(tr.rotations,4);assert.equal(tr.frames.at(-1).trees[0].key,5);
});
test('complete proof export and safe accessible SVG',()=>{
 const md=proofMarkdown();for(const s of ['Zig-zig','Zig-zag','ΔΦ_leaf','ΔΦ_remove-root','ΔΦ_attach','静态手指','Φ₀','Rank','Select','Θ(n)','https://www.cs.cmu.edu'])assert.ok(md.includes(s),s);
 const svg=treeSVG({key:'<script>',size:1});assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('role="img"'));assert.ok(svg.includes('&lt;script&gt;'));
});
