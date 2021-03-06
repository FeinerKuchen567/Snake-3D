namespace Script {
  import fc = FudgeCore;
  fc.Debug.info("Main Program Template running!");

  interface Config {
    [key: string]: number | string | Config;
  }

  let viewport: fc.Viewport;
  let grid: fc.Node;

  let snake: fc.Node;
  let head: fc.Node;
  let headScript: HeadPart;
  let body: fc.Node; 
  let tail: fc.Node;
  let food: Food;

  let score: number = 1;

  let direction: fc.Vector2 = fc.Vector2.ZERO();
  let directionOld: fc.Vector2 = fc.Vector2.ZERO();
  let faceDirection: number = 0;

  let themaSound: fc.ComponentAudio;
  let eatingSound: fc.ComponentAudio;

  let config: Config;
  let gameState: GameState;

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

    gameState = new GameState();
    gameState.score = score;

    // Snake Teile holen
    snake = graph.getChildrenByName("Snake")[0];
    head = snake.getChildrenByName("Head")[0];
    headScript = head.getComponent(HeadPart);
    body = snake.getChildrenByName("Body")[0];
    tail = snake.getChildrenByName("Tail")[0];

    food = new Food(new fc.Vector2(6, 6));
    graph.addChild(food);

    graph.addEventListener("bodyExtend", bodyExtend);
    snake.addEventListener("gameOver", gameOver);
    
    // Sound
    themaSound = head.getComponents(fc.ComponentAudio)[0];
    eatingSound = head.getComponents(fc.ComponentAudio)[1];
    if(!themaSound.isPlaying)
      themaSound.play(true);

    fc.AudioManager.default.listenTo(graph);

    fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, update);
    fc.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // fc.Physics.simulate();  // if physics is included and used
    let posHead: fc.Vector2 = head.mtxLocal.translation.toVector2();
    let nearestGridPoint: fc.Vector2 = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
    let nearGridPoint: boolean = posHead.equals(nearestGridPoint, 2 * <number>config["speed"]);
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

      // Nicht r??ckwerts laufen
      if(direction.equals(fc.Vector2.SCALE(directionOld, -1))){
        direction = directionOld;
        faceDirection = faceDirectionOld;
      }

      // Im vorgesehenen Feld bleiben (Aus Pacman ??bernommen + angepasst)
      if (blocked(fc.Vector2.SUM(nearestGridPoint, direction)))
        if (direction.equals(directionOld)) { // did not turn
          direction.set(0, 0); // full stop
          snake.dispatchEvent(new CustomEvent("gameOver"));
        }
        else {
          if (blocked(fc.Vector2.SUM(nearestGridPoint, directionOld))) { // wrong turn and dead end
            direction.set(0, 0); // full stop
            snake.dispatchEvent(new CustomEvent("gameOver"));
          }
          else
            direction = directionOld; // don't turn but continue ahead
        }

      if (!direction.equals(directionOld) || direction.magnitudeSquared == 0){
        headScript.toNearestGridPoint = true;
        body.getChildren().forEach(function (bodyPart: fc.Node){
          bodyPart.getComponent(BodyPart).toNearestGridPoint = true;
        });
        tail.getComponent(BodyPart).toNearestGridPoint = true;
      }
    }

    // Head
    // Richtungs??nderung
    if (faceDirection != faceDirectionOld) {
      headScript.newFaceDirection = faceDirectionOld - faceDirection;
      headScript.newDirection = true;
    }

    headScript.direction = direction.clone;

    // ??bergabe der neuen Richtung an ComponentScript einzelner Body-Teile + Tail 
    if(!direction.equals(directionOld)){
      // Body 
      body.getChildren().forEach(function (bodyPart: fc.Node){
        let Script: BodyPart = bodyPart.getComponent(BodyPart);
        Script.headDirection = headScript.direction.clone;
        
        if(direction.equals(fc.Vector2.ZERO()))
          Script.moveActive = false;
        else {
          Script.moveActive = true;
          Script.nextDirections.push(new fc.Vector2(direction.x, direction.y));
          if (faceDirection != faceDirectionOld) {
            Script.nextPoints.push(head.mtxLocal.translation.toVector2());
            Script.inTurn = true; 
          }
        }
      });

      // Tail
      let tailScript: BodyPart = tail.getComponent(BodyPart);
      tailScript.headDirection = headScript.direction.clone;
      tailScript.isTail = true;

      if(direction.equals(fc.Vector2.ZERO()))
        tailScript.moveActive = false;
      else {
        tailScript.moveActive = true;
        tailScript.nextDirections.push(new fc.Vector2(direction.x, direction.y));
        if (faceDirection != faceDirectionOld) {
          tailScript.nextPoints.push(head.mtxLocal.translation.toVector2());
          tailScript.inTurn = true; 
          tailScript.nextRotation.push(faceDirectionOld - faceDirection);
        }
      }
    }

    // User Interface
    themaSound.volume = gameState.musicVolume * gameState.masterVolume;
    eatingSound.volume = gameState.sfxVolume * gameState.masterVolume;

    viewport.draw();
    //fc.AudioManager.default.update();
  }

  function blocked(_posCheck: fc.Vector2): boolean {
    let check: fc.Node = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
    return (!check);
  }

  function bodyExtend(_event: CustomEvent): void {
    // Neuer Node
    let newBodyPart: fc.Node = new fc.Node("Body-" + addLeadingZeros(score, 2));
    score += 1;
    gameState.score = score;
    
    // Alle Components zuweisen
    let staringBodyPart = body.getChildrenByName("Body-Start")[0];
    newBodyPart.addComponent(new fc.ComponentMesh(staringBodyPart.getComponent(fc.ComponentMesh).mesh));
    newBodyPart.addComponent(new fc.ComponentMaterial(staringBodyPart.getComponent(fc.ComponentMaterial).material));
    newBodyPart.addComponent(new fc.ComponentTransform);
    newBodyPart.addComponent(new BodyPart(tail.getComponent(BodyPart)));
    newBodyPart.getComponent(fc.ComponentMesh).mtxPivot.translateZ(0.5);

    // Position von Tail geben & Tail verschieben
    newBodyPart.mtxLocal.translation = tail.mtxLocal.translation;
    tail.mtxLocal.translate(fc.Vector2.SCALE(tail.getComponent(BodyPart).getCurrentDirection(), -1).toVector3(0));
    
    // An den Graph h??ngen
    body.appendChild(newBodyPart);
  }

  function gameOver(_event: CustomEvent): void {
    gameState.gameOver();
    themaSound.play(false);
    snake.getComponent(fc.ComponentAudio).play(true);
    fc.Loop.removeEventListener(fc.EVENT.LOOP_FRAME, update);
  }

  function addLeadingZeros(num: number, totalLength: number) {
    return String(num).padStart(totalLength, '0');
  }
}