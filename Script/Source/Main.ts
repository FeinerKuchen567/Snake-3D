namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  //let snake: ƒ.Node;
  //let grid: ƒ.Node;
  //let direction: ƒ.Vector2 = ƒ.Vector2.ZERO();
  //let speed: number = 0.05;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    // Positionierung der Kamera
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(-5, 0, 10));
    viewport.camera.mtxPivot.rotate(new ƒ.Vector3(-30, 180, -90));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    //ƒ.AudioManager.default.update();
  }
}