export const rbCases={
 I1:{name:'叔红 · 变色上推',test:'P 红，U 红',action:'P、U → 黑；G → 红；X ← G',why:'原来每条路径从 G 获得 1 个黑；现在改从 P 或 U 获得 1 个黑。局部黑数没变，红红冲突可能上移。',next:'重新看新 X 的父亲；到根则染黑。',memory:'叔红：父叔黑，祖父红，往上看。'},
 I2:{name:'叔黑折线 · 先拉直',test:'P 红，U 黑；X 与 P 朝向相反',action:'围绕 P 旋转，使 X 上升；不变色',why:'两个红节点交换上下位置，中间子树仍满足中序关系；黑数不变。此步只是把形状变成 I3。',next:'重新命名 X、P、G，立刻进入 I3。',memory:'折线先转父，拉直再收尾。'},
 I3:{name:'叔黑直线 · 换色旋祖',test:'P 红，U 黑；X 与 P 朝向相同',action:'P → 黑；G → 红；围绕 G 旋转，使 P 上升',why:'新的局部根 P 提供原来 G 的黑色。红节点不再直接相连，各外围子树路径黑数不变。',next:'本次修复结束，最后保证根黑。',memory:'直线父黑祖红，转祖就结束。'},
 D1:{name:'兄红 · 换黑兄',test:'X 欠黑且实际为黑；S 红',action:'S → 黑；P → 红；转 P，让 S 上升',why:'S 红必有黑孩子，P 必黑。旋转后原来的近侄成为新黑兄弟；所有有效黑路径数保持，X 的亏欠尚未消失。',next:'更新 S、N、F，进入 D2 / D3 / D4。',memory:'兄红先换黑兄，再查侄子。'},
 D2:{name:'双侄黑 · 合并上推',test:'S 黑，N 黑，F 黑（NIL 也算黑）',action:'S → 红；X ← P，亏欠上移',why:'X 侧原来少一个黑；把兄弟 S 染红，使两侧都少一个黑。局部已经等高，把整棵子树的亏欠交给 P。',next:'P 红：染黑吸收；P 黑：继续上推；到根：直接消债。',memory:'双侄黑，兄染红，亏欠交给父。'},
 D3:{name:'近红远黑 · 转出远红',test:'S 黑，N 红，F 黑',action:'N → 黑；S → 红；转 S，让 N 上升',why:'黑兄弟与红近侄交换形状，保留外围黑数；新兄弟为黑，新远侄为红。亏欠仍留在 X。',next:'更新 S、N、F，必定进入 D4。',memory:'近红只是过渡，转兄得到远红。'},
 D4:{name:'远侄红 · 借黑收尾',test:'S 黑，F 红；N 可红可黑',action:'S ← P 原色；P、F → 黑；转 P，让 S 上升',why:'X 一侧经过下降且染黑的 P，多出一个实际黑色；远侧 F 染黑补偿结构变化。各路径重新等黑高，去掉虚拟 +1。',next:'本次修复结束，不向上继续。',memory:'兄承父色，父远变黑，转父结束。'}
};
export const rbPresets=[
 {id:'insert-uncle',name:'插入 · 叔红上推',initial:'20 10 30',ops:'i:5',target:'I1',why:'先看变色如何把冲突移向祖父，且不改变路径黑数。'},
 {id:'insert-bend',name:'插入 · 折线→直线',initial:'30 10',ops:'i:20',target:'I2',why:'两个旋转分开播放：第一个只负责拉直，第二个配合变色收尾。'},
 {id:'insert-line',name:'插入 · 直线收尾',initial:'30 20',ops:'i:10',target:'I3',why:'与折线案例比较，只少一次拉直旋转。'},
 {id:'insert-parent',name:'插入 · 父黑不修',initial:'20',ops:'i:10',why:'红叶接在黑父下，无红红冲突，无需旋转或变色。'},
 {id:'delete-red',name:'删除 · 摘红即止',initial:'20 10 30',ops:'d:10',why:'真正摘除红叶不会改变任何路径的黑数。'},
 {id:'delete-red-child',name:'删除 · 红子吸收',initial:'14 1 9 19',ops:'d:14',target:'D-absorb',why:'黑节点只有一个非空孩子时，该孩子必为红；把它染黑即可。'},
 {id:'delete-push',name:'删除 · 双黑上推',initial:'2 1 3 4',ops:'d:4 d:1',target:'D2',why:'先删红叶 4，得到黑色兄弟和两个黑 NIL，再看亏欠上推到根。'},
 {id:'delete-near',name:'删除 · 近红→远红',initial:'10 20 5 15',ops:'d:5',target:'D3',why:'两步都不可省：先旋兄弟转出远红，再旋父亲收尾。'},
 {id:'delete-far',name:'删除 · 远红收尾',initial:'2 1 3 4',ops:'d:1',target:'D4',why:'已经有红远侄，直接借黑，无须先处理近侄。'},
 {id:'delete-three',name:'删除 · 三旋完整链',initial:'50 60 20 30 10 40',ops:'d:50',target:'D1',why:'一例串起 D1→D3→D4，解释删除最多三次旋转为什么会取到。'},
 {id:'delete-cascade',name:'删除 · 连续向上传递',initial:'25 2 20 16 3 19 7 4 8 13',ops:'d:20 d:3',target:'D2',why:'第二次删除中 D2 连续发生两次；变色可向上传递，旋转仍只有常数次。'},
 {id:'delete-successor',name:'删除 · 别看错颜色',initial:'20 10 30 25',ops:'d:20',why:'目标是黑节点，实际摘除的后继却是红色。跟踪稳定编号，理解为什么不用补黑。'},
 {id:'delete-root',name:'删除 · 唯一根',initial:'7',ops:'d:7',target:'D-root',why:'替代位置就是根 NIL；所有路径一起减少黑色，不产生路径差异。'}
];
export const rbInsertCode=[
 'X = BST_Insert(k, RED)  // 重复键直接返回',
 'while X.parent is RED:',
 '  P = X.parent; G = P.parent; U = sibling(P)',
 '  if U is RED:             // I1',
 '    P.color = U.color = BLACK; G.color = RED',
 '    X = G; continue',
 '  if X,P,G form a bend:    // I2',
 '    rotate(P, raise=X); X = old_P',
 '    refresh P,G',
 '  P.color = BLACK; G.color = RED  // I3',
 '  rotate(G, raise=P); break',
 'root.color = BLACK'
];
export const rbDeleteCode=[
 'Y = target or successor(target)',
 'removedColor = Y.color  // 真正摘除对象的原颜色',
 'copy key/payload if needed; splice out Y using child X',
 'if removedColor is RED: return',
 'while X != root and X.color == BLACK:',
 '  P = X.parent; S = sibling(X); refresh near N, far F',
 '  if S is RED:                      // D1',
 '    S.color = BLACK; P.color = RED; rotate(P, raise=S)',
 '    refresh S,N,F',
 '  if N and F are BLACK:             // D2',
 '    S.color = RED; X = P; continue',
 '  if F is BLACK:                    // D3 (N is RED)',
 '    N.color = BLACK; S.color = RED; rotate(S, raise=N)',
 '    refresh S,N,F',
 '  S.color = P.color; P.color = F.color = BLACK // D4',
 '  rotate(P, raise=S); return',
 'X.color = BLACK   // 红 X 吸收，或根处终止'
];
export const rbReading=`
<h2>用两个不变量解释全部修复</h2>
<p><b>插入只担心红红相连。</b>新节点先红，不会让所在路径多一个黑。若父黑就结束；父红再看叔。叔红时，父叔变黑和祖父变红相互抵消；叔黑时先把折线变直线，再把局部黑色交给新的根。</p>
<p><b>删除只把一个黑色亏欠向外处理。</b>普通 BST 删除之后，真正摘除的节点至多有一个非 NIL 孩子。摘红无需修；摘黑且替代孩子红，染黑即可；摘黑且替代位置黑（常为 NIL），才需检查兄弟与侄子。橙色 <b>+1</b> 是“这条路径补记一黑”的分析标记，节点实际颜色仍只有红、黑两种。</p>
<h3>为什么远侄优先？</h3><p>在兄弟黑的前提下，只要远侄红，就能直接执行 D4，近侄颜色不影响收尾。只有远侄黑而近侄红时才需要 D3；两个都黑才 D2。D1 先把红兄弟变成黑兄弟情形。因此四类条件有明确的判断顺序，不能只背“见红就旋转”。</p>
<h3>看方向时，只问谁应该上升</h3><p>约定 X 在左，兄弟 S 在右：D1/D4 都让右边 S 上升，因此对 P 左旋；D3 让 S 的左孩子 N 上升，因此对 S 右旋。X 在右时全部镜像。插入同理：折线让 X 上升，直线让 P 上升。动画中的“镜像重放”对所有键取相反数，并把双孩子删除的后继规则镜像为前驱规则后重新执行，不是只把文字的左右交换。</p>
<h3>用黑数守恒检查变色，而不是凭印象染色</h3><p>本专题路径表从根开始计数，<b>包含根和终点黑 NIL</b>。这是为了直接对照动画，不是课件中“不含当前节点”的 bh 定义。修复中的实际黑数可能不齐；给所有经过 X 的路径加上虚拟 +1 后应相等。D2 把兄弟的黑色减一，同时把 +1 移到 P；D4 用旋转与变色把虚拟黑落实到实际节点。</p>
<p>以 D4 的 X 在左为例，设父亲旧颜色的黑贡献为 c∈{0,1}，X 子树实际黑路径数为 h；S 黑、F 红，近侄子树和 F 下方子树的黑路径数都是 h。处理前，X 侧有效黑数为 c+h+1，兄弟侧为 c+1+h。处理后 S 继承 c，P 与 F 均黑，三类路径都是 c+1+h。因此可以取消 X 的 +1，而无须猜测 P 原来是红还是黑。</p>
<h3>为什么插入最多两旋、删除最多三旋？</h3><p>插入 I1 不旋转且向上两层；一旦遇到叔黑，I2 最多一次，I3 一次便结束，所以最多两旋。删除只有 D2 会向上重复且不旋转。D3 一次之后必接 D4 一次并结束；D1 一次后 P 为红，若接 D2 就在 P 染黑终止，若接 D3/D4 也终止。因此不能反复累积 D1，最多 D1+D3+D4 三旋。检查和变色仍可能走 O(log n) 层，旋转次数是常数不代表更新总时间是 O(1)。</p>
<h3>把红节点与黑父合在一起：2–3–4 树的直觉</h3><p>在<b>合法完成状态</b>，把每个黑节点和它的红孩子看作一个多键节点：无红孩子是 2-node，一个红孩子是 3-node，两个是 4-node。红红冲突表示一个多键节点暂时放不下；叔红变色对应向上分裂。删除双侄黑时没有可借的键，合并并把不足向父节点传递；远侄红时可以重分配。下面的折叠图只在合法状态显示，避免把修复中的红红或亏欠状态误画成合法 2–3–4 树。本专题采用普通对称红黑树，不强制红链接左倾。</p>
<h3>实现中最容易错的四处</h3>
<ol><li><b>记原颜色。</b>本实验采用“复制后继键/载荷，再摘除后继对象”。目标 Z 的对象编号保持，Y 对象消失；修复由 Y 的原颜色决定。不能把目标节点的颜色当作判断依据。若采用整体移植版本，还要保存并恢复正确的颜色。</li><li><b>NIL 有位置。</b>欠黑可以落在空孩子上。实现要保存它的 parent 与左右方位。本实验为每个空位建立独立的黑 NIL 对象；共享 sentinel 的实现也必须正确记录当前替代位置，不能丢掉父亲。</li><li><b>旋转后重新找亲属。</b>D1/D3 后的 S、N、F 已经变化；I2 后 X、P、G 的命名也要更新。判定帧使用当前角色；I1/I2 与 D1/D2/D3 执行后，右图直接标出下一轮角色。动作中的旧名称对应左图，稳定编号始终追踪同一对象。</li><li><b>分清不变和暂时违反。</b>BST 中序顺序一直保持（键复制与摘除合并为一个状态）；NIL 始终黑。红红关系或实际黑数在修复中可暂时违反，只有“操作完成”状态要求五条性质全部恢复。成组变色和对应旋转作为同一修复步结算，不把半步误称为合法树。</li></ol>
<h3>如何练到不依赖口诀</h3><p>先选择“近红→远红”或“三旋完整链”，在“判定”帧停住。打开预测模式，先判断兄弟颜色，再判断远侄和近侄；说出谁应该上升、谁继承谁的颜色、亏欠是否还在。回答后再播放一步，用角色表和路径黑数核对。最后镜像同一个例子，仍然使用相同四句话。</p>
<details><summary>为什么非根的欠黑 X 不会有 NIL 兄弟？</summary><p>在修复循环中 X 实际黑且携带一个额外黑，哪怕 X 是 NIL，有效黑数也至少为 2（含 NIL）。若兄弟也只是 NIL，它只贡献 1，不可能与 X 侧相等。因此循环中的兄弟必为真实节点，侄子则可以是黑 NIL。</p></details>
<details><summary>为什么黑节点只有一个真实孩子时，这个孩子必红？</summary><p>另一侧是黑 NIL，贡献 1。若真实孩子为黑，从该孩子到 NIL 至少贡献 2，违反路径等黑高；因此它必须红，且不能有额外黑层。删除黑父后把该红孩子染黑，就补回失去的一层黑。</p></details>
<details><summary>根的亏欠为什么可以直接丢掉？</summary><p>每条根到 NIL 路径都携带同一个根处 +1。把它去掉时，所有路径一起减一，仍然相等。根本身若红还要染黑；空树的根就是黑 NIL。</p></details>
<p>算法采用经典对称的自底向上插入/删除修复规则。可对照 <a href="https://www.cs.dartmouth.edu/~thc/cs10/lectures/0519/0519.html" target="_blank" rel="noopener">Dartmouth / Thomas H. Cormen 的红黑树课程讲义</a>，以及 <a href="https://cs.dartmouth.edu/cs10/notes10.html" target="_blank" rel="noopener">Dartmouth 的 2–3–4 树解释</a>。图、记忆卡、状态叙述与练习为本课程独立编写。</p>`;
