import { models } from "../resources";
import * as THREE from "three";

export class House extends THREE.Object3D {
  constructor() {
    super();
    let house = models.house.scene.clone();
    house.scale.setScalar(30);
    this.add(house);
    this.rotation.y = 2.4;

    this.collisionSize = 0.5;
  }
}
