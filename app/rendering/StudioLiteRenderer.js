import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "../thirdparty/three/three.core.js";

export default class FlyCamera {
  constructor(cam, domElement, scene) {
    this.cam = cam;
    this.domElement = domElement;
    this.scene = scene;
    this.yaw = Math.PI;
    this.pitch = -0.35;
    this.walkSpeed = 7.5;
    this.jumpForce = 9.5;
    this.gravity = 24;
    this.groundLevel = 1.8;
    this.velocity = new Vector3();
    this.moveDir = new Vector3();
    this.isLocked = false;

    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };

    this.avatar = new Group();
    this.avatar.position.set(0, this.groundLevel, 0);
    this.avatar.rotation.y = 0;
    this.scene.add(this.avatar);

    const shirtMaterial = new MeshStandardMaterial({ color: 0x7bb5d5 });
    const skinMaterial = new MeshStandardMaterial({ color: 0xf0d7c4 });
    const pantsMaterial = new MeshStandardMaterial({ color: 0x3d3d3d });

    const torso = new Mesh(new BoxGeometry(1.4, 1.8, 0.6), shirtMaterial);
    torso.position.y = 1.75;
    this.avatar.add(torso);

    const head = new Mesh(new BoxGeometry(0.9, 0.9, 0.9), skinMaterial);
    head.position.y = 3.35;
    this.avatar.add(head);

    const leftArm = new Mesh(new BoxGeometry(0.35, 1.5, 0.35), shirtMaterial);
    leftArm.position.set(-1.0, 1.7, 0);
    this.avatar.add(leftArm);

    const rightArm = new Mesh(new BoxGeometry(0.35, 1.5, 0.35), shirtMaterial);
    rightArm.position.set(1.0, 1.7, 0);
    this.avatar.add(rightArm);

    const leftLeg = new Mesh(new BoxGeometry(0.45, 1.7, 0.45), pantsMaterial);
    leftLeg.position.set(-0.4, 0.35, 0);
    this.avatar.add(leftLeg);

    const rightLeg = new Mesh(new BoxGeometry(0.45, 1.7, 0.45), pantsMaterial);
    rightLeg.position.set(0.4, 0.35, 0);
    this.avatar.add(rightLeg);

    this.domElement.addEventListener("click", () => this.lock());

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener("mousemove", (event) => {
      if (!this.isLocked) return;
      this.yaw -= event.movementX * 0.0025;
      this.pitch -= event.movementY * 0.002;
      this.pitch = Math.max(-1.35, Math.min(1.15, this.pitch));
    });

    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyW": this.input.forward = true; break;
        case "KeyS": this.input.backward = true; break;
        case "KeyA": this.input.left = true; break;
        case "KeyD": this.input.right = true; break;
        case "Space": this.input.jump = true; break;
      }
    });

    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyW": this.input.forward = false; break;
        case "KeyS": this.input.backward = false; break;
        case "KeyA": this.input.left = false; break;
        case "KeyD": this.input.right = false; break;
        case "Space": this.input.jump = false; break;
      }
    });
  }

  lock() {
    if (this.domElement && typeof this.domElement.requestPointerLock === "function") {
      this.domElement.requestPointerLock();
    }
  }

  update(dt) {
    const forward = new Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    );

    const right = new Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );

    this.moveDir.set(0, 0, 0);
    if (this.input.forward) this.moveDir.add(forward);
    if (this.input.backward) this.moveDir.sub(forward);
    if (this.input.left) this.moveDir.sub(right);
    if (this.input.right) this.moveDir.add(right);

    if (this.moveDir.lengthSq() > 0) {
      this.moveDir.normalize();
      this.avatar.position.addScaledVector(this.moveDir, this.walkSpeed * dt);
      this.avatar.rotation.y = -this.yaw + Math.PI;
    }

    if (this.input.jump && this.avatar.position.y <= this.groundLevel + 0.05) {
      this.velocity.y = this.jumpForce;
    }

    this.velocity.y -= this.gravity * dt;
    this.avatar.position.y += this.velocity.y * dt;

    if (this.avatar.position.y < this.groundLevel) {
      this.avatar.position.y = this.groundLevel;
      this.velocity.y = 0;
    }

    const target = new Vector3(
      this.avatar.position.x,
      this.avatar.position.y + 3.3,
      this.avatar.position.z
    );

    const camOffset = new Vector3(
      -Math.sin(this.yaw) * 8,
      4.2 + Math.sin(this.pitch) * 3.5,
      -Math.cos(this.yaw) * 8
    );

    this.cam.position.copy(target).add(camOffset);
    this.cam.lookAt(target.x, target.y, target.z);
  }
}

