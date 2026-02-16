import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createWater } from './water.js';
import { FishManager } from './fish.js';
import { Player } from './player.js';
import { SpearManager } from './fishing.js';

// Game state
const gameState = {
    score: 0,
    fishCaught: 0,
    isPlaying: false
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 30);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x6688cc, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffee, 1.5);
sunLight.position.set(50, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 300;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
scene.add(sunLight);

const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c35, 0.6);
scene.add(hemisphereLight);

// Initialize game components
const environment = createEnvironment(scene);
const water = createWater(scene);
const fishManager = new FishManager(scene);
const player = new Player(camera, renderer.domElement);
const spearManager = new SpearManager(scene, camera);

// UI Elements
const scoreValue = document.getElementById('score-value');
const fishCountValue = document.getElementById('fish-count-value');
const instructions = document.getElementById('instructions');
const catchNotification = document.getElementById('catch-notification');
const catchText = document.getElementById('catch-text');

// Start game on click
document.addEventListener('click', () => {
    if (!gameState.isPlaying) {
        gameState.isPlaying = true;
        instructions.classList.add('hidden');
        player.lock();
    } else if (player.isLocked) {
        spearManager.throwSpear();
    }
});

// Check spear hits
function checkSpearHits() {
    const spears = spearManager.getActiveSpears();
    const fishes = fishManager.getFishes();
    
    spears.forEach(spear => {
        if (spear.hasHit) return;
        
        fishes.forEach(fish => {
            if (fish.caught) return;
            
            const distance = spear.mesh.position.distanceTo(fish.mesh.position);
            if (distance < fish.size + 0.5) {
                spear.hasHit = true;
                fish.caught = true;
                
                gameState.score += fish.points;
                gameState.fishCaught++;
                scoreValue.textContent = gameState.score;
                fishCountValue.textContent = gameState.fishCaught;
                
                showCatchNotification(fish);
                fishManager.catchFish(fish);
                spearManager.removeSpear(spear);
            }
        });
    });
}

function showCatchNotification(fish) {
    catchText.textContent = '🐟 ' + fish.name + ' +' + fish.points + ' points!';
    catchNotification.classList.remove('hidden');
    setTimeout(() => { catchNotification.classList.add('hidden'); }, 2000);
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    
    player.update(delta);
    water.update(elapsed);
    fishManager.update(delta, elapsed);
    spearManager.update(delta);
    checkSpearHits();
    
    // Keep player in bounds
    const pos = camera.position;
    const lakeRadius = 40;
    const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    if (distFromCenter > lakeRadius) {
        const angle = Math.atan2(pos.z, pos.x);
        pos.x = Math.cos(angle) * lakeRadius;
        pos.z = Math.sin(angle) * lakeRadius;
    }
    
    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
console.log('🎣 Lake Spearfishing loaded! Click to start.');
