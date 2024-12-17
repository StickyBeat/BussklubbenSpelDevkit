import * as THREE from "three";
import { models } from "../resources";

import { Obstacle } from "./Obstacle";
import { House } from "./House";
import SAT from "sat";

export class Level extends THREE.Object3D {
  constructor() {
    super();

    let levelSize = 20;

    let blockSize = 0.5;
    let width = levelSize * blockSize;
    let height = width;

    let left = -width / 2;
    let right = width / 2;
    let top = height / 2;
    let bottom = -height / 2;

    this.obstacles = [];

    this.destroyables = [];

    /*for (let x = 0; x < levelSize + 1; x++) {
      let obstacle = new Obstacle();
      obstacle.position.x = left + x * blockSize;
      obstacle.position.z = top;
      this.add(obstacle);
      this.obstacles.push(obstacle);
    }

    for (let x = 0; x < levelSize + 1; x++) {
      let obstacle = new Obstacle();
      obstacle.position.x = left + x * blockSize;
      obstacle.position.z = bottom - blockSize;
      this.add(obstacle);
      this.obstacles.push(obstacle);
    }

    for (let z = 1; z < levelSize + 1; z++) {
      let obstacle = new Obstacle();
      obstacle.position.x = left;
      obstacle.position.z = top - z * blockSize;
      this.add(obstacle);
      this.obstacles.push(obstacle);

      obstacle = new Obstacle();
      obstacle.position.x = right;
      obstacle.position.z = top - z * blockSize;
      this.add(obstacle);
      this.obstacles.push(obstacle);
    }

    let house = new House();
    house.position.x = 3;
    this.add(house);
    this.obstacles.push(house);

    for (let obstacle of this.obstacles) {
      let helper = new THREE.BoxHelper(obstacle.children[0]);
      helper.geometry.computeBoundingBox();
      let boundingBox = helper.geometry.boundingBox;
      let width = (boundingBox.max.x - boundingBox.min.x) * obstacle.scale.x;
      let height = (boundingBox.max.z - boundingBox.min.z) * obstacle.scale.z;
      let collisionBox = new SAT.Box(
        new SAT.Vector(obstacle.position.x, obstacle.position.z),
        width,
        height
      ).toPolygon();

      collisionBox.setAngle(-obstacle.rotation.y);
      collisionBox.setOffset(new SAT.Vector(-width / 2, -height / 2));

      obstacle.collisionBox = collisionBox;
    }*/

    let city = models.city.scene.clone();
    city.scale.setScalar(30);
    city.position.y = 0.01;

    city.traverse((obj) => {
      if (obj.name.indexOf("staket") > -1) {
        obj.material.transparent = true;
      }
    });

    for (let child of city.children) {
      /*if (child.name.indexOf("mark") > -1) {
        child.visible = false;
      }*/

      if (child.name.indexOf("obstacle") > -1) {
        //child.visible = false;

        let helper = new THREE.BoxHelper(child);
        if (child.children[0]) helper = new THREE.BoxHelper(child.children[0]);
        helper.geometry.computeBoundingBox();
        let boundingBox = helper.geometry.boundingBox;

        let width = (boundingBox.max.x - boundingBox.min.x) * city.scale.x;
        let height = (boundingBox.max.z - boundingBox.min.z) * city.scale.z;

        width = 1;
        height = 1;

        let addRot = 0;
        if (child.children[0]) {
          addRot = child.children[0].rotation.y;
        }

        switch (child.name) {
          case "obstacle_hus8":
          case "obstacle_hus12": {
            addRot += 0.8;
            width += 0.2;
            break;
          }
          case "obstacle_hus2": {
            height += 0.4;
            break;
          }
          case "obstacle_staket_": {
            width = 0.2;
            height = 10;
            break;
          }
          case "obstacle_hus11":
          case "obstacle_hus13": {
            width = 2;
            height = 5;

            break;
          }
          case "obstacle_hus6": {
            addRot += 1.15;
            width += 0.2;
            height += 0.3;
            break;
          }

          case "obstacle_hus1": {
            //width += 0.2;
            height += 0.5;
            break;
          }
          case "obstacle_hus9": {
            width += 0.5;
            height += 3;
            break;
          }

          case "obstacle_hus3": {
            addRot += 0.7;
            width += 0.2;
            height += 0.3;
            break;
          }

          case "obstacle_stonewall5": {
            height = 20;
            break;
          }

          case "obstacle_stonewall5": {
            height = 10;
            width = 0.5;
            break;
          }

          case "obstacle_stonewall2": {
            height = 30;
            break;
          }

          case "obstacle_stonewall3":
          case "obstacle_stonewall7": {
            height = 10;
            break;
          }

          case "obstacle_glasskiosk":
          case "obstacle_stonewall1": {
            width = 0.2;
            height = 0.2;
            break;
          }
          case "obstacle_staket10":
          case "obstacle_staket11":
          case "obstacle_staket12":
          case "obstacle_staket13": {
            height = 0.2;
            width = 5;
            break;
          }
          case "obstacle_staket1": {
            height = 0.1;
            width = 20;
            break;
          }
        }

        let x = boundingBox.max.x - (boundingBox.max.x - boundingBox.min.x) / 2;
        let z = boundingBox.max.z - (boundingBox.max.z - boundingBox.min.z) / 2;

        let collisionBox = new SAT.Box(
          new SAT.Vector(x * city.scale.x, z * city.scale.z),
          width,
          height
        ).toPolygon();

        collisionBox.setAngle(-child.rotation.y - addRot);
        collisionBox.setOffset(new SAT.Vector(-width / 2, -height / 2));

        child.collisionWidth = width;
        child.collisionHeight = height;
        child.collisionRot = -child.rotation.y - addRot;

        child.collisionBox = collisionBox;
        this.obstacles.push(child);
      } else if (child.name.indexOf("destroyable") > -1) {
        let helper = new THREE.BoxHelper(child);
        if (child.children[0]) helper = new THREE.BoxHelper(child.children[0]);
        helper.geometry.computeBoundingBox();
        let boundingBox = helper.geometry.boundingBox;

        let width = 0.2;
        let height = 0.2;

        if (!child.geometry.centered) {
          let x = boundingBox.max.x - (boundingBox.max.x - boundingBox.min.x) / 2;
          let z = boundingBox.max.z - (boundingBox.max.z - boundingBox.min.z) / 2;
          child.geometry.center();
          child.position.x = x;
          child.position.z = z;
          child.position.y = 0.02;
          child.geometry.orgX = x;
          child.geometry.orgZ = z;
          child.geometry.centered = true;
        } else {
          child.position.x = child.geometry.orgX;
          child.position.z = child.geometry.orgZ;
          child.position.y = 0.02;
        }

        let collisionBox = new SAT.Box(
          new SAT.Vector(child.position.x * city.scale.x, child.position.z * city.scale.z),
          width,
          height
        ).toPolygon();

        collisionBox.setAngle(-child.rotation.y);
        collisionBox.setOffset(new SAT.Vector(-width / 2, -height / 2));

        child.collisionWidth = width;
        child.collisionHeight = height;
        child.collisionRot = -child.rotation.y;

        child.collisionBox = collisionBox;
        child.destroyed = false;
        this.destroyables.push(child);
      }
    }

    this.add(city);

    let helper = new THREE.BoxHelper(this);
    helper.geometry.computeBoundingBox();
    let boundingBox = helper.geometry.boundingBox;
    this.width = boundingBox.max.x - boundingBox.min.x;
    this.height = boundingBox.max.z - boundingBox.min.z;
    this.boundingBox = boundingBox;
  }
}
