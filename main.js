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

// Sun
const color = 0xffffff;
const intensity = 1;
const pointLight = new THREE.PointLight(color, intensity);
const ambientLight = new THREE.AmbientLight(color, 0.3);
pointLight.position.set(5, 20, 20);
scene.add(pointLight, ambientLight);

const gltfLoader = new GLTFLoader();

// Duck
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

// Camel
const textureLoader = new THREE.TextureLoader();
const redTexture = textureLoader.load('/red.png');
const redMaterial = new THREE.MeshPhongMaterial({ map: redTexture });

const objLoader = new OBJLoader();
objLoader.load(
  '/camel.obj',
  function (obj) {
    obj.scale.x = obj.scale.y = obj.scale.z = 0.01;
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = redMaterial;
      }
    });
    scene.add(obj);
  },
  function (error) {
    console.error(error);
  }
);

// Water
const textureSize = 3;
const planeSize = 5000;
const gifLoader = new GifLoader();
const waterTexture = gifLoader.load('water.gif');
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set(planeSize / textureSize, planeSize / textureSize);
const waterMaterial = new THREE.MeshBasicMaterial({
  map: waterTexture,
  transparent: true,
});

const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
const plane = new THREE.Mesh(geometry, waterMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.x = 0;
plane.position.z = 0;
scene.add(plane);

// Sphere
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

// Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader
  .setPath('skybox/')
  .load([
    'pos-x.png',
    'neg-x.png',
    'pos-y.png',
    'neg-y.png',
    'pos-z.png',
    'neg-z.png',
  ]);
scene.background = cubeTexture;


// Camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.ZOOM, //TODO have a max and min zoom
  RIGHT: THREE.MOUSE.ROTATE,
};
controls.update();

// Key inputs
var leftPressed, rightPressed, downPressed, upPressed, spacePressed;
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
  if (keyCode == 32) {
    spacePressed = true;
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
  if (keyCode == 32) {
    spacePressed = false;
  }
}

Array.prototype.remove = function () {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

var fireballs = [];
var fireballTimer = 0;
var duckPlannedAngle = 0;

function animate() {
  requestAnimationFrame(animate);
   //TODO Leftclick should not rotate the duck

  //point camera towards the duck
  if (duck)
    controls.target.set(duck.position.x, duck.position.y, duck.position.z);

  controls.update();
  cubeCamera.update(renderer, scene);
  renderer.render(scene, camera);

  var azimu = controls.getAzimuthalAngle(); // camera angle around y axis, in radians
  var deltax = 0, deltaz = 0;
  var speed = 0.1;

  //set duck rotation and position based on camera angle and keys pressed
  if (upPressed) {
    duckPlannedAngle = azimu + Math.PI / 2;
    deltax += -Math.sin(azimu) * speed;
    deltaz += -Math.cos(azimu) * speed;
  }
  if (downPressed) {
    duckPlannedAngle = azimu + (3 * Math.PI) / 2;
    deltax += Math.sin(azimu) * speed;
    deltaz += Math.cos(azimu) * speed;
  }
  if (leftPressed) {
    duckPlannedAngle = azimu + Math.PI;
    deltax += -Math.cos(azimu) * speed;
    deltaz += Math.sin(azimu) * speed;
  }
  if (rightPressed) {
    duckPlannedAngle = azimu;
    deltax += Math.cos(azimu) * speed;
    deltaz += -Math.sin(azimu) * speed;
  }
  var amount = Math.PI / 20;
  var ducky = (duck.rotation.y + 2 * Math.PI) % (2 *Math.PI);
  duckPlannedAngle = (duckPlannedAngle + 2 * Math.PI) % (2 * Math.PI);

  if (duck.rotation.y != duckPlannedAngle) {
    if (leftOrRight(duckPlannedAngle, ducky)) {
      duck.rotation.y = (duck.rotation.y + amount) % (2 * Math.PI);
      ducky = (duck.rotation.y + 2 * Math.PI) % (2 * Math.PI);
      if (!leftOrRight(duckPlannedAngle, ducky)) {
        duck.rotation.y = duckPlannedAngle;
      }
    }
    else {
      duck.rotation.y = (duck.rotation.y - amount + 2 * Math.PI) % (2 * Math.PI);
      ducky = (duck.rotation.y + 2 * Math.PI) % (2 * Math.PI);
      if (leftOrRight(duckPlannedAngle, ducky)) {
        duck.rotation.y = duckPlannedAngle;
      }
    }
  }

  if (duck) {
    duck.position.x += deltax;
    duck.position.z += deltaz;
    plane.position.x = Math.round(duck.position.x / 3) * 3;
    plane.position.z = Math.round(duck.position.z / 3) * 3;
  }

  var fireballSpeed = 0.5;
  fireballTimer--;
  if (spacePressed && fireballTimer <= 0) {
    fireballTimer = 15;
    // Fireball
    let fireball = {
      mesh: new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.2, 8),
        redMaterial //TODO https://threejs.org/examples/?q=glo#webgl_postprocessing_unreal_bloom_selective
      ),
      speedx: -Math.sin(azimu) * fireballSpeed,
      speedz: -Math.cos(azimu) * fireballSpeed,
      time: 40
    };
    fireballs.push(fireball); 
    scene.add(fireball.mesh);
    fireball.mesh.position.x = duck.position.x;
    fireball.mesh.position.y = 0.5;
    fireball.mesh.position.z = duck.position.z;
  }

  for (let i = 0; i < fireballs.length; i++) {
    fireballs[i].mesh.position.x += fireballs[i].speedx;
    fireballs[i].mesh.position.z += fireballs[i].speedz;
    fireballs[i].time--;
    if (fireballs[i].time <= 0) {
      scene.remove(fireballs[i].mesh);
      fireballs.remove(fireballs[i]);
    }
  }

  //move camera with duck
  camera.position.x += deltax;
  camera.position.z += deltaz;
}
animate();


function leftOrRight(angle1, angle2) {
  return (angle1 > angle2 && Math.abs(angle1 - angle2) < Math.PI) || (angle1 < angle2 && Math.abs(angle1 - angle2) > Math.PI)
}