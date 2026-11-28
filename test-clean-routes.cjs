const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const SUBJECT_IDS = ['bi', 'de', 'cloud', 'entrepreneurship'];
const RESOURCE_PAGES = ['model-question', 'model-question-answers', 'board-paper-2026', 'question-bank'];
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

function collectRoutes() {
  const routes = [];

  for (const subject of SUBJECT_IDS) {
    const subjectDir = path.join(DIST_DIR, subject);
    if (!fs.existsSync(subjectDir)) continue;

    const unitFiles = fs.readdirSync(subjectDir)
      .filter(file => /^unit-\d+\.html$/.test(file))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

    const resourceFiles = RESOURCE_PAGES
      .map(page => `${page}.html`)
      .filter(file => fs.existsSync(path.join(subjectDir, file)));

    for (const canonicalFile of [...unitFiles, ...resourceFiles]) {
      routes.push({
        subject,
        route: path.basename(canonicalFile, '.html'),
        canonicalFile
      });
    }
  }

  return routes;
}

function createStaticServer({ cleanHtmlUrls = false } = {}) {
  const distRoot = path.resolve(DIST_DIR);

  return http.createServer((request, response) => {
    let requestUrl;
    let pathname;

    try {
      requestUrl = new URL(request.url, 'http://127.0.0.1');
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }

    const relativePath = pathname.replace(/^\/+/, '');
    let filePath = path.resolve(distRoot, relativePath);

    if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    if (cleanHtmlUrls && /\.html$/i.test(pathname)) {
      const cleanPath = pathname.replace(/\.html$/i, '');
      response.writeHead(301, { Location: `${cleanPath}${requestUrl.search}` });
      response.end();
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (!cleanHtmlUrls && !pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${pathname}/${requestUrl.search}` });
        response.end();
        return;
      }
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('File not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function hasUnresolvedRouteUrl(pageHtml) {
  const urlAttribute = /<(?:a|link|script|img|source|iframe|video|audio|embed|object)\b[^>]*?\b(?:href|src)\s*=\s*(["'])([^"']*)\1/gi;

  for (const match of pageHtml.matchAll(urlAttribute)) {
    const value = match[2];
    if (value && !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return true;
  }

  return false;
}

async function startServer(options) {
  const server = createStaticServer(options);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    server,
    baseUrl: `http://127.0.0.1:${server.address().port}`
  };
}

(async () => {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ is missing. Run npm run build first.');
    process.exitCode = 1;
    return;
  }

  const routes = collectRoutes();
  const results = { pass: 0, fail: 0, details: [] };
  const check = (name, condition) => {
    if (condition) {
      results.pass++;
      results.details.push(`✅ ${name}`);
    } else {
      results.fail++;
      results.details.push(`❌ ${name}`);
    }
  };

  check('Clean routes were generated', routes.length > 0);

  for (const route of routes) {
    const canonicalPath = path.join(DIST_DIR, route.subject, route.canonicalFile);
    const aliasPath = path.join(DIST_DIR, route.subject, route.route, 'index.html');
    const aliasExists = fs.existsSync(aliasPath);
    const aliasBody = aliasExists ? fs.readFileSync(aliasPath, 'utf8') : '';
    const containsUnresolvedUrl = hasUnresolvedRouteUrl(aliasBody);

    check(`${route.subject}/${route.route} canonical page exists`, fs.existsSync(canonicalPath));
    check(`${route.subject}/${route.route} route alias exists`, aliasExists);
    check(`${route.subject}/${route.route} alias contains the generated page`, aliasBody.includes('class="markdown-body"'));
    check(`${route.subject}/${route.route} alias uses root-relative links`, !containsUnresolvedUrl);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let activeRoute = 'startup';
  const browserErrors = [];

  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(`${activeRoute}: ${message.text()}`);
  });
  page.on('pageerror', error => browserErrors.push(`${activeRoute}: ${error.message}`));
  page.on('requestfailed', request => {
    browserErrors.push(`${activeRoute}: ${request.url()} failed (${request.failure()?.errorText || 'unknown error'})`);
  });

  async function auditRoute(baseUrl, route, serverMode) {
    activeRoute = `${serverMode}:${route.subject}/${route.route}`;
    const cleanPaths = [
      `/${route.subject}/${route.route}`,
      `/${route.subject}/${route.route}/`
    ];
    const canonicalPath = `/${route.subject}/${route.canonicalFile}`;

    try {
      await page.goto(`${baseUrl}/${route.subject}/${route.route}`, {
        waitUntil: 'commit',
        timeout: 15000
      });
      await page.waitForURL(url => cleanPaths.includes(url.pathname), {
        waitUntil: 'commit',
        timeout: 10000
      });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await page.evaluate(async () => {
        if (document.fonts) await document.fonts.ready;
      });

      const title = await page.title();
      const content = await page.locator('.markdown-body').innerText();
      const finalUrl = new URL(page.url());

      check(`${activeRoute} clean route renders`, cleanPaths.includes(finalUrl.pathname));
      check(`${activeRoute} renders a titled page`, title.includes('Worst Generation'));
      check(`${activeRoute} renders study content`, content.trim().length > 100);

      await page.goto(`${baseUrl}${canonicalPath}`, {
        waitUntil: 'commit',
        timeout: 15000
      });
      const acceptedCanonicalPaths = serverMode === 'python'
        ? [canonicalPath]
        : cleanPaths;
      await page.waitForURL(url => acceptedCanonicalPaths.includes(url.pathname), {
        waitUntil: 'commit',
        timeout: 10000
      });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await page.evaluate(async () => {
        if (document.fonts) await document.fonts.ready;
      });

      const canonicalContent = await page.locator('.markdown-body').innerText();
      check(`${activeRoute} canonical route renders without a redirect loop`, canonicalContent.trim().length > 100);
    } catch (error) {
      check(`${activeRoute} resolves and renders`, false);
      browserErrors.push(`${activeRoute}: ${error.message}`);
    }
  }

  const pythonServer = await startServer({ cleanHtmlUrls: false });
  for (const route of routes) {
    await auditRoute(pythonServer.baseUrl, route, 'python');
  }

  const serveServer = await startServer({ cleanHtmlUrls: true });
  for (const route of routes) {
    await auditRoute(serveServer.baseUrl, route, 'serve');
  }

  activeRoute = 'serve:bi/unit-1-query-and-fragment';
  try {
    await page.goto(`${serveServer.baseUrl}/bi/unit-1?source=route-test#coverage-map`, {
      waitUntil: 'commit',
      timeout: 15000
    });
    await page.waitForURL(url => (
      url.pathname === '/bi/unit-1' &&
      url.searchParams.get('source') === 'route-test' &&
      url.hash === '#coverage-map'
    ), { waitUntil: 'commit', timeout: 10000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    await page.evaluate(async () => {
      if (document.fonts) await document.fonts.ready;
    });

    const unitState = await page.evaluate(() => {
      const content = document.querySelector('.markdown-body')?.innerText || '';
      const mojibakeMarkers = ['\u00e2\u20ac', '\u00f0\u0178', '\u00c2\u00a0'];
      const stylesheet = document.querySelector('link[rel="stylesheet"][href="/styles.css"]');
      const sidebarLink = document.querySelector('.unit-list a[href="/bi/unit-2.html"]');
      return {
        hasLearnInMotion: content.includes('Learn in Motion'),
        hasMotionDemo: Boolean(document.querySelector('.learn-motion-demo')),
        hasMotionSvg: Boolean(document.querySelector('#ctpd-svg')),
        hasMojibake: mojibakeMarkers.some(marker => content.includes(marker)),
        hasRootStylesheet: Boolean(stylesheet),
        hasRootSidebarLink: Boolean(sidebarLink)
      };
    });

    check('BI Unit 1 clean route preserves query and fragment', true);
    check('BI Unit 1 clean route renders Learn in Motion', unitState.hasLearnInMotion);
    check('BI Unit 1 clean route renders CTPD demo', unitState.hasMotionDemo && unitState.hasMotionSvg);
    check('BI Unit 1 clean route has no mojibake', !unitState.hasMojibake);
    check('BI Unit 1 clean route loads the shared stylesheet', unitState.hasRootStylesheet);
    check('BI Unit 1 clean route keeps sibling-unit links valid', unitState.hasRootSidebarLink);
  } catch (error) {
    check('BI Unit 1 clean route preserves query and fragment', false);
    browserErrors.push(`${activeRoute}: ${error.message}`);
  }

  check('Clean routes produce no browser errors', browserErrors.length === 0);

  await browser.close();
  await new Promise(resolve => pythonServer.server.close(resolve));
  await new Promise(resolve => serveServer.server.close(resolve));

  console.log('\n=== CLEAN ROUTE RESULTS ===');
  console.log(`Passed: ${results.pass}`);
  console.log(`Failed: ${results.fail}`);
  console.log(`Total:  ${results.pass + results.fail}`);
  console.log(`Routes: ${routes.length}`);

  if (browserErrors.length) {
    console.log('\nBrowser errors:');
    browserErrors.forEach(error => console.log(`  ${error}`));
  }

  if (results.fail) {
    console.log('\nFailures:');
    results.details.filter(detail => detail.startsWith('❌')).forEach(detail => console.log(`  ${detail}`));
    process.exitCode = 1;
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
