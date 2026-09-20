// Course slides ADS02BTree_Stu, pp.4–7; CLRS 3e, §13.3–13.4.
export const caseLabel=(id)=>({I1:'插入 Case 1',I2:'插入 Case 2',I3:'插入 Case 3',D1:'删除 Case 1',D2:'删除 Case 2',D21:'删除 Case 2.1',D22:'删除 Case 2.2',D3:'删除 Case 3',D4:'删除 Case 4','I-root':'插入边界：根染黑','D-root':'删除边界：到根','D-absorb':'删除边界：红 X 吸收'}[id]||id);
export const caseAlignment=`<h2>与课件、课本的 Case 对齐</h2><p>依据 <b>ADS02BTree_Stu.ppt 第 4–7 页</b>，以及课件第 13 页指定的 <i>Introduction to Algorithms, 3rd ed.</i> 第 13 章：插入 §13.3（纸质页 319–321，图 13.5–13.6），删除 §13.4（327–330，图 13.7）。I1–I3 / D1–D4 只作为本网站的内部简称，数字分别与教材的插入/删除 Case 一致。</p><p><b>共同前提不能漏：</b>进入插入 Case 时，当前 X 和父 P 都红、祖父 G 黑。进入删除 Case 时，X 是非根、实际为黑并携带虚拟 +1。NIL 是黑色叶子。教材插入用 z、叔用 y；删除用 x、兄弟用 w。本页分别对应 X、U 和 X、S；P/G/N/F 表示父、祖父、近侄、远侄。</p><div class="rb-scroll"><table><thead><tr><th>课件 / 教材</th><th>本页简称</th><th>精确条件（加上共同前提）</th><th>处理后的去向</th></tr></thead><tbody><tr><td>插入 Case 1</td><td>I1</td><td>U 红；X 为左/右孩子均可</td><td>X←G，再检查根与父色</td></tr><tr><td>插入 Case 2</td><td>I2</td><td>U 黑，X/P/G 为折线</td><td>转 P、重新命名，必接 Case 3</td></tr><tr><td>插入 Case 3</td><td>I3</td><td>U 黑，X/P/G 为直线</td><td>换色转 G，结束</td></tr><tr><td>删除 Case 1</td><td>D1</td><td>S 红（因此 P 黑）</td><td>换黑兄；接 Case 2.1、3 或 4</td></tr><tr><td>删除 Case 2</td><td>D2</td><td>S 黑，N 黑，F 黑</td><td>兄染红，X←P；按旧 P 的颜色细分</td></tr><tr><td>课件 Case 2.1</td><td>D2，父红分支</td><td>Case 2 且旧 P 红</td><td>新 X 为红，染黑吸收，结束</td></tr><tr><td>课件 Case 2.2</td><td>D2，父黑分支</td><td>Case 2 且旧 P 黑</td><td>亏欠上移；到根终止，否则重新分类</td></tr><tr><td>删除 Case 3</td><td>D3</td><td>S 黑，N 红，F 黑</td><td>转 S，必接 Case 4</td></tr><tr><td>删除 Case 4</td><td>D4</td><td>S 黑，F 红；N 任意色</td><td>换色转 P，消除 +1 并结束</td></tr></tbody></table></div><p><b>Case 2.1 / 2.2 是课件第 7 页对教材 Case 2 的教学细分。</b>CLRS 的伪代码统一执行 S→红、X←P，再由循环条件和最后的染黑语句区分两种结果。父红的 Case 2.1 与“一开始替代孩子就是红色”的边界情形最终都染黑，但进入路径不同。</p><p>教材只写出一个方向：插入假定 P 在 G 左侧，所以 Case 2 的 X 是右孩子、Case 3 的 X 是左孩子；删除假定 X 在 P 左侧，所以 N=S.left、F=S.right。镜像时所有左右交换，Case 编号不变。图中白心/问号节点表示颜色不限，不能解释成额外一种颜色。</p><p>课件定义 bh(x) <b>不含 x、包含终点 NIL</b>；本动画路径表使用“含起点的黑数”以显示守恒。合法非 NIL 节点有 count(x)=bh(x)+[x 为黑]，NIL 的 bh=0，而从 NIL 自身开始的含端点计数为 1。修复中实际黑高可能暂时不一致，应先补记 X 的 +1 再比较。课件高度上界须读作 2 log₂(n+1)，精确系数 2 不能直接配自然对数 ln。</p><p>以下图只描述经典 <b>bottom-up</b> 修复。Top-down 提前分裂也使用相同局部变换，但控制流程另见插入对比页，不能直接套入这张状态机。</p>`;
export const transitionModels={
 insert:{width:1240,height:1090,title:'插入 Case 状态转移（课件 p.4 / CLRS §13.3）',nodes:[
 ['I-start',430,55,370,75,'BST 插入红叶 X',['重复键直接返回']],
 ['I-check',430,190,370,105,'循环入口：检查 X 与父 P',['X 为根 → 染黑；P 黑 → 完成','否则 X、P 红，G 黑，按叔色和形状分类']],
 ['I-stop',920,190,285,100,'退出修复',['保证根黑，插入完成']],
 ['I1',30,440,330,145,'插入 Case 1 · 叔红',['P、U→黑；G→红；X←G','不旋转；回到循环入口','X 左右位置不限']],
 ['I2',430,440,370,145,'插入 Case 2 · 叔黑折线',['转 P，使原 X 上升；不变色','令 X=原 P，再取新 P/G','只转换形状，红红尚未消失']],
 ['I3',860,670,345,145,'插入 Case 3 · 叔黑直线',['P→黑；G→红；转 G，使 P 上升','局部冲突消失，不再向上修复']],
 ['I-end',430,935,370,80,'保证根黑，完成',['Case 2 → Case 3 合计两次旋转']]],edges:[
 ['I-start','I-check','M615 130V190','进入',635,163],
 ['I-check','I-stop','M800 225H920','根 / 父黑',810,210],
 ['I-check','I1','M480 295V365H195V440','U 红',275,350],
 ['I-check','I2','M615 295V440','U 黑，折线',630,382],
 ['I-check','I3','M760 295V330H1035V670','U 黑，直线',1050,570],
 ['I1','I-check','M195 585V625H12V235H430','X 上移两层后重新判断',30,218],
 ['I2','I3','M615 585V745H860','必接 Case 3',680,730],
 ['I3','I-end','M1035 815V975H800','结束',1050,900]]},
 delete:{width:1240,height:1430,title:'删除 Case 状态转移（课件 pp.5–7 / CLRS §13.4）',nodes:[
 ['D-start',430,55,370,85,'摘除 Y，用 X 替代',['检查 Y 的原颜色（不是目标键的颜色）']],
 ['D-check',430,205,370,105,'Y 黑：X 携带虚拟 +1',['X 是根：去掉 +1，保证根黑','X 红：染黑吸收；其余进入 Case']],
 ['D-stop',940,205,265,105,'边界处理后完成',['Y 红：无需修复','根 / 红 X：终止']],
 ['D1',30,365,330,140,'删除 Case 1 · S 红',['S→黑；P→红；转 P 让 S 上升','X 不动、+1 保留；重新取 S/N/F','此后若双侄黑，只能是 Case 2.1']],
 ['D-black',430,455,370,80,'S 黑：检查 N、F',['N/F 是相对 X 的近/远侄']],
 ['D2',430,655,370,120,'删除 Case 2 · N、F 都黑',['S→红；X←旧 P，亏欠上移','再按旧 P 的颜色细分（不旋转）']],
 ['D3',30,655,330,145,'删除 Case 3 · N 红、F 黑',['N→黑；S→红；转 S 让 N 上升','X 不动、+1 保留；重新取 S/N/F','新 S 黑、新 F 红，必接 Case 4']],
 ['D4',30,930,330,145,'删除 Case 4 · F 红',['S 继承 P 原色；P、F→黑','转 P，让 S 上升；去掉 X 的 +1','N 可以红，也可以黑']],
 ['D21',430,930,370,145,'课件 Case 2.1 · 旧 P 红',['新 X 红且带 +1 → 染黑吸收','结束；不再执行另一个 Case','对应教材 Case 2 + 循环外染黑']],
 ['D22',860,930,330,145,'课件 Case 2.2 · 旧 P 黑',['新 X 黑且带 +1，回到入口','到根终止；否则重新取亲属','只有这条分支可能继续向上']],
 ['D-end',430,1240,370,95,'亏欠消除，删除完成',['最多 Case 1 → Case 3 → Case 4 三旋']]],edges:[
 ['D-start','D-check','M615 140V205','Y 黑',630,178],
 ['D-start','D-stop','M800 98H880V235H940','Y 红',815,83],
 ['D-check','D-stop','M800 275H940','根 / 红 X',825,297],
 ['D-check','D1','M430 255H195V365','非根黑 X，S 红',40,335],
 ['D-check','D-black','M615 310V455','非根黑 X，S 黑',630,389],
 ['D1','D-black','M360 490H430','新 S 黑',365,474],
 ['D-black','D2','M615 535V655','N、F 都黑',630,607],
 ['D-black','D3','M430 515H195V655','N 红、F 黑',205,608],
 ['D-black','D4','M430 485H385V1000H360','F 红',389,860],
 ['D3','D4','M195 800V930','必接 Case 4',208,875],
 ['D2','D21','M615 775V930','旧 P 红',630,861],
 ['D2','D22','M800 715H1025V930','旧 P 黑',1040,862],
 ['D22','D-check','M1190 1000H1225V340H835V245H800','重新判断新 X',960,325],
 ['D21','D-end','M615 1075V1240','染黑吸收',630,1165],
 ['D4','D-end','M195 1075V1285H430','消除 +1',210,1267]]}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function transitionSVG(kind,active=null){const m=transitionModels[kind];return `<svg xmlns="http://www.w3.org/2000/svg" class="rb-transition-svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}" role="img" aria-label="${m.title}"><title>${m.title}</title><desc>有向箭头标注判断条件。金色标记当前动画处理的 Case；点击 Case 打开对应案例。</desc><defs><marker id="arrow-${kind}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#66806c"/></marker></defs><rect width="100%" height="100%" fill="#fafbf8"/><g font-family="Microsoft YaHei,sans-serif"><text x="30" y="30" font-size="20" font-weight="bold" fill="#294c3b">${m.title}</text>${m.edges.map(([a,b,path,label,x,y])=>`<g data-transition="${a}:${b}"><path d="${path}" fill="none" stroke="#66806c" stroke-width="2" marker-end="url(#arrow-${kind})"/><text x="${x}" y="${y}" font-size="14" fill="#526953" stroke="#fafbf8" stroke-width="5" paint-order="stroke">${label}</text></g>`).join('')}${m.nodes.map(([id,x,y,w,h,title,lines])=>`<g data-transition-node="${id}" ${/^[ID]\d+$/.test(id)?`data-rb-case="${id}" role="button" tabindex="0" aria-label="${title}，打开对应动画"`:''}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${id===active?'#fff0c8':id.includes('end')||id.includes('stop')?'#e7efde':'#fff'}" stroke="${id===active?'#b87d17':'#b8cbbb'}" stroke-width="${id===active?4:1.5}"/><text x="${x+15}" y="${y+29}" font-size="18" font-weight="bold" fill="#264837">${title}</text>${lines.map((l,i)=>`<text x="${x+15}" y="${y+56+i*25}" font-size="14" fill="#526458">${esc(l)}</text>`).join('')}</g>`).join('')}<text x="30" y="${m.height-30}" font-size="15" fill="#6c775c">左右镜像共用 Case 编号。箭头表示控制流；一个操作可以依次执行多个 Case。</text></g></svg>`}
