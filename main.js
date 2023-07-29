import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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

const loader2 = new OBJLoader();
loader2.load(
	'/camel.obj',
	function (gltf) {
		scene.add( gltf );
	},
	function (error) {
		console.error(error);
	}
);
/*let car;
loader.load(
  'AM_DB2.glb',
  function (gltf) {
    car = gltf.scene;
    scene.add(car);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);*/

//camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  MIDDLE: THREE.MOUSE.ZOOM,
  RIGHT: THREE.MOUSE.ROTATE
}
controls.update();


//get key input
var leftPressed, rightPressed, downPressed, upPressed;
document.addEventListener("keydown", onDocumentKeyDown, false);
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
};
document.addEventListener("keyup", onDocumentKeyUp, false);
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
};


function animate() {
  requestAnimationFrame(animate);
  //point camera towards the duck
  if(duck) controls.target.set(duck.position.x, duck.position.y, duck.position.z);

  controls.update();
  renderer.render(scene, camera);

  var azimu = controls.getAzimuthalAngle(); // camera angle around y axis, in radians
  var deltax = 0, deltaz = 0;
  var speed = 0.1;

  //set duck rotation and position based on camera angle and keys pressed
  if (upPressed) {
    duck.rotation.y = azimu + Math.PI / 2;
    deltax += -Math.sin(azimu) * speed;
    deltaz += -Math.cos(azimu) * speed;
  }
  if (downPressed) {
    duck.rotation.y = azimu + 3 * Math.PI / 2;
    deltax += Math.sin(azimu) * speed;
    deltaz += Math.cos(azimu) * speed;
  }
  if (leftPressed) {
    duck.rotation.y = azimu +  Math.PI ;
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
