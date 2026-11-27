import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DEFAULT_BASE_URL = 'https://study-site-v2.vercel.app';

const SUBJECTS = {
  bi: {
    code: 'IT 249',
    syllabusFile: 'IT249-business-intelligence.md'
  },
  de: {
    code: 'IT 250',
    syllabusFile: 'IT250-digital-economy.md'
  },
  cloud: {
    code: 'IT 277',
    syllabusFile: 'IT277-cloud-computing.md'
  },
  entrepreneurship: {
    code: 'IT 248',
    syllabusFile: 'IT248-it-entrepreneurship-management.md'
  }
};

const RESOURCE_PAGES = ['model-question', 'model-question-answers', 'question-bank'];
const baseUrlArgument = process.argv.slice(2).find(argument => !argument.startsWith('--'));
const baseUrl = new URL(baseUrlArgument || process.env.SITE_URL || DEFAULT_BASE_URL);
const origin = baseUrl.origin;

const results = { passed: 0, failed: 0, failures: [] };

function check(name, condition, detail = '') {
  if (condition) {
    results.passed++;
    return true;
  }

  results.failed++;
  results.failures.push({ name, detail });
  return false;
}

function normalizePath(pathname) {
  const url = new URL(pathname, baseUrl);
  url.hash = '';
  return `${url.pathname}${url.search}`;
}

function collectExpectedRoutes() {
  const routes = new Set([
    '/',
    '/reels/',
    '/bi/cheat-sheet.html',
    '/styles.css',
    '/favicon.svg',
    '/site.webmanifest',
    '/reels/reels.css',
    '/reels/reels.js',
    '/reels/content.json',
    '/reels/narration-manifest.json',
    '/reels/content/bi.json',
    '/reels/content/de.json',
    '/reels/content/cloud.json',
    '/reels/content/entrepreneurship.json',
    '/reels/assets/music/easy-lemon-60-second.mp3',
    '/reels/assets/music/somewhere-sunny.mp3'
  ]);

  for (const [subjectId] of Object.entries(SUBJECTS)) {
    const subjectDir = path.join(DIST_DIR, subjectId);
    routes.add(`/${subjectId}/`);

    if (!fs.existsSync(subjectDir)) continue;

    const aliasPages = fs.readdirSync(subjectDir).filter(file => (
      /^unit-\d+\.html$/i.test(file) || RESOURCE_PAGES.includes(file.replace(/\.html$/i, ''))
    ));

    for (const filename of aliasPages) {
      const canonical = `/${subjectId}/${filename}`;
      const clean = canonical.replace(/\.html$/i, '');
      routes.add(canonical);
      routes.add(clean);
      routes.add(`${clean}/`);
    }
  }

  // Syllabus canonical directories (styled HTML pages)
  for (const subject of Object.values(SUBJECTS)) {
    const slug = subject.syllabusFile.replace(/\.md$/i, '');
    routes.add(`/_syllabus/${slug}/`);
    routes.add(`/_syllabus/${slug}`);
  }

  // Legacy raw .md URLs kept for regression (lowercase and uppercase)
  const syllabusDir = path.join(DIST_DIR, '_syllabus');
  if (fs.existsSync(syllabusDir)) {
    for (const filename of fs.readdirSync(syllabusDir).filter(file => file.endsWith('.md'))) {
      routes.add(`/_syllabus/${filename}`);
    }
  }

  // These were the broken links emitted by the previous build. Keep them in the
  // production audit so the compatibility redirects cannot regress.
  for (const subject of Object.values(SUBJECTS)) {
    routes.add(`/_syllabus/${subject.syllabusFile.replace(/^IT/, 'it')}`);
  }

  return [...routes].sort();
}

