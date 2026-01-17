#!/usr/bin/env node
/**
 * Captures screenshots of the model comparison page
 * Shows Blender reference renders vs Game GLB renders side-by-side
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'evo_assets', 'comparison_screenshots');

async function captureComparison() {
    console.log('='.repeat(60));
    console.log('MODEL COMPARISON SCREENSHOT CAPTURE');
    console.log('='.repeat(60));

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log('\n[1] Loading comparison page...');
        await page.goto('http://localhost:8888/model-comparison.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for images to load
        await page.waitForFunction(() => {
            const imgs = document.querySelectorAll('img');
            return Array.from(imgs).every(img => img.complete);
        }, { timeout: 15000 });

        await sleep(2000); // Extra time for status updates

        console.log('    ✓ Page loaded');

        // Get stats
        const stats = await page.evaluate(() => {
            const statsEl = document.getElementById('stats');
            return statsEl ? statsEl.textContent : 'Stats not found';
        });
        console.log(`\n[2] Comparison Stats:\n    ${stats}`);

        // Capture full page
        console.log('\n[3] Capturing full comparison page...');
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'full-comparison.png'),
            fullPage: true
        });
        console.log('    ✓ Full page captured');

        // Capture header section
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'comparison-header.png'),
            clip: { x: 0, y: 0, width: 1920, height: 300 }
        });
        console.log('    ✓ Header section captured');

        // Get list of models
        const models = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.comparison')).map(c => ({
                name: c.dataset.model,
                status: c.dataset.status
            }));
        });

        console.log(`\n[4] Found ${models.length} models`);

        // Capture individual comparisons (first 10)
        console.log('\n[5] Capturing individual ship comparisons...');
        const comparisons = await page.$$('.comparison');

        for (let i = 0; i < Math.min(comparisons.length, 10); i++) {
            const box = await comparisons[i].boundingBox();
            if (box) {
                const model = models[i];
                const safeName = model.name.replace(/[^a-zA-Z0-9]/g, '_');
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, `ship_${safeName}.png`),
                    clip: {
                        x: Math.max(0, box.x - 10),
                        y: Math.max(0, box.y - 10),
                        width: box.width + 20,
                        height: box.height + 20
                    }
                });
                const icon = model.status === 'verified' ? '✓' : '✗';
                console.log(`    ${icon} ${model.name} (${model.status})`);
            }
        }

        // Summary
        const verified = models.filter(m => m.status === 'verified').length;
        const missing = models.filter(m => m.status === 'missing').length;

        console.log('\n' + '='.repeat(60));
        console.log('COMPARISON SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Models: ${models.length}`);
        console.log(`Verified (both renders present): ${verified}`);
        console.log(`Missing: ${missing}`);
        console.log(`Match Rate: ${((verified / models.length) * 100).toFixed(1)}%`);
        console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);

    } catch (err) {
        console.error('Error:', err.message);
    }

    await browser.close();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

captureComparison().catch(console.error);
