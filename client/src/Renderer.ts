import * as THREE from 'three';

export class Renderer {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public targets: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 0, 100);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        document.getElementById('canvas-container')?.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.setupMap();
        this.spawnTargets();

        window.addEventListener('resize', this.onWindowResize, false);
    }

    private setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    private setupMap() {
        // Floor - 64x64 grid
        const floorGeo = new THREE.PlaneGeometry(64, 64);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid helper 64x64
        const gridHelper = new THREE.GridHelper(64, 64);
        this.scene.add(gridHelper);

        // Add some blockout obstacles
        const obstacleGeo = new THREE.BoxGeometry(4, 4, 4);
        const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

        const positions = [
            [10, 2, 10], [-10, 2, -10], [15, 2, -15], [-15, 2, 15],
            [0, 2, 20], [0, 2, -20], [20, 2, 0], [-20, 2, 0]
        ];

        positions.forEach(pos => {
            const mesh = new THREE.Mesh(obstacleGeo, obstacleMat);
            mesh.position.set(pos[0], pos[1], pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    public spawnTargets() {
        // Clear existing targets
        this.targets.forEach(t => this.scene.remove(t));
        this.targets = [];

        const targetGeo = new THREE.SphereGeometry(1.2, 32, 32);

        for (let i = 0; i < 15; i++) { // Mais alvos
            const targetMat = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff,
                metalness: 0.6,
                roughness: 0.2
            });
            const mesh = new THREE.Mesh(targetGeo, targetMat);
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                1 + Math.random() * 8, // altura aleatória
                (Math.random() - 0.5) * 40
            );
            mesh.castShadow = true;
            mesh.userData = { isTarget: true, hp: 100 };
            this.scene.add(mesh);
            this.targets.push(mesh);
        }
    }

    private onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }
}
