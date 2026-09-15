# ADS 算法研习室

根据 `Materials/Student Slides` 中 16 份 PPT（285 页）建立的中文课程知识网站，包含 15 个专题章节、32 个动态实验、42 个分步骤证明、53 道带解答练习。原始课件保持不变。

## 打开网站

在本目录运行：

```powershell
node server.mjs
```

然后访问 <http://127.0.0.1:8765>。也可使用 `npm start`，无需安装依赖。若端口已被占用，可在 PowerShell 中设置 `$env:ADS_PORT = '8766'` 后启动。服务器默认只监听本机。

网站使用浏览器 ES modules，不能用双击 HTML 的 `file://` 方式替代 HTTP 服务。所有讲义、演示与样式均为本地静态文件，没有运行时外部依赖；外部参考文献链接需要联网。

## 网站内容

| 章节 | 动态实验 |
|---|---|
| AVL、Splay、摊还分析 | AVL 插入/删除/查找及四类旋转；Splay 插入/访问/删除；MultiPop 势能 |
| 红黑树与 B+ 树 | 红黑树插入修复/查找；M=4 的 B+ 树插入分裂/查找 |
| 倒排索引 | 已排序 postings 的精确 AND 交集 |
| 左式堆与斜堆 | 分别建堆、合并、一次 deleteMin |
| 二项队列 | 插入、同阶树链接与进位 |
| 回溯与博弈 | N 皇后；Turnpike 距离多重集重构；Minimax 与 α–β |
| 分治 | 归并排序；二维最近点对 |
| 动态规划 | 矩阵链；Floyd–Warshall（含负环）；0/1 背包 |
| 贪心 | 无权活动选择；Huffman 编码 |
| NP 完全性 | Hamilton 圈到 TSP 判定的归约和小规模验证 |
| 近似算法 | NF/FF/FFD 装箱；最远点 k-center |
| 局部搜索 | 正权 Max-Cut 单顶点翻转及全局最优对照 |
| 随机算法 | 固定种子三路快排；随机雇佣 |
| 并行算法 | 树形归约；Blelloch 前缀和 |
| 外部排序 | k 路归并；替换选择 |

每个实验支持自定义输入、自动播放/暂停、速度选择、逐步前进/后退、进度条跳转与重置。当前会话内保留输入和回放位置，刷新后重置；没有跨设备的学习进度存储。

第一章另有“实现细节”页，包含可执行的 AVL 删除和父指针 Splay 参考实现。每章分为“知识与实验”“推导与证明”“扩展与辨析”“思考与练习”。`#overview` 是课程总览，`#sources` 包含原课件映射、勘误和外部参考资料。每章可通过 URL fragment 直接打开，如 `#dp`、`#external`。

## 第一章的详细教学实验

第一章当前包含 6 个实验、9 组核心知识、8 个证明、9 组扩展、11 道练习和 6 节实现细节。新增三个独立实验，保留原有 AVL/Splay 综合操作与 MultiPop 实验。

