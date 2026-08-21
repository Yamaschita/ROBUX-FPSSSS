import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";
import { GAME_CONSTANTS, WEAPONS } from "../../../shared/types";

export class FPSRoom extends Room<GameState> {
    maxClients = 16;
    private timerInterval: NodeJS.Timeout | null = null;

    onCreate (options: any) {
        this.setState(new GameState());
        this.state.timeLeft = GAME_CONSTANTS.MATCH_DURATION_MS / 1000;

        // Timer
        this.timerInterval = setInterval(() => {
            if (this.state.timeLeft > 0) {
                this.state.timeLeft--;
            } else {
                this.endMatch();
            }
        }, 1000);

        // Position Updates
        this.onMessage("move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player && player.hp > 0) {
                player.x = data.x;
                player.y = data.y;
                player.z = data.z;
                player.rotX = data.rotX;
                player.rotY = data.rotY;
            }
        });

        // Shooting simulation (simplified hitscan for now)
        this.onMessage("shoot", (client, data) => {
            const shooter = this.state.players.get(client.sessionId);
            if (!shooter || shooter.hp <= 0) return;

            // In a real authoritative setup, we should use Rapier3D on the server to cast a ray
            // For MVP blockout, we accept client hit notification but validate if target exists
            if (data.hitId) {
                const target = this.state.players.get(data.hitId);
                if (target && target.hp > 0) {
                    const weapon = WEAPONS[shooter.currentWeapon];
                    const damage = data.isHeadshot ? weapon.damage * 2 : weapon.damage;
                    
                    target.hp -= damage;

                    if (target.hp <= 0) {
                        target.hp = 0;
                        target.deaths++;
                        shooter.kills++;
                        shooter.killStreak++;

                        // Economy
                        let reward = data.isHeadshot ? GAME_CONSTANTS.HEADSHOT_REWARD : GAME_CONSTANTS.KILL_REWARD;
                        if (shooter.killStreak >= GAME_CONSTANTS.STREAK_COUNT) {
                            reward += GAME_CONSTANTS.STREAK_BONUS;
                        }
                        shooter.money += reward;

                        this.broadcast("player_killed", { victim: data.hitId, killer: client.sessionId });

                        // Respawn
                        setTimeout(() => this.respawnPlayer(data.hitId), 3000);
                    }
                }
            }
        });

        this.onMessage("buy_weapon", (client, weaponId) => {
            const player = this.state.players.get(client.sessionId);
            if (player && WEAPONS[weaponId]) {
                const weapon = WEAPONS[weaponId];
                if (player.money >= weapon.cost) {
                    player.money -= weapon.cost;
                    player.currentWeapon = weaponId;
                }
            }
        });
    }

    onJoin (client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        const player = new Player();
        player.name = "Guest_" + Math.floor(Math.random() * 1000);
        this.respawnPlayerObject(player);
        this.state.players.set(client.sessionId, player);
    }

    onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        this.state.players.delete(client.sessionId);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    private respawnPlayer(sessionId: string) {
        const player = this.state.players.get(sessionId);
        if (player) {
            this.respawnPlayerObject(player);
            // Reset streak
            player.killStreak = 0;
            // Retain weapons but reset HP
        }
    }

    private respawnPlayerObject(player: Player) {
        player.hp = 100;
        // Basic random spawn inside a 64x64 grid (assuming center is 0,0)
        player.x = (Math.random() - 0.5) * 50; 
        player.y = 2; // Above ground
        player.z = (Math.random() - 0.5) * 50;
    }

    private endMatch() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.broadcast("match_end", { msg: "Match Over!" });
        // After 10 seconds, reset room
        setTimeout(() => {
            this.state.players.forEach(p => {
                p.kills = 0;
                p.deaths = 0;
                p.money = 0;
                p.killStreak = 0;
                p.currentWeapon = "pistol";
                this.respawnPlayerObject(p);
            });
            this.state.timeLeft = GAME_CONSTANTS.MATCH_DURATION_MS / 1000;
            this.timerInterval = setInterval(() => {
                if (this.state.timeLeft > 0) this.state.timeLeft--;
                else this.endMatch();
            }, 1000);
        }, 10000);
    }
}
