/**
 * Automated Ship Sizing Analysis Script
 * Captures screenshots of all 30 ships in the shipyard and measures their visual size
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const GAME_URL = 'http://localhost:8888/space-armada/index.html';
const OUTPUT_DIR = path.join(__dirname, 'ship-captures');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAllShips() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1280,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Loading game...');
    await page.goto(GAME_URL, { waitUntil: 'networkidle2' });

    // Wait for game to load
    await page.waitForSelector('#startButton', { timeout: 30000 });
    console.log('Game loaded, clicking LAUNCH...');

    // Click LAUNCH
    await page.click('#startButton');
    await new Promise(r => setTimeout(r, 3000));

    // Wait for models to load
    console.log('Waiting for models to load...');
    await page.evaluate(() => {
        return new Promise(resolve => {
            const checkModels = setInterval(() => {
                if (window.modelsLoaded) {
                    clearInterval(checkModels);
                    resolve();
                }
            }, 500);
            // Timeout after 30s
            setTimeout(() => {
                clearInterval(checkModels);
                resolve();
            }, 30000);
        });
    });

    // Open station menu
    console.log('Opening station menu...');
    await page.evaluate(() => window.openStationMenu());
    await new Promise(r => setTimeout(r, 500));

    // Click SHIPYARD tab
    console.log('Opening shipyard...');
    await page.evaluate(() => window.showStationTab('shipyard'));
    await new Promise(r => setTimeout(r, 1000));

    // Get all ship keys
    const shipKeys = await page.evaluate(() => Object.keys(SHIPYARD_DATA));
    console.log(`Found ${shipKeys.length} ships to analyze`);

    const results = [];

    for (const shipKey of shipKeys) {
        console.log(`Capturing: ${shipKey}`);

        // Select the ship
        await page.evaluate((key) => window.selectShipForPreview(key), shipKey);
        await new Promise(r => setTimeout(r, 800)); // Wait for model to load and render

        // Get ship info and capture screenshot of the preview canvas
        const shipInfo = await page.evaluate((key) => {
            const ship = SHIPYARD_DATA[key];
            const canvas = document.getElementById('shipPreviewCanvas');
            return {
                key: key,
                name: ship.name,
                category: ship.category,
                model: ship.model,
                canvasWidth: canvas ? canvas.width : 0,
                canvasHeight: canvas ? canvas.height : 0
            };
        }, shipKey);

        // Take screenshot of just the canvas area
        const canvasElement = await page.$('#shipPreviewCanvas');
        if (canvasElement) {
            const screenshotPath = path.join(OUTPUT_DIR, `${shipKey}.png`);
            await canvasElement.screenshot({ path: screenshotPath });
            shipInfo.screenshot = screenshotPath;
        }

        results.push(shipInfo);
    }

    // Write results to JSON
    const resultsPath = path.join(OUTPUT_DIR, 'ship-analysis.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${resultsPath}`);

    // Also write a quick summary
    const summaryPath = path.join(OUTPUT_DIR, 'summary.txt');
    let summary = 'Ship Capture Summary\n';
    summary += '====================\n\n';
    summary += `Total ships: ${results.length}\n\n`;

    const categories = ['fighter', 'medium', 'heavy', 'capital'];
    for (const cat of categories) {
        const catShips = results.filter(s => s.category === cat);
        summary += `${cat.toUpperCase()} (${catShips.length}):\n`;
        catShips.forEach(s => {
            summary += `  - ${s.key}: ${s.name}\n`;
        });
        summary += '\n';
    }

    fs.writeFileSync(summaryPath, summary);
    console.log(`Summary saved to: ${summaryPath}`);

    await browser.close();
    console.log('Done! Check ship-captures/ folder for results.');

    return results;
}

captureAllShips().catch(console.error);
