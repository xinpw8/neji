const puppeteer = require('puppeteer');
const path = require('path');

const OUT_DIR = '/home/daa/neji/.agent-comms';
const BEFORE_PATH = path.join(OUT_DIR, 'bug-texture-before.png');
const AFTER_PATH = path.join(OUT_DIR, 'bug-texture-after.png');

const TEXTURE_URLS = {
  'Scoutship': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/scout.png',
  'Shuttle': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/shuttle.png',
  'UE Fighter': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/fighter.png',
  'Voinian Heavy Fighter': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/heavy%20fighter.png',
  'Crescent Fighter': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/crescent.png',
  'Escape Pod': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/escape%20pod.png',
  'UE Freighter': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/freighter.png',
  'Voinian Frigate': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/frigate.png',
  'Voinian Cruiser': 'https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/thumbnail/cruiser.png'
};

const TEXTURED_SHIP_NAMES = new Set(Object.keys(TEXTURE_URLS));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('endless-sky') && url.endsWith('.png')) {
      // Delay texture loads so the "white" phase is visible.
      setTimeout(() => {
        try {
          req.continue();
        } catch (err) {
          // Ignore if already handled
        }
      }, 2000);
      return;
    }
    req.continue();
  });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
    }
  });

  try {
    await page.goto('http://localhost:8888/space-armada/index.html', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Give the game time to preload GLB models.
    await sleep(12000);

    await page.waitForFunction(
      () => window.showStationTab && window.selectShipForPreview && document.getElementById('stationMenu'),
      { timeout: 60000 }
    );

    // Open station menu UI directly and switch to shipyard tab.
    await page.evaluate(() => {
      const stationMenu = document.getElementById('stationMenu');
      if (stationMenu) {
        stationMenu.style.display = 'flex';
      }
      window.showStationTab('shipyard');
    });

    await page.waitForSelector('.ship-card-compact', { timeout: 60000 });
    await page.waitForSelector('#shipPreviewCanvas', { timeout: 60000 });

    // Give a moment for shipyard preview to render the default ship.
    await sleep(1000);

    const shipOptions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ship-card-compact')).map(card => {
        const nameEl = card.querySelector('.ship-name');
        return {
          key: card.getAttribute('data-ship-key'),
          name: nameEl ? nameEl.textContent.trim() : '',
          selected: card.classList.contains('selected')
        };
      });
    });

    if (shipOptions.length < 2) {
      throw new Error('Not enough ship cards found to select a different ship.');
    }

    const current = shipOptions.find(opt => opt.selected);

    let target = shipOptions.find(opt => !opt.selected && TEXTURED_SHIP_NAMES.has(opt.name));
    if (!target) {
      target = shipOptions.find(opt => !opt.selected) || shipOptions[1];
    }

    console.log('Current ship:', current ? current.name : '(none)');
    console.log('Target ship:', target.name, 'key:', target.key);

    const targetTextureUrl = TEXTURE_URLS[target.name];

    // Switch preview via the exposed function.
    await page.evaluate((shipKey) => {
      window.selectShipForPreview(shipKey);
    }, target.key);

    // Wait until the preview name updates to the new selection.
    await page.waitForFunction(
      (name) => {
        const el = document.getElementById('shipPreviewName');
        return el && el.textContent && el.textContent.includes(name);
      },
      { timeout: 10000 },
      target.name
    );

    const preview = await page.$('#shipPreviewCanvas');
    const clip = preview ? await preview.boundingBox() : null;

    const clipBox = clip ? {
      x: Math.max(0, Math.floor(clip.x)),
      y: Math.max(0, Math.floor(clip.y)),
      width: Math.floor(clip.width),
      height: Math.floor(clip.height)
    } : null;

    // Capture immediately after selection (before texture load finishes).
    if (clipBox) {
      await page.screenshot({ path: BEFORE_PATH, clip: clipBox });
    } else {
      await page.screenshot({ path: BEFORE_PATH });
    }

    // Wait for the texture response if we have a known URL.
    if (targetTextureUrl) {
      try {
        await page.waitForResponse(
          res => res.url() === targetTextureUrl && res.status() === 200,
          { timeout: 20000 }
        );
      } catch (err) {
        console.log('Texture response wait timed out; continuing.');
      }
    }

    // Give the renderer a moment to update after texture load.
    await sleep(1000);

    if (clipBox) {
      await page.screenshot({ path: AFTER_PATH, clip: clipBox });
    } else {
      await page.screenshot({ path: AFTER_PATH });
    }

    console.log('Screenshots saved to:', BEFORE_PATH, AFTER_PATH);
  } catch (err) {
    console.error('Capture error:', err.message);
  }

  await browser.close();
})();
