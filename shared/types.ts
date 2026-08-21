export interface Weapon {
    id: string;
    name: string;
    cost: number;
    damage: number;
    fireRate: number; // tiros por segundo
    magazineSize: number;
    reloadTime: number; // ms
    type: 'pistol' | 'smg' | 'ar' | 'sniper';
}

export const WEAPONS: Record<string, Weapon> = {
    pistol: { id: 'pistol', name: 'Pistola Leve', cost: 0, damage: 20, fireRate: 3, magazineSize: 12, reloadTime: 1500, type: 'pistol' },
    smg: { id: 'smg', name: 'Submetralhadora', cost: 300, damage: 15, fireRate: 10, magazineSize: 30, reloadTime: 2000, type: 'smg' },
    ar: { id: 'ar', name: 'Fuzil de Assalto', cost: 600, damage: 30, fireRate: 8, magazineSize: 30, reloadTime: 2500, type: 'ar' },
    sniper: { id: 'sniper', name: 'Sniper Pesado', cost: 1200, damage: 100, fireRate: 1, magazineSize: 5, reloadTime: 3000, type: 'sniper' }
};

export const GAME_CONSTANTS = {
    MATCH_DURATION_MS: 10 * 60 * 1000, // 10 minutos
    KILL_REWARD: 100,
    HEADSHOT_REWARD: 150,
    STREAK_BONUS: 50,
    STREAK_COUNT: 3
};
