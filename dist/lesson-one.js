// Lesson-one traces keep stable node identities separate from stored keys.
const cp=x=>structuredClone(x);
const H=n=>n?n.h:-1;
export const actualHeight=n=>n?1+Math.max(actualHeight(n.left),actualHeight(n.right)):-1;
export const keys=n=>n?[...keys(n.left),n.v,...keys(n.right)]:[];
const pull=n=>{if(n)n.h=1+Math.max(H(n.left),H(n.right));return n};
const bf=n=>H(n.left)-H(n.right);
function rotateRaw(t,dir){const p=dir==='left'?t.right:t.left;if(dir==='left'){t.right=p.left;p.left=t}else{t.left=p.right;p.right=t}pull(t);return pull(p)}
export function buildTree(values,balanced=false){let next=1;function add(n,v){if(!n)return{id:'n'+next++,v,left:null,right:null,h:0};if(v<n.v)n.left=add(n.left,v);else if(v>n.v)n.right=add(n.right,v);else return n;pull(n);if(balanced){if(bf(n)>1){if(bf(n.left)<0)n.left=rotateRaw(n.left,'left');n=rotateRaw(n,'right')}if(bf(n)<-1){if(bf(n.right)>0)n.right=rotateRaw(n.right,'right');n=rotateRaw(n,'left')}}return n}let root=null;values.forEach(v=>root=add(root,v));return root}
function list(raw,max,empty=false){if(!raw.trim()&&empty)return[];const a=raw.trim().split(/[,，\s]+/);if(!raw.trim()||a.length>max||a.some(t=>!/^[-+]?\d+$/.test(t)||Math.abs(+t)>999))throw Error(`请输入最多 ${max} 个 −999…999 的整数。`);return a.map(Number)}
export function parseLesson(raw){const p=raw.split('|');if(p.length!==2)throw Error('格式：初始插入序列 | 删除键或访问键序列。');const initial=list(p[0],18,true),actions=list(p[1],24);if(new Set(initial).size!==initial.length)throw Error('初始树采用集合语义，请输入互不相同的键。');return{initial,actions}}
export function rankStats(root){const rows=[];function go(n){if(!n)return 0;const size=1+go(n.left)+go(n.right),rank=Math.log2(size);rows.push({id:n.id,v:n.v,size,rank});return size}go(root);return{rows:rows.sort((a,b)=>a.v-b.v),phi:rows.reduce((s,r)=>s+r.rank,0)}}
const findPath=(root,v)=>{const a=[];while(root){a.push(root);if(root.v===v)break;root=v<root.v?root.left:root.right}return a};
function mapNode(root,id){if(!root)return null;return root.id===id?root:mapNode(root.left,id)||mapNode(root.right,id)}
function attach(box,t,out){function seek(p,key){if(p[key]===t){p[key]=out;return true}return p[key]&&(seek(p[key],'left')||seek(p[key],'right'))}if(!seek(box,'root'))throw Error('Subtree connection not found')}
function annotate(root,mode,roles={}){if(!root)return null;const out=cp(root),ranks=new Map(rankStats(root).rows.map(r=>[r.id,r]));function go(n){if(!n)return;const r=ranks.get(n.id);n.role=roles[n.id]||'';n.note=mode==='avl'?`h=${n.h}  BF=${H(n.left)-H(n.right)}`:`s=${r.size}  r=${r.rank.toFixed(2)}`;n.heightActual=actualHeight(n);go(n.left);go(n.right)}go(out);return out}
const AVL_CODE=[
 'erase(t, key): if t == null return (null, false)',
 'if key < t.key: erase(t.left, key)',
 'if key > t.key: erase(t.right, key)',
 'if childResult.heightUnchanged: stop height propagation',
 'if t has 0 or 1 child: return its child',
 'successor = minimum(t.right)',
 't.key = successor.key  // logical key replacement',
 'erase(t.right, successor.key)  // physical deletion',
 'pull(t)  // 1 + max(height(left), height(right))',
 'if BF(t) > 1 && BF(t.left) < 0: rotateLeft(t.left)',
 'if BF(t) > 1: rotateRight(t)',
 'if BF(t) < -1 && BF(t.right) > 0: rotateRight(t.right)',
 'if BF(t) < -1: rotateLeft(t)',
 'compare new height with old height; return new root'
];
const SPLAY_CODE=[
 'search(key); x = found node or last visited node',
 'while x.parent != null:',
 '  if no grandparent: rotate x above its parent (Zig)',
 '  else if same direction: rotate parent, then x (Zig-zig)',
 '  else: rotate x twice (Zig-zag)',
 'if root.key != key: return NOT_FOUND',
 'L = root.left; R = root.right',
 'detach L and R; destroy old root',
 'if L == null: root = R; return',
 'root = L; x = maximum(L)',
 'splay(x) inside L  // R remains saved',
 'assert(root.right == null); root.right = R',
 'pull(root); return root'
];
export function avlDeleteTrace({initial,actions}){
 const box={root:buildTree(initial,true)},frames=[];let callStack=[],op=0,rotations=0,current=actions[0],pending=false;
 const snap=(msg,phase,hot=[],extra={})=>{const sortedKeys=keys(box.root),bst=sortedKeys.every((v,i)=>!i||sortedKeys[i-1]<v);frames.push({kind:'lesson-tree',mode:'avl',roots:box.root?[cp(box.root)]:[],panels:[{label:'当前 AVL · 节点编号不随键替换而改变',root:annotate(box.root,'avl',extra.roles)}],hot,msg,metrics:{'本次目标键':current,'本次旋转次数':rotations,'当前真实高度':actualHeight(box.root)},teaching:{phase,code:AVL_CODE,lines:extra.lines||[],stack:[...callStack],pointers:extra.pointers||[],checks:[{ok:bst,label:bst?'中序键严格递增':'后继复制后暂时重复，正在删除右侧旧副本'},{ok:!pending,label:pending?'结构已修改，高度 / 平衡可能等待回溯修复':'完成边界：BST 与 AVL 不变量成立'}],...extra},operation:op,complete:phase==='完成'});};
 function turn(parent,slot,dir){const t=parent[slot],p=dir==='left'?t.right:t.left,T2=dir==='left'?p.left:p.right;const outer=parent===box?'root':`${parent.id}.${slot}`;snap(`准备${dir==='left'?'左':'右'}旋 ${t.v}：先保存中间子树 T₂=${T2?.v??'∅'}，保证重连时不丢失。`,'旋转前',[t.id,p.id],{roles:{[t.id]:'z',[p.id]:'y',...(T2?{[T2.id]:'T₂'}:{})},lines:[dir==='left'?13:11],pointers:[['T₂',T2?.id??'null'],['上方连接',`${outer} → ${t.id}`]],rotation:'prepare'});
 const oldT=H(t),oldP=H(p);
 if(dir==='left'){t.right=T2;p.left=t}else{t.left=T2;p.right=t}parent[slot]=p;rotations++;
 snap('重连完成。先更新下降的旧根，再更新上升的新根；反过来会读取旧高度。','指针重连',[t.id,p.id],{lines:[dir==='left'?13:11],pointers:[[`${t.id}.${dir==='left'?'right':'left'}`,T2?.id??'null'],[`${p.id}.${dir==='left'?'left':'right'}`,t.id],[outer,p.id]],rotation:dir});
 pull(t);snap(`pull(${t.v})：下降节点高度 ${oldT} → ${t.h}。`,'更新旧根',[t.id],{lines:[9],pointers:[[`${t.id}.height`,`${oldT} → ${t.h}`]]});
 pull(p);snap(`pull(${p.v})：上升节点高度 ${oldP} → ${p.h}。`,'更新新根',[p.id],{lines:[9],pointers:[[`${p.id}.height`,`${oldP} → ${p.h}`]]});
 }
 function repair(parent,slot,oldH){let t=parent[slot];if(!t)return oldH!==-1;const cached=t.h;pull(t);const b=bf(t);snap(`回溯至 ${t.v}：h ${cached}→${t.h}，BF=${b}。`,'自底向上检查',[t.id],{lines:[9],pointers:[['h(left)',H(t.left)],['h(right)',H(t.right)],['BF',b]]});
 if(b>1){const cb=bf(t.left);snap(`左重：左孩子 BF=${cb}。${cb===0?'删除特有边界：BF=0 仍选单右旋；修复后高度不再向上传播。':cb<0?'LR：先左旋孩子，再右旋本节点。':'LL：单右旋。'}`,'选择修复分支',[t.id,t.left.id],{lines:cb<0?[10,11]:[11],decision:cb===0?'child-zero':cb<0?'LR':'LL'});if(cb<0)turn(t,'left','left');turn(parent,slot,'right')}
 else if(b<-1){const cb=bf(t.right);snap(`右重：右孩子 BF=${cb}。${cb===0?'BF=0 仍选单左旋；修复后高度不再下降。':cb>0?'RL：先右旋孩子，再左旋本节点。':'RR：单左旋。'}`,'选择修复分支',[t.id,t.right.id],{lines:cb>0?[12,13]:[13],decision:cb===0?'child-zero':cb>0?'RL':'RR'});if(cb>0)turn(t,'right','right');turn(parent,slot,'left')}
 const shrunk=H(parent[slot])<oldH;snap(`该子树更新前 h=${oldH}，修复后 h=${H(parent[slot])}：${shrunk?'高度下降，父亲还必须检查。':'高度不变，父亲无需继续平衡修复。'}`,'决定是否向上传播',parent[slot]?[parent[slot].id]:[],{lines:[14],heightChange:{before:oldH,after:H(parent[slot]),shrunk}});return shrunk;
 }
 function erase(parent,slot,v){const t=parent[slot];callStack.push(`erase(${t?.v??'∅'}, ${v})`);let result;
 if(!t){snap(`搜索遇到空指针，键 ${v} 不存在。`,'查找失败',[],{lines:[1]});result={found:false,shrunk:false}}
 else {const oldH=H(t);snap(`比较目标 ${v} 与 ${t.v}，${v===t.v?'找到目标':v<t.v?'进入左子树':'进入右子树'}。`,'定位目标',[t.id],{lines:[v<t.v?2:v>t.v?3:5]});
 if(v!==t.v){const child=erase(t,v<t.v?'left':'right',v);if(child.found&&child.shrunk)result={found:true,shrunk:repair(parent,slot,oldH)};else{snap(child.found?'子树高度未变，停止向上平衡修复。':'目标不存在，保留原树。','回溯停止',[t.id],{lines:[4]});result={found:child.found,shrunk:false}}}
 else if(!t.left||!t.right){const child=t.left||t.right;pending=true;snap(`${t.id}（键 ${t.v}）${child?'只有一个孩子':'是叶子'}，实际移除该节点对象。`,'物理删除前',[t.id],{lines:[5],physicalRemoved:t.id});parent[slot]=child;snap(`${parent===box?'root':parent.id+'.'+slot} 改指向 ${child?.id??'null'}。`,'物理删除后',child?[child.id]:[],{lines:[5],physicalRemoved:t.id,pointers:[['移除对象',`${t.id}, key=${t.v}`],['替代孩子',child?.id??'null']]});result={found:true,shrunk:true}}
 else {let s=t.right;snap('目标有两个孩子：后继是右子树中最左的节点，它不可能有左孩子。','寻找后继',[t.id,s.id],{lines:[6]});while(s.left){s=s.left;snap(`沿左指针继续到 ${s.v}。`,'寻找后继',[s.id],{lines:[6]})}const old=t.v;pending=true;t.v=s.v;snap(`把后继键 ${s.v} 复制到 ${t.id}，逻辑删除键 ${old}；节点身份仍是 ${t.id}。现在右侧旧副本待删除。`,'逻辑替换',[t.id,s.id],{lines:[7],pointers:[[`${t.id}.key`,`${old} → ${s.v}`],['实际待移除对象',s.id]],logicalDeleted:old});const sub=erase(t,'right',s.v);result={found:true,shrunk:sub.shrunk?repair(parent,slot,oldH):false};}
 }callStack.pop();return result;
 }
 snap('按初始序列完成 AVL 建树；从下面的删除操作开始逐步分析。','准备',[],{lines:[]});for(const v of actions){current=v;op++;rotations=0;pending=false;snap(`开始删除 ${v}。`,'开始');const result=erase(box,'root',v);pending=false;snap(result.found?`删除 ${v} 完成，共 ${rotations} 次旋转。`:`键 ${v} 不存在，树未改变。`,'完成',[],{result:result.found?'deleted':'missing'});}return frames;
}

