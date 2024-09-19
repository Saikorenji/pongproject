import * as THREE from "three";

const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();
loader.load('imagefond.png', function(texture) {
  scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(0.2, 2.5, 1);
const material1 = new THREE.MeshNormalMaterial({ color: 0xFF0000 });
const cube1 = new THREE.Mesh(geometry, material1);
cube1.position.x = -6;
scene.add(cube1);

const material2 = new THREE.MeshNormalMaterial({ color: 0xFF0000 });
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 1), material2);
cube2.position.x = 6;
scene.add(cube2);

const geometry2 = new THREE.SphereGeometry(0.2, 32, 16); 
const material3 = new THREE.MeshNormalMaterial( { color: 0x8B008B } ); 
const sphere = new THREE.Mesh(geometry2, material3); 
sphere.position.x = 0;
sphere.position.y = 0;
scene.add(sphere);

const wallGeometry = new THREE.BoxGeometry(12, 0.01, 1);
const wallMaterial = new THREE.MeshNormalMaterial({ color: 0x00FF00 });
const topWall = new THREE.Mesh(wallGeometry, wallMaterial);
topWall.position.y = 3;
scene.add(topWall);

const bottomWall = new THREE.Mesh(wallGeometry, wallMaterial);
bottomWall.position.y = -3;
scene.add(bottomWall);

camera.position.z = 5;

let speedX = 0.05;
let speedY = 0.05;
let moveUp = false;
let moveDown = false;
let isPaused = false;

let score1 = 0;
let score2 = 0;

const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '50%';
scoreElement.style.transform = 'translateX(-50%)';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
document.body.appendChild(scoreElement);

function updateScore() {
  scoreElement.innerHTML = `You - ${score1} | Bot - ${score2}`;
}

document.addEventListener("keydown", (event) => { // touche appuyée
  switch (event.code) {
    case "ArrowUp": {
      moveUp = true;
      break;
    }
    case "ArrowDown": {
      moveDown = true;
      break;
    }
    case "KeyR": { // Touche "R" pour reset
      resetScene();
      break;
    }
    case "KeyP": { // Touche "P" pour pause
      isPaused = !isPaused;
      break;
    }
  }
});

document.addEventListener("keyup", (event) => { // touche relachée
  switch (event.code) {
    case "ArrowUp": {
      moveUp = false;
      break;
    }
    case "ArrowDown": {
      moveDown = false;
      break;
    }
  }
});

function detectCollision(cube, sphere) {
  const cubeBox = new THREE.Box3().setFromObject(cube);
  const sphereBox = new THREE.Box3().setFromObject(sphere);
  return cubeBox.intersectsBox(sphereBox);
}

function detectWallCollision(object, wall) {
  const objectBox = new THREE.Box3().setFromObject(object);
  const wallBox = new THREE.Box3().setFromObject(wall);
  return objectBox.intersectsBox(wallBox);
}

function playBackgroundMusic() {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('background-music.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  });
}

function resetScene() {
  sphere.position.set(0, 0, 0);
  speedX = 0.05;
  speedY = 0.05;
  score1 = 0;
  score2 = 0;
  updateScore();
}

function animate() {
  if (!isPaused) {
    if (moveUp && !detectWallCollision(cube1, topWall)) {
      cube1.position.y += 0.05;
    }
    if (moveDown && !detectWallCollision(cube1, bottomWall)) {
      cube1.position.y -= 0.05;
    }

    cube1.rotation.x += 0.00;
    cube1.rotation.y += 0.00;

    cube2.rotation.x += 0.00;
    cube2.rotation.y += 0.00;

    sphere.position.x += speedX;
    sphere.position.y += speedY;

    const cube2Speed = 0.05;
    if (sphere.position.y > cube2.position.y + 0.1 && !detectWallCollision(cube2, topWall)) {
      cube2.position.y += cube2Speed;
    } else if (sphere.position.y < cube2.position.y - 0.1 && !detectWallCollision(cube2, bottomWall)) {
      cube2.position.y -= cube2Speed;
    }

    if (detectCollision(cube1, sphere) || detectCollision(cube2, sphere)) {
      speedX = -speedX;
      speedY = (Math.random() - 0.5) * 0.2;
    }

    if (sphere.position.x >= 6) {
      if (!detectCollision(cube2, sphere)) {
        score1++;
        updateScore();
      }
      sphere.position.x = 0;
      sphere.position.y = 0;
      speedX = -speedX;
    }

    if (sphere.position.x <= -6) {
      if (!detectCollision(cube1, sphere)) {
        score2++;
        updateScore();
      }
      sphere.position.x = 0;
      sphere.position.y = 0;
      speedX = -speedX;
    }

    if (sphere.position.y >= 3 || sphere.position.y <= -3) {
      speedY = -speedY;
    }

    if (detectWallCollision(sphere, topWall) || detectWallCollision(sphere, bottomWall)) {
      speedY = -speedY;
    }

    renderer.render(scene, camera);
  }
}

updateScore();
renderer.setAnimationLoop(animate);
playBackgroundMusic();