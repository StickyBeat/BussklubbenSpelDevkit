import * as THREE from "three";
import { Object3D } from "three";

import { Game } from "./Game";
import registerTweenPlugins from "./gsapPlugins";
import { loadResources } from "./resources";
import {
  GameStore,
  MODE_RUNNING,
  MODE_RESULTS,
  MODE_SAVE_ERROR,
} from "./store/GameStore";

registerTweenPlugins();

let width = window.innerWidth * 0.01;
let height = window.innerHeight * 0.01;

Object3D.DefaultUp = new THREE.Vector3(0, 1, 0);

var camera = new THREE.OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  1,
  1000
);

const scene = new THREE.Scene();
let sceneScale = 0.7;
scene.scale.x = sceneScale;
scene.scale.y = sceneScale;
scene.scale.z = sceneScale;

let canvas = document.getElementById("game");
let renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setClearColor(0x4040ff, 1);

renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setSize(window.innerWidth, window.innerHeight);

let geometry = new THREE.PlaneGeometry(20, 20, 32);
let material = new THREE.MeshBasicMaterial({
  color: 0x007934,
  side: THREE.DoubleSide,
});
let plane = new THREE.Mesh(geometry, material);

plane.position.y = 0;
plane.position.x = 0;
plane.position.z = 0;
plane.scale.setScalar(40);
plane.rotateX(Math.PI / 2);
scene.add(plane);

camera.position.y = 100;
camera.position.z = 100;
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.z = 99;

let ambient = new THREE.AmbientLight(0xc0c0c0); // soft white light
scene.add(ambient);

let point = new THREE.PointLight(0xffffff, 1, 10000);
point.position.set(10, 20, 0);
scene.add(point);

let game = null;

loadResources(init);

function init() {
  game = new Game(scene, camera);

  if (window.ClubHouseGame) {
    window.ClubHouseGame.registerRestart(() => {
      GameStore.update((s) => {
        s.mode = MODE_RUNNING;
        s.score = 0;
      });
      game.restart();
    });
    window.ClubHouseGame.gameLoaded({
      hideInGame: false,
    });
  }

  update();
}

function update() {
  game.update();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}
