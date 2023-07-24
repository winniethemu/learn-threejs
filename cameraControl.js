export class CameraControl {
  zoomMode = false;
  press = false;
  sensitivity = 0.02;

  constructor(renderer, camera, updateCallback) {
    renderer.domElement.addEventListener('mousemove', (event) => {
      if (!this.press) {
        return;
      }

      if (event.button == 0) {
        camera.position.y -= event.movementY * this.sensitivity;
        camera.position.x -= event.movementX * this.sensitivity;
      } else if (event.button == 2) {
        camera.quaternion.y -= (event.movementX * this.sensitivity) / 10;
        camera.quaternion.x -= (event.movementY * this.sensitivity) / 10;
      }

      updateCallback();
    });

    renderer.domElement.addEventListener('mousedown', () => {
      this.press = true;
    });
    renderer.domElement.addEventListener('mouseup', () => {
      this.press = false;
    });
    renderer.domElement.addEventListener('mouseleave', () => {
      this.press = false;
    });
  }
}
