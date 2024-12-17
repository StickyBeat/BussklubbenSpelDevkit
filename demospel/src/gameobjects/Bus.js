import { models, textures } from "../resources";

import * as THREE from "three";
import { Spring } from "wobble";
import { TweenMax, Sine, Bounce } from "gsap";
import SAT from "sat";

function angleDifference(angle1, angle2) {
  let diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
  return diff < -Math.PI ? diff + Math.PI * 2 : diff;
}

export class Bus extends THREE.Object3D {
  constructor() {
    super();

    this.segments = [];
    this.path = [];

    this.addSegment();
    this.addSegment();

    this.startTime = Date.now();

    this.busTime = 0;

    this.pathDistance = 0;

    this.direction = 0;
    this.speed = 0.02;
    this.segmentLength = 60;

    this.busX = 0;
    this.busZ = 0;

    this.running = false;
    this.collisionSize = 1.15;

    this.pickupStudent = false;

    let main = this.segments[0];
    main.rotation.y = Math.PI / 2;

    main.position.x = -2;
    main.position.z = 5;

    for (let i = 0; i < 200; i++) {
      main.position.x += Math.cos(-main.rotation.y) * this.speed * 16 * 0.07;
      main.position.z += Math.sin(-main.rotation.y) * this.speed * 16 * 0.07;

      this.pathDistance += this.speed * 16 * 0.07;
      this.path.unshift({
        dist: this.pathDistance,
        pos: [main.position.x, main.position.z, main.rotation.y],
      });
    }
  }

  start() {
    this.running = true;
  }

  crash() {
    this.running = false;
    if (this.tween) {
      this.tween.kill();
    }
    for (let index in this.segments) {
      let segment = this.segments[index];
      let part = segment.children[0];

      let rotDir = 1;
      if (Math.random() > 0.5) {
        rotDir = -1;
      }
      TweenMax.to(part.rotation, 0.3, {
        x: (Math.PI / 2) * rotDir,
        ease: Sine.easeIn,
        delay: index * 0.1,
      });

      let startY = segment.position.y;

      TweenMax.to(segment.position, 0.15, {
        y: 1,
        ease: Sine.easeOut,
        delay: index * 0.1,
        onComplete: () => {
          TweenMax.to(segment.position, 0.15, {
            y: startY,
            ease: Sine.easeIn,
          });
        },
      });
    }
  }

  addSegment() {
    let model = null;
    let obj = null;

    if (this.segments.length == 0) {
      model = models.busFront;
    } else if (this.segments.length == 1) {
      model = models.busBack;
    } else {
      model = models.busMiddle;
    }

    let newSegment = model.scene.clone();

    newSegment.scale.setScalar(30);
    newSegment.index = this.segments.length;

    newSegment.rotationSpring = new Spring({
      toValue: 100,
      stiffness: 1000,
      damping: 500,
      mass: 3,
      restVelocityThreshold: 0,
    });

    newSegment.position.y = 0.3;
    newSegment.rotation.y = Math.PI;

    let busObj = newSegment.children[0];

    /*if (this.segments.length == 0) {
      busObj = newSegment.children[1];
    }*/

    newSegment.busObj = busObj;

    let helper = new THREE.BoxHelper(busObj);
    helper.geometry.computeBoundingBox();
    let boundingBox = helper.geometry.boundingBox;
    let orgWidth = boundingBox.max.x - boundingBox.min.x;
    let orgHeight = boundingBox.max.z - boundingBox.min.z;
    let width = orgWidth * newSegment.scale.x * 0.9;
    let height = orgHeight * newSegment.scale.z * 0.9;

    let collisionBox = new SAT.Box(
      new SAT.Vector(0, 0),
      width,
      height
    ).toPolygon();
    collisionBox.setOffset(new SAT.Vector(-width / 2, -height / 2));
    newSegment.collisionBox = collisionBox;

    let shadowMaterial = new THREE.MeshBasicMaterial({
      map: textures.shadow,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
    });
    let shadowPlane = new THREE.PlaneGeometry(
      orgWidth * 2,
      orgHeight * 2,
      1,
      1
    );
    let shadowObject = new THREE.Mesh(shadowPlane, shadowMaterial);
    shadowObject.rotation.x = -Math.PI / 2;

    //shadowObject.position.y = 0.001;
    shadowObject.position.y = -0.009;

    newSegment.add(shadowObject);

    if (this.segments.length == 0) {
      this.door = newSegment.children[0].children[0];
      this.door.geometry = this.door.geometry.clone();
      this.door.geometry.center();
      this.door.geometry.translate(-0.0025, 0, 0);
      this.door.position.x += 0.0575;
      this.door.position.z += 0.007;
    }

    if (newSegment.index > 0) {
      let accordion = [];
      for (let i = 0; i < 10; i++) {
        let geometry = new THREE.BoxGeometry();
        let material = new THREE.MeshStandardMaterial({ color: 0x707070 });
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = 0;
        cube.position.y = 0.3;
        cube.position.z = 0;
        cube.scale.x = 0.4;
        cube.scale.y = 0.4;
        cube.scale.z = 0.1;
        this.add(cube);
        accordion.push(cube);
        cube.visible = false;
      }
      newSegment.accordion = accordion;
      newSegment.visible = false;

      let lastSegment = this.segments[this.segments.length - 1];
      newSegment.position.x = lastSegment.position.x;
      newSegment.position.y = lastSegment.position.y;

      newSegment.position.z = lastSegment.position.z;
      newSegment.rotation.y = lastSegment.rotation.y;
      newSegment.active = true;
    }

    this.add(newSegment);
    if (this.segments.length > 1) {
      let last = this.segments.pop();
      last.harmless = true;
      this.segments.push(newSegment);
      this.segments.push(last);
      this.segments[1].harmless = true;
      last.scale.setScalar(0);
    } else {
      newSegment.harmless = true;
      this.segments.push(newSegment);
    }
  }

