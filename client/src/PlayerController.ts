import * as THREE from 'three';
import { Renderer } from './Renderer';
import { UI } from './UI';

export class PlayerController {
    public position: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private direction: THREE.Vector3 = new THREE.Vector3();
    
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private isRunning = false;
    private isPointerLocked = false;
    private canJump = false;

    private speed = 18;
    private runSpeed = 28;

    private euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    private camera: THREE.PerspectiveCamera;
    private renderer: Renderer;
    private ui!: UI;
    
    private weaponMesh: THREE.Mesh;

    constructor(
        camera: THREE.PerspectiveCamera, 
        renderer: Renderer
    ) {
        this.camera = camera;
        this.renderer = renderer;
        this.camera.position.copy(this.position);
        
        // Criando o modelo da arma e anexando à câmera
        const gunGeo = new THREE.BoxGeometry(0.15, 0.15, 0.6);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        this.weaponMesh = new THREE.Mesh(gunGeo, gunMat);
        this.weaponMesh.position.set(0.3, -0.25, -0.5); // Canto inferior direito
        this.weaponMesh.castShadow = true;
        this.camera.add(this.weaponMesh);
        
        this.setupControls();
    }

    public setUI(ui: UI) {
        this.ui = ui;
    }

    private setupControls() {
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions?.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === document.body) {
                this.isPointerLocked = true;
                if (blocker) blocker.style.display = 'none';
            } else {
                this.isPointerLocked = false;
                if (blocker) blocker.style.display = 'flex';
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (!this.isPointerLocked) return;

            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= movementX * 0.002;
            this.euler.x -= movementY * 0.002;
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'ControlLeft': this.isRunning = true; break;
                case 'Space': 
                    if (this.canJump) this.velocity.y += 10;
                    this.canJump = false;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'ControlLeft': this.isRunning = false; break;
            }
        });

        document.addEventListener('mousedown', (event) => {
            if (!this.isPointerLocked) return;
            if (event.button === 0) {
                this.shoot();
            }
        });
    }

    private shoot() {
        if (!this.ui) return;
        
        // Efeito de recuo visual na arma
        this.weaponMesh.position.z += 0.1;
        this.weaponMesh.rotation.x += 0.1;
        setTimeout(() => { 
            this.weaponMesh.position.z -= 0.1; 
            this.weaponMesh.rotation.x -= 0.1;
        }, 50);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const intersects = raycaster.intersectObjects(this.renderer.targets);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            const targetMesh = hit.object as THREE.Mesh;
            
            if (targetMesh.userData.isTarget) {
                // Instakill (qualquer arma destroi em 1 tiro conforme pedido)
                targetMesh.userData.hp = 0;

                if (targetMesh.userData.hp <= 0) {
                    // Respawn target
                    targetMesh.position.set(
                        (Math.random() - 0.5) * 40,
                        1 + Math.random() * 8, // altura aleatória flutuante
                        (Math.random() - 0.5) * 40
                    );
                    (targetMesh.material as THREE.MeshStandardMaterial).color.setHex(Math.random() * 0xffffff);
                    targetMesh.userData.hp = 100;
                    
                    // Add kill
                    this.ui.addKill();
                }
            }
        }
    }

    public setWeapon(weaponId: string) {
        console.log("Equipped", weaponId);
        const mat = this.weaponMesh.material as THREE.MeshStandardMaterial;
        if (weaponId === 'smg') mat.color.setHex(0x225588);
        if (weaponId === 'ar') mat.color.setHex(0x882222);
        if (weaponId === 'sniper') mat.color.setHex(0x228822);
    }

    public update() {
        if (!this.isPointerLocked) return;

        const delta = 0.016; 

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 2.0 * delta; 

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        const currentSpeed = this.isRunning ? this.runSpeed : this.speed;

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * currentSpeed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x += this.direction.x * currentSpeed * delta;

        const controlObject = this.camera;
        controlObject.translateX(this.velocity.x * delta);
        controlObject.position.y += (this.velocity.y * delta);
        controlObject.translateZ(this.velocity.z * delta);

        if (controlObject.position.y < 2) {
            this.velocity.y = 0;
            controlObject.position.y = 2;
            this.canJump = true;
        }

        this.position.copy(controlObject.position);
    }
}
