/**
 * Comprehensive Ship Sizing Verification
 * Captures all 30 ships and calculates metrics after the fix
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = '/home/daa/neji/.agent-comms/sizing-after-fix';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create output directory
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

(async () => {
  console.log('=== COMPREHENSIVE SHIP SIZING VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    console.log('1. Loading game...');
    await page.goto('http://localhost:8888/space-armada/index.html', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('2. Clicking LAUNCH...');
    await page.waitForSelector('.btn', { timeout: 30000 });
    await page.click('.btn');

    console.log('3. Waiting for game to run...');
    await sleep(2000);
    await page.waitForFunction(() => window.gameRunning === true, { timeout: 30000 });

    console.log('4. Loading models...');
    await sleep(5000);

    console.log('5. Opening station menu...');
    await page.evaluate(() => window.openStationMenu && window.openStationMenu());
    await sleep(500);

    console.log('6. Opening shipyard...');
    await page.evaluate(() => window.showStationTab && window.showStationTab('shipyard'));
    await sleep(1500);

    // Get all ship keys (SHIPYARD_DATA is a const, not on window, but selectShipForPreview is)
    const shipKeys = await page.evaluate(() => {
      // Get ship keys from the ship cards in the DOM
      const cards = document.querySelectorAll('.ship-card-compact');
      const keys = [];
      cards.forEach(card => {
        const onclick = card.getAttribute('onclick');
        if (onclick) {
          const match = onclick.match(/selectShipForPreview\('([^']+)'\)/);
          if (match) keys.push(match[1]);
        }
      });
      return keys;
    });
    console.log(`\n7. Capturing ${shipKeys.length} ships...\n`);

    // Get preview canvas bounds
    const preview = await page.$('#shipPreviewCanvas');
    const clip = preview ? await preview.boundingBox() : null;
    const clipOpts = clip ? { clip: { x: Math.floor(clip.x), y: Math.floor(clip.y), width: Math.floor(clip.width), height: Math.floor(clip.height) }} : {};

    const results = [];

    for (let i = 0; i < shipKeys.length; i++) {
      const shipKey = shipKeys[i];
      await page.evaluate((key) => window.selectShipForPreview(key), shipKey);
      await sleep(800);

      const shipName = await page.evaluate((key) => {
        // Try to get ship name from the card
        const card = document.querySelector(`.ship-card-compact[onclick*="${key}"]`);
        return card?.querySelector('.ship-name')?.textContent || key;
      }, shipKey);
      const filename = `${String(i + 1).padStart(2, '0')}-${shipKey}.png`;

      await page.screenshot({
        path: path.join(OUT_DIR, filename),
        ...clipOpts
      });

      results.push({ key: shipKey, name: shipName, file: filename });
      console.log(`   [${i + 1}/${shipKeys.length}] ${shipName}`);
    }

    // Save results
    fs.writeFileSync(path.join(OUT_DIR, 'ships.json'), JSON.stringify(results, null, 2));

    console.log('\n=== CAPTURE COMPLETE ===');
    console.log(`Screenshots saved to: ${OUT_DIR}`);
    console.log('Review the images to verify consistent sizing.');

  } catch (err) {
    console.error('ERROR:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'error.png') });
  }

  await sleep(2000);
  await browser.close();
})();
