import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import GifLoader from 'three-gif-loader';

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

const gltfLoader = new GLTFLoader();

//duck
let duck;
gltfLoader.load(
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

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/red.png');
const material = new THREE.MeshPhongMaterial({ map: texture });

const objLoader = new OBJLoader();
objLoader.load(
  '/camel.obj',
  function (obj) {
    obj.scale.x = obj.scale.y = obj.scale.z = 0.01;
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    scene.add(obj);
  },
  function (error) {
    console.error(error);
  }
);

const gifLoader = new GifLoader();
const waterTexture = gifLoader.load('water.gif');
const waterMaterial = new THREE.MeshBasicMaterial({
  map: waterTexture,
  transparent: true,
});

const geometry = new THREE.PlaneGeometry(3, 3);
for (let i = -20; i < 20; i++) {
  for (let j = -20; j < 20; j++) {
    const plane = new THREE.Mesh(geometry, waterMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.x = i * 3;
    plane.position.z = j * 3;
    scene.add(plane);
  }
}

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
cubeRenderTarget.texture.type = THREE.HalfFloatType;
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
const sphereMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeRenderTarget.texture,
  roughness: 0.05,
  metalness: 1,
});

const sphere = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 8),
  sphereMaterial
);
cubeCamera.position.y = 3;
sphere.position.y = 3;
scene.add(sphere);

//camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  MIDDLE: THREE.MOUSE.ZOOM,
  RIGHT: THREE.MOUSE.ROTATE,
};
controls.update();

//get key input
var leftPressed, rightPressed, downPressed, upPressed;
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {
    upPressed = true;
  }
  if (keyCode == 83) {
    downPressed = true;
  }
  if (keyCode == 65) {
    leftPressed = true;
  }
  if (keyCode == 68) {
    rightPressed = true;
  }
}
document.addEventListener('keyup', onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
  var keyCode = event.which;
  if (keyCode == 87) {
    upPressed = false;
  }
  if (keyCode == 83) {
    downPressed = false;
  }
  if (keyCode == 65) {
    leftPressed = false;
  }
  if (keyCode == 68) {
    rightPressed = false;
  }
}

function animate() {
  requestAnimationFrame(animate);
  //point camera towards the duck
  if (duck)
    controls.target.set(duck.position.x, duck.position.y, duck.position.z);

  controls.update();
  cubeCamera.update(renderer, scene);
  renderer.render(scene, camera);

  var azimu = controls.getAzimuthalAngle(); // camera angle around y axis, in radians
  var deltax = 0,
    deltaz = 0;
  var speed = 0.1;

  //set duck rotation and position based on camera angle and keys pressed
  if (upPressed) {
    duck.rotation.y = azimu + Math.PI / 2;
    deltax += -Math.sin(azimu) * speed;
    deltaz += -Math.cos(azimu) * speed;
  }
  if (downPressed) {
    duck.rotation.y = azimu + (3 * Math.PI) / 2;
    deltax += Math.sin(azimu) * speed;
    deltaz += Math.cos(azimu) * speed;
  }
  if (leftPressed) {
    duck.rotation.y = azimu + Math.PI;
    deltax += -Math.cos(azimu) * speed;
    deltaz += Math.sin(azimu) * speed;
  }
  if (rightPressed) {
    duck.rotation.y = azimu;
    deltax += Math.cos(azimu) * speed;
    deltaz += -Math.sin(azimu) * speed;
  }
  if (duck) {
    duck.position.x += deltax;
    duck.position.z += deltaz;
  }
  //move camera with duck
  camera.position.x += deltax;
  camera.position.z += deltaz;
}
animate();
