import * as THREE from "three";

export class Obstacle extends THREE.Object3D {
  constructor() {
    super();
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshStandardMaterial({ color: 0x303030 });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = 0;
    cube.position.y = 0.5;
    cube.position.z = 0;

    cube.scale.x = 0.5;
    cube.scale.y = 0.5;
    cube.scale.z = 0.5;

    this.collisionSize = 0.5;

    this.add(cube);
  }
}