function checkLocalArtifacts() {
  check('dist/ exists', fs.existsSync(DIST_DIR), 'Run npm run build first.');
  if (!fs.existsSync(DIST_DIR)) return;

  for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
    const subjectIndexPath = path.join(DIST_DIR, subjectId, 'index.html');
    const subjectIndexExists = fs.existsSync(subjectIndexPath);
    check(`${subjectId} subject index exists`, subjectIndexExists, subjectIndexPath);

    if (!subjectIndexExists) continue;

    const subjectIndex = fs.readFileSync(subjectIndexPath, 'utf8');
    const slug = subject.syllabusFile.replace(/\.md$/i, '');
    const expectedLink = `../_syllabus/${slug}/`;
    const syllabusLink = subjectIndex.match(/<a\s+href="([^"]*\/_syllabus\/[^"]+)"\s+target="_blank">Syllabus<\/a>/i)?.[1];

    check(`${subjectId} syllabus link points to canonical directory`, syllabusLink === expectedLink, syllabusLink || 'Syllabus link not found');

    if (!syllabusLink) continue;

    // The canonical syllabus page is an HTML file inside the slug directory
    const syllabusHtmlPath = path.resolve(path.dirname(subjectIndexPath), syllabusLink, 'index.html');
    const syllabusExists = fs.existsSync(syllabusHtmlPath);
    check(`${subjectId} linked syllabus HTML exists`, syllabusExists, syllabusHtmlPath);

    if (!syllabusExists) continue;

    const syllabusHtml = fs.readFileSync(syllabusHtmlPath, 'utf8');
    const title = syllabusHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    check(`${subjectId} linked syllabus has correct title`, title.includes(subject.code) && title.includes('Syllabus'), title);
    check(`${subjectId} linked syllabus has markdown body`, syllabusHtml.includes('class="markdown-body"'), '');
  }
}

function isTextResponse(contentType) {
  return /text\/|json|xml|javascript|markdown/i.test(contentType);
}

function extractInternalReferences(body, responseUrl) {
  const references = [];
  const attributePattern = /<(?:a|link|script|img|source|iframe|video|audio|embed|object)\b[^>]*?\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;

  for (const match of body.matchAll(attributePattern)) {
    const rawValue = match[2]?.trim();
    if (!rawValue || rawValue.startsWith('#') || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(rawValue)) continue;

    try {
      const resolved = new URL(rawValue, responseUrl);
      if (resolved.origin !== origin) continue;
      resolved.hash = '';
      references.add(`${resolved.pathname}${resolved.search}`);
    } catch {
      // Ignore malformed URLs; the page's own HTML validation will still report it.
    }
  }

  return references;
}

function validateResponse(requestPath, finalPath, status, contentType, body, byteLength) {
  const issues = [];
  const normalizedType = contentType.toLowerCase();

  if (status < 200 || status >= 400) {
    issues.push(`HTTP ${status}`);
  }

  if (/The page could not be found\s+NOT_FOUND/i.test(body) || /\b404\s+NOT_FOUND\b/i.test(body)) {
    issues.push('Vercel error body');
  }

  if (normalizedType.includes('text/html')) {
    const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    if (!title) issues.push('HTML response has no title');
    if (byteLength < 500) issues.push(`HTML response is too short (${byteLength} bytes)`);

    if (finalPath === '/') {
      if (!title.includes('BIM 8th Semester Exam Timetable')) issues.push('Wrong homepage title');
      if (!body.includes('class="door"')) issues.push('Homepage subject doors are missing');
    } else if (finalPath === '/reels/' || finalPath === '/reels') {
      if (!title.includes('Quick Reels')) issues.push('Wrong Quick Reels title');
      if (!body.includes('id="reelStage"')) issues.push('Quick Reels stage is missing');
    } else if (/^\/(?:bi|de|cloud|entrepreneurship)\/$/.test(finalPath)) {
      if (!body.includes('class="subject-page"')) issues.push('Subject page structure is missing');
      if (!body.includes('class="units-grid"')) issues.push('Subject unit grid is missing');
    } else if (/^\/(?:bi|de|cloud|entrepreneurship)\/unit-\d+(?:\.html)?\/?$/.test(finalPath)) {
      if (!title.includes('Unit ')) issues.push('Unit page title is missing');
      if (!body.includes('class="unit-content"')) issues.push('Unit content is missing');
      if (!body.includes('class="markdown-body"')) issues.push('Unit Markdown body is missing');
    } else if (/^\/(?:bi|de|cloud|entrepreneurship)\/(?:model-question|model-question-answers|question-bank)(?:\.html)?\/?$/.test(finalPath)) {
      if (!body.includes('class="resource-content"')) issues.push('Resource content is missing');
      if (!body.includes('class="markdown-body"')) issues.push('Resource Markdown body is missing');
    } else if (/^\/_syllabus\/IT\d+[^\/]*\/?$/.test(finalPath)) {
      // Syllabus canonical HTML page (styled)
      const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
      if (!title) issues.push('Syllabus page has no title');
      if (!title.includes('Syllabus')) issues.push('Syllabus page title missing "Syllabus"');
      const syllabusSubject = Object.values(SUBJECTS).find(subject => finalPath.includes(subject.syllabusFile.replace(/\.md$/i, '')));
      if (syllabusSubject && !title.includes(syllabusSubject.code)) issues.push(`Syllabus page missing subject code ${syllabusSubject.code}`);
      if (!body.includes('class="markdown-body"')) issues.push('Syllabus page missing markdown body');
    }
  } else if (normalizedType.includes('markdown') || normalizedType.includes('text/plain')) {
    const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim() || '';
    if (!heading) issues.push('Markdown response has no heading');
    if (byteLength < 500) issues.push(`Markdown response is too short (${byteLength} bytes)`);

    const syllabusFilename = path.basename(finalPath).replace(/\.md$/i, '') + '.md';
    const syllabusSubject = Object.values(SUBJECTS).find(subject => subject.syllabusFile === syllabusFilename);
    if (syllabusSubject && (!heading.includes(syllabusSubject.code) || !heading.toLowerCase().includes('syllabus'))) {
      issues.push(`Wrong syllabus heading: ${heading}`);
    }
  } else if (normalizedType.includes('json')) {
    try {
      JSON.parse(body);
    } catch (error) {
      issues.push(`Invalid JSON: ${error.message}`);
    }
  } else if (normalizedType.includes('text/css')) {
    if (byteLength < 100) issues.push(`CSS response is too short (${byteLength} bytes)`);
  } else if (normalizedType.includes('javascript')) {
    if (byteLength < 100) issues.push(`JavaScript response is too short (${byteLength} bytes)`);
  } else if (normalizedType.includes('audio/')) {
    if (byteLength < 1000) issues.push(`Audio response is too short (${byteLength} bytes)`);
  } else if (normalizedType.includes('image/svg+xml')) {
    if (byteLength < 100) issues.push(`SVG response is too short (${byteLength} bytes)`);
  } else if (byteLength < 20) {
    issues.push(`Response is unexpectedly short (${byteLength} bytes, ${normalizedType || 'unknown content type'})`);
  }

  return issues;
}

