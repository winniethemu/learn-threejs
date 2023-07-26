import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//disable right click menu
window.addEventListener('contextmenu', (e) => e.preventDefault());

//scene camera and renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);
camera.position.x = -5;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Sun
const color = 0xffffff;
const intensity = 1;
const pointLight = new THREE.PointLight(color, intensity);
const ambientLight = new THREE.AmbientLight(color, 0.3);
pointLight.position.set(5, 20, 20);
scene.add(pointLight, ambientLight);


const loader = new GLTFLoader();

//duck
let duck;
loader.load(
  '/Duck.glb',
  function (gltf) {
    duck = gltf.scene;
    scene.add(duck);
    //duck.position.set(1, 1, -1);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

//camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  MIDDLE: THREE.MOUSE.ZOOM,
  RIGHT: THREE.MOUSE.ROTATE
}
controls.update();


//moving duck
var speed = 1;
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {
    duck.position.z += speed;
    camera.position.z += speed;
  }
  if (keyCode == 83) {
    duck.position.z -= speed;
    camera.position.z -= speed;
  }
  if (keyCode == 65) {
    duck.position.x -= speed;
    camera.position.x -= speed;
  }
  if (keyCode == 68) {
    duck.position.x += speed;
    camera.position.x += speed;
  }
};

function animate() {
  requestAnimationFrame(animate);
  controls.target.set(duck.position.x, duck.position.y, duck.position.z);
  controls.update();
  renderer.render(scene, camera);
}
animate();
