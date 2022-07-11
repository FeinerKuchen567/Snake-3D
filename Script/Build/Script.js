"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let snake;
    let head;
    let grid;
    let direction = ƒ.Vector2.ZERO();
    let faceDirection = 0;
    let speed = 0.04;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        // Positionierung der Kamera
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(0, -5, 10));
        viewport.camera.mtxPivot.rotate(new ƒ.Vector3(-30, 180, 0));
        // Grid und Snake holen
        let graph = viewport.getBranch();
        grid = graph.getChildrenByName("Grid")[0].getChildrenByName("Ground")[0];
        snake = graph.getChildrenByName("Snake")[0];
        head = snake.getChildrenByName("Head")[0];
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        let posSnake = head.mtxLocal.translation;
        let nearestGridPoint = new ƒ.Vector2(Math.round(posSnake.x), Math.round(posSnake.y));
        let nearGridPoint = posSnake.toVector2().equals(nearestGridPoint, 2 * speed);
        let faceDirectionOld = faceDirection;
        if (nearGridPoint) {
            let directionOld = direction.clone;
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
            if (direction.equals(ƒ.Vector2.SCALE(directionOld, -1))) {
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
    function blocked(_posCheck) {
        let check = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
        return (!check);
    }
    function walking(_direction) {
        // Move all Snake-Parts
        return;
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map