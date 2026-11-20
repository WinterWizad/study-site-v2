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
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for JS to execute
    await page.waitForTimeout(3000);
    
    // Get the HTML content
    const html = await page.content();
    console.log('HTML length:', html.length);
    console.log('Contains app div:', html.includes('<div id="app"'));
    console.log('Contains BIM 8th Semester:', html.includes('BIM 8th Semester'));
    
    // Get the text content of #app
    const appText = await page.textContent('#app');
    console.log('App text length:', appText?.length || 0);
    console.log('App text preview:', appText?.substring(0, 200));
    
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
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();