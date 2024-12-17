import { Bus } from "./gameobjects/Bus";
import { Student } from "./gameobjects/Student";
import { Level } from "./gameobjects/Level";
import {
  GameStore,
  MODE_RUNNING,
  MODE_RESULTS,
  MODE_SAVE_SCORE,
} from "./store/GameStore";
import * as THREE from "three";
import SAT from "sat";
import Howler from "howler";
import { Children } from "react";
import { TweenMax, Sine, Bounce } from "gsap";

const Howl = Howler.Howl;

function distanceBetween(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

export class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.driveSound = new Howl({
      src: ["sound/drive.mp3"],
    });

    this.crashSound = new Howl({
      src: ["sound/crash.mp3"],
    });

    this.pickupSound = new Howl({
      src: ["sound/pickup.mp3"],
    });

    this.bumpSound = new Howl({
      src: ["sound/smallbump.mp3"],
    });

    this.swooshSound = new Howl({
      src: ["sound/swoosh.mp3"],
    });

    this.restart();
    this.clock = new THREE.Clock();

    this.touchstartX = 0;
    this.touchstartY = 0;
    this.touchendX = 0;
    this.touchendY = 0;

    this.frameTime = Date.now();

    document.addEventListener(
      "touchstart",
      (event) => {
        this.touchstartX = event.changedTouches[0].screenX;
        this.touchstartY = event.changedTouches[0].screenY;
      },
      false
    );

    document.addEventListener(
      "touchend",
      (event) => {
        this.touchendX = event.changedTouches[0].screenX;
        this.touchendY = event.changedTouches[0].screenY;

        let distX = Math.abs(this.touchstartX - this.touchendX);
        let distY = Math.abs(this.touchstartY - this.touchendY);

        if (GameStore.getRawState().mode == MODE_RUNNING) {
          if (this.bus.running == false) {
            this.driveSound.play();
          }
          this.bus.start();

          if (distX > distY) {
            if (this.touchendX < this.touchstartX) {
              this.move("left");
            }
            if (this.touchendX > this.touchstartX) {
              this.move("right");
            }
          } else {
            if (this.touchendY > this.touchstartY) {
              this.move("down");
            }
            if (this.touchendY < this.touchstartY) {
              this.move("up");
            }
          }
        }

        /*if (this.touchendY == this.touchstartY) {
          console.log("tap?");
				}*/
      },
      false
    );

    document.onkeydown = this.checkKey.bind(this);
  }

  checkKey(e) {
    e = e || window.event;

    if (GameStore.getRawState().mode == MODE_RUNNING) {
      if (this.bus.running == false) {
        this.driveSound.play();
      }

      this.bus.start();

      if (e.keyCode == "68") {
        this.debugCubes.visible = !this.debugCubes.visible;
      }

      if (e.keyCode == "38") {
        this.move("up");
      } else if (e.keyCode == "40") {
        this.move("down");
      } else if (e.keyCode == "37") {
        this.move("left");
      } else if (e.keyCode == "39") {
        this.move("right");
      }
    }
  }

  move(direction) {
    this.swooshSound.volume(0.1);
    this.swooshSound.rate(0.8 + Math.random() * 0.4);
    this.swooshSound.play();
    switch (direction) {
      case "up": {
        this.bus.setDirection(Math.PI + Math.PI / 2);
        break;
      }
      case "down": {
        this.bus.setDirection(Math.PI / 2);
        break;
      }
      case "left": {
        this.bus.setDirection(Math.PI);
        break;
      }
      case "right": {
        this.bus.setDirection(0);
        break;
      }
    }
  }

  placeStudent() {
    this.student.wave();
    this.student.scale.setScalar(1.0);

    let obstacles = [...this.level.obstacles, ...this.bus.segments];

    let lastX = this.student.position.x;
    let lastZ = this.student.position.z;

    let collision = true;

    let tries = 0;
    while (collision) {
      tries++;
      if (tries == 50) {
        break;
      }
      this.student.position.x =
        this.level.boundingBox.min.x +
        2 +
        Math.random() * (this.level.width - 4);
      this.student.position.z =
        this.level.boundingBox.min.z +
        2 +
        Math.random() * (this.level.height - 4);

      let dist = distanceBetween(
        this.student.position.x,
        this.student.position.z,
        lastX,
        lastZ
      );
      if (dist < 2.5) {
        collision = true;
        continue;
      }

      this.student.collisionBox.pos.x = this.student.position.x;
      this.student.collisionBox.pos.y = this.student.position.z;

      collision = false;
      for (let obstacle of obstacles) {
        if (
          SAT.testPolygonPolygon(
            obstacle.collisionBox,
            this.student.collisionBox
          )
        ) {
          collision = true;
          break;
        }
      }
    }
  }

  restart() {
    if (this.bus) {
      this.scene.remove(this.bus);
    }

    this.bus = new Bus();
    this.scene.add(this.bus);

    this.directionX = 0;
    this.directionY = 1;

    if (this.level) {
      this.scene.remove(this.level);
    }

    this.level = new Level();
    this.scene.add(this.level);

    /*GameStore.update((s) => {
      s.mode = MODE_RUNNING;
      s.score = 0;
    });*/

    if (this.student) {
      this.scene.remove(this.student);
    }

    this.student = new Student();
    this.scene.add(this.student);
    this.placeStudent();

    let debugCubes = new THREE.Object3D();

    // debug collisions
    for (let obstacle of this.level.destroyables) {
      let geometry = new THREE.BoxGeometry();
      let material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      let cube = new THREE.Mesh(geometry, material);

      cube.position.x = obstacle.collisionBox.pos.x;
      cube.position.y = 0.5;
      cube.position.z = obstacle.collisionBox.pos.y;

      cube.scale.x = obstacle.collisionWidth;
      cube.scale.y = 5;
      cube.scale.z = obstacle.collisionHeight;
      cube.rotation.y = obstacle.collisionRot;

      debugCubes.add(cube);
    }

    this.scene.add(debugCubes);
    debugCubes.visible = false;
    this.debugCubes = debugCubes;

    this.pickup = false;
  }

  update() {
    let deltaTime = Date.now() - this.frameTime;
    this.frameTime = Date.now();

    this.bus.update(deltaTime);

    let busFront = this.bus.segments[0];

    if (
      this.pickup == false &&
      SAT.testPolygonPolygon(busFront.collisionBox, this.student.collisionBox)
    ) {
      this.pickupSound.play();

      this.pickup = true;
      GameStore.update((s) => {
        s.score++;
      });
      window.ClubHouseGame.setScore(GameStore.getRawState().score);
      this.bus.grow(this.student, () => {
        this.pickup = false;
        this.placeStudent();
      });
    }

    let obstacles = [...this.level.obstacles, ...this.bus.segments];

    if (GameStore.getRawState().mode == MODE_RUNNING) {
      for (let obstacle of obstacles) {
        if (obstacle.harmless) {
          continue;
        }
        if (
          SAT.testPolygonPolygon(busFront.collisionBox, obstacle.collisionBox)
        ) {
          if (window.ClubHouseGame) {
            // running in app, save score!

            window.ClubHouseGame.setScore(GameStore.getRawState().score);
            window.ClubHouseGame.gameDone();

            GameStore.update((s) => {
              s.mode = MODE_SAVE_SCORE;
            });
          } else {
            GameStore.update((s) => {
              s.mode = MODE_RESULTS;
            });
          }

          this.crashSound.rate(0.8 + Math.random() * 0.4);
          this.crashSound.volume(0.3);
          this.crashSound.play();

          this.bus.crash();
        }
      }

      for (let obj of this.level.destroyables) {
        if (SAT.testPolygonPolygon(busFront.collisionBox, obj.collisionBox)) {
          if (obj.destroyed == false) {
            this.bumpSound.rate(0.8 + Math.random() * 0.4);
            this.bumpSound.play();

            obj.destroyed = true;
            let angle = this.bus.direction - 0.1 + Math.random() * 0.2;

            let toX = obj.position.x + Math.cos(angle) * 0.1;
            let toZ = obj.position.z + Math.sin(angle) * 0.1;

            TweenMax.to(obj.rotation, 1.0, {
              x: -Math.PI / 2,
              z: Math.random() * Math.PI,
              ease: Sine.easeOut,
            });

            TweenMax.to(obj.position, 1.0, {
              x: toX,
              z: toZ,
              y: obj.position.y - 0.02,
              ease: Sine.easeOut,
            });
          }
        }
      }
    }

    this.student.update(this.clock.getDelta());

    let sceneScale = Math.abs(this.scene.scale.x);

    let targetx = busFront.position.x * sceneScale;
    let targetz = busFront.position.z * sceneScale + 99;

    this.camera.position.x += (targetx - this.camera.position.x) / 10;
    this.camera.position.z += (targetz - this.camera.position.z) / 10;
  }
}
