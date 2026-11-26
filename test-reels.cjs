const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function startServer() {
  const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = requestPath.endsWith('/') ? `${requestPath}index.html` : requestPath;
    const filePath = path.resolve(DIST_DIR, `.${relativePath}`);

    if (!filePath.startsWith(path.resolve(DIST_DIR)) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

(async () => {
  let passed = 0;
  let failed = 0;
  const errors = [];

  function check(name, condition, detail = '') {
    if (condition) {
      passed += 1;
      console.log(`PASS  ${name}`);
    } else {
      failed += 1;
      console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  async function waitForFeed(page) {
    await page.waitForFunction(() => document.querySelectorAll('.reel-card:not(.reel-measure)').length > 20, null, { timeout: 30000 });
  }

  async function waitForRepagination(page) {
    await page.waitForTimeout(320);
  }

  async function activeCardSnapshot(page) {
    return page.evaluate(() => {
      const card = document.querySelector('.reel-card[aria-hidden="false"]');
      const stored = JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}');
      return {
        cardKey: card?.dataset.cardKey || '',
        entryId: card?.dataset.entryId || '',
        cardIndex: Number(card?.dataset.cardIndex || -1),
        focusId: document.activeElement?.id || '',
        focusAction: document.activeElement?.dataset?.action || '',
        focusClass: document.activeElement?.className || '',
        focusText: document.activeElement?.textContent?.trim() || '',
        position: stored.lastPosition || null,
        positions: stored.positions || {}
      };
    });
  }

  async function viewportAudit(page) {
    return page.evaluate(() => {
      const cards = [...document.querySelectorAll('.reel-card:not(.reel-measure)')];
      const bodies = cards.map(card => {
        const body = card.querySelector('.reel-card__body');
        const cue = card.querySelector('[data-scroll-cue]');
        return {
          cardIndex: Number(card.dataset.cardIndex),
          entryId: card.dataset.entryId,
          horizontalOverflow: body ? body.scrollWidth - body.clientWidth : 0,
          verticalOverflow: body ? body.scrollHeight - body.clientHeight : 0,
          overflowY: body ? getComputedStyle(body).overflowY : '',
          cueVisible: cue ? !cue.hidden && getComputedStyle(cue).display !== 'none' : false,
          cueText: cue?.textContent?.trim() || ''
        };
      });
      const caption = document.querySelector('#stageCaption');
      const captionRect = caption?.getBoundingClientRect();
      const stageRect = document.querySelector('#reelStage')?.getBoundingClientRect();
      const topbarRect = document.querySelector('.reels-topbar')?.getBoundingClientRect();
      return {
        viewport: { width: innerWidth, height: innerHeight },
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        horizontalOverflowCards: bodies.filter(body => body.horizontalOverflow > 1),
        verticalOverflowCards: bodies.filter(body => body.verticalOverflow > 2),
        invalidScrollFallbacks: bodies.filter(body => body.verticalOverflow > 2 && (!['auto', 'scroll'].includes(body.overflowY) || !body.cueVisible)),
        caption: {
          display: caption ? getComputedStyle(caption).display : 'none',
          bottom: captionRect?.bottom || 0,
          clipped: Boolean(caption && getComputedStyle(caption).display !== 'none' && captionRect.bottom > innerHeight + 1)
        },
        stage: {
          top: stageRect?.top || 0,
          bottom: stageRect?.bottom || 0,
          left: stageRect?.left || 0,
          right: stageRect?.right || 0
        },
        topbar: {
          top: topbarRect?.top || 0,
          bottom: topbarRect?.bottom || 0
        }
      };
    });
  }

  async function waitForEmptyFeed(page) {
    await page.waitForFunction(() => document.querySelector('#stageLoading')?.classList.contains('stage-error'), null, { timeout: 30000 });
  }

  async function persistedState(page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}'));
  }

  async function activateCard(page, selector) {
    await page.evaluate(targetSelector => {
      const cards = [...document.querySelectorAll('.reel-card:not(.reel-measure)')];
      const target = cards.find(card => card.matches(targetSelector));
      if (!target) throw new Error(`No card matches ${targetSelector}`);

      const targetIndex = Number(target.dataset.cardIndex);
      let active = document.querySelector('.reel-card[aria-hidden="false"]');
      let activeIndex = Number(active?.dataset.cardIndex || 0);

      while (activeIndex !== targetIndex) {
        const direction = activeIndex < targetIndex ? 'next' : 'previous';
        active?.querySelector(`[data-action="${direction}"]`)?.click();
        active = document.querySelector('.reel-card[aria-hidden="false"]');
        activeIndex = Number(active?.dataset.cardIndex || 0);
      }
    }, selector);
  }

  async function openHubMenu(page) {
    await page.click('#hubToggle');
    await page.waitForFunction(() => document.querySelector('#hubMenu')?.open === true);
  }

  async function closeHubMenu(page) {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#hubMenu')?.open === false);
  }

  async function openSubmodal(page, modalId) {
    const modalSelector = modalId === 'feed' ? '#feedModal' : modalId === 'progress' ? '#progressModal' : '#audioModal';
    await openHubMenu(page);
    // Find and click the hub menu item
    await page.evaluate(sel => {
      const items = document.querySelectorAll('.hub-menu__item[data-hub-target]');
      items.forEach(item => {
        if (item.dataset.hubTarget === sel) item.click();
      });
    }, modalId);
    await page.waitForFunction(sel => document.querySelector(sel)?.open === true, modalSelector, { timeout: 10000 });
  }

  async function closeSubmodal(page, modalId) {
    await page.keyboard.press('Escape');
    await page.waitForFunction(id => document.querySelector(`#${id}`)?.open === false, modalId);
  }

  async function selectBrowserNarrator(page, voice = 'test-voice-one') {
    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', voice);
    await closeSubmodal(page, 'audioModal');
  }

  async function forceNarrationManifest(page) {
    await page.route('**/reels/content.json', async route => {
      const response = await route.fetch();
      const payload = await response.json();
      payload.narration = payload.narration || {};
      payload.narration.cloudEnabled = true;
      Object.values(payload.narration.segments || {}).forEach(segment => {
        segment.static = false;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });
  }

  async function installSpeechMock(context) {
    await context.addInitScript(() => {
      const log = { speaks: [], speechEvents: [], completions: 0, cancels: 0, pauses: 0, resumes: 0 };
      window.__speechLog = log;

      class MockUtterance {
        constructor(text) {
          this.text = text;
          this.rate = 1;
          this.pitch = 1;
          this.volume = 1;
          this.voice = null;
          this.onend = null;
          this.onerror = null;
        }
      }

      const synthesis = {
        getVoices() {
          return [
            { name: 'Provider Test Voice', lang: 'en-US', voiceURI: 'provider-test-voice' },
            { name: 'Provider Test Voice Two', lang: 'en-GB', voiceURI: 'provider-test-voice-two' }
          ];
        },
        speak(utterance) {
          log.speaks.push(utterance.text);
          log.speechEvents.push({
            text: utterance.text,
            time: performance.now(),
            voice: utterance.voice?.voiceURI || null,
            rate: utterance.rate
          });
          window.setTimeout(() => {
            log.completions += 1;
            utterance.onend?.();
          }, 5);
        },
        cancel() { log.cancels += 1; },
        pause() { log.pauses += 1; },
        resume() { log.resumes += 1; },
        addEventListener() {}
      };

      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance });
    });
  }

  const { server, baseUrl } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  await context.addInitScript(() => {
    const log = {
      speaks: [],
      speechEvents: [],
      completions: 0,
      cancels: 0,
      pauses: 0,
      resumes: 0,
      speaking: false,
      pending: false,
      paused: false
    };
    window.__speechLog = log;

    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
      }
    }

    const mockSynthesis = {
      getVoices() {
        return [
          { name: 'Test Voice One', lang: 'en-US', voiceURI: 'test-voice-one' },
          { name: 'Test Voice Two', lang: 'en-GB', voiceURI: 'test-voice-two' }
        ];
      },
      speak(utterance) {
        log.speaks.push(utterance.text);
        log.speechEvents.push({
          text: utterance.text,
          time: performance.now(),
          voice: utterance.voice?.voiceURI || null,
          rate: utterance.rate
        });
        log.speaking = true;
        log.pending = true;
        window.setTimeout(() => {
          log.speaking = false;
          log.pending = false;
          log.completions += 1;
          utterance.onend?.();
        }, 5);
      },
      cancel() {
        log.cancels += 1;
        log.speaking = false;
        log.pending = false;
        log.paused = false;
      },
      pause() {
        log.pauses += 1;
        log.paused = true;
      },
      resume() {
        log.resumes += 1;
        log.paused = false;
      },
      addEventListener() {}
    };

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: mockSynthesis
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtterance
    });
  });

  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(page);
    await page.evaluate(() => document.fonts?.ready);

    const initial = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.reel-card:not(.reel-measure)')].map((card, index) => {
        const body = card.querySelector('.reel-card__body');
        return {
          index,
          key: card.dataset.cardKey,
          entryId: card.dataset.entryId,
          unit: Number(card.dataset.unit),
          kind: card.dataset.kind,
          mode: card.dataset.mode,
          question: card.querySelector('.reel-card__question')?.textContent.trim() || '',
          title: card.querySelector('.reel-card__title')?.textContent.trim() || card.querySelector('.reel-card__section')?.textContent.trim() || '',
          text: body?.textContent.trim() || '',
          overflow: Boolean(body && body.scrollHeight > body.clientHeight + 2),
          bodyHeight: body?.clientHeight || 0,
          bodyScrollHeight: body?.scrollHeight || 0
        };
      });

      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent.trim(),
        cards,
        units: document.querySelectorAll('.unit-filter-button').length,
        overflow: cards.filter(card => card.overflow).length,
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        modeLabels: [...document.querySelectorAll('[data-card-mode]')].map(node => node.textContent.trim()),
        overflowMeasures: cards.filter(card => card.overflow).map(card => ({
          index: card.index,
          entryId: card.entryId,
          title: card.title,
          text: card.text.slice(0, 180),
          bodyHeight: card.bodyHeight,
          bodyScrollHeight: card.bodyScrollHeight
        }))
      };
    });

    check('Quick Reels route loads', initial.title.includes('Quick Reels'));
    check('The app names itself with one H1', initial.h1 === 'Quick Reels');
    check('All six BI units plus All are filterable', initial.units === 7);
    check('The feed creates a substantial card set', initial.cards.length > 150, `${initial.cards.length} cards`);
    check('No card body overflows after pagination', initial.overflow === 0, `${initial.overflow} overflowing cards${initial.overflow ? `: ${JSON.stringify(initial.overflowMeasures)}` : ''}`);
    check('Desktop has no horizontal page overflow', initial.pageOverflow === 0);
    check('Visual cards are labelled for music playback', initial.modeLabels.includes('Visual + music'));

    const reelComposition = await page.evaluate(() => {
      const card = document.querySelector('.reel-card[aria-hidden="false"]');
      const body = card?.querySelector('.reel-card__body');
      const actions = card?.querySelector('.reel-card__actions');
      const navigation = card?.querySelector('.reel-card__navigation');
      const cardRect = card?.getBoundingClientRect();
      const actionsRect = actions?.getBoundingClientRect();
      const hubMenu = document.querySelector('#hubMenu');
      const stage = document.querySelector('.reels-stage');
      const stageRect = stage?.getBoundingClientRect();
      return {
        actionCount: actions?.querySelectorAll('[data-action], .reel-action-link').length || 0,
        navigationCount: navigation?.querySelectorAll('[data-action]').length || 0,
        bodyPaddingRight: body ? parseFloat(getComputedStyle(body).paddingRight) : 0,
        actionsInsideCard: Boolean(cardRect && actionsRect && actionsRect.right <= cardRect.right && actionsRect.left >= cardRect.left),
        hubMenuOpen: hubMenu?.open ?? false,
        stageRatio: stageRect ? Number((stageRect.height / stageRect.width).toFixed(2)) : 0,
        stageWidth: stageRect?.width || 0,
        viewportWidth: innerWidth
      };
    });
    check('The active card uses one five-action study rail', reelComposition.actionCount === 5, JSON.stringify(reelComposition));
    check('Previous and next remain a separate two-button navigation group', reelComposition.navigationCount === 2, JSON.stringify(reelComposition));
    check('The card body reserves a readable strip beside the edge actions', reelComposition.bodyPaddingRight >= 68 && reelComposition.actionsInsideCard, JSON.stringify(reelComposition));
    check('Feed controls are hidden behind a hub menu on desktop', reelComposition.hubMenuOpen === false, JSON.stringify(reelComposition));
    check('Desktop keeps one centred portrait reading frame', reelComposition.stageRatio >= 1.7 && reelComposition.stageRatio <= 1.9 && reelComposition.stageWidth < reelComposition.viewportWidth * 0.45, JSON.stringify(reelComposition));

    const muteButtonPresent = await page.evaluate(() => ({
      hasMuteButton: Boolean(document.querySelector('.reel-card[aria-hidden="false"] [data-action="mute"]')),
      muteAriaPressed: document.querySelector('.reel-card[aria-hidden="false"] [data-action="mute"]')?.getAttribute('aria-pressed'),
      muteIconCount: document.querySelectorAll('.reel-card[aria-hidden="false"] [data-action="mute"] svg').length
    }));
    check('Mute button present on card', muteButtonPresent.hasMuteButton === true);
    check('Mute button starts unmuted', muteButtonPresent.muteAriaPressed === 'false');

    await openHubMenu(page);
    const desktopModalState = await page.evaluate(() => ({
      role: document.querySelector('#hubMenu')?.getAttribute('role'),
      modal: document.querySelector('#hubMenu')?.getAttribute('aria-modal'),
      stageInert: document.querySelector('#reelStage')?.inert,
      focusInside: document.querySelector('#hubMenu')?.contains(document.activeElement)
    }));
    await closeHubMenu(page);
    check('Desktop hub menu uses true modal-dialog semantics', desktopModalState.role === 'dialog' && desktopModalState.modal === 'true' && desktopModalState.stageInert && desktopModalState.focusInside, JSON.stringify(desktopModalState));

    const payload = await page.evaluate(async () => {
      const response = await fetch('content.json');
      return response.json();
    });
    check('Every BI unit contributes source sections', payload.units.length === 6 && Object.keys(payload.audit.unitCounts).length === 6);
    check('The feed contains every audited mapped question', payload.entries.filter(entry => entry.kind === 'question').length === payload.questionManifest.length && payload.questionManifest.length === 42, `${payload.entries.filter(entry => entry.kind === 'question').length} / ${payload.questionManifest.length}`);
    check('Every mapped question keeps its paper identity', payload.entries.filter(entry => entry.kind === 'question').every(entry => ['board', 'model'].includes(entry.paper)));
    const defaultNarrator = await page.evaluate(() => ({
      selected: document.querySelector('#voiceSelect')?.value || '',
      stored: JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}').voice || ''
    }));
    check('Google Chirp 3 HD is the default narrator', defaultNarrator.selected === 'google' && defaultNarrator.stored === 'google', JSON.stringify(defaultNarrator));
    check('Coverage and self-test sections stay excluded', payload.audit.excludedHeadings.some(item => /coverage map/i.test(item.heading)) && payload.audit.excludedHeadings.some(item => /self-test/i.test(item.heading)));
    check('No Unit 1 mojibake reaches the feed', !JSON.stringify(payload).match(/[âÂÃð]/));

    const generatedUnit1 = await page.evaluate(async () => {
      const response = await fetch('../bi/unit-1.html');
      const html = await response.text();
      return {
        hasMojibake: /[âÂÃð]/.test(html),
        hasArrow: html.includes('→')
      };
    });
    check('Generated Unit 1 pages repair mojibake without changing the source notes', generatedUnit1.hasArrow && !generatedUnit1.hasMojibake, JSON.stringify(generatedUnit1));

    const semantics = await page.evaluate(() => {
      const svg = document.querySelector('.reel-motion-visual svg');
      const describedBy = svg?.getAttribute('aria-describedby') || '';
      const tableRegions = [...document.querySelectorAll('.reel-table-wrap')];
      const diagramRegions = [...document.querySelectorAll('.reel-diagram')];
      return {
        h1Count: document.querySelectorAll('h1').length,
        h1Text: document.querySelector('h1')?.textContent.trim() || '',
        audioRole: document.querySelector('#audioStatus')?.getAttribute('role') || '',
        audioOutsideDrawer: !document.querySelector('#hubMenu')?.contains(document.querySelector('#audioStatus')),
        cardLive: document.querySelector('#cardAnnouncement')?.getAttribute('aria-live') || '',
        cardAtomic: document.querySelector('#cardAnnouncement')?.getAttribute('aria-atomic') || '',
        stateLive: document.querySelector('#stateAnnouncement')?.getAttribute('aria-live') || '',
        svgRole: svg?.getAttribute('role') || '',
        svgLabel: svg?.getAttribute('aria-label') || '',
        svgDescriptionExists: Boolean(describedBy && document.getElementById(describedBy)),
        genericTableLabels: tableRegions.filter(region => region.getAttribute('aria-label') === 'Table content').length,
        emptyTableHeaders: tableRegions.filter(region => region.querySelector('thead') && !region.querySelector('thead th')).length,
        tableFocusable: tableRegions.every(region => region.getAttribute('tabindex') === '0'),
        diagramFocusable: diagramRegions.every(region => region.getAttribute('tabindex') === '0'),
        diagramLabels: diagramRegions.filter(region => /^Diagram: /.test(region.getAttribute('aria-label') || '')).length,
        diagramCount: diagramRegions.length
      };
    });
    check('The page keeps one accessible H1 outside the mobile hub menu', semantics.h1Count === 1 && semantics.h1Text === 'Quick Reels', JSON.stringify(semantics));
    check('Narration and state changes use polite live regions', semantics.audioRole === 'status' && semantics.audioOutsideDrawer && semantics.cardLive === 'polite' && semantics.cardAtomic === 'true' && semantics.stateLive === 'polite', JSON.stringify(semantics));
    check('The motion SVG has a meaningful name and associated captions', semantics.svgRole === 'img' && /BI Pipeline/i.test(semantics.svgLabel) && semantics.svgDescriptionExists, JSON.stringify(semantics));
    check('Tables have contextual names and no empty rendered headers', semantics.genericTableLabels === 0 && semantics.emptyTableHeaders === 0 && semantics.tableFocusable, JSON.stringify(semantics));
    check('Diagrams have contextual names and remain keyboard focusable', semantics.diagramCount > 0 && semantics.diagramLabels === semantics.diagramCount && semantics.diagramFocusable, JSON.stringify(semantics));

    const brokenAnchors = await page.evaluate(async feed => {
      const documents = new Map();
      const failures = [];

      for (const entry of feed.entries) {
        const url = new URL(entry.sourceUrl, window.location.href);
        if (!documents.has(url.pathname)) {
          const response = await fetch(url.pathname);
          const html = await response.text();
          documents.set(url.pathname, new DOMParser().parseFromString(html, 'text/html'));
        }

        const document = documents.get(url.pathname);
        const anchor = url.hash.slice(1);
        if (!document.getElementById(anchor)) {
          failures.push({ entryId: entry.id, sourceUrl: entry.sourceUrl });
        }
      }

      return failures;
    }, payload);
    check('Every source link resolves to its exact generated heading', brokenAnchors.length === 0, JSON.stringify(brokenAnchors.slice(0, 10)));

    const questionOrder = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('.reel-card[data-kind="question"]')];
      const element = elements[0];
      const question = element?.querySelector('.reel-card__question');
      const answer = element?.querySelector('.reel-card__answer-label, .reel-card__continued-label');
      return {
        count: elements.length,
        question: question?.textContent.trim() || '',
        answer: answer?.textContent.trim(),
        questionBeforeAnswer: Boolean(question && answer && question.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING),
        allQuestionFirst: elements.every(card => {
          const cardQuestion = card.querySelector('.reel-card__question');
          const cardAnswer = card.querySelector('.reel-card__answer-label, .reel-card__continued-label');
          return Boolean(cardQuestion && cardAnswer && cardQuestion.compareDocumentPosition(cardAnswer) & Node.DOCUMENT_POSITION_FOLLOWING);
        })
      };
    });
    check('Question cards show the question before the answer', questionOrder.questionBeforeAnswer && questionOrder.allQuestionFirst && questionOrder.count > 0);
    check('Question answer area has a clear label', questionOrder.answer === 'Answer');

    await activateCard(page, '.reel-card[data-mode="visual"]');
    const blankTapBefore = await page.evaluate(() => ({
      paused: document.querySelector('#musicPlayer')?.paused ?? true,
      mode: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.mode || ''
    }));
    // Click the body directly in browser context to ensure proper event
    await page.evaluate(() => {
      const body = document.querySelector('.reel-card[aria-hidden="false"] .reel-card__body');
      if (body) body.click();
    });
    await page.waitForTimeout(350);
    const blankTapAfter = await page.evaluate(() => ({
      paused: document.querySelector('#musicPlayer')?.paused ?? true,
      mode: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.mode || ''
    }));
    check('Tapping blank card space toggles the active audio', blankTapBefore.paused !== blankTapAfter.paused, JSON.stringify({ blankTapBefore, blankTapAfter }));

    await page.evaluate(() => {
      window.__speechLog.speaks = [];
      document.querySelector('.reel-card[aria-hidden="false"] .reel-card__question, .reel-card[aria-hidden="false"] .reel-card__title')?.click();
    });
    await page.waitForTimeout(40);
    const textTapSpeech = await page.evaluate(() => [...window.__speechLog.speaks]);
    check('Tapping source text does not hijack the reading action', textTapSpeech.length === 0, String(textTapSpeech.length));

    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', 'test-voice-one');
    await page.locator('#speechRate').evaluate(input => {
      input.value = '1.15';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#musicVolume').evaluate(input => {
      input.value = '0.35';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await closeSubmodal(page, 'audioModal');
    const configuredPreferences = await persistedState(page);
    check('Fixed voice selection persists in state', configuredPreferences.voice === 'test-voice-one');
    check('Speech-rate selection persists in state', configuredPreferences.speechRate === 1.15);
    check('Music-volume selection persists in state', configuredPreferences.musicVolume === 0.35);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    const restoredPreferences = await persistedState(page);
    check('Audio preferences survive reload', restoredPreferences.voice === 'test-voice-one' && restoredPreferences.speechRate === 1.15 && restoredPreferences.musicVolume === 0.35);

    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', 'random');
    await closeSubmodal(page, 'audioModal');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    check('Random narrator mode survives reload', (await persistedState(page)).voice === 'random');

    // AI subtitle overlay tests
    const subtitleHiddenInitially = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      return panel ? panel.hidden : null;
    });
    check('AI subtitle starts hidden', subtitleHiddenInitially === true);

    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', 'ai');
    await closeSubmodal(page, 'audioModal');
    await page.waitForTimeout(150);

    const subtitleAiVisible = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      const content = document.querySelector('#transcriptContent');
      return panel
        ? { hidden: panel.hidden, role: panel.getAttribute('role'), live: panel.getAttribute('aria-live'), text: content?.textContent.trim().slice(0, 80) }
        : null;
    });
    check('AI subtitle is visible when AI voice selected', subtitleAiVisible && subtitleAiVisible.hidden === false);
    check('AI subtitle is a polite status region, not a dialog', subtitleAiVisible && subtitleAiVisible.role === 'status' && subtitleAiVisible.live === 'polite');
    check('AI subtitle shows generated transcript text', subtitleAiVisible && subtitleAiVisible.text && subtitleAiVisible.text.length > 0);

    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', 'random');
    await closeSubmodal(page, 'audioModal');
    await page.waitForTimeout(150);

    const subtitleHiddenAfterNonAi = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      return panel ? panel.hidden : null;
    });
    check('AI subtitle hides when a non-AI voice is selected', subtitleHiddenAfterNonAi === true);

    await openSubmodal(page, 'audio');
    await page.selectOption('#voiceSelect', 'ai');
    await closeSubmodal(page, 'audioModal');
    await page.waitForTimeout(150);

    const cardTextWithSubtitle = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      const body = document.querySelector('.reel-card[aria-hidden="false"] .reel-card__body');
      return panel && body ? { bodyTextLength: body.textContent.trim().length, panelPointer: getComputedStyle(panel).pointerEvents, panelHidden: panel.hidden } : null;
    });
    check('Original card body text stays visible under subtitle', cardTextWithSubtitle && cardTextWithSubtitle.bodyTextLength > 0);
    check('Subtitle container blocks pointer events', cardTextWithSubtitle && cardTextWithSubtitle.panelPointer === 'none');
    check('Subtitle content allows interaction', cardTextWithSubtitle && cardTextWithSubtitle.panelHidden === false);

    // Progressive subtitle tests
    const subtitleCompact = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      if (!panel || panel.hidden) return null;
      const style = window.getComputedStyle(panel);
      return { maxHeight: style.maxHeight, bottom: style.bottom, overflowY: style.overflowY };
    });
    check('AI subtitle is compact (max-height 18%)', subtitleCompact && subtitleCompact.maxHeight === '18%');
    check('AI subtitle sits above action rail', subtitleCompact && subtitleCompact.bottom === '82px');
    check('AI subtitle allows vertical scroll', subtitleCompact && subtitleCompact.overflowY === 'auto');

    const subtitleFirstSentence = await page.evaluate(() => {
      const content = document.querySelector('#transcriptContent');
      const current = content?.querySelector('.subtitle-current');
      const segments = content?.querySelectorAll('.transcript-segment');
      return {
        hasCurrent: !!current,
        totalSegments: segments?.length || 0,
        currentText: current?.textContent.trim().slice(0, 60) || ''
      };
    });
    check('AI subtitle shows first sentence highlighted', subtitleFirstSentence && subtitleFirstSentence.hasCurrent && subtitleFirstSentence.totalSegments > 0);

    // Switch to a different card and verify subtitle resets
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    const subtitleReset = await page.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      const content = document.querySelector('#transcriptContent');
      const current = content?.querySelector('.subtitle-current');
      const segments = content?.querySelectorAll('.transcript-segment');
      return panel && content ? {
        hidden: panel.hidden,
        hasCurrent: !!current,
        totalSegments: segments?.length || 0,
        currentText: current?.textContent.trim().slice(0, 60) || ''
      } : null;
    });
    check('AI subtitle resets on card change', subtitleReset && subtitleReset.hidden === false && subtitleReset.hasCurrent && subtitleReset.totalSegments > 0);

    // Regression: a persisted AI-voice state used to hang the feed build.
    // splitIntoSentences() called regex.exec() in a while loop without /g,
    // so exec() returned the same match forever and froze the main thread.
    // Fresh test profiles used a non-AI voice and never reached this path.
    const persistedAiContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await persistedAiContext.addInitScript(() => {
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [], done: [], saved: [], lastPosition: null, positions: {},
        voice: 'ai', narratorVersion: 2, aiNarrationEnabled: true,
        order: 'ordered', unit: 'all', savedOnly: false,
        speechRate: 1, shuffleSeed: 541385059, musicVolume: 0.28, muted: false
      }));
    });
    const persistedAiPage = await persistedAiContext.newPage();
    const persistedAiErrors = [];
    persistedAiPage.on('console', message => {
      if (message.type() === 'error') persistedAiErrors.push(message.text());
    });
    persistedAiPage.on('pageerror', error => persistedAiErrors.push(error.message));

    const persistedAiStart = Date.now();
    await persistedAiPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    let persistedAiReady = false;
    while (Date.now() - persistedAiStart < 20000) {
      persistedAiReady = await persistedAiPage.evaluate(() => document.querySelectorAll('.reel-card:not(.reel-measure)').length > 20);
      if (persistedAiReady) break;
      await persistedAiPage.waitForTimeout(200);
    }
    const persistedAiLoadMs = Date.now() - persistedAiStart;
    const persistedAiState = await persistedAiPage.evaluate(() => {
      const panel = document.querySelector('#transcriptPanel');
      const current = document.querySelector('#transcriptContent .subtitle-current');
      return {
        cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
        loadingHidden: document.querySelector('#stageLoading')?.hidden === true,
        voice: JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}').voice,
        subtitleVisible: panel ? panel.hidden === false : false,
        currentSentence: current?.textContent.trim().slice(0, 80) || ''
      };
    });
    check('Persisted AI voice loads the feed without hanging', persistedAiReady && persistedAiState.cards > 20 && persistedAiState.loadingHidden, JSON.stringify({ persistedAiLoadMs, ...persistedAiState }));
    check('Persisted AI voice keeps the progressive subtitle visible', persistedAiState.subtitleVisible && persistedAiState.currentSentence.length > 0, JSON.stringify(persistedAiState));

    // Move to a transcript that actually contains sentence boundaries. With the
    // old regex this navigation froze the browser; now it must stay responsive.
    const multiSentenceEntryId = await persistedAiPage.evaluate(async () => {
      const feed = await fetch('content.json').then(response => response.json());
      const entry = feed.entries.find(candidate => {
        const id = candidate.aiTranscript?.transcript;
        const text = id ? (feed.aiTranscript?.segments?.[id]?.text || '') : '';
        return /(?<=[.!?])\s+(?=[A-Z0-9"‘“(])/.test(text);
      });
      return entry?.id || '';
    });
    if (multiSentenceEntryId) {
      await activateCard(persistedAiPage, `.reel-card[data-entry-id="${multiSentenceEntryId}"]`);
    }
    const afterNavigation = await persistedAiPage.evaluate(() => ({
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
      currentSentence: document.querySelector('#transcriptContent .subtitle-current')?.textContent.trim().slice(0, 80) || ''
    }));
    check('Multi-sentence AI transcript does not freeze navigation', afterNavigation.cards > 20 && afterNavigation.currentSentence.length > 0, JSON.stringify({ multiSentenceEntryId, ...afterNavigation }));
    check('Persisted AI voice produces no browser errors', persistedAiErrors.length === 0, persistedAiErrors.join(' | '));
    await persistedAiContext.close();

    await openSubmodal(page, 'feed');
    await page.click('#unitFilters [data-unit="3"]');
    await page.waitForTimeout(100);
    const unitFiltered = await page.evaluate(() => [...document.querySelectorAll('.reel-card:not(.reel-measure)')].every(card => Number(card.dataset.unit) === 3));
    const focusedUnit = await page.evaluate(() => document.activeElement?.dataset?.unit || '');
    check('Unit filter limits the feed to the chosen unit', unitFiltered);
    check('Rebuilding the unit filters preserves keyboard focus', focusedUnit === '3', focusedUnit);

    await page.click('#unitFilters [data-unit="all"]');
    await page.click('[data-order="shuffled"]');
    await page.waitForTimeout(100);
    const shuffledBefore = await page.evaluate(() => [...document.querySelectorAll('.reel-card:not(.reel-measure)')].slice(0, 12).map(card => card.dataset.entryId));
    await closeSubmodal(page, 'feedModal');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    const shuffledAfter = await page.evaluate(() => [...document.querySelectorAll('.reel-card:not(.reel-measure)')].slice(0, 12).map(card => card.dataset.entryId));
    check('Shuffle order is stable across reloads', JSON.stringify(shuffledBefore) === JSON.stringify(shuffledAfter));
    check('Shuffle seed persists', (await persistedState(page)).shuffleSeed === 541385059);

    await openSubmodal(page, 'feed');
    await page.click('#newOrderButton');
    await page.waitForTimeout(100);
    const newShuffleSeed = (await persistedState(page)).shuffleSeed;
    check('New shuffle creates a different seed', newShuffleSeed !== 541385059, String(newShuffleSeed));
    await closeSubmodal(page, 'feedModal');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    check('New shuffle seed survives reload', (await persistedState(page)).shuffleSeed === newShuffleSeed);

    await openSubmodal(page, 'feed');
    await page.click('[data-order="ordered"]');
    await closeSubmodal(page, 'feedModal');
    await activateCard(page, '.reel-card[data-card-index="5"]');
    const orderedSnapshot = await activeCardSnapshot(page);
    await openSubmodal(page, 'feed');
    await page.click('[data-order="shuffled"]');
    await page.click('#newOrderButton');
    await page.click('[data-order="ordered"]');
    await closeSubmodal(page, 'feedModal');
    await waitForRepagination(page);
    const orderedRestored = await activeCardSnapshot(page);
    check('Ordered feed restores independently of later shuffle seeds', orderedRestored.entryId === orderedSnapshot.entryId && orderedRestored.cardKey === orderedSnapshot.cardKey, JSON.stringify({ orderedSnapshot, orderedRestored }));
    check('Ordered feed uses a seed-independent position key', Boolean(orderedRestored.positions['ordered|all|all']) && !Object.keys(orderedRestored.positions).some(key => key.startsWith('ordered|all|all|')), JSON.stringify(Object.keys(orderedRestored.positions)));

    await openSubmodal(page, 'feed');
    await page.click('[data-order="ordered"]');
    await closeSubmodal(page, 'feedModal');
    await activateCard(page, '.reel-card[data-card-index="0"]');
    const activeEntry = await page.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId);
    await page.click('.reel-card[aria-hidden="false"] [data-action="done"]');
    await page.click('.reel-card[aria-hidden="false"] [data-action="save"]');
    const savedProgress = await persistedState(page);
    check('Done state persists in local storage', savedProgress.done.includes(activeEntry));
    check('Saved state persists in local storage', savedProgress.saved.includes(activeEntry));
    check('Seen state is recorded', savedProgress.seen.includes(activeEntry));
    check('Last position is recorded', savedProgress.lastPosition?.entryId === activeEntry);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    const restoredProgress = await persistedState(page);
    check('Progress survives reload', restoredProgress.done.includes(activeEntry) && restoredProgress.saved.includes(activeEntry));

    await selectBrowserNarrator(page, 'test-voice-one');
    await page.evaluate(() => {
      window.__speechLog.speaks = [];
      window.__speechLog.speechEvents = [];
      window.__speechLog.cancels = 0;
    });
    await page.click('.reel-card[aria-hidden="false"] [data-action="next"]');
    await page.waitForTimeout(80);
    const speechAfterNext = await page.evaluate(() => ({ ...window.__speechLog, speaks: [...window.__speechLog.speaks] }));
    check('Entering a card starts narration after a gesture', speechAfterNext.speaks.length >= 1, `${speechAfterNext.speaks.length} utterances`);
    check('Leaving a card cancels the previous narration', speechAfterNext.cancels >= 1, `${speechAfterNext.cancels} cancellations`);

    const startIndex = await page.evaluate(() => {
      const current = document.querySelector('.reel-card[aria-hidden="false"]');
      return Number(current?.dataset.cardIndex || 0);
    });
    await page.evaluate(() => {
      const body = document.body;
      body.focus();
    });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(60);
    const afterArrow = await page.evaluate(() => Number(document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.cardIndex || -1));
    check('Down arrow moves to the next card', afterArrow === startIndex + 1);

    const keyboardBefore = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}');
      const activeEntryId = document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId;
      return { saved: state.saved?.includes(activeEntryId), done: state.done?.includes(activeEntryId), muted: state.muted };
    });
    await page.keyboard.press('s');
    await page.keyboard.press('d');
    await page.keyboard.press('m');
    const keyboardAfter = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}');
      const activeEntryId = document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId;
      return { saved: state.saved?.includes(activeEntryId), done: state.done?.includes(activeEntryId), muted: state.muted };
    });
    check('S toggles Saved for the active card', keyboardAfter.saved !== keyboardBefore.saved);
    check('D toggles Done for the active card', keyboardAfter.done !== keyboardBefore.done);
    check('M toggles mute', keyboardAfter.muted !== keyboardBefore.muted);

    const cardMute = await page.locator('.reel-card[aria-hidden="false"] [data-action="mute"]');
    const modalMute = await page.locator('#muteButton');
    await cardMute.click();
    await page.waitForTimeout(50);
    const muteClickState = await page.evaluate(() => ({
      cardAriaPressed: document.querySelector('.reel-card[aria-hidden="false"] [data-action="mute"]')?.getAttribute('aria-pressed'),
      modalAriaPressed: document.querySelector('#muteButton')?.getAttribute('aria-pressed')
    }));
    check('Card mute button click toggles aria-pressed', muteClickState.cardAriaPressed === 'true');
    check('Card mute click syncs with modal mute button', muteClickState.modalAriaPressed === 'true');

    await page.keyboard.press('s');
    await page.keyboard.press('d');
    await page.keyboard.press('m');

    await page.evaluate(() => {
      document.activeElement?.blur();
      window.__modifierEvents = [];
      document.addEventListener('keydown', event => {
        window.__modifierEvents.push({
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          defaultPrevented: event.defaultPrevented
        });
      });
    });
    const modifierStateBefore = await persistedState(page);
    for (const shortcut of ['Control+s', 'Meta+s', 'Control+d', 'Meta+d', 'Alt+s']) {
      await page.keyboard.press(shortcut);
    }
    const modifierStateAfter = await persistedState(page);
    const modifierEvents = await page.evaluate(() => (window.__modifierEvents || []).filter(event => ['s', 'd'].includes(event.key.toLowerCase())));
    check('Modified browser shortcuts never change Quick Reels state', JSON.stringify(modifierStateBefore.saved) === JSON.stringify(modifierStateAfter.saved) && JSON.stringify(modifierStateBefore.done) === JSON.stringify(modifierStateAfter.done) && modifierStateBefore.muted === modifierStateAfter.muted, JSON.stringify({ modifierStateBefore, modifierStateAfter }));
    check('Modified browser shortcuts are not default-prevented', modifierEvents.length === 5 && modifierEvents.every(event => !event.defaultPrevented), JSON.stringify(modifierEvents));

    const interactiveShortcutState = await page.evaluate(() => {
      const link = document.querySelector('.reel-card[aria-hidden="false"] .reel-source-link');
      link?.focus();
      return {
        focused: document.activeElement === link,
        saved: JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}').saved || []
      };
    });
    await page.keyboard.press('s');
    await page.keyboard.press('d');
    await page.keyboard.press('m');
    const interactiveShortcutAfter = await persistedState(page);
    check('M, S, and D stay native while a source link has focus', interactiveShortcutState.focused && JSON.stringify(interactiveShortcutState.saved) === JSON.stringify(interactiveShortcutAfter.saved), JSON.stringify({ interactiveShortcutState, interactiveShortcutAfter }));

    const continuationSelector = await page.evaluate(() => {
      const card = document.querySelector('.reel-card:has(.reel-card__continued-label)');
      return card ? `.reel-card[data-card-index="${card.dataset.cardIndex}"]` : '';
    });
    if (continuationSelector) {
      await activateCard(page, continuationSelector);
      const continuationFocus = await page.evaluate(() => {
        const active = document.activeElement;
        const rect = active?.getBoundingClientRect();
        return {
          className: active?.className || '',
          text: active?.textContent?.trim() || '',
          width: rect?.width || 0,
          height: rect?.height || 0,
          focusVisible: active?.matches(':focus-visible') || false
        };
      });
      check('Continuation-card navigation moves focus to a visible target', continuationFocus.width > 10 && continuationFocus.height > 10 && !continuationFocus.className.includes('reels-sr-only') && /Continued/.test(continuationFocus.text), JSON.stringify(continuationFocus));
    } else {
      check('Continuation-card navigation moves focus to a visible target', false, 'no continuation card found');
    }

    await selectBrowserNarrator(page, 'test-voice-one');
    await activateCard(page, '.reel-card[data-kind="concept"][data-mode="text"]');
    await activateCard(page, '.reel-card[data-kind="question"][data-mode="text"]');
    await page.click('.reel-card[aria-hidden="false"] [data-action="next"]');
    await page.evaluate(() => {
      window.__speechLog.speechEvents = [];
      window.__speechLog.speaks = [];
    });
    await page.click('.reel-card[aria-hidden="false"] [data-action="previous"]');
    const questionNarration = await page.evaluate(async () => {
      const card = document.querySelector('.reel-card[aria-hidden="false"]');
      const feed = await fetch('content.json').then(response => response.json());
      const entry = feed.entries.find(item => item.id === card?.dataset.entryId);
      const segmentId = entry?.narration?.title;
      return {
        visible: card?.querySelector('.reel-card__question')?.textContent.trim() || '',
        narrated: feed.narration?.segments?.[segmentId]?.text || ''
      };
    });
    await page.waitForTimeout(650);
    const speechEvents = await page.evaluate(() => [...window.__speechLog.speechEvents]);
    check('Question narration speaks the normalized question first', speechEvents[0]?.text === questionNarration.narrated && questionNarration.narrated !== questionNarration.visible, JSON.stringify({ questionNarration, events: speechEvents.slice(0, 2) }));
    check('Question and answer use one voice per card', speechEvents.length >= 2 && speechEvents[0].voice && speechEvents[0].voice === speechEvents[1].voice);
    check('Question and answer are separated by a deliberate pause', speechEvents.length >= 2 && speechEvents[1].time - speechEvents[0].time >= 400, speechEvents.length >= 2 ? String(speechEvents[1].time - speechEvents[0].time) : 'missing second segment');
    check('Narration uses the selected speech rate', speechEvents[0]?.rate === 1.15, String(speechEvents[0]?.rate));
    check('Every segment in one card keeps the same speech rate', speechEvents.length >= 2 && speechEvents.every(event => event.rate === 1.15), JSON.stringify(speechEvents));

    await activateCard(page, '.reel-card[data-kind="concept"][data-mode="text"]');
    await activateCard(page, '.reel-card[data-kind="question"][data-mode="text"]');
    await page.click('.reel-card[aria-hidden="false"] [data-action="next"]');
    await page.evaluate(() => {
      window.__speechLog.speechEvents = [];
      window.__speechLog.speaks = [];
      window.__speechLog.completions = 0;
    });
    await page.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"] [data-action="previous"]')?.click());
    await page.waitForFunction(() => window.__speechLog.completions >= 1 && window.__speechLog.speaks.length === 1);
    await page.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"] [data-action="play"]')?.click());
    await page.waitForTimeout(520);
    const pausedGapSpeech = await page.evaluate(() => ({
      speaks: [...window.__speechLog.speaks],
      status: document.querySelector('#audioStatus')?.textContent.trim() || ''
    }));
    check('Pausing during the question-answer gap does not restart the question', pausedGapSpeech.speaks.length === 1, JSON.stringify(pausedGapSpeech));
    await page.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"] [data-action="play"]')?.click());
    await page.waitForTimeout(520);
    const resumedGapSpeech = await page.evaluate(() => [...window.__speechLog.speaks]);
    check(
      'Resuming during the question-answer gap starts the pending answer once',
      resumedGapSpeech.length >= 2
        && resumedGapSpeech[0] !== resumedGapSpeech[1]
        && resumedGapSpeech.filter(text => text === resumedGapSpeech[0]).length === 1,
      JSON.stringify(resumedGapSpeech)
    );

    await activateCard(page, '.reel-card[data-mode="visual"]');
    const visualNavigation = await page.evaluate(() => {
      const audio = document.querySelector('#musicPlayer');
      const status = document.querySelector('#audioStatus');
      return {
        before: { paused: audio.paused, status: status.textContent.trim() },
        after: { paused: audio.paused, status: status.textContent.trim() },
        visualIndex: Number(document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.cardIndex || -1)
      };
    });
    await page.waitForTimeout(60);
    const musicBefore = await page.evaluate(() => ({
      paused: document.querySelector('#musicPlayer').paused,
      status: document.querySelector('#audioStatus').textContent.trim(),
      activeMode: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.mode,
      speechCount: window.__speechLog.speechEvents.length
    }));
    const musicRequest = musicBefore.paused
      ? page.waitForResponse(response => response.url().includes('/assets/music/') && response.status() === 200, { timeout: 10000 }).catch(() => null)
      : null;
    if (musicBefore.paused) await page.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    const musicResponse = musicRequest ? await musicRequest : null;
    await page.waitForTimeout(80);
    const musicState = await page.evaluate(() => ({
      src: document.querySelector('#musicPlayer').getAttribute('src'),
      paused: document.querySelector('#musicPlayer').paused,
      status: document.querySelector('#audioStatus').textContent.trim(),
      speechCount: window.__speechLog.speechEvents.length,
      playLabel: document.querySelector('.reel-card[aria-hidden="false"] [data-action="play"]')?.getAttribute('aria-label') || ''
    }));
    musicState.before = musicBefore;
    musicState.navigation = visualNavigation;
    check('Visual cards load a local MP3', musicResponse !== null || /assets\/music\/.*\.mp3$/.test(musicState.src || ''));
    check('Visual-card playback is wired to the local track', /Visual card/.test(musicState.before.status) && /assets\/music\/.*\.mp3$/.test(musicState.src || ''), JSON.stringify(musicState));
    check('Visual-card controls name the music action', /music/i.test(musicState.playLabel), musicState.playLabel);
    check('Visual cards do not start text narration', musicState.speechCount === musicState.before.speechCount, `${musicState.before.speechCount} → ${musicState.speechCount}`);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForFeed(page);
    const mobile = await page.evaluate(() => ({
      pageOverflow: document.documentElement.scrollWidth - innerWidth,
      hubMenuOpen: document.querySelector('#hubMenu')?.open ?? false,
      hubMenuInert: document.querySelector('#hubMenu')?.inert ?? false,
      hubMenuAriaHidden: document.querySelector('#hubMenu')?.getAttribute('aria-hidden') ?? 'true',
      overflow: [...document.querySelectorAll('.reel-card:not(.reel-measure)')].filter(card => {
        const body = card.querySelector('.reel-card__body');
        return body && body.scrollHeight > body.clientHeight + 2;
      }).length,
      menuVisible: getComputedStyle(document.querySelector('#hubToggle')).display !== 'none',
      stageWidth: Math.round(document.querySelector('#reelStage').getBoundingClientRect().width),
      viewportWidth: innerWidth
    }));
    check('Mobile has no horizontal page overflow', mobile.pageOverflow === 0);
    check('Mobile hub menu starts closed', !mobile.hubMenuOpen);
    check('Closed mobile hub menu is removed from the tab order', mobile.hubMenuInert && mobile.hubMenuAriaHidden === 'true');
    check('Mobile cards do not overflow after repagination', mobile.overflow === 0, `${mobile.overflow} overflowing cards`);
    check('Mobile menu control is visible', mobile.menuVisible);
    check('Mobile card stage fills the viewport width', mobile.stageWidth === mobile.viewportWidth);

    await page.click('#hubToggle');
    const openHubState = await page.evaluate(() => ({
      open: document.querySelector('#hubMenu')?.open ?? false,
      inert: document.querySelector('#hubMenu')?.inert ?? false,
      ariaHidden: document.querySelector('#hubMenu')?.getAttribute('aria-hidden') ?? 'true',
      focusInHub: document.querySelector('#hubMenu')?.contains(document.activeElement),
      role: document.querySelector('#hubMenu')?.getAttribute('role'),
      modal: document.querySelector('#hubMenu')?.getAttribute('aria-modal'),
      stageInert: document.querySelector('#reelStage')?.inert,
      stageAriaHidden: document.querySelector('#reelStage')?.getAttribute('aria-hidden')
    }));
    check('Mobile hub menu opens', openHubState.open === true);
    check('Open mobile hub menu is keyboard accessible', !openHubState.inert && openHubState.ariaHidden === 'false' && openHubState.focusInHub);
    check('Open mobile hub menu exposes true modal-dialog semantics', openHubState.role === 'dialog' && openHubState.modal === 'true' && openHubState.stageInert && openHubState.stageAriaHidden === 'true', JSON.stringify(openHubState));

    await page.evaluate(() => {
      const focusable = [...document.querySelector('#hubMenu').querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length > 0);
      focusable[focusable.length - 1]?.focus();
    });
    await page.keyboard.press('Tab');
    const trappedForward = await page.evaluate(() => ({
      inside: document.querySelector('#hubMenu').contains(document.activeElement),
      id: document.activeElement?.id || '',
      order: document.activeElement?.dataset?.order || ''
    }));
    check('Forward Tab stays inside the mobile hub menu', trappedForward.inside, JSON.stringify(trappedForward));
    await page.keyboard.press('Shift+Tab');
    const trappedReverse = await page.evaluate(() => document.querySelector('#hubMenu').contains(document.activeElement));
    check('Reverse Tab stays inside the mobile hub menu', trappedReverse);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => {
      const hub = document.querySelector('#hubMenu');
      return hub?.open === false && hub?.inert === true && hub?.getAttribute('aria-hidden') === 'true';
    }, { timeout: 5000 });
    const closedHubState = await page.evaluate(() => ({
      open: document.querySelector('#hubMenu')?.open ?? false,
      inert: document.querySelector('#hubMenu')?.inert ?? false,
      ariaHidden: document.querySelector('#hubMenu')?.getAttribute('aria-hidden') ?? 'false',
      focusId: document.activeElement?.id
    }));
    check('Escape closes the mobile hub menu', closedHubState.open === false);
    check('Closed mobile hub menu is removed from the tab order', closedHubState.inert && closedHubState.ariaHidden === 'true');
    check('Closing the mobile hub menu restores focus to its trigger', closedHubState.focusId === 'hubToggle');

    await page.click('#hubToggle');
    await page.click('#hubClose');
    const triggerClosedState = await page.evaluate(() => ({
      open: document.querySelector('#hubMenu')?.open ?? false,
      focusId: document.activeElement?.id
    }));
    check('The hub menu close button closes the mobile hub menu', triggerClosedState.open === false);
    check('Hub-menu-button close restores focus to the hub trigger', triggerClosedState.focusId === 'hubToggle', JSON.stringify(triggerClosedState));

    // Test submodal focus trapping
    await page.click('#hubToggle');
    await page.click('.hub-menu__item[data-hub-target="feed"]');
    const feedModalOpen = await page.waitForFunction(() => document.querySelector('#feedModal')?.open === true, { timeout: 5000 });
    check('Feed submodal opens on mobile', feedModalOpen);

    await page.evaluate(() => {
      const focusable = [...document.querySelector('#feedModal').querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length > 0);
      focusable[focusable.length - 1]?.focus();
    });
    await page.keyboard.press('Tab');
    const feedTrappedForward = await page.evaluate(() => document.querySelector('#feedModal').contains(document.activeElement));
    check('Forward Tab stays inside the feed submodal', feedTrappedForward);
    await page.keyboard.press('Shift+Tab');
    const feedTrappedReverse = await page.evaluate(() => document.querySelector('#feedModal').contains(document.activeElement));
    check('Reverse Tab stays inside the feed submodal', feedTrappedReverse);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('#feedModal')?.open === false, { timeout: 5000 });
    const feedClosedFocus = await page.evaluate(() => document.activeElement?.id);
    check('Escape closes feed submodal and returns focus to hub menu', feedClosedFocus === 'hubToggle');

    const viewportMatrix = [
      { width: 320, height: 568 },
      { width: 360, height: 640 },
      { width: 390, height: 844 },
      { width: 844, height: 390 },
      { width: 901, height: 500 },
      { width: 1024, height: 600 },
      { width: 1440, height: 900 }
    ];
    for (const viewport of viewportMatrix) {
      await page.setViewportSize(viewport);
      await waitForRepagination(page);
      const audit = await viewportAudit(page);
      const label = `${viewport.width}x${viewport.height}`;
      check(`${label} has no horizontal page overflow`, audit.pageOverflow <= 0, String(audit.pageOverflow));
      check(`${label} has no clipped prose inside a card`, audit.horizontalOverflowCards.length === 0, JSON.stringify(audit.horizontalOverflowCards.slice(0, 3)));
      check(`${label} keeps every overflowing card scrollable and signposted`, audit.invalidScrollFallbacks.length === 0, JSON.stringify(audit.invalidScrollFallbacks.slice(0, 3)));
      check(`${label} keeps the stage and caption inside the viewport`, audit.stage.top >= audit.topbar.bottom - 1 && audit.stage.bottom <= viewport.height + 1 && !audit.caption.clipped, JSON.stringify({ stage: audit.stage, topbar: audit.topbar, caption: audit.caption }));
    }

    let resizeTarget = null;
    for (const width of [390, 360, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await waitForRepagination(page);
      const candidate = await page.evaluate(() => {
        const groups = new Map();
        [...document.querySelectorAll('.reel-card:not(.reel-measure)')].forEach(card => {
          if (!card.querySelector('.reel-table')) return;
          const group = groups.get(card.dataset.entryId) || [];
          group.push(Number(card.dataset.cardIndex));
          groups.set(card.dataset.entryId, group);
        });
        const best = [...groups.entries()]
          .filter(([, indexes]) => indexes.length > 1)
          .sort((left, right) => right[1].length - left[1].length)[0];
        return best ? { entryId: best[0], cardIndex: Math.min(...best[1]) } : null;
      });
      if (candidate) {
        resizeTarget = { ...candidate, width };
        break;
      }
    }

    if (resizeTarget) {
      await page.setViewportSize({ width: resizeTarget.width, height: 844 });
      await waitForRepagination(page);
      const targetIndexes = await page.evaluate(entryId => [...document.querySelectorAll(`.reel-card[data-entry-id="${entryId}"]`)]
        .map(card => Number(card.dataset.cardIndex))
        .sort((left, right) => left - right), resizeTarget.entryId);
      const continuationIndex = targetIndexes[1];
      await activateCard(page, `.reel-card[data-card-index="${continuationIndex}"]`);
      await page.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"] [data-action="done"]')?.focus());
      const beforeResize = await activeCardSnapshot(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await waitForRepagination(page);
      const afterWideResize = await activeCardSnapshot(page);
      await page.setViewportSize({ width: resizeTarget.width, height: 844 });
      await waitForRepagination(page);
      const afterNarrowResize = await activeCardSnapshot(page);
      const beforeStart = beforeResize.position?.atomAnchor?.start;
      check('Resize keeps the active source entry and atom boundary', afterWideResize.entryId === beforeResize.entryId && afterNarrowResize.entryId === beforeResize.entryId && beforeStart !== undefined && afterWideResize.position?.atomAnchor?.start === beforeStart && afterNarrowResize.position?.atomAnchor?.start === beforeStart, JSON.stringify({ beforeResize, afterWideResize, afterNarrowResize }));
      check('Resize rebuild preserves focus on the active card control', afterWideResize.focusAction === 'done' && afterNarrowResize.focusAction === 'done', JSON.stringify({ afterWideResize, afterNarrowResize }));
    } else {
      check('Resize keeps the active source entry and atom boundary', false, 'no multi-row table card found');
    }

    const providerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSpeechMock(providerContext);
    const providerPage = await providerContext.newPage();
    const providerErrors = [];
    providerPage.on('console', message => {
      if (message.type() === 'error') providerErrors.push(message.text());
    });
    providerPage.on('pageerror', error => providerErrors.push(error.message));
    await forceNarrationManifest(providerPage);
    const providerRequests = [];
    const providerAudio = fs.readFileSync(path.join(DIST_DIR, 'reels', 'assets', 'music', 'easy-lemon-60-second.mp3'));
    let providerRequestsActive = 0;
    let providerRequestsMaximum = 0;
    await providerPage.route('**/api/narration?**', async route => {
      providerRequestsActive += 1;
      providerRequestsMaximum = Math.max(providerRequestsMaximum, providerRequestsActive);
      const requestUrl = new URL(route.request().url());
      providerRequests.push({
        segment: requestUrl.searchParams.get('segment') || '',
        version: requestUrl.searchParams.get('v') || ''
      });
      await new Promise(resolve => setTimeout(resolve, 80));
      await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: providerAudio });
      providerRequestsActive -= 1;
    });
    await providerPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(providerPage);
    const providerFeed = await providerPage.evaluate(async () => fetch('content.json').then(response => response.json()));
    const visualEntry = providerFeed.entries.find(entry => entry.parts.some(part => part.type === 'visual'));
    const visualTitleId = visualEntry?.narration?.title || '';
    const firstProviderRequest = providerPage.waitForRequest(
      request => request.url().includes('/api/narration?'),
      { timeout: 10000 }
    );
    await providerPage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await firstProviderRequest;
    await providerPage.waitForFunction(() => document.querySelector('#audioStatus')?.textContent.includes('Google'), null, { timeout: 10000 });
    await providerPage.waitForTimeout(220);
    const providerState = await providerPage.evaluate(() => ({
      status: document.querySelector('#audioStatus')?.textContent.trim() || '',
      speechCount: window.__speechLog?.speaks?.length || 0,
      playerSource: document.querySelector('#narrationPlayer')?.getAttribute('src') || ''
    }));
    const providerRequestCounts = providerRequests.reduce((counts, request) => {
      counts[request.segment] = (counts[request.segment] || 0) + 1;
      return counts;
    }, {});
    check(
      'Google narration routes known manifest segments to the protected endpoint',
      providerRequests.length > 0
        && providerRequests.every(request => providerFeed.narration.segments[request.segment]
          && providerFeed.narration.segments[request.segment].version === request.version),
      JSON.stringify(providerRequests.slice(0, 5))
    );
    check('Google narration does not fall back to browser speech', providerState.speechCount === 0 && /Google Chirp 3 HD/.test(providerState.status), JSON.stringify(providerState));
    check('Narration prefetch deduplicates segment requests', Object.values(providerRequestCounts).every(count => count === 1), JSON.stringify(providerRequestCounts));
    check('Narration prefetch caps background provider concurrency', providerRequestsMaximum <= 4, String(providerRequestsMaximum));
    check('Narration prefetch skips visual-only cards', !visualTitleId || !providerRequests.some(request => request.segment === visualTitleId), visualTitleId);
    check('Provider playback produces no browser errors', providerErrors.length === 0, providerErrors.join(' | '));
    await providerContext.close();

    const aiOffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSpeechMock(aiOffContext);
    await aiOffContext.addInitScript(() => {
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        voice: 'google',
        narratorVersion: 2,
        aiNarrationEnabled: false,
        muted: false
      }));
    });
    const aiOffPage = await aiOffContext.newPage();
    await forceNarrationManifest(aiOffPage);
    await aiOffPage.route('**/api/narration?**', route => route.fulfill({
      status: 200,
      contentType: 'audio/mpeg',
      body: providerAudio
    }));
    await aiOffPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(aiOffPage);
    await aiOffPage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await aiOffPage.waitForFunction(() => /Google Chirp 3 HD/.test(document.querySelector('#audioStatus')?.textContent || ''), null, { timeout: 10000 });
    await aiOffPage.waitForTimeout(220);
    const aiOffState = await aiOffPage.evaluate(() => ({
      status: document.querySelector('#audioStatus')?.textContent.trim() || '',
      speechCount: window.__speechLog?.speaks?.length || 0,
      playerSource: document.querySelector('#narrationPlayer')?.getAttribute('src') || '',
      aiEnabled: JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}').aiNarrationEnabled
    }));
    check(
      'Regression: Google narration still plays with AI narration OFF',
      aiOffState.speechCount === 0 && /Google Chirp 3 HD/.test(aiOffState.status) && Boolean(aiOffState.playerSource),
      JSON.stringify(aiOffState)
    );
    check('Regression: AI narration toggle stays OFF during Google playback', aiOffState.aiEnabled === false, JSON.stringify(aiOffState));
    await aiOffContext.close();

    const retiredVoiceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await retiredVoiceContext.addInitScript(() => {
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        voice: 'kokoro',
        narratorVersion: 2,
        aiNarrationEnabled: true,
        muted: false
      }));
    });
    const retiredVoicePage = await retiredVoiceContext.newPage();
    await retiredVoicePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(retiredVoicePage);
    const retiredVoiceState = await retiredVoicePage.evaluate(() => ({
      selected: document.querySelector('#voiceSelect')?.value || '',
      options: [...(document.querySelector('#voiceSelect')?.options || [])].map(option => option.value)
    }));
    check(
      'Retired local voice migrates to Google on load',
      retiredVoiceState.selected === 'google' && !retiredVoiceState.options.includes('kokoro'),
      JSON.stringify(retiredVoiceState)
    );
    await retiredVoiceContext.close();
    const quotaContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSpeechMock(quotaContext);
    const quotaPage = await quotaContext.newPage();
    await forceNarrationManifest(quotaPage);
    await quotaPage.route('**/api/narration?**', route => route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'quota_exhausted', message: 'Quota exhausted.' })
    }));
    await quotaPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(quotaPage);
    await quotaPage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await quotaPage.waitForFunction(() => (window.__speechLog?.speaks?.length || 0) > 0, null, { timeout: 10000 });
    const quotaState = await quotaPage.evaluate(() => ({
      status: document.querySelector('#audioStatus')?.textContent.trim() || '',
      speaks: [...(window.__speechLog?.speaks || [])]
    }));
    check(
      'Google quota failure falls back to browser speech for the current card',
      /browser voice/i.test(quotaState.status) && quotaState.speaks.length > 0,
      JSON.stringify(quotaState)
    );
    await quotaContext.close();

    const remainderContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSpeechMock(remainderContext);
    const remainderPage = await remainderContext.newPage();
    await forceNarrationManifest(remainderPage);
    let remainderFirstId = '';
    let remainderSecondId = '';
    const remainderAudio = fs.readFileSync(path.join(DIST_DIR, 'reels', 'assets', 'music', 'easy-lemon-60-second.mp3'));
    await remainderPage.route('**/api/narration?**', async route => {
      const requestUrl = new URL(route.request().url());
      const segment = requestUrl.searchParams.get('segment') || '';
      if (segment === remainderSecondId) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'quota_exhausted', message: 'Quota exhausted.' })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: remainderAudio });
    });
    await remainderPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(remainderPage);
    const remainderFeed = await remainderPage.evaluate(async () => fetch('content.json').then(response => response.json()));
    const remainderEntry = remainderFeed.entries[0];
    remainderFirstId = remainderEntry?.narration?.title || '';
    const remainderFirstPart = remainderEntry?.narration?.parts?.[0] || {};
    remainderSecondId = remainderFirstPart.type === 'table'
      ? (remainderFirstPart.header || '')
      : (remainderFirstPart.text || '');
    await remainderPage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await remainderPage.waitForFunction(
      segmentId => document.querySelector('#narrationPlayer')?.dataset.narrationSegmentId === segmentId,
      remainderFirstId,
      { timeout: 10000 }
    );
    await remainderPage.evaluate(() => document.querySelector('#narrationPlayer')?.dispatchEvent(new Event('ended')));
    await remainderPage.waitForFunction(() => (window.__speechLog?.speaks?.length || 0) > 0, null, { timeout: 10000 });
    const remainderState = await remainderPage.evaluate(() => ({
      speaks: [...(window.__speechLog?.speaks || [])],
      status: document.querySelector('#audioStatus')?.textContent.trim() || ''
    }));
    const remainderFirstText = remainderFeed.narration.segments[remainderFirstId]?.text || '';
    const remainderSecondText = remainderFeed.narration.segments[remainderSecondId]?.text || '';
    check(
      'Provider fallback starts at the failed segment instead of replaying earlier audio',
      remainderState.speaks[0] === remainderSecondText
        && remainderState.speaks[0] !== remainderFirstText
        && /browser voice/i.test(remainderState.status),
      JSON.stringify({ remainderFirstText, remainderSecondText, remainderState })
    );
    await remainderContext.close();

    const staleContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installSpeechMock(staleContext);
    const stalePage = await staleContext.newPage();
    await forceNarrationManifest(stalePage);
    let releaseFirstRequest;
    let markFirstRequestSeen;
    const firstRequestSeen = new Promise(resolve => { markFirstRequestSeen = resolve; });
    const firstRequestGate = new Promise(resolve => { releaseFirstRequest = resolve; });
    let firstRequestHandled = false;
    const staleAudio = fs.readFileSync(path.join(DIST_DIR, 'reels', 'assets', 'music', 'easy-lemon-60-second.mp3'));
    await stalePage.route('**/api/narration?**', async route => {
      const requestUrl = new URL(route.request().url());
      const segment = requestUrl.searchParams.get('segment') || '';
      if (segment === remainderFirstId && !firstRequestHandled) {
        firstRequestHandled = true;
        markFirstRequestSeen();
        await firstRequestGate;
        try {
          await route.abort('failed');
        } catch {}
        return;
      }
      await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: staleAudio });
    });
    await stalePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(stalePage);
    await stalePage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await firstRequestSeen;
    await stalePage.click('.reel-card[aria-hidden="false"] [data-action="next"]');
    await stalePage.click('.reel-card[aria-hidden="false"] [data-action="next"]');
    releaseFirstRequest();
    await stalePage.waitForTimeout(350);
    const staleState = await stalePage.evaluate(() => ({
      speaks: [...(window.__speechLog?.speaks || [])],
      status: document.querySelector('#audioStatus')?.textContent.trim() || '',
      activeMode: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.mode || ''
    }));
    check(
      'A late failed Google request cannot narrate the previous card',
      staleState.speaks.length === 0 && staleState.activeMode === 'text' && /Google/i.test(staleState.status),
      JSON.stringify(staleState)
    );
    await staleContext.close();

    const emptyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await emptyContext.addInitScript(() => {
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [],
        done: [],
        saved: [],
        lastPosition: null,
        voice: 'random',
        speechRate: 1,
        shuffleSeed: 541385059,
        order: 'ordered',
        unit: 'all',
        savedOnly: true,
        musicVolume: 0.28,
        muted: false
      }));
    });
    const emptyPage = await emptyContext.newPage();
    const emptyErrors = [];
    emptyPage.on('console', message => {
      if (message.type() === 'error') emptyErrors.push(message.text());
    });
    emptyPage.on('pageerror', error => emptyErrors.push(error.message));
    await emptyPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForEmptyFeed(emptyPage);
    const emptyState = await emptyPage.evaluate(() => ({
      text: document.querySelector('#stageLoading')?.textContent.trim() || '',
      button: document.querySelector('#stageLoading [data-empty-action="reset"]')?.textContent.trim() || '',
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length
    }));
    check('Saved-only mode explains an empty saved feed', /No saved sections yet/i.test(emptyState.text) && emptyState.cards === 0, JSON.stringify(emptyState));
    check('Saved-only mode offers a recovery action', emptyState.button === 'Show the full feed', emptyState.button);
    await emptyPage.click('#stageLoading [data-empty-action="reset"]');
    await waitForFeed(emptyPage);
    const recoveryFocus = await emptyPage.evaluate(() => ({
      tag: document.activeElement?.tagName || '',
      className: document.activeElement?.className || '',
      text: document.activeElement?.textContent?.trim() || ''
    }));
    check('Saved-only recovery restores the full feed', await emptyPage.evaluate(() => document.querySelectorAll('.reel-card:not(.reel-measure)').length > 20));
    check('Saved-only recovery moves focus into the restored card', /H2|P/.test(recoveryFocus.tag) && /reel-card/.test(recoveryFocus.className), JSON.stringify(recoveryFocus));
    check('Saved-only empty state produces no browser errors', emptyErrors.length === 0, emptyErrors.join(' | '));
    await emptyContext.close();

    const savedOnlyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const savedOnlyPage = await savedOnlyContext.newPage();
    await savedOnlyPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(savedOnlyPage);
    const savedEntryId = await savedOnlyPage.evaluate(() => document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId || '');
    await savedOnlyPage.click('.reel-card[aria-hidden="false"] [data-action="save"]');
    await openDrawer(savedOnlyPage);
    await savedOnlyPage.click('#savedFilterButton');
    await closeDrawer(savedOnlyPage);
    await waitForRepagination(savedOnlyPage);
    const savedOnlyBeforeUnsave = await savedOnlyPage.evaluate(() => ({
      entryId: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId || '',
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
      allSameEntry: [...document.querySelectorAll('.reel-card:not(.reel-measure)')].every(card => card.dataset.entryId === document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId)
    }));
    await savedOnlyPage.click('.reel-card[aria-hidden="false"] [data-action="save"]');
    await waitForRepagination(savedOnlyPage);
    const savedOnlyAfterUnsave = await savedOnlyPage.evaluate(() => ({
      entryId: document.querySelector('.reel-card[aria-hidden="false"]')?.dataset.entryId || '',
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
      empty: /No saved sections yet/i.test(document.querySelector('#stageLoading')?.textContent || '')
    }));
    check('Saved-only mode shows the newly saved card', savedOnlyBeforeUnsave.entryId === savedEntryId && savedOnlyBeforeUnsave.cards >= 1 && savedOnlyBeforeUnsave.allSameEntry, JSON.stringify(savedOnlyBeforeUnsave));
    check('Unsaving removes the card from Saved-only mode immediately', !savedOnlyAfterUnsave.entryId && savedOnlyAfterUnsave.cards === 0 && savedOnlyAfterUnsave.empty, JSON.stringify(savedOnlyAfterUnsave));
    await savedOnlyPage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForEmptyFeed(savedOnlyPage);
    const savedOnlyReloaded = await savedOnlyPage.evaluate(() => ({
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
      saved: JSON.parse(localStorage.getItem('quickReels.state.v1') || '{}').saved || []
    }));
    check('An unsaved card cannot reappear after reload', savedOnlyReloaded.cards === 0 && !savedOnlyReloaded.saved.includes(savedEntryId), JSON.stringify(savedOnlyReloaded));
    await savedOnlyContext.close();

    const fallbackContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await fallbackContext.addInitScript(() => {
      delete window.speechSynthesis;
      delete window.SpeechSynthesisUtterance;
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [], done: [], saved: [], lastPosition: null, positions: {},
        voice: 'system', narratorVersion: 2, speechRate: 1, shuffleSeed: 541385059,
        order: 'ordered', unit: 'all', savedOnly: false, musicVolume: 0.28, muted: false
      }));
    });
    const fallbackPage = await fallbackContext.newPage();
    const fallbackErrors = [];
    fallbackPage.on('console', message => {
      if (message.type() === 'error') fallbackErrors.push(message.text());
    });
    fallbackPage.on('pageerror', error => fallbackErrors.push(error.message));
    await fallbackPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(fallbackPage);
    await activateCard(fallbackPage, '.reel-card[data-mode="text"]');
    await fallbackPage.click('.reel-card[aria-hidden="false"] [data-action="play"]');
    await fallbackPage.waitForTimeout(80);
    const fallbackState = await fallbackPage.evaluate(() => ({
      status: document.querySelector('#audioStatus').textContent.trim(),
      transcript: document.querySelector('.reel-card[aria-hidden="false"] .reel-card__body')?.textContent.trim().length || 0
    }));
    check('Unavailable speech synthesis falls back to the transcript', /unavailable/i.test(fallbackState.status) && fallbackState.transcript > 0, JSON.stringify(fallbackState));
    check('Speech fallback produces no browser errors', fallbackErrors.length === 0, fallbackErrors.join(' | '));
    await fallbackContext.close();

    const delayedVoiceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await delayedVoiceContext.addInitScript(() => {
      window.__mockVoices = [];
      const synthesis = {
        getVoices() { return [...window.__mockVoices]; },
        speak() {},
        cancel() {},
        pause() {},
        resume() {},
        addEventListener(type, handler) {
          if (type === 'voiceschanged') window.__voiceEventHandler = handler;
        }
      };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [], done: [], saved: [], lastPosition: null, positions: {},
        voice: 'test-voice-one', speechRate: 1, shuffleSeed: 541385059,
        order: 'ordered', unit: 'all', savedOnly: false, musicVolume: 0.28, muted: false
      }));
    });
    const delayedVoicePage = await delayedVoiceContext.newPage();
    await delayedVoicePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(delayedVoicePage);
    const waitingVoice = await delayedVoicePage.evaluate(() => ({
      value: document.querySelector('#voiceSelect')?.value || '',
      text: document.querySelector('#voiceSelect option[value="test-voice-one"]')?.textContent.trim() || ''
    }));
    await delayedVoicePage.evaluate(() => {
      window.__mockVoices = [{ name: 'Delayed Test Voice', lang: 'en-US', voiceURI: 'test-voice-one' }];
      window.__voiceEventHandler?.(new Event('voiceschanged'));
    });
    await delayedVoicePage.waitForTimeout(50);
    const delayedVoice = await delayedVoicePage.evaluate(() => ({
      value: document.querySelector('#voiceSelect')?.value || '',
      text: document.querySelector('#voiceSelect option[value="test-voice-one"]')?.textContent.trim() || ''
    }));
    check('Delayed voice enumeration is announced honestly', /waiting for browser/i.test(waitingVoice.text), JSON.stringify(waitingVoice));
    check('A voiceschanged event restores the saved voice selection', delayedVoice.value === 'test-voice-one' && /Delayed Test Voice/.test(delayedVoice.text), JSON.stringify(delayedVoice));
    await delayedVoiceContext.close();

    const legacyVoiceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await legacyVoiceContext.addInitScript(() => {
      window.__mockVoices = [];
      const synthesis = {
        getVoices() { return [...window.__mockVoices]; },
        speak() {}, cancel() {}, pause() {}, resume() {}
      };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [], done: [], saved: [], lastPosition: null, positions: {},
        voice: 'legacy-voice', speechRate: 1, shuffleSeed: 541385059,
        order: 'ordered', unit: 'all', savedOnly: false, musicVolume: 0.28, muted: false
      }));
    });
    const legacyVoicePage = await legacyVoiceContext.newPage();
    await legacyVoicePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(legacyVoicePage);
    await legacyVoicePage.evaluate(() => {
      window.__mockVoices = [{ name: 'Legacy Test Voice', lang: 'en-GB', voiceURI: 'legacy-voice' }];
      window.speechSynthesis.onvoiceschanged?.(new Event('voiceschanged'));
    });
    await legacyVoicePage.waitForTimeout(50);
    const legacyVoice = await legacyVoicePage.evaluate(() => ({
      value: document.querySelector('#voiceSelect')?.value || '',
      text: document.querySelector('#voiceSelect option[value="legacy-voice"]')?.textContent.trim() || ''
    }));
    check('Legacy onvoiceschanged browsers restore the saved voice', legacyVoice.value === 'legacy-voice' && /Legacy Test Voice/.test(legacyVoice.text), JSON.stringify(legacyVoice));
    await legacyVoiceContext.close();

    const staleVoiceContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await staleVoiceContext.addInitScript(() => {
      const synthesis = {
        getVoices() { return [{ name: 'Available Voice', lang: 'en-US', voiceURI: 'available-voice' }]; },
        speak() {}, cancel() {}, pause() {}, resume() {}
      };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synthesis });
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [], done: [], saved: [], lastPosition: null, positions: {},
        voice: 'missing-voice', speechRate: 1, shuffleSeed: 541385059,
        order: 'ordered', unit: 'all', savedOnly: false, musicVolume: 0.28, muted: false
      }));
    });
    const staleVoicePage = await staleVoiceContext.newPage();
    await staleVoicePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(staleVoicePage);
    const staleVoice = await staleVoicePage.evaluate(() => ({
      value: document.querySelector('#voiceSelect')?.value || '',
      text: document.querySelector('#voiceSelect option[value="missing-voice"]')?.textContent.trim() || ''
    }));
    check('A stale voice URI has an explicit unavailable fallback', staleVoice.value === 'missing-voice' && /unavailable/i.test(staleVoice.text) && !/loading/i.test(staleVoice.text), JSON.stringify(staleVoice));
    await staleVoiceContext.close();

    const delayedLoadContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await delayedLoadContext.addInitScript(() => {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (!url.includes('content.json')) return nativeFetch(input, init);
        return new Promise((resolve, reject) => {
          window.setTimeout(() => nativeFetch(input, init).then(resolve, reject), 700);
        });
      };
    });
    const delayedLoadPage = await delayedLoadContext.newPage();
    await delayedLoadPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delayedLoadPage.waitForTimeout(80);
    const delayedLoadState = await delayedLoadPage.evaluate(() => ({
      railInert: document.querySelector('#reelsRail')?.inert,
      railAriaHidden: document.querySelector('#reelsRail')?.getAttribute('aria-hidden'),
      scrimInert: document.querySelector('#railScrim')?.inert
    }));
    check('The closed mobile drawer is inert while the feed is still loading', delayedLoadState.railInert && delayedLoadState.railAriaHidden === 'true' && delayedLoadState.scrimInert, JSON.stringify(delayedLoadState));
    await waitForFeed(delayedLoadPage);
    await delayedLoadContext.close();

    const loadErrorContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const loadErrorPage = await loadErrorContext.newPage();
    await loadErrorPage.route('**/reels/content.json', route => route.abort('failed'));
    await loadErrorPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForEmptyFeed(loadErrorPage);
    const loadErrorState = await loadErrorPage.evaluate(() => ({
      role: document.querySelector('#stageLoading')?.getAttribute('role') || '',
      live: document.querySelector('#stageLoading')?.getAttribute('aria-live') || '',
      railInert: document.querySelector('#reelsRail')?.inert,
      railAriaHidden: document.querySelector('#reelsRail')?.getAttribute('aria-hidden')
    }));
    check('Feed-load failures are announced as alerts and keep the drawer inert', loadErrorState.role === 'alert' && loadErrorState.live === 'assertive' && loadErrorState.railInert && loadErrorState.railAriaHidden === 'true', JSON.stringify(loadErrorState));
    await loadErrorContext.close();

    const corruptContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const corruptPage = await corruptContext.newPage();
    const corruptErrors = [];
    corruptPage.on('console', message => {
      if (message.type() === 'error') corruptErrors.push(message.text());
    });
    corruptPage.on('pageerror', error => corruptErrors.push(error.message));
    await corruptPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(corruptPage);
    await corruptPage.evaluate(() => localStorage.setItem('quickReels.state.v1', '{broken-json'));
    await corruptPage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(corruptPage);
    const corruptState = await persistedState(corruptPage);
    check('Corrupt local storage recovers with safe defaults', corruptState.shuffleSeed === 541385059 && corruptState.speechRate === 1 && corruptState.musicVolume === 0.28 && corruptState.done.length === 0 && corruptState.saved.length === 0, JSON.stringify(corruptState));
    check('Corrupt local storage produces no browser errors', corruptErrors.length === 0, corruptErrors.join(' | '));
    await corruptContext.close();

    const staleStateContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const staleStatePage = await staleStateContext.newPage();
    await staleStatePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(staleStatePage);
    const validEntries = await staleStatePage.evaluate(async () => {
      const feed = await fetch('content.json').then(response => response.json());
      return feed.entries.map(entry => ({ id: entry.id, unit: entry.unit }));
    });
    const unitOneEntry = validEntries.find(entry => entry.unit === 1);
    const unitTwoEntry = validEntries.find(entry => entry.unit === 2);
    await staleStatePage.evaluate(({ unitOneEntry, unitTwoEntry }) => {
      const staleId = 'removed-entry-id';
      const position = (entryId, feedKey, extra = {}) => ({
        key: `${entryId}::0`,
        entryId,
        atomKey: 'stale.atom',
        atomKeys: ['stale.atom'],
        feedKey,
        updatedAt: '2020-01-01T00:00:00.000Z',
        ...extra
      });
      localStorage.setItem('quickReels.state.v1', JSON.stringify({
        version: 1,
        seen: [staleId, unitOneEntry.id],
        done: [staleId, unitOneEntry.id],
        saved: [staleId, unitOneEntry.id],
        lastPosition: position(staleId, 'ordered|all|all'),
        positions: {
          'ordered|1|all': position(unitTwoEntry.id, 'ordered|1|all'),
          'ordered|2|saved': position(unitTwoEntry.id, 'ordered|2|saved'),
          'ordered|999|all': position(unitOneEntry.id, 'ordered|999|all'),
          'ordered|all|saved': position(unitTwoEntry.id, 'ordered|all|saved'),
          'ordered|all|all': position(unitOneEntry.id, 'ordered|all|all')
        },
        voice: 'random', speechRate: 1, shuffleSeed: 541385059,
        order: 'ordered', unit: '999', savedOnly: false, musicVolume: 0.28, muted: false
      }));
    }, { unitOneEntry, unitTwoEntry });
    await staleStatePage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(staleStatePage);
    const cleanedState = await persistedState(staleStatePage);
    check('Stale entry, unit, and saved-feed references are removed', cleanedState.seen.includes(unitOneEntry.id) && !cleanedState.seen.includes('removed-entry-id') && cleanedState.unit === 'all' && Object.keys(cleanedState.positions).every(key => ['ordered|all|all'].includes(key)), JSON.stringify(cleanedState));
    check('A stale atom is reconciled to a current source boundary', cleanedState.positions['ordered|all|all']?.atomAnchor && cleanedState.positions['ordered|all|all']?.atomKey !== 'stale.atom', JSON.stringify(cleanedState.positions['ordered|all|all']));
    await staleStateContext.close();

    const unsupportedVersionContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const unsupportedVersionPage = await unsupportedVersionContext.newPage();
    await unsupportedVersionPage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(unsupportedVersionPage);
    await unsupportedVersionPage.evaluate(() => localStorage.setItem('quickReels.state.v1', JSON.stringify({
      version: 99,
      seen: ['stale'], done: ['stale'], saved: ['stale'], lastPosition: null, positions: {},
      voice: 'random', speechRate: 2, shuffleSeed: 1, order: 'ordered', unit: 'all', savedOnly: false, musicVolume: 1, muted: true
    })));
    await unsupportedVersionPage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(unsupportedVersionPage);
    const unsupportedVersionState = await persistedState(unsupportedVersionPage);
    check('Unsupported saved-state versions fall back to safe defaults', unsupportedVersionState.version === 1 && unsupportedVersionState.seen.length <= 1 && unsupportedVersionState.done.length === 0 && unsupportedVersionState.saved.length === 0 && unsupportedVersionState.speechRate === 1, JSON.stringify(unsupportedVersionState));
    await unsupportedVersionContext.close();

    const unavailableStorageContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await unavailableStorageContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
          getItem() { throw new Error('Storage unavailable'); },
          setItem() { throw new Error('Storage unavailable'); },
          removeItem() { throw new Error('Storage unavailable'); },
          clear() { throw new Error('Storage unavailable'); },
          key() { throw new Error('Storage unavailable'); },
          length: 0
        }
      });
    });
    const unavailableStoragePage = await unavailableStorageContext.newPage();
    const unavailableStorageErrors = [];
    unavailableStoragePage.on('console', message => {
      if (message.type() === 'error') unavailableStorageErrors.push(message.text());
    });
    unavailableStoragePage.on('pageerror', error => unavailableStorageErrors.push(error.message));
    await unavailableStoragePage.goto(`${baseUrl}/reels/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForFeed(unavailableStoragePage);
    await unavailableStoragePage.click('#themeToggle');
    const unavailableStorageState = await unavailableStoragePage.evaluate(() => ({
      cards: document.querySelectorAll('.reel-card:not(.reel-measure)').length,
      progressNote: document.querySelector('#progressNote')?.textContent.trim() || ''
    }));
    check('Unavailable local storage does not break the feed', unavailableStorageState.cards > 20, JSON.stringify(unavailableStorageState));
    check('Unavailable local storage never claims progress was saved', /cannot be saved/i.test(unavailableStorageState.progressNote) && !/saved on this device/i.test(unavailableStorageState.progressNote), unavailableStorageState.progressNote);
    check('Unavailable local storage produces no browser errors', unavailableStorageErrors.length === 0, unavailableStorageErrors.join(' | '));
    await unavailableStorageContext.close();

    check('No browser console or page errors', errors.length === 0, errors.join(' | '));

    console.log(`\nQuick Reels checks: ${passed} passed, ${failed} failed.`);
    if (failed) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    if (errors.length) errors.forEach(message => console.error(`BROWSER  ${message}`));
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
