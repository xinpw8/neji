// Space Armada - Ships Data Module
// Extracted from index.html for modularization
// Contains all purchasable ship definitions for the shipyard

export const SHIPYARD_DATA = {
    // FIGHTERS (cheap)
    scoutship: {
        name: 'Scoutship', price: 5000, model: 'Scoutship.glb',
        hull: 60, shields: 30, speed: 400, desc: 'Fast reconnaissance vessel',
        category: 'fighter'
    },
    shuttle: {
        name: 'Shuttle', price: 8000, model: 'Shuttle.glb',
        hull: 80, shields: 40, speed: 300, desc: 'Basic transport shuttle',
        category: 'fighter'
    },
    ue_fighter: {
        name: 'UE Fighter', price: 15000, model: 'UE Fighter.glb',
        hull: 100, shields: 50, speed: 350, desc: 'Standard United Earth fighter',
        category: 'fighter'
    },
    voinian_heavy_fighter: {
        name: 'Voinian Heavy Fighter', price: 18000, model: 'Voinian Heavy Fighter.glb',
        hull: 140, shields: 30, speed: 280, desc: 'Armored Voinian interceptor',
        category: 'fighter'
    },
    crescent_fighter: {
        name: 'Crescent Fighter', price: 20000, model: 'Crescent Fighter.glb',
        hull: 90, shields: 60, speed: 380, desc: 'Agile Crescent design',
        category: 'fighter'
    },
    azdara: {
        name: 'Azdara', price: 25000, model: 'Azdara.glb',
        hull: 70, shields: 80, speed: 450, desc: 'Fastest ship in known space',
        category: 'fighter'
    },
    krait: {
        name: 'Krait', price: 12000, model: 'Krait.glb',
        hull: 75, shields: 35, speed: 360, desc: 'Popular pirate fighter',
        category: 'fighter'
    },
    emalgha_fighter: {
        name: 'Emalgha Fighter', price: 16000, model: 'Emalgha Fighter.glb',
        hull: 110, shields: 25, speed: 320, desc: 'Rugged Emalgha design',
        category: 'fighter'
    },
    miranu_courier: {
        name: 'Miranu Courier', price: 10000, model: 'Miranu Courier.glb',
        hull: 70, shields: 45, speed: 370, desc: 'Swift Miranu messenger ship',
        category: 'fighter'
    },
    escape_pod: {
        name: 'Escape Pod', price: 1000, model: 'Escape Pod.glb',
        hull: 30, shields: 10, speed: 200, desc: 'Emergency escape vehicle',
        category: 'fighter'
    },

    // MEDIUM SHIPS
    arada: {
        name: 'Arada', price: 50000, model: 'Arada.glb',
        hull: 150, shields: 100, speed: 320, desc: 'Versatile medium warship',
        category: 'medium'
    },
    turncoat: {
        name: 'Turncoat', price: 45000, model: 'Turncoat.glb',
        hull: 180, shields: 80, speed: 280, desc: 'Converted pirate vessel',
        category: 'medium'
    },
    azdgari_arada: {
        name: 'Azdgari Arada', price: 55000, model: 'Azdgari Arada.glb',
        hull: 140, shields: 120, speed: 340, desc: 'Azdgari-modified Arada',
        category: 'medium'
    },
    igadzra_arada: {
        name: 'Igadzra Arada', price: 55000, model: 'Igadzra Arada.glb',
        hull: 160, shields: 110, speed: 310, desc: 'Igadzra-modified Arada',
        category: 'medium'
    },
    lazira: {
        name: 'Lazira', price: 60000, model: 'Lazira.glb',
        hull: 200, shields: 90, speed: 260, desc: 'Zidagar warship',
        category: 'medium'
    },
    helian: {
        name: 'Helian', price: 65000, model: 'Helian.glb',
        hull: 220, shields: 100, speed: 240, desc: 'Heavy combat vessel',
        category: 'medium'
    },

    // HEAVY SHIPS
    ue_freighter: {
        name: 'UE Freighter', price: 100000, model: 'UE Freighter.glb',
        hull: 300, shields: 120, speed: 200, desc: 'Large cargo hauler with weapons',
        category: 'heavy'
    },
    voinian_frigate: {
        name: 'Voinian Frigate', price: 120000, model: 'Voinian Frigate.glb',
        hull: 400, shields: 80, speed: 180, desc: 'Heavily armored warship',
        category: 'heavy'
    },
    voinian_cruiser: {
        name: 'Voinian Cruiser', price: 150000, model: 'Voinian Cruiser.glb',
        hull: 500, shields: 100, speed: 160, desc: 'Main Voinian battle cruiser',
        category: 'heavy'
    },
    miranu_freighter: {
        name: 'Miranu Freighter', price: 80000, model: 'Miranu Freighter.glb',
        hull: 250, shields: 100, speed: 220, desc: 'Miranu trading vessel',
        category: 'heavy'
    },
    miranu_freighter_ii: {
        name: 'Miranu Freighter II', price: 90000, model: 'Miranu Freighter II.glb',
        hull: 280, shields: 120, speed: 210, desc: 'Upgraded Miranu freighter',
        category: 'heavy'
    },
    miranu_gunship: {
        name: 'Miranu Gunship', price: 110000, model: 'Miranu Gunship.glb',
        hull: 320, shields: 140, speed: 230, desc: 'Armed Miranu escort ship',
        category: 'heavy'
    },
    emalgha_freighter: {
        name: 'Emalgha Freighter', price: 85000, model: 'Emalgha Freighter.glb',
        hull: 350, shields: 60, speed: 190, desc: 'Rugged Emalgha hauler',
        category: 'heavy'
    },
    cargo_freighter: {
        name: 'Cargo Freighter', price: 70000, model: 'Cargo Freighter.glb',
        hull: 200, shields: 80, speed: 180, desc: 'Standard cargo transport',
        category: 'heavy'
    },
    freight_courier: {
        name: 'Freight Courier', price: 95000, model: 'Freight Courier.glb',
        hull: 240, shields: 110, speed: 250, desc: 'Fast cargo delivery ship',
        category: 'heavy'
    },
    azdgari_warship: {
        name: 'Azdgari Warship', price: 180000, model: 'Azdgari Warship.glb',
        hull: 350, shields: 200, speed: 280, desc: 'Elite Azdgari battleship',
        category: 'heavy'
    },
    crescent_warship: {
        name: 'Crescent Warship', price: 200000, model: 'Crescent Warship.glb',
        hull: 400, shields: 180, speed: 250, desc: 'Powerful Crescent warship',
        category: 'heavy'
    },

    // CAPITAL SHIPS (expensive)
    igazra: {
        name: 'Igazra', price: 500000, model: 'Igazra.glb',
        hull: 600, shields: 300, speed: 200, desc: 'Igadzra flagship',
        category: 'capital'
    },
    ue_carrier: {
        name: 'UE Carrier', price: 750000, model: 'UE Carrier.glb',
        hull: 800, shields: 400, speed: 150, desc: 'United Earth capital ship',
        category: 'capital'
    },
    voinian_dreadnaught: {
        name: 'Voinian Dreadnaught', price: 1000000, model: 'Voinian Dreadnaught.glb',
        hull: 1200, shields: 200, speed: 120, desc: 'Ultimate Voinian warship',
        category: 'capital'
    }
};

// Ship categories for UI organization
export const SHIP_CATEGORIES = ['fighter', 'medium', 'heavy', 'capital'];

// Get ships by category
export function getShipsByCategory(category) {
    return Object.entries(SHIPYARD_DATA)
        .filter(([key, ship]) => ship.category === category)
        .reduce((obj, [key, ship]) => {
            obj[key] = ship;
            return obj;
        }, {});
}
