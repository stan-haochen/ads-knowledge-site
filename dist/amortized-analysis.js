const sections = [
  ['aggregate', '（1）聚合法'], ['accounting', '（2）记账法'], ['potential', '（3）势能法'],
  ['multipop', 'a）MultiPop模型'], ['mtf', 'b）Move-To-Front'], ['splay', 'c）splay树'],
  ['references', 'Reference']
];

export function mountAmortizedAnalysis() {
  const controller = new AbortController();
  const main = document.querySelector('#main');
  document.title = '摊还分析 · 第一课 · ADS 算法研习室';
  document.querySelector('#breadcrumb').textContent = '第一课 / 摊还分析';
  document.querySelectorAll('[data-chapter]').forEach(link => link.classList.toggle('active', link.dataset.chapter === 'avl'));
  main.innerHTML = `<div class="aa-page">
    <div class="eyebrow">CHAPTER 01 / READING NOTE</div>
    <div class="aa-actions"><a href="#avl">← 返回第一课</a><a href="articles/amortized-analysis/index.md" download="摊还分析.md">下载 Markdown ↓</a></div>
    <div class="aa-layout">
      <article class="aa-article" aria-labelledby="aa-title" aria-busy="true"><p role="status">正在加载摊还分析…</p></article>
      <aside class="aa-contents" aria-label="本文目录"><h2>本文目录</h2>
        <div class="aa-toc">${sections.map(([id, label]) => `<button type="button" data-aa-jump="${id}">${label}</button>`).join('')}</div>
        <div class="aa-related"><h2>配合实验阅读</h2><a href="#avl/stack">MultiPop 势能实验 ↗</a><a href="#avl/splay-potential">Splay 势能动画 ↗</a><a href="#avl/splay-proof">Splay 完整证明 ↗</a></div>
      </aside>
    </div>
    <div class="aa-bottom"><button type="button" data-aa-jump="title">回到文章开头 ↑</button><a href="#avl/splay-potential">继续观察 Splay 势能动画 →</a></div>
  </div>`;
  const article = main.querySelector('.aa-article');
  main.querySelectorAll('[data-aa-jump]').forEach(button => {
    button.onclick = () => {
      const target = main.querySelector(`#aa-${button.dataset.aaJump}`);
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
  });
  fetch(new URL('./articles/amortized-analysis/article.html', import.meta.url), {signal: controller.signal})
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      if (controller.signal.aborted) return;
      article.innerHTML = html;
      article.setAttribute('aria-busy', 'false');
    })
    .catch(error => {
      if (error.name === 'AbortError') return;
      article.setAttribute('aria-busy', 'false');
      article.innerHTML = '<h1 id="aa-title">摊还分析</h1><p role="alert">文章加载失败，请刷新重试，或下载 Markdown 阅读。</p>';
    });
  return () => controller.abort();
}
