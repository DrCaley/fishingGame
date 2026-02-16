import * as THREE from 'three';

export function createWater(scene) {
    const waterGeometry = new THREE.CircleGeometry(30, 32);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.3,
        shininess: 100
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.01;
    scene.add(water);
    return water;
}
