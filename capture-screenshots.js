#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const MODEL_FILES = [
    'Arada.glb',
    'Azdara.glb',
    'Azdgari Arada.glb',
    'Azdgari Warship.glb',
    'Cargo Freighter.glb',
    'Crescent Fighter.glb',
    'Crescent Warship.glb',
    'Emalgha Fighter.glb',
    'Emalgha Freighter.glb',
    'Escape Pod.glb',
    'Freight Courier.glb',
    'Helian.glb',
    'Igadzra Arada.glb',
    'Igazra.glb',
    'Krait.glb',
    'Lazira.glb',
    'Miranu Courier.glb',
    'Miranu Freighter II.glb',
    'Miranu Freighter.glb',
    'Miranu Gunship.glb',
    'Scoutship.glb',
    'Shuttle.glb',
    'Turncoat.glb',
    'UE Carrier.glb',
    'UE Fighter.glb',
    'UE Freighter.glb',
    'Voinian Cruiser.glb',
    'Voinian Dreadnaught.glb',
    'Voinian Frigate.glb',
    'Voinian Heavy Fighter.glb'
];

const PROJECT_DIR = __dirname;
const OUTPUT_DIR = path.join(PROJECT_DIR, 'evo_assets', 'game_renders');
const PORT = 8765;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function startServer() {
    return new Promise((resolve, reject) => {
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.glb': 'model/gltf-binary',
            '.png': 'image/png',
            '.json': 'application/json'
        };

        const server = http.createServer((req, res) => {
            let filePath = path.join(PROJECT_DIR, req.url === '/' ? 'model-viewer.html' : req.url);

            // Handle URL-encoded paths
            filePath = decodeURIComponent(filePath);

            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    console.error(`404: ${filePath}`);
                    res.writeHead(404);
                    res.end('Not found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            resolve(server);
        });

        server.on('error', reject);
    });
}

async function captureScreenshots() {
    console.log('Starting screenshot capture...');
    console.log(`Output directory: ${OUTPUT_DIR}`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Start local server
    const server = await startServer();

    // Launch browser with WebGL software rendering
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--enable-webgl',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--ignore-gpu-blocklist',
            '--enable-unsafe-swiftshader'
        ]
    });

    const page = await browser.newPage();

    // Enable console logging from page
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    // Set viewport to match our canvas size
    await page.setViewport({ width: 800, height: 800 });

    // Navigate to the model viewer
    const url = `http://localhost:${PORT}/model-viewer.html`;
    console.log(`Loading: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for Three.js and loader to initialize
    console.log('Waiting for Three.js initialization...');
    await page.waitForFunction(() => {
        return typeof window.loadModelByIndex === 'function';
    }, { timeout: 30000 });

    // Wait for first model to load
    await page.waitForFunction(() => window.modelReady === true, { timeout: 30000 });
    await sleep(1000);

    console.log(`\nCapturing ${MODEL_FILES.length} models...\n`);

    for (let i = 0; i < MODEL_FILES.length; i++) {
        const modelName = MODEL_FILES[i].replace('.glb', '');
        const outputPath = path.join(OUTPUT_DIR, `${modelName}.png`);

        console.log(`[${i + 1}/${MODEL_FILES.length}] Capturing: ${modelName}`);

        // Load the model
        await page.evaluate((index) => {
            window.loadModelByIndex(index);
        }, i);

        // Wait for model to load
        try {
            await page.waitForFunction(() => window.modelReady === true, { timeout: 15000 });
        } catch (e) {
            console.log(`   WARNING: Timeout waiting for ${modelName}, capturing anyway...`);
        }

        // Extra time for rendering
        await sleep(500);

        // Get the canvas element and capture screenshot
        const canvasElement = await page.$('#canvas-container canvas');

        if (canvasElement) {
            await canvasElement.screenshot({ path: outputPath, type: 'png' });
            const stats = fs.statSync(outputPath);
            console.log(`   Saved: ${modelName}.png (${stats.size} bytes)`);
        } else {
            console.error(`   ERROR: Canvas not found for ${modelName}`);
        }
    }

    await browser.close();
    server.close();

    console.log('\n=== Screenshot Capture Complete ===');
    console.log(`Total models captured: ${MODEL_FILES.length}`);
    console.log(`Output directory: ${OUTPUT_DIR}`);

    // List output files with sizes
    console.log('\n--- Output Files ---');
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
    let totalSize = 0;
    files.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        console.log(`  ${file.padEnd(35)} ${stats.size.toString().padStart(8)} bytes`);
    });
    console.log(`\nTotal: ${files.length} files, ${totalSize} bytes`);
}

captureScreenshots().catch(err => {
    console.error('Error during capture:', err);
    process.exit(1);
});
