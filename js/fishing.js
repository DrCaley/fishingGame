import * as THREE from 'three';
import { removeFish } from './fish.js';

export function createFishing(scene, camera) {
    const fishing = {
        scene: scene,
        camera: camera,
        isCasting: false,
        bobber: null,
        line: null,
        castTime: 0,
        score: 0,
        catches: []
    };
    
    // Cast on spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!fishing.isCasting) {
                cast(fishing);
            } else {
                reel(fishing);
            }
        }
    });
    
    return fishing;
}

function cast(fishing) {
    fishing.isCasting = true;
    fishing.castTime = Date.now();
    
    // Get cast direction from camera
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(fishing.camera.quaternion);
    
    // Cast distance
    const castDistance = 15;
    const targetX = fishing.camera.position.x + direction.x * castDistance;
    const targetZ = fishing.camera.position.z + direction.z * castDistance;
    
    // Create bobber
    const bobberGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const bobberMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    fishing.bobber = new THREE.Mesh(bobberGeometry, bobberMaterial);
    fishing.bobber.position.set(targetX, 0.2, targetZ);
    fishing.scene.add(fishing.bobber);
    
    // Create fishing line
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    fishing.line = new THREE.Line(lineGeometry, lineMaterial);
    fishing.scene.add(fishing.line);
    
    updateUI(fishing);
}

function reel(fishing) {
    fishing.isCasting = false;
    
    if (fishing.bobber) {
        fishing.scene.remove(fishing.bobber);
        fishing.bobber = null;
    }
    if (fishing.line) {
        fishing.scene.remove(fishing.line);
        fishing.line = null;
    }
    
    updateUI(fishing);
}

export function updateFishing(fishing, fishes) {
    if (!fishing.bobber) return;
    
    // Bobber animation
    fishing.bobber.position.y = 0.2 + Math.sin(Date.now() * 0.005) * 0.1;
    
    // Update line
    if (fishing.line) {
        const points = [
            new THREE.Vector3(
                fishing.camera.position.x,
                fishing.camera.position.y - 0.5,
                fishing.camera.position.z
            ),
            fishing.bobber.position.clone()
        ];
        fishing.line.geometry.setFromPoints(points);
    }
    
    // Check for fish catch
    for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        const dist = fishing.bobber.position.distanceTo(fish.position);
        
        if (dist < 2) {
            // Caught a fish!
            const fishType = fish.userData.type;
            fishing.score += fishType.points;
            fishing.catches.push(fishType.name);
            
            // Remove fish
            removeFish(fishes, fish, fishing.scene);
            
            // Reel in automatically
            reel(fishing);
            
            updateUI(fishing);
            break;
        }
    }
}

function updateUI(fishing) {
    document.getElementById('score').textContent = `Score: ${fishing.score}`;
    document.getElementById('status').textContent = fishing.isCasting ? 'Fishing... (SPACE to reel)' : 'Press SPACE to cast';
    
    const catchList = document.getElementById('catches');
    if (catchList) {
        catchList.innerHTML = fishing.catches.slice(-5).map(c => `<li>${c}</li>`).join('');
    }
}

export function getScore(fishing) {
    return fishing.score;
}
