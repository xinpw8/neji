/**
 * Verify Ship Sizing Fix
 * Captures screenshots of several ships to verify the targetSize=70 fix
 */
const puppeteer = require('puppeteer');
const path = require('path');

const OUT_DIR = '/home/daa/neji/.agent-comms';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('=== SHIP SIZING FIX VERIFICATION ===\n');

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

    // Get preview canvas bounds
    const preview = await page.$('#shipPreviewCanvas');
    const clip = preview ? await preview.boundingBox() : null;
    const clipOpts = clip ? { clip: { x: Math.floor(clip.x), y: Math.floor(clip.y), width: Math.floor(clip.width), height: Math.floor(clip.height) }} : {};

    // Test ships from different categories
    const testShips = [
      'voinian_heavy_fighter',  // The ship that was too small
      'ue_fighter',             // Standard fighter
      'shuttle',                // Small ship
      'voinian_dreadnaught',    // Large capital ship
      'arada',                  // Medium ship
      'ue_carrier'              // Another capital
    ];

    console.log('\n7. Capturing ship screenshots...\n');

    for (const shipKey of testShips) {
      await page.evaluate((key) => window.selectShipForPreview(key), shipKey);
      await sleep(1000);

      const shipName = await page.evaluate((key) => window.SHIPYARD_DATA?.[key]?.name || key, shipKey);
      console.log(`   Capturing: ${shipName}`);

      await page.screenshot({
        path: path.join(OUT_DIR, `fix-verify-${shipKey}.png`),
        ...clipOpts
      });
    }

    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('Check .agent-comms/fix-verify-*.png files');
    console.log('Ships should now fill more of the preview area');

  } catch (err) {
    console.error('ERROR:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'fix-verify-error.png') });
  }

  await sleep(2000);
  await browser.close();
})();
