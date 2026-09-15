// Teaching snapshots are deliberately outside the cost model. All tree mutations
// use cached subtree sizes, parent pointers and constant-time rotation updates.
const sz=n=>n?.size||0;
const pull=n=>{if(n)n.size=1+sz(n.left)+sz(n.right)};
export const log=n=>Math.log2(n);
export function localRound(kind,weights={a:1,b:1,c:1,d:1,x:1,p:1,g:1}){
 const {a,b,c,d,x,p,g}=weights;
 if([a,b,c,d].some(v=>!Number.isFinite(v)||v<0)||[x,p,g].some(v=>!Number.isFinite(v)||v<=0))throw Error('子树权重须非负，节点权重须为正。');
 let before,after;
 if(kind==='zig'){before={x:x+a+b,p:p+x+a+b+c};after={x:before.p,p:p+b+c}}
 else if(kind==='zigzig'){before={x:x+a+b,p:p+x+a+b+c,g:g+p+x+a+b+c+d};after={x:before.g,p:p+b+g+c+d,g:g+c+d}}
 else if(kind==='zigzag'){before={x:x+b+c,p:p+a+x+b+c,g:g+p+a+x+b+c+d};after={x:before.g,p:p+a+b,g:g+c+d}}
 else throw Error('未知旋转类型');
 const cost=kind==='zig'?1:2,delta=Object.keys(before).reduce((v,k)=>v+log(after[k])-log(before[k]),0),gain=log(after.x)-log(before.x);
 return{before,after,cost,delta,amortized:cost+delta,bound:3*gain+(kind==='zig'?1:0),gain};
}
export const operationOptions=[['access','查找（成功 / 失败）'],['insert','插入：叶插入后伸展'],['insert-root','插入：Split 后建新根'],['delete','删除（成功 / 失败）'],['split-lt','Split：< k / ≥ k'],['split-le','Split：≤ k / > k'],['join','Join：有序两树合并'],['min','最小值'],['max','最大值'],['pred','严格前驱'],['succ','严格后继'],['lower','Lower bound：最小 ≥ k'],['rank','Rank：小于 k 的键数'],['select','Select：第 k 小（从 1 起）'],['range','闭区间报告 [k, h]']];
export function parseKeys(raw){const a=raw.trim()?raw.trim().split(/[,，\s]+/).map(Number):[];if(a.length>20||a.some(x=>!Number.isSafeInteger(x)||Math.abs(x)>999)||new Set(a).size!==a.length)throw Error('每棵树输入至多 20 个互异整数，范围 −999…999；允许空树。');return a}
export function runOperation(type,keys,arg=35,rightKeys=[],high=65){
 if(!operationOptions.some(([k])=>k===type))throw Error('未知操作');
 if(!Number.isSafeInteger(arg)||!Number.isSafeInteger(high))throw Error('参数必须是整数');
 if(new Set(keys).size!==keys.length||new Set(rightKeys).size!==rightKeys.length)throw Error('初始键不可重复');
 if(type==='range'&&arg>high)throw Error('区间左端点不能大于右端点');
 const make=key=>({key,left:null,right:null,parent:null,size:1});
 function build(ks){const box={root:null};for(const k of ks){const node=make(k);if(!box.root){box.root=node;continue}let t=box.root;while(true){const side=k<t.key?'left':'right';if(t[side])t=t[side];else{t[side]=node;node.parent=t;break}}while(t){pull(t);t=t.parent}}return box}
 const roots=[build(keys)];if(type==='join')roots.push(build(rightKeys));
 if(type==='join'&&keys.length&&rightKeys.length&&Math.max(...keys)>=Math.min(...rightKeys))throw Error('Join 要求左树每个键都严格小于右树每个键。');
 let rotations=0,result=null;const frames=[];
 function snapshot(n){return n?{key:n.key,size:n.size,left:snapshot(n.left),right:snapshot(n.right)}:null}
 function phi(n){return n?log(n.size)+phi(n.left)+phi(n.right):0}
 function record(phase,msg,focus=[]){const potential=roots.reduce((v,b)=>v+phi(b.root),0),prev=frames.at(-1);frames.push({phase,msg,focus,trees:roots.map(b=>snapshot(b.root)),phi:potential,delta:prev?potential-prev.phi:0,c:prev?rotations-prev.rotations:0,rotations,amortized:prev?rotations-prev.rotations+potential-prev.phi:0,result});}
 function rotate(box,x){const p=x.parent,g=p.parent,left=x===p.left,side=left?'right':'left',other=left?'left':'right';p[other]=x[side];if(x[side])x[side].parent=p;x[side]=p;p.parent=x;x.parent=g;if(!g)box.root=x;else g[g.left===p?'left':'right']=x;pull(p);pull(x);rotations++}
 function splay(box,x){if(!x)return;while(x.parent){const p=x.parent,g=p.parent;let kind='Zig';if(!g)rotate(box,x);else if((g.left===p)===(p.left===x)){kind='Zig-zig';rotate(box,p);rotate(box,x)}else{kind='Zig-zag';rotate(box,x);rotate(box,x)}record(kind,`${kind} 完整轮：伸展 ${x.key}；只在整轮结束结算秩差。`,[x.key,p.key,...(g?[g.key]:[])])}}
 function search(box,k){let t=box.root,last=null;const path=[];while(t){last=t;path.push(t.key);if(k===t.key)break;t=k<t.key?t.left:t.right}record('搜索',path.length?`访问路径 ${path.join(' → ')}；${t?'命中':'未命中，伸展最后访问节点 '+last.key}。`:'空树，无需伸展。',path);splay(box,last);return t}
 function extreme(box,side){let x=box.root;const path=[];while(x){path.push(x.key);if(!x[side])break;x=x[side]}record('搜索端点',path.length?`${side==='left'?'最小':'最大'}值路径 ${path.join(' → ')}。`:'空树没有端点。',path);splay(box,x);return x}
 function split(box,k,inclusive=false,alreadySplayed=false){if(!alreadySplayed)search(box,k);const L={root:null},R={root:null},t=box.root;if(t){if(t.key<k||(inclusive&&t.key===k)){L.root=t;R.root=t.right;t.right=null}else{R.root=t;L.root=t.left;t.left=null}if(L.root)L.root.parent=null;if(R.root)R.root.parent=null;pull(t)}roots.splice(roots.indexOf(box),1,L,R);record('断边 / Split',`返回 ${inclusive?'≤':'<'} ${k} 与 ${inclusive?'>':'≥'} ${k}；只减少原根的子树大小，ΔΦ ≤ 0。`,t?[t.key]:[]);return[L,R]}
 function join(L,R){if(!L.root||!R.root){const out={root:L.root||R.root};roots.splice(roots.indexOf(L),1);roots.splice(roots.indexOf(R),1);roots.push(out);record('空树合并','一侧为空，转交另一棵树的根；势能不变。');return out}const x=extreme(L,'right'),l=sz(L.root),r=sz(R.root);x.right=R.root;R.root.parent=x;pull(x);roots.splice(roots.indexOf(R),1);record('接边 / Join',`只增加新根 ${x.key} 的秩：ΔΦ = log₂(${l+r}/${l})。`,[x.key]);return L}
 record('初始森林','初始树由输入顺序建立；其构造成本不计入本次操作，Φ₀ 保留在账本中。');
 const T=roots[0];
 if(type==='access'){result=search(T,arg)?.key??null}
 if(type==='insert'){
  let t=T.root,p=null;const path=[];while(t){p=t;path.push(t.key);if(t.key===arg)break;t=arg<t.key?t.left:t.right}
  record('搜索',`插入搜索路径：${path.join(' → ')||'空'}。`,path);
  if(t){result='重复键，不插入';splay(T,t)}else{const x=make(arg);x.parent=p;if(!p)T.root=x;else p[arg<p.key?'left':'right']=x;while(p){pull(p);p=p.parent}record('插入叶节点','新叶秩为 0；原祖先的秩增量之和至多 log₂(n+1)。',[arg]);splay(T,x);result=arg}
 }
 if(type==='insert-root'){
  const hit=search(T,arg);if(hit)result='重复键，不插入';else{const [L,R]=split(T,arg,false,true);const x=make(arg);x.left=L.root;x.right=R.root;if(x.left)x.left.parent=x;if(x.right)x.right.parent=x;pull(x);roots.splice(0,roots.length,{root:x});record('新根连接','新建根的秩为 log₂(n+1)，其他节点子树未变；ΔΦ = log₂(n+1)。',[arg]);result=arg}
 }
 if(type==='delete'){
  const x=search(T,arg);if(!x)result='不存在，无需删除';else{const n=x.size,L={root:x.left},R={root:x.right};if(L.root)L.root.parent=null;if(R.root)R.root.parent=null;x.left=x.right=null;roots.splice(0,1,L,R);record('删除根 / 分离森林',`删除根贡献的 log₂${n}，其余节点子树保持原状；ΔΦ = −log₂${n}。`,[arg]);join(L,R);result=arg}
 }
 if(type==='split-lt'||type==='split-le'){split(T,arg,type==='split-le');result=type==='split-lt'?'< k | ≥ k':'≤ k | > k'}
 if(type==='join'){join(T,roots[1]);result='合并完成'}
 if(type==='min'||type==='max')result=extreme(T,type==='min'?'left':'right')?.key??null;
 if(['pred','succ','lower'].includes(type)){const [L,R]=split(T,arg,type==='succ');result=extreme(type==='pred'?L:R,type==='pred'?'right':'left')?.key??null;record('保存答案',`答案：${result??'不存在'}；随后 Join 恢复键集合。`);join(L,R)}
 if(type==='rank'||type==='select'){
  if(type==='select'&&(arg<1||arg>sz(T.root))){result='k 越界（O(1) 检查）';record('边界检查',result)}else{let t=T.root,last=null,k=arg,answer=0;const path=[];while(t){last=t;path.push(t.key);if(type==='rank'){if(arg<=t.key)t=t.left;else{answer+=sz(t.left)+1;t=t.right}}else{const r=sz(t.left)+1;if(k===r){answer=t.key;break}if(k<r)t=t.left;else{k-=r;t=t.right}}}result=answer;record('按 size 搜索',`路径 ${path.join(' → ')||'空'}；答案 ${answer}，伸展命中或最后访问节点。`,path);splay(T,last)}
 }
 if(type==='range'){const [L,U]=split(T,arg),[M,R]=split(U,high,true),out=[];function inorder(x){if(x){inorder(x.left);out.push(x.key);inorder(x.right)}}inorder(M.root);result=out;record('报告区间',`输出 ${out.length} 个键：${out.join(', ')||'空'}。遍历额外 Θ(k)，不计入旋转列。`);join(join(L,M),R)}
 record('完成',`操作完成；结果 ${Array.isArray(result)?'['+result.join(', ')+']':result??'不存在'}。`);
 return{type,frames,result,rotations,initialPhi:frames[0].phi,finalPhi:frames.at(-1).phi,amortized:rotations+frames.at(-1).phi-frames[0].phi};
}
