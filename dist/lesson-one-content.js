export function enrichLessonOne(c){
 c.title='AVL 与 Splay 树';
 c.desc='从旋转如何保持有序，到删除如何修复结构，再到势能如何支付昂贵访问。把操作、实现与证明放在同一条学习路径上。';
 c.demos=['avl','avl-delete','splay','splay-delete','splay-potential','stack'];
 c.learningPath=[['avl-delete','01 · AVL 删除','追踪后继、缓存高度与逐层修复'],['splay-delete','02 · Splay 删除','观察伸展、拆树和 Join 的完整过程'],['splay-potential','03 · 均摊证明','从单轮秩变化走到序列总成本'],['splay-proof','04 · 完整证明专题','所有基本操作的证明、图示与势能账本'],['amortized-analysis','05 · 摊还分析','从三种方法到 MultiPop、MTF 与 Splay']];
 c.concepts.push(
 ['删除时，键和节点是两回事','双孩子 AVL 删除可以复制后继的键与载荷，再在右子树实际移除后继对象。原目标节点的地址未变。后继没有左孩子，却可能有右孩子；需要把这个孩子接回后继原父亲。演示用稳定编号 n1、n2…区分对象与键。若外部保存节点引用，复制键会影响其语义，应明确采用复制载荷还是整体移植节点。'],
 ['AVL 删除的四个问题','每次回溯依次回答：新高度是多少？BF 是否越界？重孩子朝哪侧倾斜？修复后高度是否继续下降？尤其 BF(t)=+2 且 BF(t.left)=0 时必须单右旋；对称的 −2 / 0 情况单左旋。不能直接用插入的“新键落在哪边”判断删除分支。'],
 ['Splay 失败查找也是一次调整','本网站采用 bottom-up Splay：找到键就伸展该节点，没找到就伸展最后访问节点。因此删除不存在的键仍可能改变树形，但不能改变键集合。应用层若要求失败查找不改结构，需要采用另一明确约定，并重新说明其分析与接口语义。'],
 ['从完整轮次观察势能','一次 Zig 计 1 次旋转；Zig-zig / Zig-zag 的两次旋转合为一轮计 2。势能比较必须用整轮之前和之后的树。双旋中间帧只解释指针，不单独套用整轮上界。访问完成后才把这次访问记入序列账本。']
 );
 c.proofs.push(
 {title:'AVL 删除：为什么 BF=0 单旋后可以停止？',method:'高度分类讨论',claim:'设删除后 t 左重至 BF(t)=2，左孩子 y 的 BF=0。单右旋修复平衡，并恢复到删除前该局部子树的高度。',steps:['设删除后 t 的右子树高度为 k；y 的左右子树高度均为 k+1，因此 h(y)=k+2。删除前 t 的右子树高度是 k+1，原 h(t)=k+3。','右旋后，下降的 t 左右高度分别为 k+1 和 k，所以 h(t)=k+2，BF(t)=1。','上升的 y 左高度仍为 k+1，右孩子 t 高度为 k+2，所以 h(y)=k+3，BF(y)=−1。两节点都平衡。','新局部根 y 高度 k+3，等于删除前原 t 的高度。父亲看到的孩子高度没有变化，因此可停止向上平衡修复。右重且右孩子 BF=0 的情况完全对称。','如果重孩子 BF≠0，修复后局部高度通常下降一层，祖先仍可能失衡；一次删除可以在多个祖先处做旋转。'],formula:'重孩子 BF=0 ⇒ 单旋 ⇒ 局部高度恢复 ⇒ 停止传播'},
 {title:'Splay 的 Join 为什么不会破坏 BST？',method:'不变量 + 最大值性质',claim:'若 L、R 各为 BST，且 L 中每个键都小于 R 中每个键，则可用 splay(max(L)) 后连接右孩子完成 Join。',steps:['如果 L 为空直接返回 R；否则令 x=max(L)。查找最大值沿右指针进行。','把 x 在 L 内伸展到根。旋转保持中序序列，因此新 L 仍含原 L 的全部键，并且都不大于 x。','新根 x 的右孩子必为空；否则右子树中存在比 x 更大的键，与 x 为最大值矛盾。','令 x.right=R。由于 L 的所有键小于 R 的所有键，新的中序遍历为 inorder(L) 接 inorder(R)，严格递增。','删除时先把目标 k 伸展到根，分离的左右子树满足 L&lt;k&lt;R，因而天然满足 Join 的前提。森林阶段必须保留 R 的引用。'],formula:'erase(k) = splay(k) → detach(L,R) → join(L,R)'},
 {title:'从旋转轮到一次访问，再到整个序列',method:'两层望远镜求和',claim:'固定 n 个键、单位权重、以旋转次数计成本。m 次成功访问满足 Σcᵢ ≤ m(3log₂n+1)+Φ₀−Φₘ。',steps:['令 r(v)=log₂s(v)，Φ=Σr(v)。每个完整双旋轮 ĉ≤3(r′(x)−r(x))；Zig 轮至多额外加 1。','一次访问一直伸展同一个对象 x。前一轮的结束秩等于后一轮的开始秩，中间项逐一相消。Zig 只可能在最后出现一次。','x 最终成为整树根，s_final(x)=n。因此 ĉ_access≤3(log₂n−log₂s_before(x))+1≤3log₂n+1。','按访问求和：Σĉᵢ=Σcᵢ+Σ(Φᵢ−Φᵢ₋₁)=Σcᵢ+Φₘ−Φ₀。移项得到声明的不等式。','单位权重时 0≤Φₘ，且 Φ₀≤nlog₂n；从任意初始树出发，这个证明得到 O((m+n)log n) 的序列上界。不能仅凭“Φ 非负”就把正的 Φ₀ 删掉。','实际访问还包括搜索、比较与指针重连，成本是 O(cᵢ+1)。这里的精确常数属于旋转计数模型；加入访问常数后仍得到同阶序列复杂度。'],formula:'Σcᵢ = Σĉᵢ + Φ₀ − Φₘ　（初始势能必须保留）'},
 {title:'Splay 删除的对数均摊界：拆树与挂接也要计账',method:'势能分解',claim:'单位权重下，标准删除的旋转与常数指针操作具有 O(log n) 的均摊成本；不能只说“做两次 Splay”就忽略结构变化。',steps:['先搜索并伸展待删除节点。这部分由访问引理给出 O(log n) 均摊界；失败时伸展最后访问节点后返回。','成功时根的秩为 log₂n。拆下 L、R 并去掉根，其他节点的子树集合不变；森林势能定义为 Φ(L)+Φ(R)，因此拆树造成 ΔΦ=−log₂n。','若 L 非空，在 L 内伸展 max(L)。R 的势能固定，这次伸展可在 L 的势能上单独应用访问引理，均摊成本 O(log |L|)。','把 R 挂在新 L 根的空右指针，只改变该根的子树大小。势能增加 log₂(n−1)−log₂|L|，至多 O(log n)。L 为空时直接返回 R。','合并各阶段的真实成本与势能差，中间森林势能相消，得到一次删除 O(log n) 的均摊界。n≤1 的边界按 O(1) 单独处理。'],formula:'ΔΦ_detach = −log₂n；ΔΦ_attach = log₂(n−1) − log₂|L|'}
 );
 c.extensions.push(
 ['为何 Zig-zig 先转父亲？','同向三节点中，Splay 先把 p 转过 g，再把 x 转过 p；Zig-zag 则把 x 连续转过 p 和 g。若无论情况都连续把 x 转上去，就变成 move-to-root 启发式，树形与秩变化不同，不能直接复用本节访问引理。用三个节点加中间子树手算两种算法，比较哪些节点会下沉。'],
 ['增广：第 k 小、排名与区间查询','给节点维护 size=1+size(left)+size(right)，便可按左子树大小选择第 k 小或计算排名。AVL 的高度和 size 都应在旋转时先更新下降节点，再更新上升节点。Splay 本身不要求 size；为了顺序统计或隐式序列才额外维护。删除停止高度传播并不代表 size 可以停止更新：即使高度不变，沿途 size 仍少了 1。'],
 ['加权访问引理与静态最优性的入口','为每个键赋任意固定正权 w(v)，把 s(v) 改为子树权重和、r=log₂s，仍可用相同的局部秩分析，访问上界为 O(1+log(W/w(x)))。算法不需要知道这些分析权重。选择与访问频率相关的正权，可推导与最优静态 BST 相比的序列界；需要单独处理零频率与初始势能。本页交互演示只使用单位权重。'],
 ['局部性不等于高度平衡','热点访问使常用键逐渐靠近根；连续访问当前根只需常数工作。Splay 还有工作集、静态手指等更精细的序列性质，可从原论文继续学习。单条演示只能展示现象，不能证明任意访问序列都满足这些定理，也不能把一次 O(n) 访问误判为违背均摊界。'],
 ['Split、隐式 Splay 与区间操作','按键 Split 可先查找边界并 Splay，再断开根的一侧，明确返回的是 &lt;k 与 ≥k 还是 ≤k 与 >k。隐式 Splay 用子树 size 表示序列位置，借助两次定位隔离一个区间。若加入翻转、区间和等懒标记，必须在判断左右关系与旋转前自顶向下 push，在修改后自底向上 pull；不能照搬无标记模板。'],
 ['实现选择与工程代价','AVL 提供单次最坏 O(log n) 界，适合关心响应时间上界的场景；Splay 通过访问改树，适合利用局部性，但单次操作可能线性。Splay 的逻辑“读”会写结构，需考虑并发同步与迭代器失效。递归 Splay 或普通 BST 的栈深可能达 O(n)；父指针迭代版本可以避免深递归。']
 );
 c.quiz.push(
 ['为什么 AVL 删除分支中的 BF(left) < 0 不能写成 ≤ 0？','左重且左孩子 BF=0 时应单右旋。将条件写成 ≤0 会误选双旋，也会掩盖删除特有的高度不变情形。运行“重孩子 BF=0”案例，核对旋转前后真实高度。'],
 ['删除两个孩子的节点 20，复制后继 22 后，n1 还代表键 20 吗？','不再代表。n1 对象仍存活，其键成为 22；实际移除的是原后继节点。若节点还有 value，应按数据模型一并复制；若外部引用要求对象身份绑定键，应采用移植版本并相应更新父指针。'],
 ['AVL 高度未变就返回，为什么顺序统计 size 仍可能出错？','高度不变只允许停止高度平衡修复。祖先子树少了一个节点，size 仍必须一路更新。实现可始终回溯 pull 所有元数据，仅跳过不再需要的旋转判断。'],
 ['三节点链 1→2→3 与平衡树根 2 的势能分别多少？','链的子树大小为 3、2、1，所以 Φ=log₂3+1≈2.585；平衡树子树大小为 3、1、1，Φ=log₂3≈1.585。势能衡量一类可释放的结构成本，不等于树高。'],
 ['Zig-zag 的哪个集合关系带来 −2？','旋转后 p、g 的子树不相交，大小 a、b 满足 a+b≤s′(x)。ab≤((a+b)/2)²，取 log₂ 得 log₂a+log₂b≤2log₂(a+b)−2≤2r′(x)−2。'],
 ['一次访问的 ĉ 为负，真实运行时间是否为负？','否。ĉ=c+ΔΦ 是分析账目。若 −ΔΦ>c，结构释放的势能超过这次旋转成本，ĉ 就为负；真实旋转次数仍非负。序列等式会保留初始与最终势能。'],
 ['删掉 Splay 根后，为什么不能随便把 R 挂到 L 根的右侧？','L 根原来可能还有非空右子树，直接覆盖会丢节点。必须先把 max(L) 伸展到 L 根，从最大值性质推出右孩子为空，再挂接 R。'],
 ['从任意 n 节点初始树开始，只做一次访问，能直接断言 O(log n) 的实际时间吗？','不能。链的最深节点需要线性搜索与旋转。访问引理控制 c+ΔΦ；序列总成本的推导还需 Φ₀−Φₘ。这与 AVL 的单次最坏对数保证不同。']
 );
 c.refs.push(['MIT 6.851 · Splay trees 与加权访问引理','https://courses.csail.mit.edu/6.851/spring07/scribe/lec02.pdf']);
 c.implementation=[
 {title:'统一约定与旋转接口',text:'使用互异整数键的集合语义，空树高度 −1、叶子高度 0，BF=左高−右高。旋转函数返回局部新根，调用方必须接回返回值。以下 AVL 代码可直接作为 JavaScript 参考实现；演示中的逐步快照只是教学记录，不属于 O(log n) 算法本身。',code:`const height = t => t ? t.h : -1;
const balance = t => height(t.left) - height(t.right);
function pull(t) {
  t.h = 1 + Math.max(height(t.left), height(t.right));
  return t;
}
function rotateRight(t) {
  const y = t.left, middle = y.right;
  t.left = middle;
  y.right = t;
  pull(t);                 // 先下降的旧根
  return pull(y);           // 再上升的新根
}
function rotateLeft(t) {
  const y = t.right, middle = y.left;
  t.right = middle;
  y.left = t;
  pull(t);
  return pull(y);
}`},
 {title:'AVL 删除：可执行参考代码',text:'此版本始终递归回溯更新高度，写法比提前停止更简单，最坏仍为 O(log n)。动画额外显示“高度是否还下降”，用于理解何时可以停止平衡修复。若存储 size 等增广信息，将它并入 pull；不能因高度未变而漏更新。',code:`function rebalance(t) {
  pull(t);
  if (balance(t) > 1) {
    if (balance(t.left) < 0) t.left = rotateLeft(t.left);
    return rotateRight(t);  // 包括孩子 BF = 0
  }
  if (balance(t) < -1) {
    if (balance(t.right) > 0) t.right = rotateRight(t.right);
    return rotateLeft(t);
  }
  return t;
}
function eraseAVL(t, key) {
  if (!t) return null;
  if (key < t.key) t.left = eraseAVL(t.left, key);
  else if (key > t.key) t.right = eraseAVL(t.right, key);
  else {
    if (!t.left || !t.right) return t.left || t.right;
    let successor = t.right;
    while (successor.left) successor = successor.left;
    t.key = successor.key; // 有 value 时同步复制 value
    t.right = eraseAVL(t.right, successor.key);
  }
  return rebalance(t);
}
// 外层调用也要接回可能变化的根：
root = eraseAVL(root, key);`},
 {title:'AVL 删除分支速查',text:'先 pull 当前节点，再按 BF 分类。+2 / 左孩子≥0：单右旋；+2 / 左孩子<0：先左后右；−2 / 右孩子≤0：单左旋；−2 / 右孩子>0：先右后左。未失衡时也要比较新旧高度：由 ±1 变 0 常会继续下降，由 0 变 ±1 常停止。旋转后用实际新根的高度判断，不要依据旧根对象。'},
 {title:'父指针 Splay：一次旋转必须更新哪些连接',text:'下面是完整的 bottom-up 旋转与伸展参考实现，节点字段为 key、left、right、parent，根保存在 box.root。它不维护高度或 size；如需增广，旋转末尾先 pull(p) 再 pull(x)。若使用懒标记，先沿祖先路径 push，再判断方向。',code:`function rotateUp(box, x) {
  const p = x.parent, g = p.parent;
  const isLeft = p.left === x;
  const middle = isLeft ? x.right : x.left;
  if (isLeft) { p.left = middle; x.right = p; }
  else        { p.right = middle; x.left = p; }
  if (middle) middle.parent = p;
  p.parent = x;
  x.parent = g;
  if (!g) box.root = x;
  else if (g.left === p) g.left = x;
  else g.right = x;
}
function splay(box, x) {
  while (x.parent) {
    const p = x.parent, g = p.parent;
    if (!g) rotateUp(box, x);               // Zig
    else if ((g.left === p) === (p.left === x)) {
      rotateUp(box, p); rotateUp(box, x);   // Zig-zig
    } else {
      rotateUp(box, x); rotateUp(box, x);   // Zig-zag
    }
  }
}`},
 {title:'Splay 删除：查找、拆树与 Join',text:'找到键或最后访问节点后都伸展。先保存左右子树引用，断开 parent，释放旧根，再在 L 内伸展最大节点。JavaScript 由垃圾回收释放对象；C++ 中应在保存引用并断开拥有关系后按所有权策略销毁，不能继续读取已释放节点。',code:`function eraseSplay(box, key) {
  let t = box.root, last = null;
  while (t) {
    last = t;
    if (t.key === key) break;
    t = key < t.key ? t.left : t.right;
  }
  if (!last) return false;
  splay(box, last);
  if (box.root.key !== key) return false;
  const old = box.root, L = old.left, R = old.right;
  if (L) L.parent = null;
  if (R) R.parent = null;
  old.left = old.right = old.parent = null;
  box.root = L;
  if (!L) { box.root = R; return true; }
  let x = L;
  while (x.right) x = x.right;
  splay(box, x);       // 只在 L 中调整
  box.root.right = R;  // max(L) 的右孩子必为空
  if (R) R.parent = box.root;
  return true;        // 有 size 时此处 pull(box.root)
}`},
 {title:'边界与调试顺序',text:'先检查空树、删除不存在的键、删除根、只有一个孩子、双孩子后继带右孩子，再检查 AVL 的四类修复与重孩子 BF=0。每次完整操作后验证中序严格递增、键集合正确；AVL 还验证缓存高度与 |BF|≤1，父指针 Splay 还验证 root.parent=null 和孩子反向引用一致。中间动画可能暂时有旧高度或后继副本，应把局部暂态与完成边界的不变量区分开。'}
 ];
}
