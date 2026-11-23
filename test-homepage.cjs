const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  let passed = 0;
  let failed = 0;

  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  function check(name, condition) {
    if (condition) {
      passed++;
      console.log(`PASS  ${name}`);
    } else {
      failed++;
      console.log(`FAIL  ${name}`);
    }
  }

  async function wheelTo(selector) {
    const { width, height } = page.viewportSize();
    await page.mouse.move(width / 2, height / 2);

    for (let attempt = 0; attempt < 10; attempt++) {
      const state = await page.$eval(selector, (element, scrollerSelector) => {
        const scroller = document.querySelector(scrollerSelector);
        const scrollerRect = scroller.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return {
          top: Math.round(elementRect.top - scrollerRect.top),
          current: Math.round(scroller.scrollTop),
          target: Math.round(scroller.scrollTop + elementRect.top - scrollerRect.top - 10)
        };
      }, '.home-scroll');

      if (Math.abs(state.top - 10) <= 18) return state;
      const distance = state.target - state.current;
      if (Math.abs(distance) < 5) break;
      const step = Math.sign(distance) * Math.min(1200, Math.max(900, Math.abs(distance)));
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(700);
    }

    return page.$eval(selector, (element, scrollerSelector) => {
      const scroller = document.querySelector(scrollerSelector);
      const scrollerRect = scroller.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      return {
        top: Math.round(elementRect.top - scrollerRect.top),
        current: Math.round(scroller.scrollTop),
        target: Math.round(scroller.scrollTop + elementRect.top - scrollerRect.top - 10)
      };
    }, '.home-scroll');
  }

  async function snapPositions(selectors) {
    return page.evaluate(selectorList => {
      const scroller = document.querySelector('.home-scroll');
      const scrollerTop = scroller.getBoundingClientRect().top;
      return selectorList.map(selector => {
        const element = document.querySelector(selector);
        const rect = element.getBoundingClientRect();
        return {
          selector,
          top: Math.round(rect.top - scrollerTop),
          bottom: Math.round(rect.bottom - scrollerTop),
          endOffset: Math.round(rect.bottom - scroller.getBoundingClientRect().bottom),
          height: Math.round(rect.height),
          align: getComputedStyle(element).scrollSnapAlign,
          stop: getComputedStyle(element).scrollSnapStop
        };
      });
    }, selectors);
  }

  function isSnapped(positions) {
    return positions.some(position =>
      Math.abs(position.top - 10) <= 18 ||
      (position.align === 'end' && Math.abs(position.endOffset) <= 18)
    );
  }

  try {
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);

    const desktop = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const scroller = document.querySelector('.home-scroll');
      const route = document.querySelector('.rail-viewport');
      const hero = document.querySelector('.rail-hero');
      const wheel = document.querySelector('.spin-section');
      const panelSelectors = ['.rail-hero', '.spin-section', '.doors', '.pattern'];
      const panels = panelSelectors.map(selector => {
        const element = document.querySelector(selector);
        const rect = element.getBoundingClientRect();
        return {
          selector,
          directChild: element.parentElement === scroller,
          snapAlign: getComputedStyle(element).scrollSnapAlign,
          snapStop: getComputedStyle(element).scrollSnapStop,
          height: Math.round(rect.height)
        };
      });
      const shipFigurehead = document.querySelector('.rail-traveller .ship-figurehead');
      const todayTick = document.querySelector('.rail-tick.is-today');
      const shipRect = shipFigurehead.getBoundingClientRect();
      const todayRect = todayTick.getBoundingClientRect();
      const routeCards = [...document.querySelectorAll('.rail-station.is-ours .station-card')];
      const cardRects = routeCards.map(element => element.getBoundingClientRect());
      let routeCardOverlaps = 0;
      for (let i = 0; i < cardRects.length; i++) {
        for (let j = i + 1; j < cardRects.length; j++) {
          const a = cardRects[i];
          const b = cardRects[j];
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX > 2 && overlapY > 2) routeCardOverlaps++;
        }
      }
      const beachRect = document.querySelector('.beach-art').getBoundingClientRect();
      const rulerRect = document.querySelector('.rail-tick.is-today').getBoundingClientRect();

      return {
        title: document.title,
        h1Count: document.querySelectorAll('h1').length,
        h1Hidden: h1?.classList.contains('sr-only') && !visible(h1),
        forbiddenVisibleLine: [...document.querySelectorAll('p')].some(element =>
          visible(element) && element.textContent.includes('BIM 8th-semester exam prep')
        ),
        examStations: document.querySelectorAll('.rail-station.is-ours').length,
        filmStations: document.querySelectorAll('.rail-station.is-movie').length,
        routeNames: [...document.querySelectorAll('.rail-station.is-ours .station-name')].map(element => element.textContent.trim()),
        routeContainsCode: routeCards.some(element => /\bIT\s*\d{3}\b/.test(element.textContent)),
        routeLineCount: document.querySelectorAll('.rail-line').length,
        routeTrailCount: document.querySelectorAll('.rail-route-trail').length,
        islandCount: document.querySelectorAll('.station-dot svg').length,
        beachVisible: getComputedStyle(document.querySelector('.beach-art')).display !== 'none' && beachRect.height > 40,
        rulerOnBeach: rulerRect.top >= beachRect.top && rulerRect.bottom <= beachRect.bottom,
        routeCardOverlaps,
        hullTrimCount: document.querySelectorAll('.ship path[fill="#f3e3c3"]').length,
        shipArrivalOffset: Math.round(Math.abs(
          (shipRect.left + shipRect.width / 2) - (todayRect.left + todayRect.width / 2)
        )),
        shipInitialY: Math.round(shipRect.top + shipRect.height / 2),
        shipEntrance: getComputedStyle(document.querySelector('.rail-traveller .ship-wrap')).animationName,
        shipOutsideRouteViewport: !route.contains(document.querySelector('.rail-traveller')),
        rootSnapType: getComputedStyle(document.documentElement).scrollSnapType,
        scrollerSnapType: getComputedStyle(scroller).scrollSnapType,
        scrollerOverflowY: getComputedStyle(scroller).overflowY,
        scrollerScrollable: scroller.scrollHeight > scroller.clientHeight,
        scrollerHeight: scroller.clientHeight,
        initialScrollerScrollTop: Math.round(scroller.scrollTop),
        initialWindowScrollY: Math.round(scrollY),
        headerOutsideScroller: !scroller.contains(document.querySelector('.site-header')),
        routeSnapType: getComputedStyle(route).scrollSnapType,
        wheelImmediatelyAfterHero: hero.nextElementSibling === wheel,
        panels,
        clock: document.querySelector('.header-clock').textContent.trim().replace(/\s+/g, ' '),
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        primaryNoteActions: document.querySelectorAll('.door-primary').length,
        undersizedNoteActions: [...document.querySelectorAll('.door-primary')].filter(element =>
          element.getBoundingClientRect().height < 44
        ).length,
        wheelPresent: !!document.querySelector('#wheel')
      };
    });

    check('Homepage title identifies the timetable and notes', desktop.title === 'BIM 8th Semester Exam Timetable & Study Notes');
    check('Exactly one H1 exists', desktop.h1Count === 1);
    check('H1 is visually hidden', desktop.h1Hidden);
    check('Rejected visible identification line is absent', !desktop.forbiddenVisibleLine);
    check('Four exam stations are present', desktop.examStations === 4);
    check('Film stop remains in the route', desktop.filmStations === 1);
    check('Route uses subject names instead of codes', JSON.stringify(desktop.routeNames) === JSON.stringify(['Entrepreneurship', 'Digital Economy', 'Business Intelligence', 'Cloud Computing']) && !desktop.routeContainsCode);
    check('Blue exam-route connector is removed', desktop.routeLineCount === 0);
    check('Dashed nautical route is present', desktop.routeTrailCount === 1);
    check('Five beach islands are present', desktop.islandCount === 5);
    check('Beach foreground is visible', desktop.beachVisible);
    check('Date ruler rests on the beach', desktop.rulerOnBeach);
    check('Subject cards do not overlap', desktop.routeCardOverlaps === 0);
    check('Straight hull trim line is removed', desktop.hullTrimCount === 0);
    check('Ship stops at the Today marker', desktop.shipArrivalOffset <= 3);
    check('Ship uses its authored sail-in animation', desktop.shipEntrance === 'sailIn');
    check('Ship is not clipped by the horizontal route viewport', desktop.shipOutsideRouteViewport);
    check('Timetable route does not snap horizontally', !desktop.routeSnapType.includes('x'));
    check('Root page does not own vertical snapping', !desktop.rootSnapType.includes('y'));
    check('Dedicated homepage scroller uses vertical mandatory snapping', desktop.scrollerSnapType.includes('y') && desktop.scrollerSnapType.includes('mandatory'));
    check('Dedicated homepage scroller owns vertical overflow', desktop.scrollerOverflowY === 'auto');
    check('Dedicated homepage scroller is scrollable', desktop.scrollerScrollable);
    check('Homepage initially opens at the hero', desktop.initialScrollerScrollTop === 0 && desktop.initialWindowScrollY === 0);
    check('Header stays outside the homepage scroller', desktop.headerOutsideScroller);
    check('Hero, wheel, notes, and blueprint are direct scroller panels', desktop.panels.every(panel => panel.directChild));
    check('Every homepage panel snaps at its start', desktop.panels.every(panel => panel.snapAlign === 'start'));
    check('Every homepage panel uses normal snap stopping', desktop.panels.every(panel => panel.snapStop === 'normal'));
    check('Every homepage panel fills the available viewport height', desktop.panels.every(panel => panel.height >= desktop.scrollerHeight - 2));
    check('Study wheel remains immediately after the hero', desktop.wheelImmediatelyAfterHero);
    check('Countdown uses calendar days only', /^(IT 248 (Today|\d+ days?)|Done)$/.test(desktop.clock) && !desktop.clock.includes(':'));
    check('Desktop page has no horizontal overflow', desktop.pageOverflow === 0);
    check('Each subject has one Open notes action', desktop.primaryNoteActions === 4);
    check('Open notes actions meet 44px', desktop.undersizedNoteActions === 0);
    check('Study wheel remains present', desktop.wheelPresent);

    await page.$eval('.rail-viewport', element => {
      element.scrollTo({ left: 420, behavior: 'instant' });
    });
    await page.waitForTimeout(150);
    const routeAlignment = await page.evaluate(() => {
      const ship = document.querySelector('.rail-traveller .ship-figurehead').getBoundingClientRect();
      const today = document.querySelector('.rail-tick.is-today').getBoundingClientRect();
      return Math.round(Math.abs(
        (ship.left + ship.width / 2) - (today.left + today.width / 2)
      ));
    });
    check('Ship follows Today during horizontal route scrolling', routeAlignment <= 3);
    await page.$eval('.rail-viewport', element => {
      element.scrollTo({ left: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(150);

    const desktopSnapTargets = ['.rail-hero', '.spin-section', '.doors', '.pattern', '.page-foot'];
    const desktopViewport = page.viewportSize();
    await page.mouse.move(desktopViewport.width / 2, desktopViewport.height / 2);

    await page.$eval('.home-scroll', element => { element.scrollTop = 0; });
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(900);
    const betweenPanelPositions = await snapPositions(desktopSnapTargets);
    check('Vertical scrolling never rests between homepage panels', isSnapped(betweenPanelPositions));

    await page.$eval('.home-scroll', element => { element.scrollTop = 0; });
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 1900);
    await page.waitForTimeout(900);
    const fastScrollTop = await page.$eval('.home-scroll', element => element.scrollTop);
    const wheelScrollTop = await page.$eval('.spin-section', element => {
      const scroller = document.querySelector('.home-scroll');
      const scrollerRect = scroller.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      return Math.round(scroller.scrollTop + elementRect.top - scrollerRect.top);
    });
    check('A fast scroll can cross more than one panel', fastScrollTop > wheelScrollTop);

    const wheelSnap = await wheelTo('.spin-section');
    check('Vertical scrolling settles on the wheel panel', Math.abs(wheelSnap.top - 10) <= 18);
    const anchoredShip = await page.evaluate(() => {
      const figurehead = document.querySelector('.rail-traveller .ship-figurehead');
      const rect = figurehead.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      return {
        y: Math.round(y),
        coveredByWheel: !!topElement?.closest('.spin-section')
      };
    });
    check('Ship stays anchored while the wheel scrolls over it', Math.abs(anchoredShip.y - desktop.shipInitialY) <= 3);
    check('Lower study content covers the anchored ship', anchoredShip.coveredByWheel);
    const wheelPanelScrollTop = await page.$eval('.home-scroll', element => element.scrollTop);
    await page.mouse.wheel(0, -450);
    await page.waitForTimeout(900);
    const upwardScrollTop = await page.$eval('.home-scroll', element => element.scrollTop);
    const upwardPositions = await snapPositions(desktopSnapTargets);
    check('Scrolling upward from the wheel reaches the hero', upwardScrollTop < wheelPanelScrollTop && Math.abs(upwardPositions[0].top - 10) <= 18);
    const notesSnap = await wheelTo('.doors');
    check('Vertical scrolling settles on the notes panel', Math.abs(notesSnap.top - 10) <= 18);
    const anchoredShipAtNotes = await page.evaluate(() => {
      const rect = document.querySelector('.rail-traveller .ship-figurehead').getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      return {
        y: Math.round(y),
        coveredByNotes: !!topElement?.closest('.doors')
      };
    });
    check('Ship stays anchored while the notes panel scrolls over it', Math.abs(anchoredShipAtNotes.y - desktop.shipInitialY) <= 3);
    check('Notes content covers the anchored ship', anchoredShipAtNotes.coveredByNotes);
    const blueprintSnap = await wheelTo('.pattern');
    check('Vertical scrolling settles on the blueprint panel', Math.abs(blueprintSnap.top - 10) <= 18);
    const anchoredShipAtBlueprint = await page.evaluate(() => {
      const rect = document.querySelector('.rail-traveller .ship-figurehead').getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      return {
        y: Math.round(y),
        coveredByBlueprint: !!topElement?.closest('.pattern')
      };
    });
    check('Ship stays anchored while the blueprint scrolls over it', Math.abs(anchoredShipAtBlueprint.y - desktop.shipInitialY) <= 3);
    check('Blueprint content covers the anchored ship', anchoredShipAtBlueprint.coveredByBlueprint);
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(900);
    const footerState = await page.$eval('.page-foot', element => {
      const scroller = document.querySelector('.home-scroll');
      const scrollerRect = scroller.getBoundingClientRect();
      const footerRect = element.getBoundingClientRect();
      return {
        top: Math.round(footerRect.top - scrollerRect.top),
        bottom: Math.round(footerRect.bottom - scrollerRect.top),
        clientHeight: scroller.clientHeight
      };
    });
    check('The closing footer remains reachable', footerState.top < footerState.clientHeight && Math.abs(footerState.bottom - footerState.clientHeight) <= 18);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const mobile = await page.evaluate(() => {
      const scroller = document.querySelector('.home-scroll');
      scroller.scrollTop = 0;
      const ship = document.querySelector('.mobile-ship .ship');
      const shipFigurehead = document.querySelector('.mobile-ship .ship-figurehead');
      const shipRect = shipFigurehead.getBoundingClientRect();
      const todayRect = document.querySelector('.rail-origin').getBoundingClientRect();
      const route = document.querySelector('.rail-viewport');
      const panels = ['.rail-hero', '.spin-section', '.doors', '.pattern'].map(selector => {
        const element = document.querySelector(selector);
        return {
          directChild: element.parentElement === scroller,
          snapAlign: getComputedStyle(element).scrollSnapAlign,
          height: Math.round(element.getBoundingClientRect().height)
        };
      });
      const contentTargets = [
        '.doors > .section-head',
        '.doors > .doors-list > .door',
        '.pattern > .section-head',
        '.pattern .marks-block',
        '.pattern .rules-block'
      ].map(selector => {
        const element = document.querySelector(selector);
        return {
          selector,
          snapAlign: getComputedStyle(element).scrollSnapAlign,
          snapStop: getComputedStyle(element).scrollSnapStop,
          height: Math.round(element.getBoundingClientRect().height)
        };
      });
      const footer = document.querySelector('.page-foot');
      return {
        shipVisible: getComputedStyle(ship).display !== 'none' && ship.getBoundingClientRect().width > 200,
        shipInitialY: Math.round(shipRect.top + shipRect.height / 2),
        shipArrivalOffset: Math.round(Math.abs(
          (shipRect.left + shipRect.width / 2) - (todayRect.left + todayRect.width / 2)
        )),
        shipEntrance: getComputedStyle(document.querySelector('.mobile-ship .ship-wrap')).animationName,
        routeScrollable: route.scrollWidth > route.clientWidth,
        routeSnapType: getComputedStyle(route).scrollSnapType,
        scrollerSnapType: getComputedStyle(scroller).scrollSnapType,
        scrollerHeight: scroller.clientHeight,
        panels,
        contentTargets,
        footerSnapAlign: getComputedStyle(footer).scrollSnapAlign,
        footerHeight: Math.round(footer.getBoundingClientRect().height),
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        navToggleVisible: getComputedStyle(document.querySelector('.mobile-nav-toggle')).display !== 'none'
      };
    });

    check('Mobile ship remains visible', mobile.shipVisible);
    check('Mobile ship stops at the Today marker', mobile.shipArrivalOffset <= 3);
    check('Mobile ship uses its authored sail-in animation', mobile.shipEntrance === 'sailIn');
    check('Mobile route remains horizontally scrollable', mobile.routeScrollable);
    check('Mobile route does not snap horizontally', !mobile.routeSnapType.includes('x'));
    check('Mobile uses mandatory vertical snapping', mobile.scrollerSnapType.includes('y') && mobile.scrollerSnapType.includes('mandatory'));
    check('Mobile homepage panels remain direct scroller children', mobile.panels.every(panel => panel.directChild));
    check('Mobile hero and wheel remain full-height snap panels', mobile.panels.slice(0, 2).every(panel => panel.snapAlign === 'start'));
    check('Mobile tall panels expose smaller content targets', mobile.panels.slice(2).every(panel => panel.snapAlign === 'none'));
    check('Every mobile content target snaps at its start', mobile.contentTargets.every(target => target.snapAlign === 'start' && target.snapStop === 'normal'));
    check('Every mobile content target fits the viewport', mobile.contentTargets.every(target => target.height <= mobile.scrollerHeight));
    check('Mobile closing footer remains a reachable final reel', mobile.footerSnapAlign === 'end' && mobile.footerHeight <= mobile.scrollerHeight);
    check('Mobile homepage panels fill the available viewport height', mobile.panels.every(panel => panel.height >= mobile.scrollerHeight - 2));
    check('Mobile page has no horizontal overflow', mobile.pageOverflow === 0);
    check('Mobile navigation control is visible', mobile.navToggleVisible);

    const mobileSnapTargets = [
      '.rail-hero',
      '.spin-section',
      '.doors > .section-head',
      '.doors > .doors-list > .door:nth-child(1)',
      '.doors > .doors-list > .door:nth-child(2)',
      '.doors > .doors-list > .door:nth-child(3)',
      '.doors > .doors-list > .door:nth-child(4)',
      '.pattern > .section-head',
      '.pattern .marks-block',
      '.pattern .rules-block',
      '.page-foot'
    ];

    const mobileWheelSnap = await wheelTo('.spin-section');
    check('Mobile vertical scrolling settles on the wheel panel', Math.abs(mobileWheelSnap.top - 10) <= 18);
    const mobileAnchoredShip = await page.evaluate(() => {
      const figurehead = document.querySelector('.mobile-ship .ship-figurehead');
      const rect = figurehead.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      return {
        y: Math.round(y),
        coveredByWheel: !!topElement?.closest('.spin-section')
      };
    });
    check('Mobile ship stays anchored under scrolling content', Math.abs(mobileAnchoredShip.y - mobile.shipInitialY) <= 3);
    check('Mobile study content covers the anchored ship', mobileAnchoredShip.coveredByWheel);
    const mobileWheelScrollTop = await page.$eval('.home-scroll', element => element.scrollTop);
    await page.mouse.wheel(0, -900);
    await page.waitForTimeout(900);
    const mobileUpwardPositions = await snapPositions(mobileSnapTargets);
    check('Mobile scrolling upward from the wheel reaches the hero', Math.abs(mobileUpwardPositions[0].top - 10) <= 18);

    await page.$eval('.home-scroll', element => { element.scrollTop = 0; });
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(900);
    const mobileBetweenPositions = await snapPositions(mobileSnapTargets);
    check('Mobile scrolling never rests between content reels', isSnapped(mobileBetweenPositions));

    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(900);
    const mobileCardPositions = await snapPositions(mobileSnapTargets);
    const firstSubjectCard = mobileCardPositions.find(position => position.selector.includes(':nth-child(1)'));
    check('Mobile subject cards remain independently reachable', Math.abs(firstSubjectCard.top - 10) <= 18);
    const mobileShipAtSubjectCard = await page.evaluate(() => {
      const rect = document.querySelector('.mobile-ship .ship-figurehead').getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      return {
        y: Math.round(y),
        coveredBySubject: !!topElement?.closest('.doors')
      };
    });
    check('Mobile ship stays anchored over the subject cards', Math.abs(mobileShipAtSubjectCard.y - mobile.shipInitialY) <= 3);
    check('Mobile subject content covers the anchored ship', mobileShipAtSubjectCard.coveredBySubject);

    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(900);
    const mobileFooterPositions = await snapPositions(mobileSnapTargets);
    const mobileFooter = mobileFooterPositions.find(position => position.selector === '.page-foot');
    check('Mobile closing footer remains visible at the final reel', Math.abs(mobileFooter.endOffset) <= 18);

    await page.click('.mobile-nav-toggle');
    check('Mobile navigation opens', await page.getAttribute('.mobile-nav-toggle', 'aria-expanded') === 'true');
    check('Opened mobile navigation is visible', await page.$eval('#siteNav', element => getComputedStyle(element).display !== 'none'));
    await page.keyboard.press('Escape');
    check('Escape closes mobile navigation', await page.getAttribute('.mobile-nav-toggle', 'aria-expanded') === 'false');
    check('Escape returns focus to the menu button', await page.evaluate(() => document.activeElement?.classList.contains('mobile-nav-toggle')));
    check('No browser console errors', errors.length === 0);

    console.log(`\nHomepage checks: ${passed} passed, ${failed} failed.`);
    if (errors.length) errors.forEach(error => console.error(`ERROR  ${error}`));
    if (failed) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
