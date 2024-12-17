import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export let models = {};
export let textures = {};

let loadObjects = {
  busFront: "/objects/buss_front_test/buss_front_wdoor_test.gltf",
  busMiddle: "/objects/buss_mid/buss_mid.gltf",
  busBack: "/objects/buss_bak/buss_bak.gltf",
  house: "/objects/hus/hus.gltf",
  kid: "/objects/kid_wave_run_2/kid_wave_run_2.gltf",
  dude: "/objects/dude/model.gltf",
  city: "/objects/stad_ny_2/stad_3.gltf",
};

let loadTextures = {
  shadow: "/images/shadow.png",
};

export const loadResources = (onDone) => {
  let loader = new GLTFLoader();
  let textureLoader = new THREE.TextureLoader();

  let leftCount = Object.keys(loadObjects).length;
  leftCount += Object.keys(loadTextures).length;

  for (let name in loadObjects) {
    let file = loadObjects[name];
    loader.load(
      file,
      function (gltf) {
        if (name == "busFront" || name == "busMiddle" || name == "busBack") {
          gltf.scene.traverse((obj) => {
            if (obj.geometry) {
              obj.geometry.translate(0, -0.01, 0);
            }
          });

          /*for (let obj of gltf.scene.children) {
            
          }*/
        }

        models[name] = gltf;
        leftCount--;
        if (leftCount == 0 && onDone) {
          onDone();
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  for (let name in loadTextures) {
    let file = loadTextures[name];
    textureLoader.load(
      file,
      function (texture) {
        textures[name] = texture;
        leftCount--;
        if (leftCount == 0 && onDone) {
          onDone();
        }
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
};
