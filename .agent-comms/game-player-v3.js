/**
 * Space Armada Game Player v3
 * - Uses MOUSE to aim (ship auto-faces cursor)
 * - Uses WASD/Arrows for movement (strafe)
 * - Plays until death
 */
const puppeteer = require('puppeteer');

const GAME_URL = 'http://localhost:8888/space-armada/index.html';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBasicFunctions(page, playerName) {
  console.log(`\n=== ${playerName}: TESTING BASIC CONTROLS ===\n`);
  const results = { movement: false, aiming: false, firing: false, tested: [] };

  try {
    // Test 1: Movement (strafe)
    console.log('Testing: Movement (WASD strafing)...');
    const posBefore = await page.evaluate(() => ({ x: window.playerState?.x || 0, y: window.playerState?.y || 0 }));
    await page.keyboard.down('KeyW');
    await sleep(500);
    await page.keyboard.up('KeyW');
    await sleep(200);
    const posAfter = await page.evaluate(() => ({ x: window.playerState?.x || 0, y: window.playerState?.y || 0 }));
    results.movement = (posBefore.x !== posAfter.x || posBefore.y !== posAfter.y);
    console.log(`  Movement: ${results.movement ? 'PASS' : 'FAIL'}`);
    results.tested.push('movement');

    // Test 2: Aiming (mouse movement changes rotation)
    console.log('Testing: Aiming (mouse controls rotation)...');
    const rotBefore = await page.evaluate(() => window.playerState?.rotation || 0);
    // Move mouse to different position
    await page.mouse.move(800, 400); // Right side
    await sleep(300);
    const rotAfter1 = await page.evaluate(() => window.playerState?.rotation || 0);
    await page.mouse.move(400, 600); // Bottom left
    await sleep(300);
    const rotAfter2 = await page.evaluate(() => window.playerState?.rotation || 0);
    results.aiming = (Math.abs(rotAfter1 - rotBefore) > 0.1 || Math.abs(rotAfter2 - rotAfter1) > 0.1);
    console.log(`  Aiming: ${results.aiming ? 'PASS' : 'FAIL'} (rotation changed: ${rotBefore.toFixed(2)} -> ${rotAfter1.toFixed(2)} -> ${rotAfter2.toFixed(2)})`);
    results.tested.push('aiming');

    // Test 3: Firing
    console.log('Testing: Firing (Space key)...');
    await page.keyboard.press('Space');
    await sleep(100);
    await page.keyboard.press('Space');
    await sleep(100);
    const shots = await page.evaluate(() => window.projectiles?.length || 0);
    results.firing = shots > 0;
    console.log(`  Firing: ${results.firing ? 'PASS' : 'FAIL'} (${shots} projectiles)`);
    results.tested.push('firing');

    console.log('\n=== TEST SUMMARY ===');
    const passed = Object.values(results).filter(v => v === true).length;
    console.log(`Passed: ${passed}/3 tests`);
    console.log('====================\n');

  } catch (err) {
    console.error('Test error:', err.message);
  }

  return results;
}

