const puppeteer = require('puppeteer');
const path = require('path');

const OUT_DIR = '/home/daa/neji/.agent-comms';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('=== BURST CAPTURE SCRIPT ===\n');

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

    console.log('7. Finding ships...');
    await page.waitForSelector('.ship-card-compact', { timeout: 30000 });
    const cards = await page.$$('.ship-card-compact');
    console.log(`   Found ${cards.length} ships`);

    // Find 3rd non-selected ship (different from what might be cached)
    let targetCard = null;
    let count = 0;
    for (const card of cards) {
      const className = await page.evaluate(el => el.className, card);
      if (!className.includes('selected')) {
        count++;
        if (count === 3) {  // Skip first two, get third
          targetCard = card;
          const name = await page.evaluate(el => el.querySelector('.ship-name')?.textContent, card);
          console.log(`   Selected: ${name}`);
          break;
        }
      }
    }
    if (!targetCard) targetCard = cards[3];

    const preview = await page.$('#shipPreviewCanvas');
    const clip = preview ? await preview.boundingBox() : null;
    console.log('   Preview:', clip ? `${clip.width}x${clip.height}` : 'N/A');

    // Take burst of screenshots
    console.log('\n8. BURST CAPTURE - clicking and taking rapid screenshots...');

    const clipOpts = clip ? { clip: { x: Math.floor(clip.x), y: Math.floor(clip.y), width: Math.floor(clip.width), height: Math.floor(clip.height) }} : {};

    // Screenshot BEFORE click
    await page.screenshot({ path: path.join(OUT_DIR, 'burst-0-before.png'), ...clipOpts });

    // Click the ship
    await targetCard.click();

    // Take burst immediately after click
    const delays = [0, 10, 25, 50, 100, 200, 500, 1000, 2000];
    let lastTime = Date.now();

    for (const delay of delays) {
      const elapsed = Date.now() - lastTime;
      if (delay > elapsed) {
        await sleep(delay - elapsed);
      }
      await page.screenshot({ path: path.join(OUT_DIR, `burst-${delay}ms.png`), ...clipOpts });
      console.log(`   Captured at ${delay}ms`);
      lastTime = Date.now();
    }

    console.log('\n=== DONE - Check .agent-comms/burst-*.png ===');

  } catch (err) {
    console.error('ERROR:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'burst-error.png') });
  }

  await sleep(3000);
  await browser.close();
})();
