(() => {
  const guide = document.querySelector('.lotusie-guide');
  if (!guide) return;

  const toggle = guide.querySelector('.guide-toggle');
  const stepLabel = guide.querySelector('#guide-step');
  const guideText = guide.querySelector('#guide-text');
  const progress = guide.querySelector('.guide-progress i');
  if (!toggle || !stepLabel || !guideText || !progress) return;

  const chapterData = [
    ['.hero', 'WELCOME · 欢迎', '你好，我是 Lotusie！让我陪你一起认识 MacauGo。'],
    ['#idea', '01 · 项目理念', '沉浸故事、现实探索，再加上懂你的 AI，三种能量合成 MacauGo！'],
    ['#why', '02 · 现实痛点', '攻略很分散，体验也容易千篇一律。我们想让旅行真正贴近每个人。'],
    ['#experience', '03 · 产品体验', '告诉我时间、预算和兴趣，我会规划路线，并在现场为你解锁任务。'],
    ['#city', 'CITY · 城市内容', '地标、街区、美食和演出，都能成为一段可以参与的澳门故事。'],
    ['#journey', '04 · 使用流程', '创建计划、跟随地图、完成挑战，最后收藏属于你的澳门记忆。'],
    ['#maker', '05 · 关于团队', 'MacauGo 把 AI 技术与澳门文旅实践连接起来，让创意真正落地。'],
    ['#goals', '06 · 参赛目标', '我们会先完成可体验的核心 Demo，再逐步进入真实旅游服务场景。'],
    ['#final', 'FINAL · 出发', '探索澳门，乐在旅程。准备好和我一起出发了吗？']
  ];

  const chapters = chapterData
    .map(([selector, step, text]) => ({ element: document.querySelector(selector), step, text }))
    .filter(({ element }) => element);

  let activeIndex = -1;
  let animationTimer;

  const showChapter = (index, animate = true) => {
    const chapter = chapters[index];
    if (!chapter || index === activeIndex) return;

    activeIndex = index;
    stepLabel.textContent = chapter.step;
    guideText.textContent = chapter.text;
    progress.style.transform = `scaleX(${(index + 1) / chapters.length})`;

    if (!animate || guide.classList.contains('is-collapsed')) return;
    window.clearTimeout(animationTimer);
    guide.classList.remove('is-changing');
    requestAnimationFrame(() => {
      guide.classList.add('is-changing');
      animationTimer = window.setTimeout(() => guide.classList.remove('is-changing'), 650);
    });
  };

  const findClosestChapter = () => {
    const focusLine = window.innerHeight * 0.5;
    let closestIndex = 0;
    let closestDistance = Infinity;

    chapters.forEach(({ element }, index) => {
      const rect = element.getBoundingClientRect();
      const distance = rect.top <= focusLine && rect.bottom >= focusLine
        ? 0
        : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(() => {
      showChapter(findClosestChapter());
    }, { rootMargin: '-44% 0px -44% 0px', threshold: 0 });
    chapters.forEach(({ element }) => observer.observe(element));
  } else {
    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        showChapter(findClosestChapter());
        scheduled = false;
      });
    }, { passive: true });
  }

  const setCollapsed = (collapsed) => {
    guide.classList.toggle('is-collapsed', collapsed);
    toggle.textContent = collapsed ? '+' : '×';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? '展开 Lotusie 导览' : '收起 Lotusie 导览');
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCollapsed(!guide.classList.contains('is-collapsed'));
  });

  showChapter(findClosestChapter(), false);
})();