  hits(x, z) {
    let main = this.segments[0];
    let margin = 0.7;
    return (
      main.position.x > x - margin &&
      main.position.x < x + margin &&
      main.position.z > z - margin &&
      main.position.z < z + margin
    );
  }

  grow(student, onDone) {
    if (this.tween) {
      this.tween.kill();
    }

    this.pickupStudent = true;
    let doorSpeed = 0.3;
    let main = this.segments[0];

    let testObj = new THREE.Object3D();
    testObj.position.copy(student.position);
    testObj.lookAt(main.position);

    student.run();

    TweenMax.to(student.rotation, 0.5, {
      y: -main.rotation.y + 2.5,
      onComplete: () => {
        //student.run();
      },
    });

    TweenMax.to(this.door.rotation, doorSpeed, {
      y: -Math.PI / 2,
      ease: Sine.easeInOut,
      onComplete: () => {
        let doorPos = new THREE.Vector3();
        this.door.updateMatrixWorld();
        this.door.getWorldPosition(doorPos);

        TweenMax.to(student.position, 0.5, {
          x:
            main.position.x +
            Math.cos(-main.rotation.y) * 0.4 +
            Math.cos(-main.rotation.y + Math.PI / 2) * 0.3,
          z:
            main.position.z +
            Math.sin(-main.rotation.y) * 0.4 +
            Math.sin(-main.rotation.y + Math.PI / 2) * 0.3,
          onComplete: () => {
            let scaleTween = TweenMax.to(student.scale, 0.5, {
              x: 0.5,
              y: 0.5,
              z: 0.5,
            });

            TweenMax.to(student.position, 0.5, {
              x: main.position.x + Math.cos(-main.rotation.y) * 0.3,
              z: main.position.z + Math.sin(-main.rotation.y) * 0.3,
              onComplete: () => {
                scaleTween.kill();
                student.scale.setScalar(1.0);
                this.pickupStudent = false;
                onDone();
                TweenMax.to(this.door.rotation, doorSpeed, {
                  y: 0,
                });
              },
            });
          },
        });
      },
    });

    this.addSegment();
    this.updateSegments();
    let last = this.segments[this.segments.length - 1];
    last.harmless = true;
    last.scale.setScalar(0);

    TweenMax.to(last.scale, 1, {
      x: 30,
      y: 30,
      z: 30,
      ease: Sine.easeInOut,
      onComplete: () => {
        last.harmless = false;
      },
    });
  }

  setDirection(angle) {
    if (this.pickupStudent) {
      return;
    }
    this.direction = angle;

    if (this.tween) {
      this.tween.kill();
    }

    let diff = Math.abs(angleDifference(-angle, this.segments[0].rotation.y));

    this.tween = TweenMax.to(this.segments[0].rotation, 0.3 * diff, {
      directionalRotation: {
        useRadians: true,
        y: -angle + "_short",
      },
      ease: Sine.easeInOut,
    });
  }

