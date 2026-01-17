const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/home/daa/neji/.agent-comms/shipyard-sizing';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    await page.goto('http://localhost:8888/space-armada/index.html', { waitUntil: 'networkidle2', timeout: 60000 });

    // Start the game.
    await page.waitForSelector('.btn', { timeout: 30000 });
    await page.click('.btn');

    await page.waitForFunction(() => window.gameRunning === true, { timeout: 30000 });

    // Let models load.
    await sleep(5000);

    // Open station menu and shipyard.
    await page.evaluate(() => window.openStationMenu && window.openStationMenu());
    await sleep(500);
    await page.evaluate(() => window.showStationTab && window.showStationTab('shipyard'));
    await sleep(1500);

    await page.waitForSelector('.ship-card-compact', { timeout: 30000 });
    await page.waitForSelector('#shipPreviewCanvas', { timeout: 30000 });

    const ships = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ship-card-compact')).map(card => {
        const name = card.querySelector('.ship-name')?.textContent?.trim() || '';
        return {
          key: card.getAttribute('data-ship-key'),
          name,
          selected: card.classList.contains('selected')
        };
      });
    });

    const preview = await page.$('#shipPreviewCanvas');
    const clip = preview ? await preview.boundingBox() : null;
    const clipBox = clip ? {
      x: Math.floor(clip.x),
      y: Math.floor(clip.y),
      width: Math.floor(clip.width),
      height: Math.floor(clip.height)
    } : null;

    const results = [];

    for (let i = 0; i < ships.length; i++) {
      const ship = ships[i];
      await page.evaluate((key) => window.selectShipForPreview && window.selectShipForPreview(key), ship.key);
      await page.waitForFunction(
        (name) => {
          const el = document.getElementById('shipPreviewName');
          return el && el.textContent && el.textContent.includes(name);
        },
        { timeout: 10000 },
        ship.name
      );
      await sleep(400);

      const filename = `${String(i + 1).padStart(2, '0')}-${sanitize(ship.name)}.png`;
      const filepath = path.join(OUT_DIR, filename);

      if (clipBox) {
        await page.screenshot({ path: filepath, clip: clipBox });
      } else {
        await page.screenshot({ path: filepath });
      }

      results.push({ ...ship, file: filepath });
      console.log(`Captured ${ship.name} -> ${filename}`);
    }

    fs.writeFileSync(path.join(OUT_DIR, 'shipyard-sizing.json'), JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Capture error:', err.message);
  }

  await browser.close();
})();
