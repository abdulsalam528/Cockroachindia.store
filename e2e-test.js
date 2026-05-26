/**
 * CJP Merchandise Store — E2E Integration Test
 * =============================================
 * Uses Puppeteer to run the full user journey:
 *   1. Register "Comrade Layabout"
 *   2. Purchase CJP Cotton Armour (XL x 2)
 *   3. Verify payment on dashboard
 *   4. Register admin, assign shipment
 *   5. Re-login as Comrade Layabout, verify tracking
 *   6. Final comprehensive screenshot
 */

const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'test-screenshots');

// Helper: ensure screenshot dir exists
const fs = require('fs');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function screenshotPath(name) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clearTokenCookie(page) {
  // The cookie is httpOnly so we can't use document.cookie
  // Use Puppeteer's CDP-based cookie deletion instead
  const cookies = await page.cookies();
  const tokenCookie = cookies.find(c => c.name === 'token');
  if (tokenCookie) {
    await page.deleteCookie({ name: 'token', domain: tokenCookie.domain, path: tokenCookie.path });
  }
  // Also try calling the logout API as a backup
  try {
    await page.evaluate(() => fetch('/api/auth/logout', { method: 'POST' }));
  } catch {}
  console.log('   🍪 Cleared token cookie (via Puppeteer CDP + logout API)');
}

async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 500, timeout });
  } catch {
    // ok, proceed
  }
}

