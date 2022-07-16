namespace Script {
  import fc = FudgeCore;
  fc.Debug.info("Main Program Template running!");

  interface Config {
    [key: string]: number | string | Config;
  }

  let viewport: fc.Viewport;
  let snake: fc.Node;
  let head: fc.Node;
  let body: fc.Node 
  let tail: fc.Node 
  let grid: fc.Node;
  let direction: fc.Vector2 = fc.Vector2.ZERO();
  let directionOld: fc.Vector2 = fc.Vector2.ZERO();
  let faceDirection: number = 0;
  let config: Config;

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    // Positionierung der Kamera
    viewport.camera.mtxPivot.translate(new fc.Vector3(0, -5, 10));
    viewport.camera.mtxPivot.rotate(new fc.Vector3(-30, 180, 0));

    // Grid und Snake holen
    let graph: fc.Node = viewport.getBranch();
    grid = graph.getChildrenByName("Grid")[0].getChildrenByName("Ground")[0];
    
    // Config laden
    let response: Response = await fetch("config.json");
    config = await response.json();

    // Snake Teile holen
    snake = graph.getChildrenByName("Snake")[0];
    head = snake.getChildrenByName("Head")[0];
    body = snake.getChildrenByName("Body")[0];
    tail = snake.getChildrenByName("Tail")[0];
    
    let themaSound: fc.ComponentAudio = head.getComponent(fc.ComponentAudio);
    if(!themaSound.isPlaying)
      themaSound.play(true);

    fc.AudioManager.default.listenTo(graph);

    fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, update);
    fc.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // fc.Physics.simulate();  // if physics is included and used
    let posHead: fc.Vector3 = head.mtxLocal.translation;
    let nearestGridPoint: fc.Vector2 = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
    let nearGridPoint: boolean = posHead.toVector2().equals(nearestGridPoint, 2 * <number>config["speed"]);
    let faceDirectionOld: number = faceDirection;

    if (nearGridPoint) {
      directionOld = direction.clone;
      if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.ARROW_RIGHT, fc.KEYBOARD_CODE.D])) {
        direction.set(1, 0);
        faceDirection = 90;
      }
      if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.A])) {
        direction.set(-1, 0);
        faceDirection = 270;
      }
      if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.ARROW_UP, fc.KEYBOARD_CODE.W])) {
        direction.set(0, 1);
        faceDirection = 0;
      }
      if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.ARROW_DOWN, fc.KEYBOARD_CODE.S])) {
        direction.set(0, -1);
        faceDirection = 180;
      }

      // Nicht rückwerts laufen
      if(direction.equals(fc.Vector2.SCALE(directionOld, -1))){
        direction = directionOld;
        faceDirection = faceDirectionOld;
      }

      // Im vorgesehenen Feld bleiben (Aus Pacman übernommen + angepasst)
      if (blocked(fc.Vector2.SUM(nearestGridPoint, direction)))
        if (direction.equals(directionOld)) // did not turn
          direction.set(0, 0); // full stop
        else {
          if (blocked(fc.Vector2.SUM(nearestGridPoint, directionOld))) // wrong turn and dead end
            direction.set(0, 0); // full stop
          else
            direction = directionOld; // don't turn but continue ahead
        }

      if (!direction.equals(directionOld) || direction.magnitudeSquared == 0)
        head.mtxLocal.translation = nearestGridPoint.toVector3();
    }

    // Übergabe der neuen Richtung an ComponentScript einzelner Body-Teile + Tail 
    if(!direction.equals(directionOld)){
      // Body 
      body.getChildren().forEach(function (bodyPart: fc.Node){
        let Script: BodyPart = bodyPart.getComponent(BodyPart);
        Script.headDirection = direction;
        
        if(direction.equals(fc.Vector2.ZERO()))
          Script.moveActive = false;
        else {
          Script.moveActive = true;
          Script.nextDirections.push(new fc.Vector2(direction.x, direction.y));
          if (faceDirection != faceDirectionOld) {
            Script.nextPoints.push(posHead.toVector2());
            Script.inTurn = true; 
          }
        }
      });

      // Tail
      let tailScript: BodyPart = tail.getComponent(BodyPart);
      tailScript.headDirection = direction;
      tailScript.isTail = true;

      if(direction.equals(fc.Vector2.ZERO()))
        tailScript.moveActive = false;
      else {
        tailScript.moveActive = true;
        tailScript.nextDirections.push(new fc.Vector2(direction.x, direction.y));
        if (faceDirection != faceDirectionOld) {
          tailScript.nextPoints.push(posHead.toVector2());
          tailScript.inTurn = true; 
          tailScript.nextRotation.push(faceDirectionOld - faceDirection);
        }
      }
    }
    
    // Kopf drehen, wenn sich die Richtung ändert
    if (faceDirection != faceDirectionOld) {
      head.getChild(0).mtxLocal.rotateZ(faceDirectionOld - faceDirection);
      head.getChild(1).mtxLocal.rotateZ(faceDirectionOld - faceDirection);
    }
    
    // Snake (Kopf) bewegen
    head.mtxLocal.translate(fc.Vector2.SCALE(direction, <number>config["speed"]).toVector3());

    viewport.draw();
    //fc.AudioManager.default.update();
  }

  function blocked(_posCheck: fc.Vector2): boolean {
    let check: fc.Node = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
    return (!check);
  }
}