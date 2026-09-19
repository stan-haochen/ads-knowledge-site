import test from 'node:test';
import assert from 'node:assert/strict';
import {RBMachine,rbLabTrace,parseRBKeys,parseRBOps} from '../dist/redblack-lab-engine.js';
import {rbPresets,rbCases} from '../dist/redblack-lab-content.js';
import {rbTreeSVG,rbGuideSVG,rb234SVG} from '../dist/redblack-lab-view.js';
import {rbMemoryText} from '../dist/redblack-lab.js';
function inorder(n){return n.nil?[]:[...inorder(n.left),n.key,...inorder(n.right)]}
function validate(n,{full=false,parent=null,live=false,min=-Infinity,max=Infinity}={}){if(live)assert.equal(n.parent,parent,'reverse parent link');assert.ok(['R','B'].includes(n.color));if(n.nil){assert.equal(n.color,'B');return 1}assert.ok(n.key>min&&n.key<max,'BST');if(full&&n.color==='R'){assert.equal(n.left.color,'B');assert.equal(n.right.color,'B')}const a=validate(n.left,{full,live,parent:n,min,max:n.key}),b=validate(n.right,{full,live,parent:n,min:n.key,max});if(full)assert.equal(a,b,'equal black height');return a+(n.color==='B'?1:0)}
function audit(f){validate(f.root);if(f.phase==='action'&&['D1','D2','D3'].includes(f.caseId)){const find=(n,id)=>n.id===id?n:n.nil?null:find(n.left,id)||find(n.right,id);assert.equal(f.roles.X,f.debt);if(f.caseId==='D1'||f.caseId==='D3')assert.equal(find(f.root,f.roles.S).color,'B');if(f.caseId==='D3')assert.equal(find(f.root,f.roles.F).color,'R')} assert.equal(new Set(f.paths.map(p=>p.effective)).size,1,'every intermediate frame has equal effective black paths');if(['start','begin','complete'].includes(f.phase)){assert.equal(f.root.color,'B');validate(f.root,{full:true});assert.equal(f.debt,null)}}
test('all teaching presets and exact mirrors cover every repair branch',()=>{
 const seen=new Set();for(const p of rbPresets){const initial=parseRBKeys(p.initial),ops=parseRBOps(p.ops),frames=rbLabTrace(initial,ops),mirror=rbLabTrace(initial.map(x=>-x),ops.map(o=>({...o,key:-o.key})),{predecessor:true});assert.equal(frames.length,mirror.length,p.id);frames.forEach((f,i)=>{audit(f);audit(mirror[i]);assert.equal(f.caseId,mirror[i].caseId,p.id+' mirrored case');assert.deepEqual(inorder(f.root).map(x=>-x).reverse(),inorder(mirror[i].root));if(f.side)assert.notEqual(f.side,mirror[i].side);if(f.caseId)seen.add(f.caseId+(f.side||''));assert.ok(rbTreeSVG(f.root,{roles:f.roles,debt:f.debt}).includes('role="img"'))});if(p.target)assert.ok(frames.some(f=>f.caseId===p.target),p.id)}
 for(const id of ['I1','I2','I3','D1','D2','D3','D4'])assert.ok(seen.has(id+'L')||seen.has(id+'R'),id);
});
test('mixed updates match set oracle, preserve reverse links, black paths, and rotation limits',()=>{
 let seed=73198;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
 for(let run=0;run<85;run++){const initial=[...new Set(Array.from({length:15},()=>Math.floor(rnd()*80)))],set=new Set(initial),m=new RBMachine(initial);for(let i=0;i<65;i++){const key=Math.floor(rnd()*95),type=rnd()<.5?'i':'d',from=m.frames.length;m.run([{type,key}]);if(type==='i')set.add(key);else set.delete(key);for(const f of m.frames.slice(from))audit(f);validate(m.root,{full:true,live:true});assert.equal(m.root.color,'B');assert.deepEqual(inorder(m.root),[...set].sort((a,b)=>a-b));assert.ok(m.rotations<=(type==='i'?2:3),'rotation bound')}}
});
test('D1 and D3 retain debt, D2 moves it, D4 clears it; maximum three rotations occurs',()=>{
 const p=rbPresets.find(p=>p.id==='delete-three'),f=rbLabTrace(parseRBKeys(p.initial),parseRBOps(p.ops));assert.deepEqual(f.filter(x=>x.phase==='decision').map(x=>x.caseId),['D1','D3','D4']);assert.equal(f.at(-1).rotations,3);
 for(let i=0;i<f.length;i++)if(f[i].phase==='action'&&['D1','D3'].includes(f[i].caseId))assert.equal(f[i].debt,f[i-1].debt);
 const c=rbPresets.find(p=>p.id==='delete-cascade'),fs=rbLabTrace(parseRBKeys(c.initial),parseRBOps(c.ops));assert.equal(fs.filter(f=>f.operation===2&&f.caseId==='D2'&&f.phase==='decision').length,2);for(let i=1;i<fs.length;i++)if(fs[i].phase==='action'&&fs[i].caseId==='D2')assert.equal(fs[i].debt,fs[i-1].roles.P);
});
test('logical key replacement preserves target identity and tests physical removed color',()=>{
 const fs=rbLabTrace([20,10,30,25],[{type:'d',key:20}]),selected=fs.find(f=>f.phase==='select'),removed=fs.find(f=>f.phase==='remove'),meta=selected.meta;assert.notEqual(meta.targetId,meta.physicalId);assert.equal(meta.removedColor,'R');assert.equal(removed.debt,null);function flat(n){return n.nil?[n]:[n,...flat(n.left),...flat(n.right)]}const old=flat(selected.root),now=flat(removed.root);assert.equal(old.find(n=>n.id===meta.targetId).color,'B');assert.equal(now.find(n=>n.id===meta.targetId).key,25);assert.equal(now.find(n=>n.id===meta.targetId).color,'B');assert.ok(!now.some(n=>n.id===meta.physicalId));assert.equal(fs.at(-1).rotations,0);
});
test('empty/root/absent/duplicate/NIL boundaries and content exports',()=>{
 for(const initial of [[],[1],[1,2],[2,1],[2,1,3]]){const f=rbLabTrace(initial,[{type:'i',key:1},{type:'d',key:99},{type:'f',key:2},...initial.map(key=>({type:'d',key})),{type:'d',key:1}]);f.forEach(audit);assert.deepEqual(inorder(f.at(-1).root),[]);assert.ok(rb234SVG(f.at(-1).root).includes('空树'))}
 assert.throws(()=>parseRBKeys('1 1'));assert.throws(()=>parseRBOps('d:x'));assert.throws(()=>parseRBOps(''));assert.throws(()=>parseRBKeys('1000'));const notes=rbMemoryText();for(const id of Object.keys(rbCases)){assert.ok(notes.includes(id));assert.ok(rbGuideSVG().includes('data-rb-guide="'+id+'"'))}assert.ok(notes.includes('原颜色'));assert.ok(notes.includes('NIL'));
});
