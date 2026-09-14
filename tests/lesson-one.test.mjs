import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {lessonDemos,parseLesson,avlDeleteTrace,splayDeleteTrace,splayPotentialTrace,keys,rankStats} from '../dist/lesson-one.js';
import {chapters} from '../dist/content.js';
import {renderLessonDetail,renderLessonTree} from '../dist/lesson-one-view.js';
const sorted=a=>[...a].sort((a,b)=>a-b),close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let seed=91827;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function avl(n){if(!n)return-1;const l=avl(n.left),r=avl(n.right);assert.ok(Math.abs(l-r)<=1);assert.equal(n.h,1+Math.max(l,r));assert.deepEqual(keys(n),sorted(keys(n)));return n.h}
function identities(n,out=[]){if(n){out.push(n.id);identities(n.left,out);identities(n.right,out)}return out}
test('all teaching presets produce renderable steps, cover LR/RL/zero-child/cascade',()=>{
 const decisions=new Set();for(const[id,d]of Object.entries(lessonDemos))for(const p of d.presets){const f=d.run(d.parse(p.input));for(const x of f){const html=renderLessonDetail(x)+renderLessonTree(x);assert.ok(!html.includes('NaN'));assert.ok(html.includes('伪代码'));if(x.teaching.decision)decisions.add(x.teaching.decision)}assert.ok(f.at(-1).complete,id)}
 for(const x of ['LR','RL','LL','RR','child-zero'])assert.ok(decisions.has(x),x);
 const d=lessonDemos['avl-delete'],p=d.presets.find(x=>x.label==='多层连续修复'),f=d.run(d.parse(p.input));assert.equal(f.at(-1).metrics['本次旋转次数'],3);
});
test('detailed AVL deletions preserve every completion boundary, cached height and stable successor identity',()=>{
 for(let batch=0;batch<90;batch++){const initial=shuffle(Array.from({length:14},(_,i)=>i-4)),actions=shuffle([...initial,99]).slice(0,12),f=avlDeleteTrace({initial,actions}),expected=new Set(initial);for(const x of f.filter(x=>x.complete)){expected.delete(actions[x.operation-1]);assert.deepEqual(keys(x.roots[0]),sorted(expected));avl(x.roots[0]);assert.equal(new Set(identities(x.roots[0])).size,expected.size)}}
 const f=avlDeleteTrace({initial:[20,10,30,5,15,25,40,22,27],actions:[20]});const logical=f.find(x=>x.teaching.logicalDeleted===20);assert.equal(logical.roots[0].id,'n1');assert.equal(logical.roots[0].v,22);assert.equal(f.at(-1).roots[0].id,'n1');assert.ok(f.some(x=>x.teaching.physicalRemoved&&x.teaching.physicalRemoved!=='n1'));
});
test('Splay deletion conserves nodes across split forests and correct sets at every completion',()=>{
 for(let batch=0;batch<85;batch++){const initial=shuffle(Array.from({length:12},(_,i)=>i)),actions=shuffle([...initial,88,99]),f=splayDeleteTrace({initial,actions});let expected=new Set(initial);for(const x of f){if(x.teaching.removed)expected.delete(actions[x.operation-1]);const all=x.roots.flatMap(keys),allIds=x.roots.flatMap(t=>identities(t));assert.deepEqual(sorted(all),sorted(expected),x.msg);assert.equal(new Set(allIds).size,allIds.length,x.msg);assert.equal(x.metrics['当前森林节点数'],all.length);for(const root of x.roots)assert.deepEqual(keys(root),sorted(keys(root)));if(x.complete){expected.delete(actions[x.operation-1]);assert.deepEqual(all,sorted(expected))}}}
 const f=splayDeleteTrace({initial:[20,10,30,25],actions:[26]});assert.equal(f.at(-1).roots[0].v,25);assert.equal(f.at(-1).teaching.result,'missing');
});
test('all Splay round inequalities, disjoint sets, rank changes and telescoping hold on varied sequences',()=>{
 const types=new Set();let negative=false;
 for(let batch=0;batch<100;batch++){const initial=shuffle(Array.from({length:12},(_,i)=>i)),actions=Array.from({length:14},()=>Math.floor(random()*12)),frames=splayPotentialTrace({initial,actions});for(const f of frames){assert.deepEqual(keys(f.roots[0]),sorted(initial));const p=f.teaching.proof;if(p){types.add(p.type);close(p.delta,p.phiAfter-p.phiBefore);close(p.amortized,p.c+p.delta);assert.ok(p.amortized<=p.bound+1e-9);close(p.rows.reduce((n,r)=>n+r.delta,0),p.delta);for(const r of p.rows)if(r.role==='不变')close(r.delta,0);if(p.sets){assert.ok(p.sets[0].ids.every(id=>!p.sets[1].ids.includes(id)));assert.ok(p.sets.reduce((n,s)=>n+s.ids.length,0)<=p.container);assert.ok(p.setRankSum<=p.logUpper+1e-9)}negative ||=p.amortized<0}
 if(f.complete){const a=f.teaching.access,l=f.ledger;assert.equal(f.roots[0].v,a.key);assert.ok(a.amortized<=a.bound+1e-9);close(l.totalC,l.totalA+l.phi0-l.phi);close(l.phi,rankStats(f.roots[0]).phi);close(a.c,l.rounds.reduce((n,p)=>n+p.c,0));close(a.amortized,l.rounds.reduce((n,p)=>n+p.amortized,0))}}
 }
 assert.deepEqual([...types].sort(),['Zig','Zig-zag','Zig-zig']);assert.ok(negative);
});
test('parsers enforce set semantics; empty/missing/repeated access boundaries work',()=>{
 for(const raw of ['1,1|1','1,2','x|1','1|9999','1|'])assert.throws(()=>parseLesson(raw));assert.throws(()=>splayPotentialTrace(parseLesson('|1')));assert.throws(()=>splayPotentialTrace(parseLesson('1,2|3')));
 assert.equal(avlDeleteTrace(parseLesson('|1')).at(-1).teaching.result,'missing');assert.equal(splayDeleteTrace(parseLesson('|1')).at(-1).teaching.result,'missing');
 const f=splayPotentialTrace(parseLesson('2,1,3|2,2')).at(-1);assert.equal(f.ledger.totalC,0);close(f.ledger.totalA,0);
});
test('published AVL and parent-pointer Splay reference code executes correctly, including reverse links',()=>{
 const sections=chapters[0].implementation;
 const avlCode=sections[0].code+'\n'+sections[1].code.split('// 外层调用')[0];
 const context=vm.createContext({});vm.runInContext(avlCode,context);
 function simple(values,parent=null){if(!values.length)return null;const mid=Math.floor(values.length/2),n={key:values[mid],h:0,left:null,right:null,parent};n.left=simple(values.slice(0,mid),n);n.right=simple(values.slice(mid+1),n);n.h=1+Math.max(n.left?.h??-1,n.right?.h??-1);return n}
 const read=n=>n?[...read(n.left),n.key,...read(n.right)]:[];
 for(let b=0;b<35;b++){let root=simple(Array.from({length:17},(_,i)=>i)),expected=new Set(read(root));for(const key of shuffle([...expected,99])){context.root=root;context.key=key;root=vm.runInContext('eraseAVL(root,key)',context);expected.delete(key);assert.deepEqual(read(root),sorted(expected));function check(n){if(!n)return-1;const l=check(n.left),r=check(n.right);assert.ok(Math.abs(l-r)<=1);assert.equal(n.h,Math.max(l,r)+1);return n.h}check(root)}}
 vm.runInContext(sections[3].code+'\n'+sections[4].code,context);
 for(let b=0;b<35;b++){const box={root:simple(Array.from({length:17},(_,i)=>i))},expected=new Set(read(box.root));for(const key of shuffle([...expected,99,100])){context.box=box;context.key=key;const result=vm.runInContext('eraseSplay(box,key)',context);assert.equal(result,expected.delete(key));assert.deepEqual(read(box.root),sorted(expected));function check(n,p=null){if(!n)return;assert.equal(n.parent,p);check(n.left,n);check(n.right,n)}check(box.root)}}
});
