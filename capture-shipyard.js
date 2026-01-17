#!/usr/bin/env node
/**
 * Captures screenshots of each ship in the game's shipyard/dock
 * Shows actual in-game sprites as they appear to the player
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'evo_assets', 'shipyard_screenshots');

async function captureShipyard() {
    console.log('='.repeat(60));
    console.log('SHIPYARD SCREENSHOT CAPTURE');
    console.log('='.repeat(60));

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Suppress WebGL errors
    page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('WebGL')) {
            console.log('Error:', msg.text());
        }
    });

    try {
        console.log('\n[1] Loading game...');
        await page.goto('http://localhost:8888/space-armada.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await sleep(2000);
        console.log('    ✓ Game loaded');

        // Start game
        console.log('\n[2] Starting game...');
        await page.keyboard.press('Space');
        await sleep(500);
        await page.keyboard.press('Enter');
        await sleep(2000);
        console.log('    ✓ Game started');

        // Get list of ships from the game
        console.log('\n[3] Getting ship list from shipyard...');
        const shipList = await page.evaluate(() => {
            if (typeof SHIPS_FOR_SALE === 'undefined') return [];
            const allShips = [];
            Object.entries(SHIPS_FOR_SALE).forEach(([category, ships]) => {
                ships.forEach(ship => {
                    allShips.push({
                        name: ship.name,
                        model: ship.model,
                        category: category,
                        price: ship.price,
                        description: ship.description
                    });
                });
            });
            return allShips;
        });

        if (shipList.length === 0) {
            console.log('    ! Could not get ship list, trying alternative method...');
            // Try to open shipyard and get ships
        } else {
            console.log(`    ✓ Found ${shipList.length} ships for sale`);
        }

        // Open the dock/shipyard
        console.log('\n[4] Opening dock interface...');
        await page.keyboard.press('KeyD'); // Common dock key
        await sleep(1000);

        // Try to find and click shipyard
        const dockOpened = await page.evaluate(() => {
            const dockPanel = document.querySelector('.dock-panel, #dockPanel, .dock-menu');
            return !!dockPanel;
        });

        if (!dockOpened) {
            // Try escape then d
            await page.keyboard.press('Escape');
            await sleep(500);
            await page.keyboard.press('KeyD');
            await sleep(1000);
        }

        // Take screenshot of dock
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '00-dock-overview.png'),
            fullPage: false
        });
        console.log('    ✓ Captured dock overview');

        // Try to access shipyard
        console.log('\n[5] Accessing shipyard...');

        // Look for shipyard button
        const shipyardFound = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, .menu-item, .dock-option'));
            for (const btn of buttons) {
                if (btn.textContent.toLowerCase().includes('ship') ||
                    btn.textContent.toLowerCase().includes('yard') ||
                    btn.textContent.toLowerCase().includes('buy')) {
                    btn.click();
                    return true;
                }
            }
            return false;
        });

        await sleep(1000);

        // Take screenshot of shipyard
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '01-shipyard-menu.png'),
            fullPage: false
        });

        // Now iterate through ships if possible
        console.log('\n[6] Capturing individual ship views...');
        let capturedCount = 0;

        // Get available ship categories
        const categories = await page.evaluate(() => {
            const cats = document.querySelectorAll('.ship-category, .category-tab, [data-category]');
            return Array.from(cats).map(c => c.textContent || c.dataset.category);
        });

        if (categories.length > 0) {
            console.log(`    Found ${categories.length} categories`);
        }

        // Try to capture each ship listing
        const shipElements = await page.evaluate(() => {
            const ships = document.querySelectorAll('.ship-item, .ship-card, .ship-listing, [data-ship]');
            return ships.length;
        });

        if (shipElements > 0) {
            console.log(`    Found ${shipElements} ship elements`);

            for (let i = 0; i < Math.min(shipElements, 30); i++) {
                await page.evaluate((index) => {
                    const ships = document.querySelectorAll('.ship-item, .ship-card, .ship-listing, [data-ship]');
                    if (ships[index]) {
                        ships[index].click();
                    }
                }, i);

                await sleep(500);

                // Get ship name for filename
                const shipName = await page.evaluate(() => {
                    const nameEl = document.querySelector('.ship-name, .selected-ship-name, h2, h3');
                    return nameEl ? nameEl.textContent.trim() : null;
                });

                if (shipName) {
                    const safeName = shipName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
                    await page.screenshot({
                        path: path.join(OUTPUT_DIR, `ship-${safeName}.png`),
                        fullPage: false
                    });
                    console.log(`    ✓ Captured: ${shipName}`);
                    capturedCount++;
                }
            }
        }

        // If we couldn't find ship elements, take general screenshots
        if (capturedCount === 0) {
            console.log('    ! No individual ships found, capturing general views...');

            // Try keyboard navigation
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('ArrowDown');
                await sleep(300);
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, `shipyard-view-${i + 1}.png`),
                    fullPage: false
                });
                capturedCount++;
            }
        }

        // Take final full-page screenshot
        console.log('\n[7] Taking full interface screenshot...');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'full-interface.png'),
            fullPage: true
        });

        console.log('\n' + '='.repeat(60));
        console.log('CAPTURE COMPLETE');
        console.log('='.repeat(60));
        console.log(`Total screenshots: ${capturedCount + 3}`);
        console.log(`Output directory: ${OUTPUT_DIR}`);

    } catch (err) {
        console.error('Error:', err.message);
    }

    await browser.close();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

captureShipyard().catch(console.error);
