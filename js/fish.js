import * as THREE from 'three';

const FISH_TYPES = [
    { name: 'Goldfish', color: 0xffa500, points: 10, size: 0.8 },
    { name: 'Bass', color: 0x228b22, points: 25, size: 1.0 },
    { name: 'Trout', color: 0x4682b4, points: 50, size: 1.2 },
    { name: 'Salmon', color: 0xfa8072, points: 75, size: 1.4 },
    { name: 'Rare Koi', color: 0xff6347, points: 150, size: 1.0 }
];

export function createFish(scene) {
    const fishes = [];
    
    for (let i = 0; i < 12; i++) {
        const fishType = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
        
        // Fish body
        const bodyGeometry = new THREE.ConeGeometry(0.3 * fishType.size, 1 * fishType.size, 8);
        bodyGeometry.rotateZ(-Math.PI / 2);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: fishType.color });
        const fishMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Fish tail
        const tailGeometry = new THREE.ConeGeometry(0.2 * fishType.size, 0.4 * fishType.size, 4);
        tailGeometry.rotateZ(Math.PI / 2);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.x = -0.6 * fishType.size;
        fishMesh.add(tail);
        
        // Position fish in water
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 20;
        fishMesh.position.set(
            Math.cos(angle) * radius,
            -0.5 - Math.random() * 1.5,
            Math.sin(angle) * radius
        );
        
        fishMesh.userData = {
            type: fishType,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                0,
                (Math.random() - 0.5) * 0.05
            ),
            wobble: Math.random() * Math.PI * 2
        };
        
        scene.add(fishMesh);
        fishes.push(fishMesh);
    }
    
    return fishes;
}

export function updateFish(fishes) {
    fishes.forEach(fish => {
        const data = fish.userData;
        
        // Move fish
        fish.position.add(data.velocity);
        
        // Wobble animation
        data.wobble += 0.1;
        fish.position.y = -1 + Math.sin(data.wobble) * 0.2;
        
        // Keep in pond
        const dist = Math.sqrt(fish.position.x ** 2 + fish.position.z ** 2);
        if (dist > 25) {
            data.velocity.x *= -1;
            data.velocity.z *= -1;
        }
        
        // Random turns
        if (Math.random() < 0.02) {
            data.velocity.x += (Math.random() - 0.5) * 0.02;
            data.velocity.z += (Math.random() - 0.5) * 0.02;
            const speed = data.velocity.length();
            if (speed > 0.05) {
                data.velocity.multiplyScalar(0.05 / speed);
            }
        }
        
        // Face direction
        fish.rotation.y = Math.atan2(data.velocity.x, data.velocity.z);
    });
}

export function removeFish(fishes, fish, scene) {
    const index = fishes.indexOf(fish);
    if (index > -1) {
        scene.remove(fish);
        fishes.splice(index, 1);
    }
}