async function playUntilDeath(page, playerName) {
  console.log(`\n=== ${playerName}: COMBAT MODE ===\n`);

  const startTime = Date.now();
  let gameOver = false;
  let kills = 0;
  let credits = 0;
  let lastLogTime = 0;
  let totalShots = 0;
  let maxKillStreak = 0;
  let currentStreak = 0;
  let lastKills = 0;

  // Get viewport size for mouse positioning
  const viewport = page.viewport();
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  while (!gameOver) {
    const state = await page.evaluate(() => {
      if (!window.playerState) return null;
      const player = window.playerState;
      const enemies = window.enemies || [];

      let nearestEnemy = null;
      let minDist = Infinity;
      for (const e of enemies) {
        if (!e || e.destroyed) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
          minDist = dist;
          nearestEnemy = {
            x: e.x, y: e.y, dist,
            screenX: 0, screenY: 0 // Will be calculated
          };
        }
      }

      // Calculate screen position of enemy (approximate)
      // The camera is top-down, centered on player
      if (nearestEnemy) {
        // World to screen conversion (simplified)
        const cameraHeight = 500; // Approximate camera height
        const scale = window.innerHeight / (2 * cameraHeight * Math.tan(Math.PI / 8)); // FOV factor
        nearestEnemy.screenX = window.innerWidth / 2 + (nearestEnemy.x - player.x) * scale;
        nearestEnemy.screenY = window.innerHeight / 2 + (nearestEnemy.y - player.y) * scale;
      }

      return {
        x: player.x, y: player.y,
        rotation: player.rotation || 0,
        hull: player.hull || 0,
        maxHull: player.maxHull || 100,
        shields: player.shields || 0,
        maxShields: player.maxShields || 100,
        credits: player.credits || 0,
        kills: player.kills || 0,
        nearestEnemy,
        enemyCount: enemies.filter(e => e && !e.destroyed).length,
        gameOver: window.gameOver || false
      };
    });

    if (!state) {
      await sleep(100);
      continue;
    }

    if (state.gameOver || state.hull <= 0) {
      gameOver = true;
      console.log('\n*** GAME OVER ***');
      break;
    }

    kills = state.kills;
    credits = state.credits;

    if (kills > lastKills) {
      currentStreak += (kills - lastKills);
      if (currentStreak > maxKillStreak) maxKillStreak = currentStreak;
      lastKills = kills;
    }

    const now = Date.now();
    if (now - lastLogTime > 5000) {
      const elapsed = Math.floor((now - startTime) / 1000);
      const hullPct = Math.round((state.hull / state.maxHull) * 100);
      console.log(`[${elapsed}s] Hull: ${hullPct}% | Kills: ${kills} | Credits: ${credits} | Enemies: ${state.enemyCount}`);
      lastLogTime = now;
    }

    // COMBAT AI
    if (state.nearestEnemy && state.nearestEnemy.dist < 800) {
      const enemy = state.nearestEnemy;

      // AIM: Move mouse toward enemy position on screen
      const targetX = Math.max(50, Math.min(viewport.width - 50, enemy.screenX));
      const targetY = Math.max(50, Math.min(viewport.height - 50, enemy.screenY));
      await page.mouse.move(targetX, targetY);

      // APPROACH or EVADE based on distance
      if (enemy.dist > 300) {
        // Move toward enemy (W key)
        await page.keyboard.down('KeyW');
        await sleep(30);
        await page.keyboard.up('KeyW');
      } else if (enemy.dist < 100) {
        // Too close, back up
        await page.keyboard.down('KeyS');
        await sleep(30);
        await page.keyboard.up('KeyS');
      }

      // Strafe for evasion
      if (state.shields < state.maxShields * 0.3) {
        const strafeKey = Math.random() > 0.5 ? 'KeyA' : 'KeyD';
        await page.keyboard.down(strafeKey);
        await sleep(30);
        await page.keyboard.up(strafeKey);
      }

      // FIRE! (rapid fire)
      await page.keyboard.press('Space');
      totalShots++;

    } else {
      // No enemies nearby - explore
      await page.keyboard.down('KeyW');
      await sleep(50);
      await page.keyboard.up('KeyW');

      // Random mouse movement to scan area
      const scanX = centerX + (Math.random() - 0.5) * 400;
      const scanY = centerY + (Math.random() - 0.5) * 400;
      await page.mouse.move(scanX, scanY);

      currentStreak = 0;
    }

    await sleep(50);
  }

  return {
    kills,
    credits,
    survivalTime: Math.floor((Date.now() - startTime) / 1000),
    maxKillStreak,
    totalShots
  };
}

async function playGame(playerName = 'Unknown') {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${playerName} - SPACE ARMADA CHALLENGER v3`);
  console.log(`${'='.repeat(50)}\n`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  let finalStats = { kills: 0, credits: 0, survivalTime: 0, score: 0 };

  try {
    console.log('Loading game...');
    await page.goto(GAME_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Clicking LAUNCH...');
    await page.waitForSelector('.btn', { timeout: 30000 });
    await page.click('.btn');

    console.log('Waiting for game to initialize...');
    await sleep(3000);
    await page.waitForFunction(() => window.gameRunning === true, { timeout: 30000 });

    // Center mouse
    await page.mouse.move(700, 450);

    const testResults = await testBasicFunctions(page, playerName);
    const playStats = await playUntilDeath(page, playerName);

    const score = (playStats.kills * 100) + playStats.credits + (playStats.survivalTime * 10) + (playStats.maxKillStreak * 50);

    finalStats = {
      player: playerName,
      kills: playStats.kills,
      credits: playStats.credits,
      survivalTime: playStats.survivalTime,
      maxKillStreak: playStats.maxKillStreak,
      totalShots: playStats.totalShots,
      testsPassed: testResults.tested.length,
      score
    };

    console.log(`\n${'='.repeat(50)}`);
    console.log(`${playerName} - FINAL RESULTS`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Kills: ${finalStats.kills}`);
    console.log(`Credits: ${finalStats.credits}`);
    console.log(`Survival Time: ${finalStats.survivalTime}s`);
    console.log(`Max Kill Streak: ${finalStats.maxKillStreak}`);
    console.log(`Total Shots: ${finalStats.totalShots}`);
    console.log(`-`.repeat(50));
    console.log(`TOTAL SCORE: ${finalStats.score}`);
    console.log(`${'='.repeat(50)}\n`);

  } catch (err) {
    console.error('Game error:', err.message);
  }

  await sleep(2000);
  await browser.close();

  return finalStats;
}

module.exports = { playGame };

if (require.main === module) {
  const playerName = process.argv[2] || 'Player';
  playGame(playerName).then(result => {
    console.log('\n--- JSON ---');
    console.log(JSON.stringify(result, null, 2));
  });
}