// Shared bottom-up splaying. Each double rotation is one proof round.
function splayWithTrace(box,v,emit,{saved=()=>null,phase='访问',analysis=false}={}){
 let rotationCount=0;
 while(box.root?.v!==v){const path=findPath(box.root,v),x=path.at(-1),p=path.at(-2),g=path.at(-3);if(!p||x.v!==v)break;
 const same=g&&(g.left===p)===(p.left===x),type=!g?'Zig':same?'Zig-zig':'Zig-zag';
 const before=cp(box.root),r0=rankStats(before),roles={[x.id]:'x',[p.id]:'p',...(g?{[g.id]:'g'}:{})},ranks=new Map(r0.rows.map(r=>[r.id,r]));
 const context={type,roles,before,saved:saved(),phase,analysis,c:0,completeRound:false};
 emit(`识别 ${type}：x=${x.v}，p=${p.v}${g?'，g='+g.v:''}。${same?'同向时先转 p，再转 x。':''}`,'识别旋转轮',context);
 const turn=(t,dir)=>{const a=dir==='left'?t.right:t.left,T2=dir==='left'?a.left:a.right;const owner=findPath(box.root,t.v).at(-2),connection=owner?`${owner.id}.${owner.left===t?'left':'right'}`:'root';const out=rotateRaw(t,dir);attach(box,t,out);rotationCount++;return[[`${t.id}.${dir==='left'?'right':'left'}`,T2?.id??'null'],[`${a.id}.${dir==='left'?'left':'right'}`,t.id],[connection,out.id]]};
 let pointers;
 if(!g){pointers=turn(p,p.left===x?'right':'left')}
 else if(same){const dir=g.left===p?'right':'left';const first=turn(g,dir);emit('第一次旋转已完成。双旋尚未结束，此时不单独套用 Zig-zig 的整轮上界。','双旋中间状态',{...context,c:1,pointers:first});pointers=turn(p,dir)}
 else{const first=turn(p,p.left===x?'right':'left');emit('x 先超过 p。双旋尚未结束，继续旋转 x 与 g。','双旋中间状态',{...context,c:1,pointers:first});pointers=turn(g,g.left===x?'right':'left')}
 const after=rankStats(box.root),now=new Map(after.rows.map(r=>[r.id,r])),c=g?2:1,delta=after.phi-r0.phi,dx=now.get(x.id).rank-ranks.get(x.id).rank;
 const proof={type,c,phiBefore:r0.phi,phiAfter:after.phi,delta,amortized:c+delta,rankGain:dx,bound:3*dx+(g?0:1),nodeIds:[x.id,p.id,...(g?[g.id]:[])],rows:r0.rows.map(r=>({...r,afterSize:now.get(r.id).size,afterRank:now.get(r.id).rank,delta:now.get(r.id).rank-r.rank,role:roles[r.id]||'不变'})),roles};
 // Sizes of the two disjoint sets that make the logarithmic inequality work.
 if(g){if(same){proof.sets=[{label:'旋转前 x 子树',ids:allIds(mapNode(before,x.id))},{label:'旋转后 g 子树',ids:allIds(mapNode(box.root,g.id))}]}else proof.sets=[{label:'旋转后 p 子树',ids:allIds(mapNode(box.root,p.id))},{label:'旋转后 g 子树',ids:allIds(mapNode(box.root,g.id))}];proof.container=now.get(x.id).size;proof.setRankSum=proof.sets.reduce((s,a)=>s+Math.log2(a.ids.length),0);proof.logUpper=2*now.get(x.id).rank-2;}
 emit(`${type} 完成：旋转成本 c=${c}，ΔΦ=${delta.toFixed(3)}，ĉ=${(c+delta).toFixed(3)}。`,'完整旋转轮',{...context,c,proof,pointers,completeRound:true});
 }return rotationCount;
}
function allIds(n){return n?[n.id,...allIds(n.left),...allIds(n.right)]:[]}

