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
    console.log('Loading http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check main page
    const title = await page.title();
    console.log('Page title:', title);

    // Check subject cards
    const biCard = await page.$('a[href="bi/index.html"]');
    console.log('BI card:', biCard ? 'FOUND' : 'MISSING');

    const deCard = await page.$('a[href="de/index.html"]');
    console.log('DE card:', deCard ? 'FOUND' : 'MISSING');

    const cloudCard = await page.$('a[href="cloud/index.html"]');
    console.log('Cloud card:', cloudCard ? 'FOUND' : 'MISSING');

    const entCard = await page.$('a[href="entrepreneurship/index.html"]');
    console.log('Entrepreneurship card:', entCard ? 'FOUND' : 'MISSING');

    // Navigate to BI subject
    await biCard.click();
    await page.waitForTimeout(1000);
    const biTitle = await page.title();
    console.log('\nBI Subject page:', biTitle);

    // Check unit links
    const unitLinks = await page.$$eval('.unit-card a', links => links.map(l => l.href));
    console.log('BI units:', unitLinks.length);

    // Navigate to BI Unit 1
    await page.goto('http://localhost:8080/bi/unit-1.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);
    const unitTitle = await page.title();
    console.log('\nBI Unit 1:', unitTitle);

    // Check content rendered
    const content = await page.textContent('.markdown-body');
    console.log('Has BI intro:', content.includes('Business Intelligence') ? 'PASS' : 'FAIL');
    console.log('Has tables:', content.includes('OLTP') ? 'PASS' : 'FAIL');
    console.log('Has code blocks:', (await page.$('.code-block')) ? 'PASS' : 'FAIL');

    // Test theme toggle
    await page.click('.site-header .theme-toggle');
    await page.waitForTimeout(200);
    const darkTheme = await page.getAttribute('html', 'data-theme');
    console.log('\nDark mode:', darkTheme === 'dark' ? 'PASS' : 'FAIL');

    // Test mobile sidebar (resize)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    const sidebarToggle = await page.$('.sidebar-toggle');
    console.log('\nMobile sidebar toggle:', sidebarToggle ? 'VISIBLE' : 'HIDDEN');

    // Test search (if implemented)
    // Test print styles (check CSS)

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