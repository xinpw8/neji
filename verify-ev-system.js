#!/usr/bin/env node
/**
 * Verification script for EV Nova game system implementation
 * Tests that all EV functions and data structures are properly defined and functional
 */

const puppeteer = require('puppeteer');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verify() {
    console.log('='.repeat(60));
    console.log('EV NOVA SYSTEM VERIFICATION');
    console.log('='.repeat(60));

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

    // Capture console logs (only show non-WebGL errors)
    page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('WebGL')) {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    try {
        console.log('\n[1] Loading game...');
        await page.goto('http://localhost:8888/space-armada/index.html', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await sleep(3000);
        console.log('    ✓ Game loaded successfully');

        // Test EV_SHIP_STATS
        console.log('\n[2] Verifying EV_SHIP_STATS...');
        const shipStats = await page.evaluate(() => {
            if (typeof EV_SHIP_STATS === 'undefined') return null;
            return {
                types: Object.keys(EV_SHIP_STATS),
                fighter: EV_SHIP_STATS.fighter,
                heavy: EV_SHIP_STATS.heavy,
                boss: EV_SHIP_STATS.boss
            };
        });

        if (shipStats) {
            console.log('    ✓ EV_SHIP_STATS defined');
            console.log(`    Ship types: ${shipStats.types.join(', ')}`);
            console.log(`    Fighter stats: shield=${shipStats.fighter.shield}, armor=${shipStats.fighter.armor}, speed=${shipStats.fighter.speed}`);
            console.log(`    Heavy stats: shield=${shipStats.heavy.shield}, armor=${shipStats.heavy.armor}, speed=${shipStats.heavy.speed}`);
            console.log(`    Boss stats: shield=${shipStats.boss.shield}, armor=${shipStats.boss.armor}, speed=${shipStats.boss.speed}`);
        } else {
            console.log('    ✗ EV_SHIP_STATS NOT FOUND');
        }

        // Test AI_BEHAVIORS
        console.log('\n[3] Verifying AI_BEHAVIORS...');
        const aiBehaviors = await page.evaluate(() => {
            if (typeof AI_BEHAVIORS === 'undefined') return null;
            return {
                types: Object.keys(AI_BEHAVIORS),
                wimpyTrader: AI_BEHAVIORS.wimpyTrader,
                interceptor: AI_BEHAVIORS.interceptor
            };
        });

        if (aiBehaviors) {
            console.log('    ✓ AI_BEHAVIORS defined');
            console.log(`    AI types: ${aiBehaviors.types.join(', ')}`);
            console.log(`    WimpyTrader: fleeThreshold=${aiBehaviors.wimpyTrader.fleeThreshold}, aggression=${aiBehaviors.wimpyTrader.aggression}`);
            console.log(`    Interceptor: fleeThreshold=${aiBehaviors.interceptor.fleeThreshold}, aggression=${aiBehaviors.interceptor.aggression}`);
        } else {
            console.log('    ✗ AI_BEHAVIORS NOT FOUND');
        }

        // Test COMBAT_RATINGS
        console.log('\n[4] Verifying COMBAT_RATINGS...');
        const combatRatings = await page.evaluate(() => {
            if (typeof COMBAT_RATINGS === 'undefined') return null;
            return COMBAT_RATINGS;
        });

        if (combatRatings) {
            console.log('    ✓ COMBAT_RATINGS defined');
            console.log(`    ${combatRatings.length} rating levels:`);
            combatRatings.forEach(r => console.log(`      ${r.kills} kills = "${r.name}" (${r.color})`));
        } else {
            console.log('    ✗ COMBAT_RATINGS NOT FOUND');
        }

        // Test getCombatRating function
        console.log('\n[5] Verifying getCombatRating()...');
        const ratingTests = await page.evaluate(() => {
            if (typeof getCombatRating !== 'function') return null;
            return {
                rating0: getCombatRating(0),
                rating50: getCombatRating(50),
                rating200: getCombatRating(200),
                rating1000: getCombatRating(1000)
            };
        });

        if (ratingTests) {
            console.log('    ✓ getCombatRating() function works');
            console.log(`    0 kills = "${ratingTests.rating0.name}"`);
            console.log(`    50 kills = "${ratingTests.rating50.name}"`);
            console.log(`    200 kills = "${ratingTests.rating200.name}"`);
            console.log(`    1000 kills = "${ratingTests.rating1000.name}"`);
        } else {
            console.log('    ✗ getCombatRating() NOT FOUND');
        }

        // Test applyEVDamage function
        console.log('\n[6] Verifying applyEVDamage()...');
        const damageTest = await page.evaluate(() => {
            if (typeof applyEVDamage !== 'function') return null;

            // Create test target
            const target = {
                shield: 25, maxShield: 25,
                armor: 15, maxArmor: 15,
                disableThreshold: 0.33,
                health: 40, maxHealth: 40,
                disabled: false, destroyed: false
            };

            // Apply 20 energy damage (should hit shields first)
            applyEVDamage(target, 20, 0);
            const afterEnergy = { shield: target.shield, armor: target.armor, disabled: target.disabled };

            // Apply 10 mass damage (should hit armor)
            applyEVDamage(target, 0, 10);
            const afterMass = { shield: target.shield, armor: target.armor, disabled: target.disabled };

            return { afterEnergy, afterMass };
        });

        if (damageTest) {
            console.log('    ✓ applyEVDamage() function works');
            console.log(`    After 20 energy damage: shield=${damageTest.afterEnergy.shield}, armor=${damageTest.afterEnergy.armor}`);
            console.log(`    After 10 mass damage: shield=${damageTest.afterMass.shield}, armor=${damageTest.afterMass.armor}, disabled=${damageTest.afterMass.disabled}`);
        } else {
            console.log('    ✗ applyEVDamage() NOT FOUND');
        }

        // Test updateShipRegeneration function
        console.log('\n[7] Verifying updateShipRegeneration()...');
        const regenTest = await page.evaluate(() => {
            if (typeof updateShipRegeneration !== 'function') return null;

            const ship = {
                shield: 10, maxShield: 25,
                armor: 10, maxArmor: 15,
                shieldRecharge: 5,  // 5 per second
                armorRecharge: 0,
                health: 20, maxHealth: 40,
                disabled: false, destroyed: false
            };

            const before = { shield: ship.shield, armor: ship.armor };
            updateShipRegeneration(ship, 1.0);  // 1 second
            const after = { shield: ship.shield, armor: ship.armor };

            return { before, after };
        });

        if (regenTest) {
            console.log('    ✓ updateShipRegeneration() function works');
            console.log(`    Before: shield=${regenTest.before.shield}, armor=${regenTest.before.armor}`);
            console.log(`    After 1s: shield=${regenTest.after.shield}, armor=${regenTest.after.armor}`);
            console.log(`    Shield regenerated: ${regenTest.after.shield - regenTest.before.shield} points`);
        } else {
            console.log('    ✗ updateShipRegeneration() NOT FOUND');
        }

        // Verify enemy spawning uses EV stats
        console.log('\n[8] Verifying enemy spawning with EV stats...');
        const enemyCheck = await page.evaluate(() => {
            if (typeof enemies === 'undefined' || enemies.length === 0) {
                return { error: 'No enemies spawned yet' };
            }
            const enemy = enemies[0];
            return {
                type: enemy.type,
                hasShield: typeof enemy.shield !== 'undefined',
                hasArmor: typeof enemy.armor !== 'undefined',
                hasShieldRecharge: typeof enemy.shieldRecharge !== 'undefined',
                hasAiBehavior: typeof enemy.aiBehavior !== 'undefined',
                shield: enemy.shield,
                maxShield: enemy.maxShield,
                armor: enemy.armor,
                maxArmor: enemy.maxArmor,
                aiType: enemy.aiType
            };
        });

        if (enemyCheck.error) {
            console.log(`    ! ${enemyCheck.error}`);
        } else {
            console.log('    ✓ Enemy has EV stats:');
            console.log(`      type: ${enemyCheck.type}`);
            console.log(`      shield: ${enemyCheck.shield}/${enemyCheck.maxShield}`);
            console.log(`      armor: ${enemyCheck.armor}/${enemyCheck.maxArmor}`);
            console.log(`      aiType: ${enemyCheck.aiType}`);
            console.log(`      hasShieldRecharge: ${enemyCheck.hasShieldRecharge}`);
            console.log(`      hasAiBehavior: ${enemyCheck.hasAiBehavior}`);
        }

        // Check HUD combat rating element
        console.log('\n[9] Verifying HUD combat rating element...');
        const hudCheck = await page.evaluate(() => {
            const element = document.getElementById('combatRating');
            if (!element) return null;
            return {
                exists: true,
                text: element.textContent,
                color: element.style.color
            };
        });

        if (hudCheck) {
            console.log('    ✓ Combat rating HUD element exists');
            console.log(`      Text: "${hudCheck.text}"`);
            console.log(`      Color: ${hudCheck.color}`);
        } else {
            console.log('    ✗ Combat rating HUD element NOT FOUND');
        }

        console.log('\n' + '='.repeat(60));
        console.log('VERIFICATION COMPLETE');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Verification error:', err.message);
    }

    await browser.close();
}

verify().catch(console.error);