export function splayDeleteTrace({initial,actions}){
 const box={root:buildTree(initial)},frames=[];let right=null,op=0,current=actions[0],rotations=0;
 function snap(msg,phase,extra={}){const panels=right!==null||extra.split?[{label:'L · 正在伸展最大值',root:annotate(box.root,'splay',extra.roles)},{label:'R · 已保存，暂不参与旋转',root:annotate(right,'splay')}]:[{label:'当前 Splay 树',root:annotate(box.root,'splay',extra.roles)}];frames.push({kind:'lesson-tree',mode:'splay',roots:[box.root,right].filter(Boolean).map(cp),panels,hot:extra.hot||[],msg,metrics:{'目标键':current,'本次旋转':rotations,'当前森林节点数':keys(box.root).length+keys(right).length},teaching:{phase,code:SPLAY_CODE,lines:extra.lines||[],pointers:extra.pointers||[],checks:[{ok:true,label:right?'max(L) < min(R)，暂存 R 不丢失':'旋转保持每个子树的中序次序'}],...extra},operation:op,complete:phase==='完成'})}
 const emit=(msg,phase,round)=>{if(phase==='双旋中间状态'||phase==='完整旋转轮')rotations++;snap(phase==='完整旋转轮'?`${round.type} 完成。${right?'R 保持保存，继续处理 L。':'继续向根伸展。'}`:msg,phase,{roles:round.roles,hot:Object.keys(round.roles),lines:[right?11:round.type==='Zig'?3:round.type==='Zig-zig'?4:5],pointers:round.pointers,roundType:round.type,split:right!==null})};
 snap('初始形态由普通 BST 插入序列构建；Splay 无需初始高度平衡。初始化成本不属于本次删除动画。','准备');
 for(const v of actions){current=v;op++;rotations=0;snap(`查找待删除的键 ${v}。`,'开始',{lines:[1]});const path=findPath(box.root,v);for(const t of path)snap(`访问 ${t.v}，${v===t.v?'找到目标':v<t.v?'继续向左':'继续向右'}。`,'查找',{hot:[t.id],lines:[1]});if(!path.length){snap('空树删除，安全返回。','完成',{lines:[1],result:'missing'});continue}const last=path.at(-1);splayWithTrace(box,last.v,emit);if(box.root.v!==v){snap(`键 ${v} 不存在。伸展最后访问节点 ${box.root.v}，键集合不变，但树形可能改变。`,'完成',{lines:[6],result:'missing'});continue}
 const removed=box.root,oldLeft=removed.left;right=removed.right;
 snap(`目标 ${v} 已到根。先保存 L=${oldLeft?.v??'∅'} 与 R=${right?.v??'∅'}，再释放根。`,'保存两侧',{lines:[7],pointers:[['L',oldLeft?.id??'null'],['R',right?.id??'null']],split:false});
 // The preceding full-tree snapshot must not render R twice.
 frames.at(-1).metrics['当前森林节点数']=keys(removed).length;frames.at(-1).roots=[cp(removed)];frames.at(-1).panels=[{label:'待移除根 · 先保存左右引用',root:annotate(removed,'splay')}];
 box.root=oldLeft;removed.left=removed.right=null;snap(`实际移除 ${removed.id}（键 ${v}）。两棵子树各自完整保留。`,'分离并删除根',{split:true,lines:[8],removed:removed.id,pointers:[['销毁节点',removed.id],['L.parent / R.parent','均应置 null（使用父指针时）']]});
 if(!box.root){box.root=right;right=null;snap('L 为空，直接令 root=R；不需要额外伸展。','完成',{lines:[9],result:'deleted'});continue}
 let maximum=box.root;while(maximum.right){snap(`沿 L 的右指针：${maximum.v} → ${maximum.right.v}。`,'寻找左侧最大值',{hot:[maximum.id,maximum.right.id],lines:[10],split:true});maximum=maximum.right}
 snap(`L 的最大键为 ${maximum.v}。把它伸展成 L 的根，不是在 R 中找最大值。`,'准备 Join',{hot:[maximum.id],lines:[10,11],split:true});splayWithTrace(box,maximum.v,emit,{saved:()=>right});
 if(box.root.right)throw Error('Maximum must have no right child');snap(`L 根 ${box.root.v} 的右孩子必为空，因为它已是 L 中最大键。可以安全挂接 R。`,'验证 Join 前提',{lines:[12],split:true,pointers:[['root.right','null'],['max(L) < min(R)',right?`${box.root.v} < ${keys(right)[0]}`:'R 为空，条件自然成立']]});
 box.root.right=right;right=null;pull(box.root);snap(`root.right=R，更新必要的元数据。删除 ${v} 完成。`,'完成',{lines:[12,13],result:'deleted'});
 }return frames;
}