  update(deltaTime) {
    let main = this.segments[0];

    if (this.running && this.pickupStudent == false) {
      this.busTime += deltaTime;

      main.position.x +=
        Math.cos(-main.rotation.y) * this.speed * deltaTime * 0.07;
      main.position.z +=
        Math.sin(-main.rotation.y) * this.speed * deltaTime * 0.07;

      this.pathDistance += this.speed * deltaTime * 0.07;

      this.path.unshift({
        dist: this.pathDistance,
        pos: [main.position.x, main.position.z, main.rotation.y],
      });

      main.collisionBox.pos.x = main.position.x;
      main.collisionBox.pos.y = main.position.z;
      main.collisionBox.setAngle(-main.rotation.y);
    }
    this.updateSegments();
  }

  interpolatePosition(distance) {
    for (let snapIndex = 0; snapIndex < this.path.length; snapIndex++) {
      let snap = this.path[snapIndex];

      if (distance < snap.dist) {
        continue;
      }
      if (snapIndex == this.path.length - 1) {
        return snap.pos;
      } else {
        let nextSnap = this.path[snapIndex + 1];
        let distBetween = snap.dist - nextSnap.dist;
        let extraDist = distance - snap.dist;
        let amount = extraDist / distBetween;
        let diffX = (snap.pos[0] - nextSnap.pos[0]) * amount;
        let diffY = (snap.pos[1] - nextSnap.pos[1]) * amount;
        let pos = [...snap.pos];
        pos[0] += diffX;
        pos[1] += diffY;

        return snap.pos;
      }
    }
    return this.path[this.path.length - 1].pos;
  }

  updateSegments() {
    for (let index in this.segments) {
      let segment = this.segments[index];

      if (index == 0) {
        continue;
      }

      let segmentDistance = this.pathDistance - index * 1.3; // * 0.1;
      let pos = null;

      pos = this.interpolatePosition(segmentDistance);

      if (segment.active) {
        segment.position.x = pos[0];
        segment.position.z = pos[1];
        segment.rotation.y = pos[2];
      }

      segment.collisionBox.pos.x = segment.position.x;
      segment.collisionBox.pos.y = segment.position.z;
      segment.collisionBox.setAngle(-segment.rotation.y);

      let target = this.segments[index - 1];

      let growModifier = 0.5 - (segment.scale.x / 30) * 0.5;

      let startX =
        segment.position.x +
        Math.cos(-segment.rotation.y) * (0.45 - growModifier);
      let startZ =
        segment.position.z +
        Math.sin(-segment.rotation.y) * (0.45 - growModifier);

      let targetX = target.position.x + Math.cos(-target.rotation.y) * -0.5;
      let targetZ = target.position.z + Math.sin(-target.rotation.y) * -0.5;

      let dist = new THREE.Vector3(startX, 0, startZ).distanceTo(
        new THREE.Vector3(targetX, 0, targetZ)
      );

      let realDist = segment.position.distanceTo(target.position);
      if (realDist > 1) {
        segment.active = true;
      }

      let lineAngle = Math.atan2(startZ - targetZ, startX - targetX);

      let startRot = target.rotation.y + Math.PI / 2;
      let endRot = segment.rotation.y + Math.PI / 2;
      let diff = angleDifference(startRot, endRot);
      let step = diff / segment.accordion.length;
      let angle = startRot;

      let lineStep = dist / segment.accordion.length;

      let partX = targetX;
      let partY = target.position.y;

      let partScale = (target.scale.x / 30) * 0.4;
      let partScaleStep =
        ((segment.scale.x / 30) * 0.4 - partScale) / segment.accordion.length;

      let partYStep =
        (0.3 * (segment.scale.x / 30) +
          segment.position.y -
          (0.3 + target.position.y)) /
        segment.accordion.length;
      let partZ = targetZ;

      segment.visible = realDist > 0;

      for (let part of segment.accordion) {
        part.visible = realDist > 0;
        part.position.x = partX;
        part.position.y = partY;
        part.position.z = partZ;

        part.scale.x = partScale;
        part.scale.y = partScale;

        partX += Math.cos(lineAngle) * lineStep;
        partZ += Math.sin(lineAngle) * lineStep;
        partY += partYStep;
        partScale += partScaleStep;
        part.rotation.y = angle;
        angle += step;
      }
    }
  }
}