async function fetchRoute(routePath) {
  const response = await fetch(new URL(routePath, baseUrl), {
    redirect: 'follow',
    headers: { 'User-Agent': 'study-site-production-audit/1.0' }
  });
  const contentType = response.headers.get('content-type') || '';
  let body = '';
  let byteLength = 0;

  if (isTextResponse(contentType)) {
    body = await response.text();
    byteLength = Buffer.byteLength(body);
  } else {
    const bytes = await response.arrayBuffer();
    byteLength = bytes.byteLength;
  }

  const finalUrl = new URL(response.url);
  const finalPath = `${finalUrl.pathname}${finalUrl.search}`;
  const issues = validateResponse(routePath, finalPath, response.status, contentType, body, byteLength);

  return {
    routePath,
    finalPath,
    status: response.status,
    contentType,
    byteLength,
    issues,
    references: contentType.toLowerCase().includes('text/html')
      ? extractInternalReferences(body, response.url)
      : []
  };
}

async function auditLiveSite() {
  const expectedRoutes = collectExpectedRoutes();
  const queue = [...expectedRoutes];
  const claimed = new Set();
  const routeResults = [];

  async function worker() {
    while (queue.length) {
      const routePath = queue.shift();
      if (!routePath || claimed.has(routePath)) continue;
      claimed.add(routePath);

      try {
        const result = await fetchRoute(routePath);
        routeResults.push(result);
        for (const reference of result.references) {
          if (!claimed.has(reference)) queue.push(reference);
        }
      } catch (error) {
        routeResults.push({
          routePath,
          finalPath: routePath,
          status: 0,
          contentType: '',
          byteLength: 0,
          issues: [`Fetch failed: ${error.message}`],
          references: []
        });
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  for (const result of routeResults) {
    check(
      `${result.routePath} -> ${result.finalPath} returns the expected content`,
      result.issues.length === 0,
      result.issues.join('; ')
    );
  }

  return routeResults;
}

console.log(`Production content audit: ${baseUrl.href}`);
checkLocalArtifacts();
const routeResults = await auditLiveSite();

console.log(`\n=== PRODUCTION CONTENT AUDIT ===`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Routes fetched: ${routeResults.length}`);

if (results.failed) {
  console.log('\nFailures:');
  for (const failure of results.failures) {
    console.log(`  ❌ ${failure.name}${failure.detail ? ` — ${failure.detail}` : ''}`);
  }
  process.exitCode = 1;
} else {
  console.log('All fetched routes returned the expected content.');
}
