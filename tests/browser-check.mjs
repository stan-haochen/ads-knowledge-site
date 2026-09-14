const baseURL=(process.env.ADS_BASE_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chapters} from '../dist/content.js';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright')}catch{playwright=require('C:/Users/stanz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
await mkdir('qa-output',{recursive:true});
const browser=await playwright.chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(baseURL,{waitUntil:'networkidle'});
await page.locator('#stage').waitFor();
assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()),'#20332f');
await page.screenshot({path:'qa-output/desktop-initial.png'});
let checked=0;
for(const c of chapters){await page.goto(baseURL+'/#'+c.id);await page.locator('#demo').waitFor();for(const d of c.demos){await page.locator('#demo').selectOption(d);assert.equal(await page.locator('#error').innerText(),'');assert.ok((await page.locator('#stage').innerHTML()).length>30);const max=await page.locator('#seek').getAttribute('max');await page.locator('#seek').fill(max);assert.match(await page.locator('#step-number').innerText(),new RegExp('/ '+(+max+1)+'$'));await page.locator('#prev').click();await page.locator('#next').click();await page.locator('#reset').click();assert.ok(await page.locator('#prev').isDisabled());checked++}for(const t of ['proof','extend','practice']){await page.locator('#tab-'+t).click();assert.ok((await page.locator('#panel').innerText()).length>80)}await page.locator('details summary').first().click();assert.ok(await page.locator('details').first().getAttribute('open')!==null)}
await page.goto(baseURL+'/#avl');await page.locator('#input').fill('30,20,10,25,28,27');await page.locator('#run').click();await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));await page.screenshot({path:'qa-output/desktop-avl.png'});
const before=await page.locator('#stage').innerHTML();await page.locator('#input').fill('not-a-number');await page.locator('#run').click();assert.ok((await page.locator('#error').innerText()).length>5);assert.equal(await page.locator('#stage').innerHTML(),before);
await page.locator('#input').fill('30,20,10');await page.locator('#run').click();await page.locator('#play').click();await page.waitForTimeout(760);assert.ok(+(await page.locator('#seek').inputValue())>0);await page.locator('#play').click();const paused=await page.locator('#seek').inputValue();await page.waitForTimeout(800);assert.equal(await page.locator('#seek').inputValue(),paused);
await page.locator('#tab-proof').click();await page.screenshot({path:'qa-output/desktop-proof.png'});
await page.goto(baseURL+'/#sources');assert.match(await page.locator('h1').innerText(),/课件与参考资料/);assert.equal(await page.locator('tbody tr').count(),15);
await page.goto(baseURL+'/#overview');assert.match(await page.locator('h1').innerText(),/高级数据结构/);
await page.setViewportSize({width:390,height:844});
for(const id of ['avl','btrees','dp','backtracking','sources','overview']){await page.goto(baseURL+'/#'+id);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);assert.equal(overflow,false,'mobile overflow '+id)}
await page.goto(baseURL+'/#avl');await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));await page.screenshot({path:'qa-output/mobile-avl.png',fullPage:true});await page.locator('#menu').click();assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('menu-open')));await page.locator('a[data-chapter="dp"]').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('menu-open')),false);
assert.deepEqual(errors,[]);
const toolsPage=await browser.newPage();
const nativeWebMCP=await page.evaluate(()=>!!document.modelContext?.registerTool);
await toolsPage.addInitScript(()=>{window.registeredTools={};Object.defineProperty(document,'modelContext',{configurable:true,value:{registerTool(tool){window.registeredTools[tool.name]=tool}}})});
await toolsPage.goto(baseURL);
assert.deepEqual(await toolsPage.evaluate(()=>Object.keys(window.registeredTools).sort()),['read_algorithm_state','run_algorithm_demo','seek_algorithm_step']);
const result=await toolsPage.evaluate(()=>window.registeredTools.run_algorithm_demo.execute({demo:'matrix',input:'10,20,50,1,100'}));
assert.equal(result.demo,'matrix');assert.equal(await toolsPage.locator('#demo').inputValue(),'matrix');
await toolsPage.evaluate(()=>{const t=window.registeredTools;t.seek_algorithm_step.execute({step:t.read_algorithm_state.execute({}).total-1})});
assert.match(await toolsPage.locator('#message').innerText(),/2200/);
const snapshot=await toolsPage.locator('#stage').innerHTML();
for(const invalid of [{demo:'queens',input:'99'},{demo:'matrix',input:''},{demo:'__proto__',input:'1'}]){const rejected=await toolsPage.evaluate(input=>{try{window.registeredTools.run_algorithm_demo.execute(input);return false}catch{return true}},invalid);assert.equal(rejected,true)}
assert.equal(await toolsPage.locator('#stage').innerHTML(),snapshot);
const rangeRejected=await toolsPage.evaluate(()=>{try{window.registeredTools.seek_algorithm_step.execute({step:999999});return false}catch{return true}});assert.equal(rangeRejected,true);
await toolsPage.close();
await writeFile('qa-output/browser-report.json',JSON.stringify({chapters:15,demos:checked,consoleErrors:errors,desktop:'1440×1080',mobile:'390×844',checks:['all routes','all demos','final state','previous next reset','all content tabs','practice disclosure','invalid input preserves result','autoplay and pause','mobile overflow','mobile navigation']},null,2));
console.log(JSON.stringify({chapters:15,demos:checked,consoleErrors:errors,status:'passed',webMCPAdapter:'passed with injected registry',nativeWebMCP}));await browser.close();
