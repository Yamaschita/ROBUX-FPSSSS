import { PlayerController } from './PlayerController';

const WEAPONS = [
    { id: 'pistol', name: 'Pistola Leve', cost: 0, damage: 20 },
    { id: 'smg', name: 'Submetralhadora', cost: 300, damage: 15 },
    { id: 'ar', name: 'Fuzil de Assalto', cost: 600, damage: 30 },
    { id: 'sniper', name: 'Sniper Pesado', cost: 1200, damage: 100 }
];

export class UI {
    private elHP = document.getElementById('hp');
    private elMoney = document.getElementById('money');
    private elKills = document.getElementById('kills');
    private elStreak = document.getElementById('streak');
    
    private shop = document.getElementById('shop');
    private shopItems = document.getElementById('shop-items');
    
    private isShopOpen = false;
    private playerController!: PlayerController;

    // Local Game State
    public hp = 100;
    public money = 0;
    public kills = 0;
    public streak = 0;
    public currentWeapon = WEAPONS[0];

    public init(playerController: PlayerController) {
        this.playerController = playerController;
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyB') {
                this.toggleShop();
            }
        });

        this.renderShop();
        this.updateHUD();
    }

    private toggleShop() {
        this.isShopOpen = !this.isShopOpen;
        if (this.shop) {
            this.shop.style.display = this.isShopOpen ? 'block' : 'none';
        }
        if (this.isShopOpen) {
            document.exitPointerLock();
        } else {
            document.body.requestPointerLock();
        }
    }

    private renderShop() {
        if (!this.shopItems) return;
        this.shopItems.innerHTML = '';
        WEAPONS.forEach(w => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `<span>${w.name}</span> <span>$${w.cost}</span>`;
            div.onclick = () => {
                this.buyWeapon(w.id);
            };
            this.shopItems!.appendChild(div);
        });
    }

    private buyWeapon(id: string) {
        const weapon = WEAPONS.find(w => w.id === id);
        if (weapon && this.money >= weapon.cost) {
            this.money -= weapon.cost;
            this.currentWeapon = weapon;
            this.playerController.setWeapon(weapon.id);
            this.updateHUD();
            this.toggleShop();
        } else {
            alert('Not enough money!');
        }
    }

    public addKill() {
        this.kills++;
        this.streak++;
        let reward = 100;
        if (this.streak >= 3) reward += 50;
        this.money += reward;
        this.updateHUD();
    }

    private updateHUD() {
        if (this.elHP) this.elHP.innerText = this.hp.toString();
        if (this.elMoney) this.elMoney.innerText = this.money.toString();
        if (this.elKills) this.elKills.innerText = this.kills.toString();
        if (this.elStreak) this.elStreak.innerText = this.streak.toString();
    }
}
