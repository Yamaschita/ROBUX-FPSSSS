import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
    @type("number") rotX: number = 0; // Look horizontal
    @type("number") rotY: number = 0; // Look vertical

    @type("number") hp: number = 100;
    @type("string") name: string = "Player";
    @type("string") currentWeapon: string = "pistol";
    
    @type("number") kills: number = 0;
    @type("number") deaths: number = 0;
    @type("number") money: number = 0;
    @type("number") killStreak: number = 0;
}

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("number") timeLeft: number = 600; // 10 minutes in seconds
}
