import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters} from '../dist/content.js';
import {mapGroups,modules,frontiers,cases,sources,connections,learningRoutes,reviewedOn} from '../dist/course-map-data.js';
import {mapSVG,mapMarkdown,matchingModules} from '../dist/course-map.js';
test('course map covers every chapter exactly once with useful learning and research links',()=>{
 assert.deepEqual(modules.map(m=>m.id),chapters.map(c=>c.id));assert.deepEqual(mapGroups.flatMap(g=>g.ids),chapters.map(c=>c.id));
 for(const m of modules){assert.ok(m.questions.length>=3);assert.ok(m.topics.length>=4);for(const k of ['challenge','method','check','cost'])assert.ok(m[k].trim().length>0,m.id+' '+k);for(const id of m.apps)assert.ok(cases.some(c=>c.id===id&&c.modules.includes(m.id)),id);for(const id of m.research)assert.ok(frontiers.some(r=>r.id===id&&r.modules.includes(m.id)),id)}
 for(const[a,b,kind,why]of connections){assert.ok(modules.some(m=>m.id===a));assert.ok(modules.some(m=>m.id===b));assert.ok(kind&&why)}for(const r of learningRoutes)r.ids.forEach(id=>assert.ok(modules.some(m=>m.id===id)));
});
test('research claims carry scoped status, dates, primary-source links and entry tasks',()=>{
 assert.match(reviewedOn,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Set(frontiers.map(r=>r.id)).size,frontiers.length);
 for(const r of frontiers){assert.ok(['open','conditional','direction','milestone'].includes(r.kind));for(const k of ['question','known','remaining','bridge','entry'])assert.ok(r[k].length>15,r.id+' '+k);assert.ok(r.refs.length);r.refs.forEach(id=>assert.ok(sources[id]));}
 for(const s of Object.values(sources)){assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.date&&s.type&&s.title)}
 assert.equal(frontiers.find(r=>r.id==='sssp').kind,'milestone');assert.equal(frontiers.find(r=>r.id==='apsp').kind,'conditional');assert.match(frontiers.find(r=>r.id==='dynamic').known,/预印本/);
});
test('exports retain all chapters, applications, research boundaries and source links',()=>{
 const svg=mapSVG(chapters,{standalone:true}),md=mapMarkdown(chapters);for(const c of chapters){assert.ok(svg.includes(c.title));assert.ok(md.includes(c.file));assert.ok(md.includes('#'+c.id));}for(const r of frontiers){assert.ok(md.includes(r.title));assert.ok(md.includes(r.remaining));r.refs.forEach(id=>assert.ok(md.includes(sources[id].url)))}for(const c of cases)assert.ok(md.includes(c.title));assert.ok(!svg.includes('data-map-node'));assert.ok(!svg.includes('NaN'));assert.ok(!md.includes('undefined'));
 const collapsed=mapSVG(chapters,{collapsed:new Set(['structures'])});assert.ok(!collapsed.includes('data-map-node="avl"'));assert.ok(collapsed.includes('data-map-node="dp"'));
});
test('search finds related research and handles no results without executing markup',()=>{
 assert.ok(matchingModules('PIT').some(m=>m.id==='random'));assert.deepEqual(matchingModules('', 'limits').map(m=>m.id),['np','approx','local']);assert.equal(matchingModules('<img src=x onerror=alert(1)>').length,0);assert.equal(matchingModules('unfindable-course-token').length,0);
});
