import { models } from "../resources";
import * as THREE from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import SAT from "sat";

export class Student extends THREE.Object3D {
  constructor(scene) {
    super();

    let kid = SkeletonUtils.clone(models.kid.scene);
    this.mixer = new THREE.AnimationMixer(kid);

    this.waveAction = this.mixer.clipAction(models.kid.animations[0]);
    this.runAction = this.mixer.clipAction(models.kid.animations[1]);

    this.wave();

    this.clips = models.kid.animations;
    kid.scale.setScalar(30);
    kid.rotation.y = -Math.PI / 2;
    this.mixer.timeScale = 1.0;

    let helper = new THREE.BoxHelper(kid.children[1]);
    helper.geometry.computeBoundingBox();
    let boundingBox = helper.geometry.boundingBox;

    let width = (boundingBox.max.x - boundingBox.min.x) * kid.scale.x * 2;
    let height = (boundingBox.max.z - boundingBox.min.z) * kid.scale.z * 2;

    let collisionBox = new SAT.Box(
      new SAT.Vector(kid.position.x, kid.position.z),
      width,
      height
    ).toPolygon();

    collisionBox.setAngle(-kid.rotation.y);
    collisionBox.setOffset(new SAT.Vector(-width / 2, -height / 2));
    this.collisionBox = collisionBox;

    kid.rotation.y = Math.random() * Math.PI * 2;

    kid.traverse((obj) => {
      if (obj.name == "hair") {
        obj.material.transparent = true;
      }
    });

    /*let dude = models.dude.scene.clone();
		dude.traverse((obj) => {
			if (obj.geometry) {
				obj.geometry.center();
			}
		});
		dude.position.y = 0.4;
		dude.rotation.y = Math.random() * Math.PI * 2;
		this.add(dude);*/
    this.add(kid);
  }

  wave() {
    this.runAction.stop();
    this.waveAction.reset().setLoop(THREE.LoopRepeat).play();
  }

  run() {
    this.waveAction.stop();
    this.runAction.reset().setLoop(THREE.LoopRepeat).play();
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