export function splayPotentialTrace({initial,actions}){
 if(!initial.length)throw Error('势能实验需要非空初始树。');if(actions.some(v=>!initial.includes(v)))throw Error('访问引理实验固定键集合，只接受树中已经存在的访问键。');
 const box={root:buildTree(initial)},phi0=rankStats(box.root).phi,frames=[],history=[];let totalC=0,totalA=0,operation=0,rounds=[],target=actions[0];
 function snapshot(msg,phase,extra={}){const stats=rankStats(box.root);frames.push({kind:'lesson-tree',mode:'potential',roots:[cp(box.root)],panels:extra.before?[{label:'本轮之前 · 同一组节点编号',root:annotate(extra.before,'splay',extra.roles)},{label:phase==='双旋中间状态'?'只做完第一次旋转':'本轮之后',root:annotate(box.root,'splay',extra.roles)}]:[{label:'当前树 · 标注子树大小 s 与秩 r=log₂s',root:annotate(box.root,'splay')}],hot:extra.roles?Object.keys(extra.roles):[],msg,metrics:{'当前访问键':target,'当前势能 Φ':stats.phi.toFixed(3),'已结算旋转成本':totalC,'初始势能 Φ₀':phi0.toFixed(3)},teaching:{phase,code:['s(v) = 1 + s(v.left) + s(v.right)','r(v) = log2(s(v)); Φ(T) = Σ r(v)','complete Zig: c = 1; complete double rotation: c = 2','ĉ = c + Φ(after) − Φ(before)','ĉ ≤ 3 × (r_after(x) − r_before(x)) + [Zig]','sum over rounds: ĉ_access ≤ 3 log2(n / s_before(x)) + 1','sum over accesses: Σc = Σĉ + Φ0 − Φfinal'],lines:phase==='完整旋转轮'?[3,4,5]:phase==='访问完成'?[6,7]:phase==='双旋中间状态'?[3]:[1,2],pointers:extra.pointers||[],...extra},ledger:{phi0,phi:stats.phi,totalC,totalA,history:cp(history),rounds:cp(rounds)},operation,complete:phase==='访问完成'});}
 snapshot('固定 n 个键，仅分析成功访问。初始 BST 的构建成本不计入访问序列，但它的初始势能 Φ₀ 明确保留。','准备');
 for(const v of actions){operation++;target=v;rounds=[];const start=rankStats(box.root),x=start.rows.find(x=>x.v===v),bound=3*Math.log2(initial.length/x.size)+1;let cost=0;
 snapshot(`第 ${operation} 次访问 ${v}：初始 s(x)=${x.size}，Φ=${start.phi.toFixed(3)}。`,'开始');
 splayWithTrace(box,v,(msg,phase,round)=>{if(round.completeRound){rounds.push(round.proof);cost+=round.c;}snapshot(msg,phase,{before:round.before,roles:round.roles,pointers:round.pointers,proof:round.completeRound?round.proof:null,halfRound:phase==='双旋中间状态'})},{analysis:true});
 const final=rankStats(box.root),delta=final.phi-start.phi,amortized=cost+delta;totalC+=cost;totalA+=amortized;history.push({index:operation,key:v,c:cost,phiBefore:start.phi,phiAfter:final.phi,delta,amortized,bound,totalC,totalA});
 snapshot(`访问 ${v} 完成：c=${cost}，ΔΦ=${delta.toFixed(3)}，ĉ=${amortized.toFixed(3)} ≤ ${bound.toFixed(3)}。${cost===0?'目标已在根，旋转成本为 0；实际查找仍有常数成本。':''}`,'访问完成',{access:history.at(-1)});
 }return frames;
}

