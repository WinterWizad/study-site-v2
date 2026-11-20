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

  const testCases = [
    { subject: 'bi', unit: 1, name: 'BI Unit 1', check: 'Introduction to Business Intelligence' },
    { subject: 'bi', unit: 2, name: 'BI Unit 2', check: 'Data Warehousing' },
    { subject: 'de', unit: 1, name: 'DE Unit 1', check: 'Introduction to Digital Economy' },
    { subject: 'de', unit: 6, name: 'DE Unit 6', check: 'Nepal Perspective' },
    { subject: 'cloud', unit: 1, name: 'Cloud Unit 1', check: 'Introduction to Cloud Computing' },
    { subject: 'cloud', unit: 4, name: 'Cloud Unit 4', check: 'Virtualization' },
    { subject: 'cloud', unit: 6, name: 'Cloud Unit 6', check: 'Cloud Security' },
    { subject: 'entrepreneurship', unit: 1, name: 'Ent Unit 1', check: 'Foundations of Entrepreneurship' },
    { subject: 'entrepreneurship', unit: 3, name: 'Ent Unit 3', check: 'Business Model Development' },
  ];

  try {
    console.log('Loading http://localhost:8080/simple-site/...');
    await page.goto('http://localhost:8080/simple-site/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    for (const tc of testCases) {
      console.log(`\n--- Testing ${tc.name} ---`);
      const link = await page.$(`a[href="#${tc.subject}/unit-${tc.unit}"]`);
      if (!link) {
        console.log(`  LINK NOT FOUND`);
        continue;
      }
      await link.click();
      await page.waitForTimeout(1500);

      const article = await page.$('article');
      if (article) {
        const text = await article.textContent();
        const pass = text.includes(tc.check);
        console.log(`  ${pass ? 'PASS' : 'FAIL'}: ${tc.check}`);
        if (!pass) console.log(`    Preview: ${text.substring(0, 200)}`);
      } else {
        const contentText = await page.textContent('#content');
        console.log(`  FAIL: No article element`);
        console.log(`    Content: ${contentText?.substring(0, 200)}`);
      }
    }

    // Test theme toggle
    console.log('\n--- Testing theme toggle ---');
    await page.click('#themeToggle');
    await page.waitForTimeout(200);
    const darkTheme = await page.getAttribute('html', 'data-theme');
    console.log(`  Dark mode: ${darkTheme === 'dark' ? 'PASS' : 'FAIL'}`);

    await page.click('#themeToggle');
    await page.waitForTimeout(200);
    const lightTheme = await page.getAttribute('html', 'data-theme');
    console.log(`  Light mode: ${lightTheme === 'light' ? 'PASS' : 'FAIL'}`);

    // Test search
    console.log('\n--- Testing search ---');
    await page.fill('#searchInput', 'warehous');
    await page.waitForTimeout(300);
    const visibleLinks = await page.$$eval('.unit-link:not([style*="display: none"])', links => links.map(l => l.textContent));
    console.log(`  Search 'warehous': ${visibleLinks.some(t => t.toLowerCase().includes('warehous')) ? 'PASS' : 'FAIL'}`);
    console.log(`  Visible: ${visibleLinks.slice(0, 5).join(', ')}`);

    await page.fill('#searchInput', '');
    await page.waitForTimeout(200);

    // Test code highlighting (Cloud Unit 4 might have code)
    console.log('\n--- Testing code highlighting ---');
    const codeLink = await page.$('a[href="#cloud/unit-4"]');
    if (codeLink) {
      await codeLink.click();
      await page.waitForTimeout(1500);
      const hasHighlighted = await page.$('pre code.hljs');
      console.log(`  Code highlighting: ${hasHighlighted ? 'PASS' : 'NO CODE BLOCKS'}`);
    }

    // Test copy button
    console.log('\n--- Testing copy button ---');
    const copyBtn = await page.$('.copy-btn');
    console.log(`  Copy button exists: ${copyBtn ? 'PASS' : 'NOT PRESENT (no code blocks)'}`);

    console.log('\n=== FINAL SUMMARY ===');
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