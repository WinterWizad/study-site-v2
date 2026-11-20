const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const failedRequests = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  page.on('requestfailed', request => {
    failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    console.log('Navigating to http://localhost:8000...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForSelector('#app', { timeout: 10000 });
    
    // Check if home page content is rendered
    const homeContent = await page.textContent('#app');
    console.log('Home page loaded:', homeContent.includes('BIM 8th Semester Exam Prep') ? 'PASS' : 'FAIL');
    
    // Check for console errors
    if (errors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      errors.forEach(e => console.log('ERROR:', e));
    } else {
      console.log('\n=== NO CONSOLE ERRORS ===');
    }
    
    // Check for failed requests
    if (failedRequests.length > 0) {
      console.log('\n=== FAILED REQUESTS ===');
      failedRequests.forEach(f => console.log('FAILED:', f));
    } else {
      console.log('\n=== NO FAILED REQUESTS ===');
    }
    
    // Check for favicon
    const faviconResponse = await page.goto('http://localhost:8000/favicon.svg', { waitUntil: 'response' });
    console.log('\nFavicon.svg:', faviconResponse.status() === 200 ? 'PASS (200)' : `FAIL (${faviconResponse.status()})`);
    
    // Check microlighter
    const microlighterResponse = await page.goto('https://cdn.jsdelivr.net/npm/microlighter@latest/dist/grammar-dependencies.js', { waitUntil: 'response' });
    console.log('Microlighter:', microlighterResponse.status() === 200 ? 'PASS (200)' : `FAIL (${microlighterResponse.status()})`);
    
    // Check WebAwesome
    const webawesomeResponse = await page.goto('https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.15.0/dist/webawesome.min.js', { waitUntil: 'response' });
    console.log('WebAwesome:', webawesomeResponse.status() === 200 ? 'PASS (200)' : `FAIL (${webawesomeResponse.status()})`);
    
    // Navigate to BI subject
    await page.goto('http://localhost:8000#subject/bi', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForSelector('.content-body', { timeout: 10000 });
    const biContent = await page.textContent('.content-body');
    console.log('\nBI Subject page:', biContent.includes('Introduction to Business Intelligence') ? 'PASS' : 'FAIL');
    
    // Navigate to Unit 1
    await page.goto('http://localhost:8000#unit/bi/1', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForSelector('#overview', { timeout: 10000 });
    const unitContent = await page.textContent('#overview');
    console.log('Unit 1 page:', unitContent.includes('Introduction to Business Intelligence') ? 'PASS' : 'FAIL');
    
    // Navigate to syllabus
    await page.goto('http://localhost:8000#syllabus/bi', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForSelector('#units', { timeout: 10000 });
    const syllabusContent = await page.textContent('#units');
    console.log('Syllabus page:', syllabusContent.includes('Unit 1') ? 'PASS' : 'FAIL');
    
    // Navigate to questions
    await page.goto('http://localhost:8000#questions/bi', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForSelector('#model', { timeout: 10000 });
    const questionsContent = await page.textContent('#model');
    console.log('Questions page:', questionsContent.includes('Group A') ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();