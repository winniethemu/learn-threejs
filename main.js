import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { CameraControl } from './cameraControl';

window.addEventListener('contextmenu', (e) => e.preventDefault());

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const intensity = 1;
const pointLight = new THREE.PointLight(color, intensity);
const ambientLight = new THREE.AmbientLight(color, 0.3);
pointLight.position.set(5, 20, 20);
scene.add(pointLight, ambientLight);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xdd4444 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 5;

const loader = new GLTFLoader();

let duck;

loader.load(
  '/Duck.glb',
  function (gltf) {
    duck = gltf.scene;
    scene.add(duck);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const cameraControl = new CameraControl(renderer, camera, () => {
  // you might want to rerender on camera update if you are not rerendering all the time
  window.requestAnimationFrame(() => renderer.render(scene, camera));
});

function animate() {
  requestAnimationFrame(animate);
  // if (duck) {
  //   duck.rotation.x += 0.01;
  //   duck.rotation.y += 0.01;
  // }
  renderer.render(scene, camera);
}
animate();