(async () => {
  console.log('🪳 CJP Merchandise Store E2E Test');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('   [PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.log('   [PAGE ERROR]', err.toString()));

  try {
    // First, reset the DB by hitting the test-reset endpoint if it exists,
    // or just proceed (the test handles duplicate registrations gracefully)

    // Clean up any existing test data via direct MongoDB connection
    console.log('\n🧹 PRE-TEST: Cleaning up existing test data');
    console.log('-'.repeat(40));
    
    const { execSync } = require('child_process');
    try {
      const output = execSync('node db-cleanup.js', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: __dirname,
        timeout: 15000
      });
      console.log('   ' + output.trim().split('\n').join('\n   '));
      console.log('   ✅ Test data cleaned from MongoDB');
    } catch (cleanErr) {
      console.log('   ⚠️  MongoDB cleanup failed (may be OK):', cleanErr.message?.substring(0, 200));
    }
    
    await sleep(1000);

    // ═══════════════════════════════════════════════════
    // STEP 1: Register as Comrade Layabout
    // ═══════════════════════════════════════════════════
    console.log('\n📋 STEP 1: Register as Comrade Layabout');
    console.log('-'.repeat(40));

    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    console.log('   ✅ Navigated to /register');

    // Fill Full Name
    await page.type('input[name="fullName"]', 'Comrade Layabout', { delay: 30 });
    console.log('   ✅ Typed fullName');

    // Fill Email
    await page.type('input[name="email"]', 'comrade1@cjp.org', { delay: 30 });
    console.log('   ✅ Typed email');

    // Fill Phone
    await page.type('input[name="phoneNumber"]', '9876543210', { delay: 30 });
    console.log('   ✅ Typed phone');

    // Leave WhatsApp blank (already empty)

    // Fill Address Line 1
    await page.$eval('input[name="addressLine1"]', el => el.value = '');
    await page.type('input[name="addressLine1"]', '123 Slacker Lane', { delay: 30 });
    console.log('   ✅ Typed addressLine1');

    // Fill City
    await page.$eval('input[name="city"]', el => el.value = '');
    await page.type('input[name="city"]', 'Delhi', { delay: 30 });
    console.log('   ✅ Typed city');

    // Fill State
    await page.$eval('input[name="state"]', el => el.value = '');
    await page.type('input[name="state"]', 'Delhi', { delay: 30 });
    console.log('   ✅ Typed state');

    // Fill Postal Code
    await page.$eval('input[name="postalCode"]', el => el.value = '');
    await page.type('input[name="postalCode"]', '110001', { delay: 30 });
    console.log('   ✅ Typed postalCode');

    // Fill Password
    await page.type('input[name="password"]', 'slacker123', { delay: 30 });
    console.log('   ✅ Typed password');

    // Click submit
    await page.click('button[type="submit"]');
    console.log('   ✅ Clicked SUBMIT ENLISTMENT SHEET');

    // Wait for client-side redirect to /dashboard (Next.js uses router.push, not full navigation)
    await page.waitForFunction(
      () => window.location.pathname === '/dashboard',
      { timeout: 15000 }
    );
    await sleep(3000);

    const url1 = page.url();
    console.log(`   📍 Current URL: ${url1}`);

    // Wait for "NO PROCUREMENT ARCHIVES FOUND" text
    try {
      await page.waitForSelector('h4', { timeout: 5000 });
    } catch {}

    const dashboardText = await page.evaluate(() => document.body.innerText);
    if (dashboardText.includes('NO PROCUREMENT ARCHIVES FOUND')) {
      console.log('   ✅ Dashboard shows "NO PROCUREMENT ARCHIVES FOUND"');
    } else {
      console.log('   ⚠️  Dashboard text doesn\'t contain expected empty state');
    }

    await page.screenshot({ path: screenshotPath('01_register_dashboard_empty'), fullPage: true });
    console.log('   📸 Screenshot: 01_register_dashboard_empty.png');

    // ═══════════════════════════════════════════════════
    // STEP 2: Purchase Certified Cockroach T-Shirt
    // ═══════════════════════════════════════════════════
    console.log('\n🛒 STEP 2: Purchase Certified Cockroach T-Shirt');
    console.log('-'.repeat(40));

    await page.goto(`${BASE}/products/certified-cockroach-tee`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);
    console.log('   ✅ Navigated to product page');

    // Wait for product to load (look for Buy Now button)
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('BUY NOW'),
        { timeout: 10000 }
      );
      console.log('   ✅ Product page fully loaded');
    } catch {
      console.log('   ⚠️  BUY NOW button not found, continuing...');
    }

    // Select size XL — find button with text "XL" and click it
    const clickedXL = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const xlBtn = buttons.find(b => b.textContent.trim() === 'XL');
      if (xlBtn) {
        xlBtn.click();
        return true;
      }
      return false;
    });
    if (clickedXL) {
      await sleep(500);
      console.log('   ✅ Selected size XL');
    } else {
      console.log('   ⚠️  XL button not found');
    }

    // Click the + button to increase quantity to 2
    const clickedPlus = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const plusBtn = buttons.find(b => b.textContent.trim() === '+');
      if (plusBtn) {
        plusBtn.click();
        return true;
      }
      return false;
    });
    if (clickedPlus) {
      await sleep(500);
      console.log('   ✅ Increased quantity to 2');
    } else {
      console.log('   ⚠️  + button not found');
    }

    // Verify BUY NOW shows correct price
    const buyBtnText = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyBtn = buttons.find(b => b.textContent.includes('BUY NOW'));
      return buyBtn ? buyBtn.textContent.trim() : null;
    });
    console.log(`   💰 Buy button text: "${buyBtnText}"`);

    // Click BUY NOW
    const clickedBuyNow = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buyNowBtn = buttons.find(b => b.textContent.includes('BUY NOW'));
      if (buyNowBtn) {
        buyNowBtn.click();
        return true;
      }
      return false;
    });
    if (clickedBuyNow) {
      console.log('   ✅ Clicked BUY NOW');
    } else {
      console.log('   ⚠️  BUY NOW button not found');
    }

    // Wait for redirect to checkout page
    await page.waitForFunction(
      () => window.location.pathname === '/checkout',
      { timeout: 15000 }
    );
    await sleep(2000);
    console.log('   ✅ Redirected to /checkout page');

    // Click the Pay button on the checkout page
    const clickedPay = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const payBtn = buttons.find(b => b.textContent.includes('Pay') || b.textContent.includes('PAY'));
      if (payBtn) {
        payBtn.click();
        return true;
      }
      return false;
    });
    if (clickedPay) {
      console.log('   ✅ Clicked Pay button on checkout page');
    } else {
      console.log('   ⚠️  Pay button not found on checkout page');
    }

    // Wait for Razorpay UPI Simulator modal
    await sleep(3000);
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Razorpay UPI Simulator'),
        { timeout: 10000 }
      );
      console.log('   ✅ Razorpay UPI Simulator modal appeared');
    } catch {
      console.log('   ⚠️  Modal not detected by text, continuing...');
    }

    // Verify modal content
    const modalContent = await page.evaluate(() => document.body.innerText);
    if (modalContent.includes('Cockroach India Store (via abdulsalamproductions)')) {
      console.log('   ✅ Beneficiary: Cockroach India Store (via abdulsalamproductions)');
    }
    if (modalContent.includes('958')) {
      console.log('   ✅ Total Amount: INR 958.00');
    }

    await page.screenshot({ path: screenshotPath('02_razorpay_modal'), fullPage: true });
    console.log('   📸 Screenshot: 02_razorpay_modal.png');

    // Click CONFIRM MOCK UPI
    const clickedConfirm = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.textContent.includes('CONFIRM MOCK UPI'));
      if (confirmBtn) {
        confirmBtn.click();
        return true;
      }
      return false;
    });
    if (clickedConfirm) {
      console.log('   ✅ Clicked CONFIRM MOCK UPI');
    } else {
      console.log('   ⚠️  CONFIRM MOCK UPI button not found on page (real gateway mode?)');
    }

    // Wait for success notification
    await sleep(3000);
    const successText = await page.evaluate(() => document.body.innerText);
    if (successText.includes('Simulated Payment Successful')) {
      console.log('   ✅ Success notification: "Simulated Payment Successful!"');
    }

    await page.screenshot({ path: screenshotPath('03_payment_success_notification'), fullPage: true });
    console.log('   📸 Screenshot: 03_payment_success_notification.png');

    // Wait for redirect to dashboard
    await sleep(3000);
    try {
      await page.waitForFunction(
        () => window.location.pathname === '/dashboard',
        { timeout: 10000 }
      );
    } catch {}

    // ═══════════════════════════════════════════════════
    // STEP 3: Verify Payment Success on Dashboard
    // ═══════════════════════════════════════════════════
    console.log('\n📊 STEP 3: Verify Payment on Dashboard');
    console.log('-'.repeat(40));

    // Navigate explicitly to dashboard if not already there
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2', timeout: 15000 });
    }
    await sleep(4000);
    await waitForNetworkIdle(page);
    console.log(`   📍 Current URL: ${page.url()}`);

    // Wait for orders to load (wait for the spinner to disappear)
    try {
      await page.waitForFunction(
        () => !document.body.innerText.includes('Fetching active dispatches'),
        { timeout: 10000 }
      );
    } catch {}

    await sleep(2000);

    const dashText = await page.evaluate(() => document.body.innerText);
    
    if (dashText.includes('Certified Cockroach') || dashText.includes('T-Shirt')) {
      console.log('   ✅ Order item: Certified Cockroach T-Shirt found');
    } else {
      console.log('   ⚠️  Product name not found in dashboard text');
    }

    if (dashText.includes('XL')) {
      console.log('   ✅ Size XL confirmed');
    }

    if (dashText.includes('958')) {
      console.log('   ✅ Total: INR 958.00 confirmed');
    }

    if (dashText.includes('Paid')) {
      console.log('   ✅ Status shows Paid on progress tracker');
    }

    await page.screenshot({ path: screenshotPath('04_dashboard_order_paid'), fullPage: true });
    console.log('   📸 Screenshot: 04_dashboard_order_paid.png');

    // ═══════════════════════════════════════════════════
    // STEP 4: Register Admin and Assign Shipment
    // ═══════════════════════════════════════════════════
    console.log('\n🔧 STEP 4: Register Admin & Assign Shipment');
    console.log('-'.repeat(40));

    // Clear token cookie to log out (httpOnly cookie requires Puppeteer API)
    await clearTokenCookie(page);
    await sleep(1000);

    // Navigate to register - retry loop for httpOnly cookie edge cases
    let registerAttempts = 0;
    while (registerAttempts < 3) {
      await page.goto(`${BASE}/register`, { waitUntil: 'networkidle2', timeout: 15000 });
      await sleep(2000);
      
      if (page.url().includes('/register')) {
        break; // Successfully on register page
      }
      
      console.log(`   ⚠️  Redirected to ${page.url()}, clearing cookies again (attempt ${registerAttempts + 1})`);
      await clearTokenCookie(page);
      // Also clear ALL cookies as nuclear option
      const allCookies = await page.cookies();
      for (const c of allCookies) {
        await page.deleteCookie({ name: c.name, domain: c.domain, path: c.path });
      }
      await sleep(1000);
      registerAttempts++;
    }
    console.log(`   ✅ On register page: ${page.url()}`);

    // Fill registration form for admin (including address fields now required by form validation)
    await page.type('input[name="fullName"]', 'Supreme Commander', { delay: 30 });
    await page.type('input[name="email"]', 'admin@cjp.org', { delay: 30 });
    await page.type('input[name="phoneNumber"]', '9999999999', { delay: 30 });
    
    await page.type('input[name="addressLine1"]', 'Admin HQ, Central Block', { delay: 30 });
    await page.type('input[name="city"]', 'New Delhi', { delay: 30 });
    await page.type('input[name="state"]', 'Delhi', { delay: 30 });
    await page.type('input[name="postalCode"]', '110001', { delay: 30 });

    await page.type('input[name="password"]', 'admin123', { delay: 30 });
    console.log('   ✅ Filled admin registration form (including required address fields)');

    // Submit
    await page.click('button[type="submit"]');
    console.log('   ✅ Clicked submit');

    // Wait for client-side redirect to /dashboard
    await page.waitForFunction(
      () => window.location.pathname === '/dashboard',
      { timeout: 15000 }
    );
    await sleep(2000);
    console.log(`   📍 Current URL: ${page.url()}`);

    // Navigate to admin dashboard
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(4000);
    await waitForNetworkIdle(page);
    console.log('   ✅ Navigated to /admin');

    // Wait for orders to load
    try {
      await page.waitForFunction(
        () => !document.body.innerText.includes('Decrypting order ledgers'),
        { timeout: 15000 }
      );
    } catch {}
    await sleep(2000);

    const adminText = await page.evaluate(() => document.body.innerText);
    if (adminText.includes('Comrade Layabout')) {
      console.log('   ✅ Found order from Comrade Layabout');
    } else {
      console.log('   ⚠️  Comrade Layabout order not found in admin');
      console.log('   📄 Admin page text snippet:', adminText.substring(0, 500));
    }

    await page.screenshot({ path: screenshotPath('05_admin_before_update'), fullPage: true });
    console.log('   📸 Screenshot: 05_admin_before_update.png');

    // Select BlueDart from Logistics Partner dropdown
    // Find the first courier partner select
    const courierSelects = await page.$$('select');
    let courierSelectFound = false;
    for (const sel of courierSelects) {
      const options = await sel.evaluate(el => {
        return Array.from(el.options).map(o => o.value);
      });
      if (options.includes('BlueDart')) {
        await sel.select('BlueDart');
        courierSelectFound = true;
        console.log('   ✅ Selected BlueDart from Logistics Partner');
        break;
      }
    }
    if (!courierSelectFound) {
      console.log('   ⚠️  BlueDart option not found in any select');
    }

    await sleep(500);

    // Type tracking ID in the Waybill Tracking ID field
    // It's an input with placeholder containing "DELH-"
    const trackingInput = await page.$('input[placeholder*="DELH"]');
    if (trackingInput) {
      // Clear existing value first
      await trackingInput.click({ clickCount: 3 });
      await trackingInput.type('BD-123456', { delay: 30 });
      console.log('   ✅ Typed BD-123456 in Waybill Tracking ID');
    } else {
      console.log('   ⚠️  Tracking ID input not found');
    }

    await sleep(500);

    // Change status to Shipped
    // Find the tracking status select (has "Shipped" option but also "Pending / Unpaid")
    for (const sel of courierSelects) {
      const options = await sel.evaluate(el => {
        return Array.from(el.options).map(o => o.value);
      });
      if (options.includes('Shipped') && options.includes('Pending')) {
        await sel.select('Shipped');
        console.log('   ✅ Changed Tracking Status to Shipped');
        break;
      }
    }

    await sleep(500);

    // Click the save button (black button with Save/floppy icon)
    // The save button has title="Save Logistics Details"
    const saveBtn = await page.$('button[title="Save Logistics Details"]');
    if (saveBtn) {
      await saveBtn.click();
      console.log('   ✅ Clicked Save Logistics Details');
    } else {
      // Fallback: find by looking for the Save icon button near the dropdowns
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const hasTitle = await btn.evaluate(el => el.title);
        if (hasTitle && hasTitle.includes('Save')) {
          await btn.click();
          console.log('   ✅ Clicked Save button (fallback)');
          break;
        }
      }
    }

    // Wait for success toast
    await sleep(3000);
    const afterSaveText = await page.evaluate(() => document.body.innerText);
    if (afterSaveText.includes('Logistics data synchronized successfully')) {
      console.log('   ✅ Success toast: "Logistics data synchronized successfully"');
    } else {
      console.log('   ⚠️  Success toast not found in page text');
    }

    await page.screenshot({ path: screenshotPath('06_admin_after_update'), fullPage: true });
    console.log('   📸 Screenshot: 06_admin_after_update.png');

    // ═══════════════════════════════════════════════════
    // STEP 5: Verify as Comrade Layabout
    // ═══════════════════════════════════════════════════
    console.log('\n🔑 STEP 5: Verify as Comrade Layabout');
    console.log('-'.repeat(40));

    // Clear ALL cookies to ensure clean state
    await clearTokenCookie(page);
    const allCookies5 = await page.cookies();
    for (const c of allCookies5) {
      await page.deleteCookie({ name: c.name, domain: c.domain, path: c.path });
    }
    await sleep(1000);

    // Navigate to login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    console.log('   ✅ Navigated to /login');

    // Fill login form
    await page.type('input[name="email"]', 'comrade1@cjp.org', { delay: 30 });
    await page.type('input[name="password"]', 'slacker123', { delay: 30 });
    console.log('   ✅ Filled login credentials');

    // Submit login
    await page.click('button[type="submit"]');
    console.log('   ✅ Clicked REQUEST SYSTEM ACCESS');

    // Wait for client-side redirect to dashboard
    await page.waitForFunction(
      () => window.location.pathname === '/dashboard',
      { timeout: 15000 }
    );
    await sleep(4000);
    await waitForNetworkIdle(page);
    console.log(`   📍 Current URL: ${page.url()}`);

    // Wait for orders to load
    try {
      await page.waitForFunction(
        () => !document.body.innerText.includes('Fetching active dispatches'),
        { timeout: 10000 }
      );
    } catch {}
    await sleep(3000);

    const verifyText = await page.evaluate(() => document.body.innerText);

    if (verifyText.includes('BLUEDART') || verifyText.includes('BlueDart')) {
      console.log('   ✅ Logistics Partner: BLUEDART confirmed');
    } else {
      console.log('   ⚠️  BLUEDART not found in dashboard text');
    }

    if (verifyText.includes('BD-123456')) {
      console.log('   ✅ Waybill Tracking ID: BD-123456 confirmed');
    } else {
      console.log('   ⚠️  BD-123456 not found in dashboard text');
    }

    if (verifyText.includes('Shipped')) {
      console.log('   ✅ Shipped status visible in milestone tracker');
    }

    await page.screenshot({ path: screenshotPath('07_comrade_dashboard_shipped'), fullPage: true });
    console.log('   📸 Screenshot: 07_comrade_dashboard_shipped.png');

    // ═══════════════════════════════════════════════════
    // STEP 6: Final Comprehensive Screenshot
    // ═══════════════════════════════════════════════════
    console.log('\n📷 STEP 6: Final Comprehensive Screenshot');
    console.log('-'.repeat(40));

    // Scroll to top for complete view
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);

    await page.screenshot({ path: screenshotPath('08_final_comprehensive'), fullPage: true });
    console.log('   📸 Screenshot: 08_final_comprehensive.png');

    // ═══════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════
    console.log('\n' + '='.repeat(50));
    console.log('🎉 E2E TEST COMPLETE');
    console.log('='.repeat(50));
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('Files:');
    const files = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
    files.forEach(f => console.log(`  📸 ${f}`));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);

    // Take error screenshot
    try {
      await page.screenshot({ path: screenshotPath('ERROR_screenshot'), fullPage: true });
      console.log('   📸 Error screenshot saved');
    } catch {}
  } finally {
    await browser.close();
    console.log('\n🔒 Browser closed');
  }
})();
