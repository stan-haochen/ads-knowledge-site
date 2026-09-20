import test from 'node:test';
import assert from 'node:assert/strict';
import {compareInsert,treeFromSequence,cascadeFamily,validateRB,treeSignature,countNodes,comparePresets} from '../dist/rb-compare-engine.js';
import {RBMachine} from '../dist/redblack-lab-engine.js';
const keys=n=>n.nil?[]:[...keys(n.left),n.key,...keys(n.right)];
const shape=n=>n.nil?'_':`${n.key}(${shape(n.left)},${shape(n.right)})`;
function verifyFrames(fs){let prev={rotations:0,splits:0,recolors:0,visits:0};for(const f of fs){assert.equal(new Set(f.paths.map(p=>p.black)).size,1,'black paths preserved even during repair');for(const [k,v]of Object.entries(prev))assert.ok(f.stats[k]>=v);prev=f.stats;if(f.type==='complete'||f.type==='start'){assert.equal(f.root.color,'B');validateRB(f.root)}}}
test('extreme family is valid and exact work gap scales with h',()=>{
 for(let h=1;h<=5;h++){const root=cascadeFamily(h),r=compareInsert(root,[0]);assert.equal(countNodes(root),6*2**h-5);assert.equal(validateRB(root),h+2);assert.equal(r.bottomFinal.stats.recolors,0);assert.equal(r.bottomFinal.stats.rotations,0);assert.equal(r.topFinal.stats.recolors,3*h+1);assert.equal(r.topFinal.stats.splits,h);assert.equal(r.topFinal.stats.rotations,0);assert.equal(shape(r.bottomFinal.root),shape(r.topFinal.root));assert.equal(r.sameFinal,false);verifyFrames(r.bottom);verifyFrames(r.top);const before=r.top.find(f=>f.type==='insert');assert.equal(before.stats.recolors,3*h+1)}
});
test('17-node case changes structure only for top-down and rotates before attachment',()=>{
 const p=comparePresets[0],initial=p.initial.split(' ').map(Number),root=treeFromSequence(initial),copy=JSON.stringify(root),r=compareInsert(root,[110]);assert.equal(JSON.stringify(root),copy);assert.deepEqual(r.bottom[0].root,r.top[0].root);assert.equal(r.bottomFinal.stats.rotations,0);assert.equal(r.bottomFinal.stats.recolors,0);assert.equal(r.topFinal.stats.rotations,2);assert.equal(r.topFinal.stats.recolors,5);assert.notEqual(shape(r.bottomFinal.root),shape(r.topFinal.root));assert.ok(r.top.filter(f=>f.type==='rotate').every(f=>!f.inserted));verifyFrames(r.bottom);verifyFrames(r.top);
});
test('top-down and bottom-up match set semantics on random shared initial trees and multi-key sequences',()=>{
 let seed=8891;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};for(let i=0;i<150;i++){const initial=[...new Set(Array.from({length:20},()=>Math.floor(rnd()*100)-50))],ops=Array.from({length:24},()=>Math.floor(rnd()*120)-60),r=compareInsert(treeFromSequence(initial),ops),expected=[...new Set([...initial,...ops])].sort((a,b)=>a-b);assert.deepEqual(keys(r.bottomFinal.root),expected);assert.deepEqual(keys(r.topFinal.root),expected);verifyFrames(r.bottom);verifyFrames(r.top);const ref=new RBMachine(initial).run(ops.map(key=>({type:'i',key}))).at(-1);assert.equal(treeSignature(r.bottomFinal.root),treeSignature(ref.root))}
});
test('repeated-key semantics and insertion timing are explicit',()=>{
 const root=cascadeFamily(2),r=compareInsert(root,[10]);assert.equal(r.bottomFinal.inserted,false);assert.equal(r.topFinal.inserted,false);assert.equal(treeSignature(root),treeSignature(r.bottomFinal.root));assert.notEqual(treeSignature(root),treeSignature(r.topFinal.root));assert.deepEqual(keys(r.topFinal.root),keys(root));verifyFrames(r.top);const p=comparePresets.find(p=>p.id==='upward'),t=compareInsert(treeFromSequence(p.initial.split(' ').map(Number)),[5]);assert.ok(t.bottom.filter(f=>f.type==='split').every(f=>f.inserted));assert.ok(t.top.filter(f=>f.type==='split').every(f=>!f.inserted));assert.throws(()=>compareInsert(root,[]));assert.throws(()=>cascadeFamily(6));
});