- [AVL 删除详解](http://127.0.0.1:8765/#avl/avl-delete)：6 个预设，包含后继复制与对象身份、叶/单孩子/空树、重孩子 BF=0、LR/RL 双旋，以及下层 LR 后祖先 LL 的连续修复案例。显示调用栈、指针、高度缓存与传播判断。
- [Splay 删除详解](http://127.0.0.1:8765/#avl/splay-delete)：5 个预设，包含两阶段伸展、分离 L/R、伸展 max(L)、挂接 R、L 为空、失败删除及删到空树。拆树过程中同时呈现两棵子树。
- [Splay 均摊证明可视化](http://127.0.0.1:8765/#avl/splay-potential)：5 个预设，逐轮对照旋转前后，显示子树大小、秩、势能差、真实旋转成本与均摊成本；彩色节点集合解释对数不等式，按完整访问结算序列账本。
- [实现细节](http://127.0.0.1:8765/#avl/implementation)：旋转返回新根、缓存更新次序、父指针重连、失败查找约定、删除与 Join 代码，以及 size 增广和懒标记的注意点。

新实验输入统一为 `初始插入序列 | 操作序列`，最多 18 个互异初始键、24 个操作键。AVL 初始序列按 AVL 插入建树；Splay 初始序列按普通 BST 插入建树，形态由输入决定。势能实验固定键集合，只接受成功访问。支持预设选择、关键步骤跳转、原始字号/适应画布和稳定节点移动；系统选择减少动态效果时禁用过渡。

势能实验以旋转次数计 c，实际访问成本为 O(c+1)，双旋中间状态不单独套用整轮上界。任意初始树的势能 Φ₀ 明确保留。Splay 删除的拆树/挂接势能分析、加权访问引理入口、顺序统计、Split/隐式 Splay、并发与迭代器影响在讲义中扩展。

新增浏览器检查：启动网站后运行 `node tests/lesson-browser.mjs`。当前已验证全部 16 个预设和 84 个关键教学状态，覆盖逐节点秩表、代码高亮、关键步骤跳转、双树显示、输入纠错、缩放和手机页面无水平溢出。自动化测试另对随机序列检查 AVL 高度与平衡、Splay 森林节点守恒、访问引理局部不等式、两层望远镜求和，并直接执行页面中的参考代码核对父指针。

## 完整课程知识地图

入口：[课程地图](https://stan-haochen.github.io/ads-knowledge-site/#mindmap)。左侧导航、课程总览与各章标题区都提供入口。

- 四条主线、15 个专题，每章给出内容范围、3 个关键问题、挑战、证明方法、掌握标准、成本前提与现有实验链接。
- 五种视图：总览脑图、完整纲要、跨章联系、开放问题与前沿、应用案例。
- 18 条标明关系类型的跨章联系，3 条建议学习路线，4 组共同基础。
- 11 个研究条目，区分开放问题、条件性假设、研究方向与已突破的历史障碍；每项提供已知进展、剩余问题、课程衔接、入门任务和来源。研究状态核查截至 **2026-09-15**，不自动联网刷新。
- 9 个跨章应用案例，明确区分真实产品/论文机制与教学建模。
- 可搜索、按主线筛选、切换节点视角、折叠和缩放。脑图可导出 SVG，完整知识地图可导出 Markdown；导出不受当前筛选影响。手机可在画布内滑动，也可使用完整纲要视图。

深链接示例：`#mindmap/avl`、`#mindmap/research`、`#mindmap/cases`、`#mindmap/connections`、`#mindmap/outline`。

维护数据位于 `dist/course-map-data.js`；交互及导出逻辑为 `dist/course-map.js`，样式为 `dist/course-map.css`。研究数据需要人工核查并更新日期，不应把某个新预印本的声明直接写成已被学界接受的通用定论，也不应把工程研究议题写成尚未解决的经典算法问题。

`npm test` 包括地图的课程覆盖、交叉链接、研究状态元数据和导出完整性检查。`node tests/course-map-browser.mjs` 检查 15 章选择、键盘操作、缩放/折叠、搜索、研究状态筛选、导出文件、课程实验链接和五种手机视图；同样支持 `ADS_BASE_URL`。

## 科学性与演示边界

- 按原课件页码建立主题映射，证明逐步说明基例、不变量、归纳/交换/势能论证和适用条件。
- 区分最坏、摊还和期望复杂度；区分 CPU、I/O、Work/Depth；区分近似保证、体积下界和穷举最优。
- 修正或澄清 AVL Fibonacci 下标、红黑高度的对数底、B+ 扇出与 I/O 模型、背包舍入方向、NP/coNP 的未决关系等。
- 图形直接来自算法计算的状态快照，并非预先写好的动画。
- 为清楚呈现状态，演示可能采用重算高度、排序数组表示优先队列、线性扫描各 run 表头等直观实现；讲义中的最优复杂度针对明确注明的标准算法实现，不包含可视化快照和绘图开销。
- 红黑树与 B+ 树的删除、二项队列的 deleteMin、最优 BST、装配线、Skip list 等在讲义中讨论，尚未提供对应的独立操作实验。网站没有声称课件中的每个扩展项目都有完整实现。
- 输入规模经过限制，适合课堂逐步讲解；并行算法展示依赖层，并未实际启动浏览器多线程；外排模拟不操作磁盘文件。
- 检索实验针对两条已构建倒排表，不提供真实文档库搜索服务。没有账号、服务端数据库或学生成绩数据。

## 文件结构

```text
dist/
  index.html          页面入口、元数据、自定义图标
  style.css           响应式样式，本地字体回退
  content.js          15 章讲义（含第一章扩充），共 42 个证明、53 道练习
  engine.js           32 个实验的注册、纯计算与输入校验
  renderers.js        树、图、棋盘、数组、矩阵等 SVG/HTML 渲染
  app.js              章节路由、播放器、交互状态与可选 WebMCP
  lesson-one.js       AVL/Splay 详细删除、Splay 势能分析追踪
  lesson-one-view.js  稳定节点树图、指针/秩账本、局部推导、序列图
  lesson-one-content.js 第一章扩展讲义与可执行参考代码
  lesson-one.css      第一章布局与教学视图样式
  source-map.json     原课件文件、页数与 SHA-256
tests/
  algorithms.test.mjs 自动化正确性与边界检查
  browser-check.mjs   全站浏览器交互检查
  lesson-one.test.mjs 第一章算法、证明不等式及页面参考代码执行验证
  lesson-browser.mjs  新增案例、深链接、关键帧与移动端验证
server.mjs            无依赖本地 HTTP 服务
Start-ADS.ps1         PowerShell 启动入口
```

## 维护内容

`content.js` 的 `chapters` 是课程内容数据。章节中的 `demos` 指向 `engine.js` 注册的实验名称。新增算法时，先实现输入解析和返回快照的纯函数，再在 `demos` 中注册，最后添加到章节。

讲义说明文字允许少量 HTML 标记；请将其视为可信的作者内容，不要直接写入来自不可信用户的 HTML。用户的算法输入则严格解析并转义后展示。

## 验证

```powershell
npm test
```

37 组测试已通过，覆盖所有默认实验、随机序列上的 AVL/Splay/红黑/B+ 不变量、排序与最近点对参考对照、DP 最优值、负环传播、近似保证、外排守恒等。浏览器检查覆盖 15 章、32 个实验、播放器、错误输入、参考页以及桌面 1440×1080 / 手机 390×844 布局，无页面 JavaScript 异常。

运行可选浏览器检查需要 Playwright 和 Chrome：启动网站后运行 `node tests/browser-check.mjs`。测试文件优先寻找项目可用的 Playwright，其次使用当前 Codex 环境的 bundled 路径；在其他电脑上请安装自己的 Playwright 或修改该后备路径。页面无需 Playwright 才能使用。

网站在支持 `document.modelContext` 的浏览器中注册三个可选 WebMCP 工具：读取实验状态、运行实验、跳转步骤。不支持该提案的浏览器照常使用页面。已验证注册适配器与可见状态更新；当前浏览器没有可用的原生 WebMCP 上下文，因此未声明原生端到端兼容性。

## GitHub Pages 发布

仓库：[stan-haochen/ads-knowledge-site](https://github.com/stan-haochen/ads-knowledge-site)。网站配置地址为 https://stan-haochen.github.io/ads-knowledge-site/ 。首次启用 Pages 并完成部署后即可公开访问。

`.github/workflows/pages.yml` 在每次推送 `main` 后先执行 `npm test`，通过后把 `dist` 发布到 GitHub Pages；测试失败不会更新网站。Pull Request 只运行测试。工作流也支持 Actions 页面手动运行。部署仅使用 GitHub 自动提供的短期 `GITHUB_TOKEN`，无需把个人 Token 放入仓库。

首次设置：在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。随后查看 [发布流程](https://github.com/stan-haochen/ads-knowledge-site/actions/workflows/pages.yml) 的执行结果。网站资源和 ES module 使用相对路径，支持 `/ads-knowledge-site/` 项目路径与原有章节深链接。

以后修改网页内容后，可以运行：

```powershell
.\Publish-ADS.ps1 -Message "补充课程内容"
```

该脚本验证分支与目标仓库、运行算法测试、检查远端是否有未合入变更，然后提交网站相关文件并推送。已有暂存内容时会要求先处理，避免顺带提交其他工作。它不会强制推送，也不代表云端部署一定完成；最终结果以 Actions 为准。

也可以自行执行 `npm test`，审阅并提交本次变更，然后 `git push origin main`。本项目的 AGENTS.md 已记录用户要求：完成网页更新后测试、提交、推送，并检查部署结果。

本地文件保存本身不会触发 GitHub Actions；完成提交并推送才会发布。这使未完成的课堂内容和中间修改不会直接成为线上版本。

浏览器检查支持线上地址：

```powershell
$env:ADS_BASE_URL = 'https://stan-haochen.github.io/ads-knowledge-site/'
node tests/browser-check.mjs
node tests/lesson-browser.mjs
```

网页运行无需 Node 或本地服务器；Node 仅用于本地开发与 CI 测试。`Materials/Student Slides` 原始课件及本地检查截图不属于 Pages 发布产物。


## Splay 所有基本操作的证明专题

入口 `#avl/splay-proof`，第一课各内容标签与学习路径均可进入。13 个部分覆盖成本模型、带权三种旋转、访问引理、两层望远镜求和、成功/失败查找、Split、Join、两种插入、删除、边界查询、顺序统计、区间操作、批量操作边界，以及保留初始化项的带权推论。

两个实验分别提供可修改权重的旋转前后图（含镜像、不相交集合与 SVG 导出）和 15 类操作的阶段回放（含整个森林、节点 size/rank、势能账本、原始字号）。页面支持下载完整证明 Markdown。懒标记增广提供适用条件与证明，未宣称已实现懒更新动画。动画的快照/绘图成本不纳入理想数据结构成本；账本的 c 只计旋转，正文说明如何换算真实时间。

`npm test` 中新增的测试核对 4,800 组带权旋转、随机操作的排序集合参考结果、每个快照的 BST/size/森林不变量、结构变化的精确势能及望远镜等式。`node tests/splay-proof-browser.mjs` 验证 15 类操作、导出、回放、错误输入、路由清理和桌面/手机布局，也支持 `ADS_BASE_URL` 检查线上页面。
