const { chromium, devices } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const CHECK_GROUP = process.env.MOBILE_CHECK || 'all';

function shouldRun(group) {
  return CHECK_GROUP === 'all' || CHECK_GROUP === group;
}

async function dispatchSwipe(page, x, y, deltaX, deltaY, steps = 18) {
  const client = await page.context().newCDPSession(page);
  const point = (px, py) => ({ x: px, y: py, radiusX: 2, radiusY: 2, force: 1, id: 1 });

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [point(x, y)]
  });

  for (let step = 1; step <= steps; step += 1) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(
        x + deltaX * step / steps,
        y + deltaY * step / steps
      )]
    });
    await page.waitForTimeout(16);
  }

  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function topHitTarget(page, selector) {
  return page.$eval(selector, element => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x,
      y,
      tag: hit?.tagName || null,
      className: typeof hit?.className === 'string' ? hit.className : '',
      inside: !!(hit && (hit === element || element.contains(hit)))
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await context.newPage();
  const errors = [];
  let passed = 0;
  let failed = 0;

  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  function check(name, condition) {
    if (condition) {
      passed += 1;
      console.log(`PASS  ${name}`);
    } else {
      failed += 1;
      console.log(`FAIL  ${name}`);
    }
  }

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    if (shouldRun('menu')) {
      // MOB-01: the open menu must own the hit targets for all visible links.
      await page.click('.mobile-nav-toggle');
      await page.waitForFunction(() => document.querySelector('.mobile-nav-toggle')?.getAttribute('aria-expanded') === 'true', { timeout: 5000 });
      check('Mobile navigation opens', await page.getAttribute('.mobile-nav-toggle', 'aria-expanded') === 'true');

      const menuHitTargets = await page.$$eval('#siteNav a', links => links.map(link => {
        const rect = link.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(x, y);
        return {
          text: link.textContent.trim(),
          inside: !!(hit && (hit === link || link.contains(hit)))
        };
      }));
      check('Every visible mobile-nav link owns its hit target', menuHitTargets.every(target => target.inside));

      // Confirm a real activation works, rather than only checking hit testing.
      await page.waitForSelector('#siteNav a[href="reels/"]', { state: 'visible', timeout: 5000 });
      const menuUrlBefore = page.url();
      await page.click('#siteNav a[href="reels/"]');
      await page.waitForTimeout(500);
      check('A visible mobile-nav link activates', page.url() !== menuUrlBefore && page.url().includes('/reels/'));
    }

    if (shouldRun('swipe')) {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);

      // MOB-02/03: verify that the homepage scroller is configured for vertical
      // touch scrolling and that the horizontal route remains horizontally
      // scrollable via touch.
      await page.$eval('.home-scroll', element => { element.scrollTop = 0; });
      await page.$eval('.rail-viewport', element => { element.scrollLeft = 0; });
      await page.waitForTimeout(500);

      const routeRect = await page.$eval('.rail-viewport', element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });
      const routeX = routeRect.left + 20;
      const routeY = routeRect.top + 30;

      // Static checks for vertical touch scrolling configuration.
      const verticalConfig = await page.evaluate(() => {
        const scroller = document.querySelector('.home-scroll');
        const style = getComputedStyle(scroller);
        return {
          overflowY: style.overflowY,
          touchAction: style.touchAction,
          scrollable: scroller.scrollHeight > scroller.clientHeight
        };
      });
      check('Homepage scroller allows vertical overflow', verticalConfig.overflowY === 'auto');
      check('Homepage scroller touch-action includes pan-y', verticalConfig.touchAction.includes('pan-y'));
      check('Homepage scroller is vertically scrollable', verticalConfig.scrollable);

      // Horizontal swipe from route area (touch).
      await dispatchSwipe(page, routeX, routeY, -240, 0);
      await page.waitForTimeout(500);
      const routeScrollLeft = await page.$eval('.rail-viewport', element => element.scrollLeft);
      check('Horizontal swipe from route area scrolls the route', routeScrollLeft > 0);
    }

    if (shouldRun('cards')) {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);

      // MOB-04: first subject route card should be at least partially visible
      // in the horizontal route viewport without scrolling.
      const visibility = await page.evaluate(() => {
        const viewport = document.querySelector('.rail-viewport');
        const firstStation = document.querySelector('.rail-station.is-ours');
        if (!viewport || !firstStation) return { visible: false, reason: 'missing elements' };
        const vp = viewport.getBoundingClientRect();
        const card = firstStation.querySelector('.station-card');
        if (!card) return { visible: false, reason: 'no card' };
        const cr = card.getBoundingClientRect();
        // Card intersects viewport horizontally
        const intersects = cr.right > vp.left && cr.left < vp.right;
        return { visible: intersects, cardLeft: cr.left, cardRight: cr.right, vpLeft: vp.left, vpRight: vp.right };
      });
      check('First subject card is horizontally visible', visibility.visible);
    }

    console.log(`\nMobile interaction checks: ${passed} passed, ${failed} failed.`);
    if (errors.length) errors.forEach(error => console.error(`ERROR  ${error}`));
    if (failed || errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