const make=(title,label,input,run,code,presets)=>({title,label,default:input,parse:parseLesson,run,code,presets});
export const lessonDemos={
 'avl-delete':make('AVL 删除 · 逐层修复详解','初始 AVL 插入序列 | 依次删除的键','4,2,5,1,3 | 5',avlDeleteTrace,AVL_CODE.join('\n'),[
  {label:'重孩子 BF=0',input:'4,2,5,1,3 | 5',why:'删去 5 后，4 左重而孩子 2 的 BF=0；单右旋后高度不变。'},
  {label:'双孩子 / 后继替换',input:'20,10,30,5,15,25,40,22,27 | 20',why:'关注 n1 的键变化，以及右子树中实际移除的后继对象。'},
  {label:'LR 双旋',input:'5,2,8,1,4,7,3 | 7',why:'删除右侧叶后，检查左重节点与偏右的左孩子。'},
  {label:'RL 双旋',input:'-5,-2,-8,-1,-4,-7,-3 | -7',why:'LR 案例的镜像：右重节点的右孩子左倾，先右后左。'},
  {label:'多层连续修复',input:'3,15,16,12,4,13,6,8,9,14,10,2,1,5,7,11 | 15',why:'先在下层做 LR 双旋，高度继续下降；祖先还需一次 LL 单旋，总共三次旋转。'},
  {label:'叶 / 单孩子 / 空树',input:'2,1,3,4 | 1,3,2,4,9',why:'覆盖叶子、单孩子、根、空树与不存在键。'}]),
 'splay-delete':make('Splay 删除 · Split / Join 详解','初始普通 BST 插入序列 | 依次删除的键','40,20,60,10,30,50,70,25,35 | 40',splayDeleteTrace,SPLAY_CODE.join('\n'),[
  {label:'删除根 / 两次伸展阶段',input:'40,20,60,10,30,50,70,25,35 | 40',why:'根已就位后分离 L、R，再伸展 max(L) 并挂回 R。'},
  {label:'非根删除',input:'40,20,60,10,30,50,70,25,35 | 30',why:'先用 Zig-zag 伸展目标 30，再把 L 的最大值 25 伸展到 L 根，观察两个阶段。'},
  {label:'L 为空',input:'20,10,30 | 10',why:'删除最小键后 L 为空，直接接回 R。'},
  {label:'删除失败与末次访问',input:'20,10,30,25 | 26,99',why:'集合不变，但失败查找把最后访问节点伸展到根。'},
  {label:'连续删除到空树',input:'2,1,3 | 2,1,3,4',why:'检查空侧、根与最后一个节点的边界。'}]),
 'splay-potential':make('Splay 均摊证明 · 势能与访问引理','初始普通 BST 插入序列 | 成功访问序列（固定键集合）','1,2,3,4,5,6,7,8 | 8,1,8,4,4',splayPotentialTrace,'s(v)=子树节点数；r(v)=log₂s(v)\nΦ(T)=Σr(v)\n完整旋转轮：ĉ=c+ΔΦ\nZig: ĉ≤3Δr(x)+1\nZig-zig / Zig-zag: ĉ≤3Δr(x)\n访问序列：Σc=Σĉ+Φ₀−Φfinal',[
  {label:'链状树 / 重复访问',input:'1,2,3,4,5,6,7,8 | 8,1,8,4,4',why:'先观察昂贵访问与势能释放，再观察连续访问根的常数实际成本。'},
  {label:'Zig',input:'2,1,3 | 1',why:'只有 x、p 的秩变化；最后可能出现额外常数 1。'},
  {label:'Zig-zig 与不相交集合',input:'60,40,80,20,50,70,90,10,30 | 20',why:'旧 x 子树与新 g 子树不相交，用它们解释对数不等式。'},
  {label:'Zig-zag 与不相交集合',input:'60,20,80,10,40,30,50,70,90 | 40',why:'新 p、g 子树不相交；其根秩和被 2r′(x)−2 控制。'},
  {label:'热点访问',input:'40,20,60,10,30,50,70 | 10,10,10,30,10,30,10',why:'树形适应访问局部性；实验观察不等于工作集定理的证明。'}])
};
