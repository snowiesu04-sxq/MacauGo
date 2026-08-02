(() => {
  const switcher = document.querySelector('.language-switch');
  if (!switcher) return;

  // Phrase replacements run before the character map so contextual forms stay natural.
  const traditionalPhrases = new Map([
    ['大数据', '大數據'],
    ['数据科学', '數據科學'],
    ['信息', '資訊'],
    ['社交媒体', '社交媒體'],
    ['里面', '裡面'],
    ['发起人', '發起人'],
    ['复旦', '復旦'],
    ['头发', '頭髮'],
    ['理发', '理髮'],
    ['皇后', '皇后'],
    ['之后', '之後'],
    ['然后', '然後'],
    ['背后', '背後']
  ]);
  const simplifiedChars = '与专业个丰为么乐争于产亲们优会传体侣伙关兴内决准划创别务动区却历参发变叙后台启团园围国图场墙处备复头奖妈学实对导将届属币带并庆应开忆态惊愿戏战户扩拟换据数无旧时术机条来构标档桥欢气浅游湾滨灵点烟热独现码离种积筑级线组织绍经绕统继综网脚节苏荐获蓝虚见观规览觉触计认让记设访证识诉语调贴赛践转轮输达过还进连适锁锚长门问闲间阁队阳际险随隐页项顺预领题风饮驱验简';
  const traditionalChars = '與專業個豐為麼樂爭於產親們優會傳體侶夥關興內決準劃創別務動區卻歷參發變敘後臺啟團園圍國圖場牆處備複頭獎媽學實對導將屆屬幣帶並慶應開憶態驚願戲戰戶擴擬換據數無舊時術機條來構標檔橋歡氣淺遊灣濱靈點煙熱獨現碼離種積築級線組織紹經繞統繼綜網腳節蘇薦獲藍虛見觀規覽覺觸計認讓記設訪證識訴語調貼賽踐轉輪輸達過還進連適鎖錨長門問閒間閣隊陽際險隨隱頁項順預領題風飲驅驗簡';
  const characterMap = new Map([...simplifiedChars].map((character, index) => [character, traditionalChars[index]]));
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const translatedAttributes = ['aria-label', 'alt', 'title', 'placeholder', 'content'];

  const toTraditional = (value) => {
    let result = value;
    traditionalPhrases.forEach((replacement, phrase) => {
      result = result.split(phrase).join(replacement);
    });
    return [...result].map((character) => characterMap.get(character) || character).join('');
  };

  const rememberPageContent = () => {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script, style')) continue;
      originalText.set(node, node.nodeValue);
    }
    document.querySelectorAll('*').forEach((element) => {
      const values = {};
      translatedAttributes.forEach((attribute) => {
        if (element.hasAttribute(attribute)) values[attribute] = element.getAttribute(attribute);
      });
      if (Object.keys(values).length) originalAttributes.set(element, values);
    });
  };

  const translate = (value) => document.documentElement.dataset.language === 'traditional'
    ? toTraditional(value)
    : value;

  const setLanguage = (language) => {
    const traditional = language === 'traditional';
    document.documentElement.dataset.language = language;
    document.documentElement.lang = traditional ? 'zh-Hant' : 'zh-CN';

    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const source = originalText.get(node);
      if (source !== undefined) node.nodeValue = traditional ? toTraditional(source) : source;
    }
    document.querySelectorAll('*').forEach((element) => {
      const values = originalAttributes.get(element);
      if (!values) return;
      Object.entries(values).forEach(([attribute, source]) => {
        element.setAttribute(attribute, traditional ? toTraditional(source) : source);
      });
    });
    switcher.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    window.dispatchEvent(new CustomEvent('macaugo:languagechange', { detail: { language } }));
  };

  rememberPageContent();
  window.macauGoLanguage = { translate, setLanguage };
  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if (button) setLanguage(button.dataset.language);
  });
  setLanguage('simplified');
})();

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
    const translate = window.macauGoLanguage?.translate || ((value) => value);
    stepLabel.textContent = translate(chapter.step);
    guideText.textContent = translate(chapter.text);
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
    const label = collapsed ? '展开 Lotusie 导览' : '收起 Lotusie 导览';
    toggle.setAttribute('aria-label', window.macauGoLanguage?.translate(label) || label);
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCollapsed(!guide.classList.contains('is-collapsed'));
  });

  window.addEventListener('macaugo:languagechange', () => {
    const chapter = chapters[activeIndex];
    if (chapter) {
      const translate = window.macauGoLanguage?.translate || ((value) => value);
      stepLabel.textContent = translate(chapter.step);
      guideText.textContent = translate(chapter.text);
    }
    setCollapsed(guide.classList.contains('is-collapsed'));
  });

  showChapter(findClosestChapter(), false);
})();
