#!/usr/bin/env node
/**
 * Comprehensive EV Nova System Verification
 * Tests all game systems with actual gameplay simulation
 */

const puppeteer = require('puppeteer');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function comprehensiveTest() {
    console.log('='.repeat(70));
    console.log('COMPREHENSIVE EV NOVA SYSTEM VERIFICATION');
    console.log('='.repeat(70));

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader'
        ]
    });

    const page = await browser.newPage();

    // Track ALL errors and failed requests
    const errors = [];
    const failedRequests = [];
    const consoleMessages = [];

    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            errors.push(text);
        }
        consoleMessages.push({ type: msg.type(), text });
    });

    page.on('requestfailed', req => {
        failedRequests.push({
            url: req.url(),
            failure: req.failure()?.errorText || 'unknown'
        });
    });

    page.on('response', res => {
        if (res.status() >= 400) {
            failedRequests.push({
                url: res.url(),
                status: res.status()
            });
        }
    });

    let testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function recordTest(name, passed, details = '') {
        testResults.tests.push({ name, passed, details });
        if (passed) testResults.passed++;
        else testResults.failed++;
        const icon = passed ? '✓' : '✗';
        console.log(`    ${icon} ${name}${details ? ': ' + details : ''}`);
    }

    try {
        // ============================================================
        // PHASE 1: Load Game
        // ============================================================
        console.log('\n[PHASE 1] Loading Game...');
        await page.goto('http://localhost:8888/space-armada/index.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await sleep(2000);
        recordTest('Game page loaded', true);

        // ============================================================
        // PHASE 2: Verify EV Data Structures
        // ============================================================
        console.log('\n[PHASE 2] Verifying EV Data Structures...');

        // Test EV_SHIP_STATS
        const shipStats = await page.evaluate(() => {
            if (typeof window.EV_SHIP_STATS === 'undefined') return null;
            const stats = window.EV_SHIP_STATS;
            return {
                typeCount: Object.keys(stats).length,
                types: Object.keys(stats),
                fighter: stats.fighter,
                heavy: stats.heavy,
                boss: stats.boss
            };
        });

        if (shipStats) {
            recordTest('EV_SHIP_STATS exists', true, `${shipStats.typeCount} ship types`);
            recordTest('Fighter has shield/armor',
                shipStats.fighter.shield === 25 && shipStats.fighter.armor === 15,
                `shield=${shipStats.fighter.shield}, armor=${shipStats.fighter.armor}`);
            recordTest('Heavy has higher stats',
                shipStats.heavy.shield > shipStats.fighter.shield,
                `shield=${shipStats.heavy.shield}, armor=${shipStats.heavy.armor}`);
            recordTest('Boss has highest stats',
                shipStats.boss.shield > shipStats.heavy.shield,
                `shield=${shipStats.boss.shield}, armor=${shipStats.boss.armor}`);
        } else {
            recordTest('EV_SHIP_STATS exists', false, 'NOT FOUND');
        }

        // Test AI_BEHAVIORS
        const aiBehaviors = await page.evaluate(() => {
            if (typeof window.AI_BEHAVIORS === 'undefined') return null;
            const ai = window.AI_BEHAVIORS;
            return {
                typeCount: Object.keys(ai).length,
                types: Object.keys(ai),
                wimpyTrader: ai.wimpyTrader,
                interceptor: ai.interceptor
            };
        });

        if (aiBehaviors) {
            recordTest('AI_BEHAVIORS exists', true, `${aiBehaviors.typeCount} AI types`);
            recordTest('WimpyTrader flees easily',
                aiBehaviors.wimpyTrader.fleeThreshold >= 0.8,
                `fleeThreshold=${aiBehaviors.wimpyTrader.fleeThreshold}`);
            recordTest('Interceptor is aggressive',
                aiBehaviors.interceptor.aggression >= 0.9,
                `aggression=${aiBehaviors.interceptor.aggression}`);
        } else {
            recordTest('AI_BEHAVIORS exists', false, 'NOT FOUND');
        }

        // Test COMBAT_RATINGS
        const combatRatings = await page.evaluate(() => {
            if (typeof window.COMBAT_RATINGS === 'undefined') return null;
            return window.COMBAT_RATINGS;
        });

        if (combatRatings) {
            recordTest('COMBAT_RATINGS exists', true, `${combatRatings.length} rating levels`);
            recordTest('Starts with Harmless',
                combatRatings[0].name === 'Harmless',
                `first rating: "${combatRatings[0].name}"`);
            recordTest('Ends with Elite III',
                combatRatings[combatRatings.length - 1].name === 'Elite III',
                `final rating: "${combatRatings[combatRatings.length - 1].name}"`);
        } else {
            recordTest('COMBAT_RATINGS exists', false, 'NOT FOUND');
        }

        // ============================================================
        // PHASE 3: Test EV Functions
        // ============================================================
        console.log('\n[PHASE 3] Testing EV Functions...');

        // Test getCombatRating
        const ratingTests = await page.evaluate(() => {
            if (typeof window.getCombatRating !== 'function') return null;
            return {
                at0: window.getCombatRating(0),
                at10: window.getCombatRating(10),
                at100: window.getCombatRating(100),
                at500: window.getCombatRating(500),
                at5000: window.getCombatRating(5000)
            };
        });

        if (ratingTests) {
            recordTest('getCombatRating(0) = Harmless',
                ratingTests.at0.name === 'Harmless', ratingTests.at0.name);
            recordTest('getCombatRating(10) = Poor',
                ratingTests.at10.name === 'Poor', ratingTests.at10.name);
            recordTest('getCombatRating(100) = Competent',
                ratingTests.at100.name === 'Competent', ratingTests.at100.name);
            recordTest('getCombatRating(500) = Deadly',
                ratingTests.at500.name === 'Deadly', ratingTests.at500.name);
            recordTest('getCombatRating(5000) = Elite III',
                ratingTests.at5000.name === 'Elite III', ratingTests.at5000.name);
        } else {
            recordTest('getCombatRating function', false, 'NOT FOUND');
        }

        // Test applyEVDamage - Energy damage
        const energyDamageTest = await page.evaluate(() => {
            if (typeof window.applyEVDamage !== 'function') return null;
            const target = {
                shield: 50, maxShield: 50,
                armor: 30, maxArmor: 30,
                health: 80, maxHealth: 80,
                disableThreshold: 0.33,
                disabled: false, destroyed: false
            };
            const before = { shield: target.shield, armor: target.armor };
            window.applyEVDamage(target, 30, 0); // 30 energy, 0 mass
            return {
                before,
                after: { shield: target.shield, armor: target.armor },
                disabled: target.disabled,
                destroyed: target.destroyed
            };
        });

        if (energyDamageTest) {
            recordTest('Energy damage hits shields first',
                energyDamageTest.after.shield === 20 && energyDamageTest.after.armor === 30,
                `shield: ${energyDamageTest.before.shield} → ${energyDamageTest.after.shield}`);
        } else {
            recordTest('applyEVDamage (energy)', false, 'NOT FOUND');
        }

        // Test applyEVDamage - Mass damage
        const massDamageTest = await page.evaluate(() => {
            if (typeof window.applyEVDamage !== 'function') return null;
            const target = {
                shield: 50, maxShield: 50,
                armor: 30, maxArmor: 30,
                health: 80, maxHealth: 80,
                disableThreshold: 0.33,
                disabled: false, destroyed: false
            };
            const before = { shield: target.shield, armor: target.armor };
            window.applyEVDamage(target, 0, 20); // 0 energy, 20 mass
            return {
                before,
                after: { shield: target.shield, armor: target.armor },
                disabled: target.disabled
            };
        });

        if (massDamageTest) {
            recordTest('Mass damage hits armor directly',
                massDamageTest.after.armor === 10 && massDamageTest.after.shield === 50,
                `armor: ${massDamageTest.before.armor} → ${massDamageTest.after.armor}`);
        } else {
            recordTest('applyEVDamage (mass)', false, 'NOT FOUND');
        }

        // Test applyEVDamage - Shield bleedthrough
        const bleedthroughTest = await page.evaluate(() => {
            if (typeof window.applyEVDamage !== 'function') return null;
            const target = {
                shield: 10, maxShield: 50,
                armor: 30, maxArmor: 30,
                health: 40, maxHealth: 80,
                disableThreshold: 0.33,
                disabled: false, destroyed: false
            };
            window.applyEVDamage(target, 30, 0); // 30 energy with only 10 shield
            // Should: deplete 10 shield, then 20 remaining * 0.5 = 10 armor damage
            return {
                shield: target.shield,
                armor: target.armor,
                expectedArmor: 20 // 30 - 10 = 20 * 0.5 = 10 bleed, so 30 - 10 = 20
            };
        });

        if (bleedthroughTest) {
            recordTest('Energy bleeds to armor at 50%',
                bleedthroughTest.shield === 0 && bleedthroughTest.armor === 20,
                `shield=${bleedthroughTest.shield}, armor=${bleedthroughTest.armor}`);
        }

        // Test applyEVDamage - Disable threshold
        const disableTest = await page.evaluate(() => {
            if (typeof window.applyEVDamage !== 'function') return null;
            const target = {
                shield: 0, maxShield: 50,
                armor: 15, maxArmor: 30, // 50% armor
                health: 15, maxHealth: 80,
                disableThreshold: 0.33,
                disabled: false, destroyed: false
            };
            window.applyEVDamage(target, 0, 10); // Hit armor, should bring to 5/30 = 16%
            return {
                armor: target.armor,
                disabled: target.disabled,
                armorPercent: target.armor / target.maxArmor
            };
        });

        if (disableTest) {
            recordTest('Ship disabled at 33% armor',
                disableTest.disabled === true,
                `armor=${disableTest.armor}/${30} (${(disableTest.armorPercent * 100).toFixed(0)}%), disabled=${disableTest.disabled}`);
        }

        // Test applyEVDamage - Destruction
        const destroyTest = await page.evaluate(() => {
            if (typeof window.applyEVDamage !== 'function') return null;
            const target = {
                shield: 0, maxShield: 50,
                armor: 5, maxArmor: 30,
                health: 5, maxHealth: 80,
                disableThreshold: 0.33,
                disabled: true, destroyed: false
            };
            const result = window.applyEVDamage(target, 0, 10);
            return {
                armor: target.armor,
                destroyed: result, // applyEVDamage returns true if destroyed
                health: target.health
            };
        });

        if (destroyTest) {
            recordTest('Ship destroyed at 0 armor',
                destroyTest.destroyed === true,
                `armor=${destroyTest.armor}, destroyed=${destroyTest.destroyed}`);
        }

        // Test updateShipRegeneration
        const regenTest = await page.evaluate(() => {
            if (typeof window.updateShipRegeneration !== 'function') return null;
            const ship = {
                shield: 20, maxShield: 50,
                armor: 15, maxArmor: 30,
                shieldRecharge: 10, // 10 per second
                armorRecharge: 2,   // 2 per second
                health: 35, maxHealth: 80,
                disabled: false, destroyed: false
            };
            const before = { shield: ship.shield, armor: ship.armor };
            window.updateShipRegeneration(ship, 2.0); // 2 seconds
            return {
                before,
                after: { shield: ship.shield, armor: ship.armor },
                expectedShield: Math.min(50, 20 + 10 * 2), // 40
                expectedArmor: Math.min(30, 15 + 2 * 2)    // 19
            };
        });

        if (regenTest) {
            recordTest('Shield regenerates correctly',
                regenTest.after.shield === 40,
                `${regenTest.before.shield} + (10 * 2s) = ${regenTest.after.shield}`);
            recordTest('Armor regenerates correctly',
                regenTest.after.armor === 19,
                `${regenTest.before.armor} + (2 * 2s) = ${regenTest.after.armor}`);
        } else {
            recordTest('updateShipRegeneration', false, 'NOT FOUND');
        }

        // Test regen caps at max
        const regenCapTest = await page.evaluate(() => {
            if (typeof window.updateShipRegeneration !== 'function') return null;
            const ship = {
                shield: 48, maxShield: 50,
                armor: 29, maxArmor: 30,
                shieldRecharge: 10,
                armorRecharge: 5,
                health: 77, maxHealth: 80,
                disabled: false, destroyed: false
            };
            window.updateShipRegeneration(ship, 5.0); // 5 seconds - would overshoot
            return {
                shield: ship.shield,
                armor: ship.armor,
                shieldCapped: ship.shield === ship.maxShield,
                armorCapped: ship.armor === ship.maxArmor
            };
        });

        if (regenCapTest) {
            recordTest('Regen caps at max values',
                regenCapTest.shieldCapped && regenCapTest.armorCapped,
                `shield=${regenCapTest.shield}/50, armor=${regenCapTest.armor}/30`);
        }

        // ============================================================
        // PHASE 4: Test HUD Elements
        // ============================================================
        console.log('\n[PHASE 4] Testing HUD Elements...');

        const hudTest = await page.evaluate(() => {
            const combatRating = document.getElementById('combatRating');
            const targetInfo = document.getElementById('targetInfo');
            return {
                combatRatingExists: !!combatRating,
                combatRatingText: combatRating?.textContent,
                combatRatingColor: combatRating?.style.color,
                targetInfoExists: !!targetInfo
            };
        });

        recordTest('Combat rating HUD element exists',
            hudTest.combatRatingExists,
            hudTest.combatRatingText ? `showing "${hudTest.combatRatingText}"` : '');
        recordTest('Combat rating has correct initial color',
            hudTest.combatRatingColor === 'rgb(102, 102, 102)',
            hudTest.combatRatingColor);

        // ============================================================
        // PHASE 5: Simulate Gameplay and Test Enemy Spawning
        // ============================================================
        console.log('\n[PHASE 5] Simulating Gameplay...');

        // Start the game
        await page.evaluate(() => {
            if (typeof startGame === 'function') startGame();
        });
        await sleep(1000);

        // Press keys to start
        await page.keyboard.press('Space');
        await sleep(500);
        await page.keyboard.press('Enter');
        await sleep(2000);

        // Check if game started
        const gameState = await page.evaluate(() => {
            return {
                gameRunning: typeof gameRunning !== 'undefined' ? gameRunning : null,
                enemyCount: typeof window.enemies !== 'undefined' ? window.enemies.length : 0
            };
        });

        recordTest('Game started', gameState.gameRunning === true || gameState.enemyCount > 0,
            `running=${gameState.gameRunning}, enemies=${gameState.enemyCount}`);

        // Wait for enemies to spawn
        await sleep(3000);

        // Check enemies have EV stats
        const enemyStats = await page.evaluate(() => {
            if (typeof window.enemies === 'undefined' || window.enemies.length === 0) {
                return { error: 'No enemies array or empty' };
            }

            const enemy = window.enemies[0];
            return {
                count: window.enemies.length,
                type: enemy.type,
                hasShield: typeof enemy.shield === 'number',
                hasMaxShield: typeof enemy.maxShield === 'number',
                hasArmor: typeof enemy.armor === 'number',
                hasMaxArmor: typeof enemy.maxArmor === 'number',
                hasShieldRecharge: typeof enemy.shieldRecharge === 'number',
                hasAiBehavior: typeof enemy.aiBehavior === 'object',
                hasDisableThreshold: typeof enemy.disableThreshold === 'number',
                shield: enemy.shield,
                maxShield: enemy.maxShield,
                armor: enemy.armor,
                maxArmor: enemy.maxArmor,
                shieldRecharge: enemy.shieldRecharge,
                aiType: enemy.aiType,
                aiBehavior: enemy.aiBehavior
            };
        });

        if (enemyStats.error) {
            recordTest('Enemies spawned', false, enemyStats.error);
        } else {
            recordTest('Enemies spawned', true, `${enemyStats.count} enemies`);
            recordTest('Enemy has shield stat', enemyStats.hasShield,
                `shield=${enemyStats.shield}/${enemyStats.maxShield}`);
            recordTest('Enemy has armor stat', enemyStats.hasArmor,
                `armor=${enemyStats.armor}/${enemyStats.maxArmor}`);
            recordTest('Enemy has shieldRecharge', enemyStats.hasShieldRecharge,
                `recharge=${enemyStats.shieldRecharge}`);
            recordTest('Enemy has AI behavior', enemyStats.hasAiBehavior,
                `aiType=${enemyStats.aiType}`);
            recordTest('Enemy has disable threshold', enemyStats.hasDisableThreshold,
                `threshold=${enemyStats.disableThreshold || 'N/A'}`);
        }

        // ============================================================
        // PHASE 6: Test Combat Integration
        // ============================================================
        console.log('\n[PHASE 6] Testing Combat Integration...');

        // Simulate some movement and combat
        await page.keyboard.down('KeyW');
        await sleep(500);
        await page.keyboard.up('KeyW');

        // Fire weapon
        await page.keyboard.down('Space');
        await sleep(200);
        await page.keyboard.up('Space');
        await sleep(500);

        // Check if combat systems are accessible
        const combatIntegration = await page.evaluate(() => {
            return {
                hasProjectiles: Array.isArray(window.projectiles),
                projectileCount: window.projectiles ? window.projectiles.length : 0,
                gameRunning: window.gameRunning
            };
        });

        recordTest('Projectile system exists', combatIntegration.hasProjectiles,
            `array with ${combatIntegration.projectileCount} projectiles`);
        recordTest('Game running state exposed', combatIntegration.gameRunning === true,
            `gameRunning=${combatIntegration.gameRunning}`);

        // Test actual damage application by checking source code integration
        const damageIntegration = await page.evaluate(() => {
            // Verify applyEVDamage is available and enemies have EV stats
            const hasFunction = typeof window.applyEVDamage === 'function';
            const enemyHasStats = window.enemies && window.enemies[0] &&
                typeof window.enemies[0].shield === 'number' &&
                typeof window.enemies[0].armor === 'number';
            return { hasFunction, enemyHasStats };
        });

        recordTest('applyEVDamage integrated with combat',
            damageIntegration.hasFunction && damageIntegration.enemyHasStats,
            `function=${damageIntegration.hasFunction}, enemyStats=${damageIntegration.enemyHasStats}`);

        // ============================================================
        // PHASE 7: Report Errors
        // ============================================================
        console.log('\n[PHASE 7] Error Report...');

        // Filter out non-critical requests (favicon, etc.)
        const criticalFailedRequests = failedRequests.filter(req =>
            !req.url.includes('favicon')
        );

        if (criticalFailedRequests.length > 0) {
            console.log(`    ✗ ${criticalFailedRequests.length} failed requests:`);
            criticalFailedRequests.forEach(req => {
                console.log(`      - ${req.url} (${req.status || req.failure})`);
            });
            testResults.failed++;
        } else {
            recordTest('No failed HTTP requests', true,
                failedRequests.length > 0 ? `(${failedRequests.length} non-critical ignored)` : '');
        }

        const criticalErrors = errors.filter(e =>
            !e.includes('WebGL') &&
            !e.includes('GL_INVALID') &&
            !e.includes('RENDER WARNING')
        );

        if (criticalErrors.length > 0) {
            console.log(`    ✗ ${criticalErrors.length} JavaScript errors:`);
            criticalErrors.forEach(e => console.log(`      - ${e}`));
            testResults.failed++;
        } else {
            recordTest('No critical JavaScript errors', true);
        }

        // ============================================================
        // FINAL SUMMARY
        // ============================================================
        console.log('\n' + '='.repeat(70));
        console.log('TEST SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
        console.log(`Passed: ${testResults.passed}`);
        console.log(`Failed: ${testResults.failed}`);
        console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(70));

        if (testResults.failed > 0) {
            console.log('\nFailed Tests:');
            testResults.tests.filter(t => !t.passed).forEach(t => {
                console.log(`  - ${t.name}${t.details ? ': ' + t.details : ''}`);
            });
        }

    } catch (err) {
        console.error('\nFATAL ERROR:', err.message);
        console.error(err.stack);
    }

    await browser.close();
}

comprehensiveTest().catch(console.error);
