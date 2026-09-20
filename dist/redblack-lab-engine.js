// Symmetric, bottom-up red-black repair. Each external leaf has its own
// black NIL object so a deficient empty position has an unambiguous parent.
import {caseLabel} from './redblack-case-map.js';
export const isRed=n=>!!n&&!n.nil&&n.color==='R';
export function parseRBKeys(text){const a=text.trim()?text.trim().split(/[,，\s]+/).map(Number):[];if(a.length>24||a.some(v=>!Number.isSafeInteger(v)||Math.abs(v)>999)||new Set(a).size!==a.length)throw Error('初始树须为至多 24 个互异整数，范围 −999…999；允许空树。');return a}
export function parseRBOps(text){const words=text.trim().split(/[,，\s]+/).filter(Boolean);if(!words.length||words.length>24)throw Error('请输入 1–24 个操作，例如 i:19 d:8 f:12。');return words.map(s=>{const m=/^(?:([idf]):)?(-?\d+)$/.exec(s);if(!m||Math.abs(+m[2])>999)throw Error('操作格式为 i:键、d:键、f:键；键在 −999…999。');return{type:m[1]||'i',key:+m[2]}})}
export function snapshotPaths(root,debtId=null){const paths=[];function visit(n,black,path,debt){black+=n.color==='B'?1:0;debt+=n.id===debtId?1:0;path=[...path,n.nil?'NIL':String(n.key)];if(n.nil)paths.push({id:n.id,path,black,effective:black+debt,debt});else{visit(n.left,black,path,debt);visit(n.right,black,path,debt)}}visit(root,0,[],0);return paths}
export class RBMachine{
 constructor(initial=[],{predecessor=false}={}){this.predecessor=predecessor;this.serial=0;this.root=this.nil(null);this.frames=[];this.capture=false;this.rotations=0;this.debt=null;this.operation=0;this.meta=null;for(const key of initial)this.insert(key);this.capture=true;this.rotations=0;this.record('start','初始红黑树','初始序列已按标准红黑插入建树；下面只回放指定操作。')}
 nil(parent){return{id:'e'+(++this.serial),nil:true,color:'B',parent}}
 node(key,parent){const n={id:'n'+(++this.serial),key,color:'R',parent,nil:false};n.left=this.nil(n);n.right=this.nil(n);return n}
 snapshot(n=this.root){return n.nil?{id:n.id,nil:true,color:'B'}:{id:n.id,key:n.key,color:n.color,nil:false,left:this.snapshot(n.left),right:this.snapshot(n.right)}}
 record(phase,title,text,roles={},caseId=null,side=null){if(!this.capture)return;let courseCase=caseId;if(caseId==='D2'){if(phase==='decision'){const seek=n=>n.id===roles.P?n:n.nil?null:seek(n.left)||seek(n.right);this.d2Variant=seek(this.root).color==='R'?'D21':'D22'}courseCase=this.d2Variant}if(caseId){title=caseLabel(courseCase)+' · '+title.replace(/^[ID][1-4] · /,'');if(caseId==='D2')text+=(courseCase==='D21'?' 课件 Case 2.1：旧父红，新 X 染黑吸收后结束。':' 课件 Case 2.2：旧父黑；若到根则终止，否则重新分类。')}let roleScope=phase==='action'?'本轮执行前的角色（追踪变色对象）':'当前角色';if(phase==='action'&&['I1','I2','D1','D2','D3'].includes(caseId)){const id=caseId==='I1'?roles.G:caseId==='I2'?roles.P:this.debt;const seek=n=>n.id===id?n:n.nil?null:seek(n.left)||seek(n.right);const next=seek(this.root);if(next){roles=caseId.startsWith('I')?this.iroles(next):this.droles(next);roleScope='下一轮角色（已重新命名）'}}const root=this.snapshot();this.frames.push({root,phase,title,text,roles:{...roles},roleScope,caseId,courseCase,side,debt:this.debt,rotations:this.rotations,operation:this.operation,meta:this.meta?{...this.meta}:null,paths:snapshotPaths(root,this.debt)})}
 rotate(p,dir){const outward=dir==='left'?'right':'left',inward=dir==='left'?'left':'right',s=p[outward],g=p.parent;if(s.nil)throw Error('Cannot rotate through NIL');p[outward]=s[inward];p[outward].parent=p;s.parent=g;if(!g)this.root=s;else g[g.left===p?'left':'right']=s;s[inward]=p;p.parent=s;this.rotations++}
 find(key){let n=this.root;while(!n.nil&&key!==n.key)n=key<n.key?n.left:n.right;return n}
 iroles(x){const p=x.parent,g=p?.parent,u=g?(g.left===p?g.right:g.left):null;return Object.fromEntries([['X',x],['P',p],['G',g],['U',u]].filter(([,n])=>n).map(([r,n])=>[r,n.id]))}
 droles(x){const p=x.parent;if(!p)return{X:x.id};const left=x===p.left,s=left?p.right:p.left;return{X:x.id,P:p.id,S:s.id,...(!s.nil?{N:(left?s.left:s.right).id,F:(left?s.right:s.left).id}:{})}}
 decision(id,title,text,roles,side){this.record('decision',title,text,roles,id,side)}
 insert(key){let p=null,n=this.root;while(!n.nil){p=n;if(key===n.key){this.record('complete','重复键：不插入',`键 ${key} 已存在；集合和树形都不变。`,{X:n.id});return}n=key<n.key?n.left:n.right}let x=this.node(key,p);if(!p)this.root=x;else p[key<p.key?'left':'right']=x;this.record('insert','先插红叶',`把 ${key} 染红，左右接黑色 NIL。所有路径黑色数量不变；只检查根或红红冲突。`,this.iroles(x));while(isRed(x.parent)){
  let p=x.parent,g=p.parent,left=p===g.left,u=left?g.right:g.left,roles=this.iroles(x),side=left?'L':'R';
  if(isRed(u)){this.decision('I1','I1 · 叔红：变色上推','父 P 与叔 U 都红；把 P、U 染黑，G 染红。下一轮令 X=G，检查更高处。',roles,side);p.color=u.color='B';g.color='R';x=g;this.record('action','父叔黑，祖父红；X 上移两层','每条经过 G 的路径都是“少一个 G 的黑 + 多一个 P/U 的黑”，黑数不变。',roles,'I1',side)}
  else{
   if(x===(left?p.right:p.left)){this.decision('I2','I2 · 叔黑、折线：先拉直',`围绕 P ${left?'左':'右'}旋一次；只改变结构，不变色。下一轮重新识别 X、P、G。`,roles,side);this.rotate(p,left?'left':'right');x=p;this.record('action','折线 → 直线','这一旋只把形状转为 I3，尚未消除红红冲突。',roles,'I2',side)}
   p=x.parent;g=p.parent;roles=this.iroles(x);this.decision('I3','I3 · 叔黑、直线：换色旋祖',`P 染黑、G 染红；围绕 G ${left?'右':'左'}旋。`,roles,side);p.color='B';g.color='R';this.rotate(g,left?'right':'left');this.record('action','P 上升为黑，G 下降为红','局部路径黑数保持；红红冲突消失，停止修复。',roles,'I3',side);break;
  }
 }
 if(this.root.color==='R'){this.decision('I-root','到根：根染黑','根上的红色直接染黑；所有根到 NIL 路径一起增加一个黑色。',{X:this.root.id});this.root.color='B';this.record('action','根已染黑','根为黑，五条性质恢复。',{X:this.root.id},'I-root')}
 this.record('complete',`插入 ${key} 完成`,`本次 ${this.rotations} 次旋转；经典插入最多 2 次。根黑、NIL 黑、无红红、各路径黑数相等。`)
 }
 erase(key){const z=this.find(key);if(z.nil){this.record('complete','删除不存在的键',`没有找到 ${key}，树形和集合均不改变。`);return}let y=z;if(!z.left.nil&&!z.right.nil){y=this.predecessor?z.left:z.right;while(!(this.predecessor?y.right:y.left).nil)y=this.predecessor?y.right:y.left}const original=y.color,x=y.left.nil?y.right:y.left;this.meta={targetId:z.id,targetKey:z.key,physicalId:y.id,physicalKey:y.key,removedColor:original,replacementId:x.id,replacementMode:this.predecessor?'前驱':'后继'};
 this.record('select','先确定真正摘除的对象',y===z?`目标 ${key} 至多一个非 NIL 孩子，直接摘除它。看它的原颜色 ${original}。`:`目标 ${key} 有两个孩子。${this.predecessor?'前驱':'后继'} ${y.key} 没有${this.predecessor?'右':'左'}孩子：复制它的键与载荷到 ${z.id}，再摘除 ${y.id}。修复依据 ${y.id} 的原颜色 ${original}。`,{Z:z.id,Y:y.id,X:x.id});
 if(y!==z)z.key=y.key;const p=y.parent;x.parent=p;if(!p)this.root=x;else p[p.left===y?'left':'right']=x;
 if(original==='B')this.debt=x.id;
 this.record('remove',original==='R'?'摘除红节点：黑数未变':'摘除黑节点：替代位置欠一个黑',original==='R'?'没有移除任何黑色，不需要修复。':'橙色 +1 是分析标记：经过 X 的路径暂时补计一个黑色；节点实际颜色仍为 R 或 B。',this.droles(x));
 if(original==='B')this.fixDelete(x);this.debt=null;this.record('complete',`删除 ${key} 完成`,`本次 ${this.rotations} 次旋转；经典删除最多 3 次。全部 NIL 路径黑数一致，黑色亏欠已清零。`)
 }
 fixDelete(x){while(x!==this.root&&!isRed(x)){
  let p=x.parent,left=x===p.left,s=left?p.right:p.left,side=left?'L':'R',roles=this.droles(x);
  if(s.nil)throw Error('A deficient nonroot black position must have a non-NIL sibling');
  if(isRed(s)){this.decision('D1','D1 · 兄红：先换黑兄','S 染黑、P 染红；围绕 P 向 X 一侧旋，使原兄弟上升。亏欠留在 X，重新找兄弟。',roles,side);s.color='B';p.color='R';this.rotate(p,left?'left':'right');this.record('action','红兄变黑兄，亏欠仍在原位','D1 只改变判断环境，不负责消除亏欠。接着进入删除 Case 2.1、3 或 4；原 P 已红，不会直接进入 Case 2.2。',roles,'D1',side);p=x.parent;s=left?p.right:p.left}
  let near=left?s.left:s.right,far=left?s.right:s.left;roles=this.droles(x);
  if(!isRed(near)&&!isRed(far)){this.decision('D2','D2 · 兄黑、双侄黑：合并上推','S 染红，让兄弟侧也少一个黑；亏欠从 X 移到 P。P 红可吸收，P 黑继续向上。',roles,side);s.color='R';x=p;this.debt=x.id;this.record('action','X ← P：亏欠上移一层','下面两侧已经等黑高；仅父位置继续欠黑。注意下一轮 X、P、S 都要重新命名。',roles,'D2',side)}
  else{
   if(!isRed(far)){this.decision('D3','D3 · 兄黑、近红远黑：先转出远红','N 染黑、S 染红；围绕 S 向远离 X 的一侧旋。重新取兄弟，必进入 D4。',roles,side);near.color='B';s.color='R';this.rotate(s,left?'right':'left');this.record('action','近红 → 远红','X 的亏欠未变；新兄弟为黑且远侄为红。',roles,'D3',side);s=left?p.right:p.left;far=left?s.right:s.left;roles=this.droles(x)}
   this.decision('D4','D4 · 兄黑、远侄红：借黑收尾','S 继承 P 原色；P、F 染黑；围绕 P 向 X 一侧旋。近侄颜色无须额外判断。',roles,side);s.color=p.color;p.color='B';far.color='B';this.rotate(p,left?'left':'right');this.debt=null;this.record('action','借黑完成：亏欠清零','X 一侧获得一个实际黑色，其他路径的黑数保持；本次删除修复结束。',roles,'D4',side);return;
  }
 }
 const root=x===this.root;this.decision(root?'D-root':'D-absorb',root?'到根：统一减一，直接消债':'遇红 X：染黑吸收',root?'所有路径都经过根，去掉根上的虚拟 +1 不会造成路径间差异；若根实际为红，还需染黑。':'红节点本来贡献 0，染黑后贡献 1，恰好抵消它携带的一个黑色亏欠。',{X:x.id});x.color='B';this.debt=null;this.record('action',root?'根处理完成':'红 X 已变黑，亏欠清零','虚拟额外黑色已移除；现在只用实际黑色验证。',{X:x.id},root?'D-root':'D-absorb')
 }
 run(ops){for(const op of ops){this.operation++;this.rotations=0;this.meta=null;this.debt=null;this.record('begin',`${op.type==='d'?'删除':op.type==='f'?'查找':'插入'} ${op.key}`,`第 ${this.operation} 个操作，从当前合法红黑树开始。`);if(op.type==='d')this.erase(op.key);else if(op.type==='i')this.insert(op.key);else{const x=this.find(op.key);this.record('complete',x.nil?'未找到':'查找命中',x.nil?`不存在键 ${op.key}。`:`命中 ${op.key}；普通红黑树查找不修改结构。`,x.nil?{}:{X:x.id})}}return this.frames}
}
export function rbLabTrace(initial,ops,options){return new RBMachine(initial,options).run(ops)}
