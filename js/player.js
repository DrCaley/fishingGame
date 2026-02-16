import * as THREE from 'three';

export function createPlayer(camera) {
    const player = {
        camera: camera,
        keys: {},
        mouse: { x: 0, y: 0 },
        rotation: { x: 0, y: 0 },
        moveSpeed: 0.15,
        isPointerLocked: false
    };
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        player.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        player.keys[e.code] = false;
    });
    
    // Mouse controls for looking around
    document.addEventListener('click', () => {
        if (!player.isPointerLocked) {
            document.body.requestPointerLock();
        }
    });
    
    document.addEventListener('pointerlockchange', () => {
        player.isPointerLocked = document.pointerLockElement === document.body;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (player.isPointerLocked) {
            player.rotation.y -= e.movementX * 0.002;
            player.rotation.x -= e.movementY * 0.002;
            player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotation.x));
        }
    });
    
    return player;
}

export function updatePlayer(player) {
    const camera = player.camera;
    
    // Apply rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.rotation.y;
    camera.rotation.x = player.rotation.x;
    
    // Movement direction based on camera facing
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();
    
    // Apply movement
    if (player.keys['KeyW']) camera.position.addScaledVector(forward, player.moveSpeed);
    if (player.keys['KeyS']) camera.position.addScaledVector(forward, -player.moveSpeed);
    if (player.keys['KeyA']) camera.position.addScaledVector(right, -player.moveSpeed);
    if (player.keys['KeyD']) camera.position.addScaledVector(right, player.moveSpeed);
    
    // Keep player at fixed height and within bounds
    camera.position.y = 5;
    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    if (dist > 70) {
        camera.position.x *= 70 / dist;
        camera.position.z *= 70 / dist;
    }
}
