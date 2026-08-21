import { PlayerController } from './PlayerController';
import { Renderer } from './Renderer';
import { UI } from './UI';

class GameClient {
    private renderer: Renderer;
    private playerController: PlayerController;
    private ui: UI;

    constructor() {
        this.renderer = new Renderer();
        this.playerController = new PlayerController(this.renderer.camera, this.renderer);
        this.ui = new UI();
        
        this.ui.init(this.playerController);
        this.playerController.setUI(this.ui);
        
        // Setup initial text
        const inst = document.getElementById('instructions');
        if (inst) inst.innerHTML = 'Click to Play<br><span style="font-size:16px">WASD: Move, Mouse: Aim, L-Click: Shoot, B: Shop</span>';

        this.animate();
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        
        if (this.playerController) {
            this.playerController.update();
        }

        this.renderer.render();
    }
}

new GameClient();
