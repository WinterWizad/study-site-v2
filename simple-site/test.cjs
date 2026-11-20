const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  page.on('requestfailed', req => failedRequests.push(`${req.url()} - ${req.failure()?.errorText}`));

  try {
    console.log('Loading http://localhost:8080/simple-site/...');
    await page.goto('http://localhost:8080/simple-site/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate to BI Unit 1
    const link = await page.$('a[href="#bi/unit-1"]');
    if (link) {
      await link.click();
      await page.waitForTimeout(2000);

      const article = await page.$('article');
      if (article) {
        const unitText = await article.textContent();
        console.log('BI Unit 1 loaded:', unitText.includes('Introduction to Business Intelligence') ? 'PASS' : 'FAIL');
        console.log('Has lecture hours:', unitText.includes('Lecture hours') ? 'PASS' : 'FAIL');
        console.log('Has marks info:', unitText.includes('Marks carried') ? 'PASS' : 'FAIL');
        console.log('Content preview:', unitText.substring(0, 300));
      } else {
        console.log('Article element not found after navigation');
        const contentText = await page.textContent('#content');
        console.log('Content div:', contentText?.substring(0, 500));
      }
    } else {
      console.log('BI Unit 1 link not found');
      const sidebarText = await page.textContent('#sidebarNav');
      console.log('Sidebar text preview:', sidebarText?.substring(0, 300));
    }

    console.log('\n=== SUMMARY ===');
    console.log('Console errors:', errors.length);
    if (errors.length) errors.forEach(e => console.log('  ERROR:', e));
    console.log('Failed requests:', failedRequests.length);
    if (failedRequests.length) failedRequests.forEach(f => console.log('  FAILED:', f));

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();