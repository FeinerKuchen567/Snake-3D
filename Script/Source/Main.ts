namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let snake: ƒ.Node;
  let head: ƒ.Node;
  let grid: ƒ.Node;
  let direction: ƒ.Vector2 = ƒ.Vector2.ZERO();
  let faceDirection: number = 0;
  let speed: number = 0.04;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    // Positionierung der Kamera
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(0, -5, 10));
    viewport.camera.mtxPivot.rotate(new ƒ.Vector3(-30, 180, 0));

    // Grid und Snake holen
    let graph: ƒ.Node = viewport.getBranch();
    grid = graph.getChildrenByName("Grid")[0].getChildrenByName("Ground")[0];

    snake = graph.getChildrenByName("Snake")[0];
    head = snake.getChildrenByName("Head")[0];

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    let posSnake: ƒ.Vector3 = head.mtxLocal.translation;
    let nearestGridPoint: ƒ.Vector2 = new ƒ.Vector2(Math.round(posSnake.x), Math.round(posSnake.y));
    let nearGridPoint: boolean = posSnake.toVector2().equals(nearestGridPoint, 2 * speed);
    let faceDirectionOld: number = faceDirection;

    if (nearGridPoint) {
      let directionOld: ƒ.Vector2 = direction.clone;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])) {
        direction.set(1, 0);
        faceDirection = 90;
      }
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])) {
        direction.set(-1, 0);
        faceDirection = 270;
      }
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
        direction.set(0, 1);
        faceDirection = 0;
      }
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])) {
        direction.set(0, -1);
        faceDirection = 180;
      }

      // Nicht rückwerts laufen
      if(direction.equals(ƒ.Vector2.SCALE(directionOld, -1))){
        direction = directionOld;
        faceDirection = faceDirectionOld;
      }

      if (blocked(ƒ.Vector2.SUM(nearestGridPoint, direction)))
        if (direction.equals(directionOld)) // did not turn
          direction.set(0, 0); // full stop
        else {
          if (blocked(ƒ.Vector2.SUM(nearestGridPoint, directionOld))) // wrong turn and dead end
            direction.set(0, 0); // full stop
          else
            direction = directionOld; // don't turn but continue ahead
        }

      if (!direction.equals(directionOld) || direction.magnitudeSquared == 0)
        head.mtxLocal.translation = nearestGridPoint.toVector3();

    }
    
    if (faceDirection != faceDirectionOld) {
      head.getChild(0).mtxLocal.rotateZ(faceDirectionOld - faceDirection);
      head.getChild(1).mtxLocal.rotateZ(faceDirectionOld - faceDirection);
    }
    
    head.mtxLocal.translate(ƒ.Vector2.SCALE(direction, speed).toVector3());
    walking(direction);

    viewport.draw();
    //ƒ.AudioManager.default.update();
  }

  function blocked(_posCheck: ƒ.Vector2): boolean {
    let check: ƒ.Node = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
    return (!check);
  }

  function walking(_direction: ƒ.Vector2): void {
    // Move all Snake-Parts


    
    return;
  }
}