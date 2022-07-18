"use strict";
var Script;
(function (Script) {
    var fc = FudgeCore;
    fc.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class BodyPart extends fc.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = fc.Component.registerSubclass(BodyPart);
        // Properties may be mutated by users in the editor via the automatically created user interface
        nextDirections = [];
        nextPoints = [];
        moveActive = false;
        headDirection = fc.Vector2.ZERO();
        inTurn = false;
        // Für den "Tail"
        isTail = false;
        nextRotation = [];
        direction = fc.Vector2.ZERO();
        toNextPoint = fc.Vector2.ZERO();
        config;
        constructor() {
            super();
            this.serialize();
            // Don't start when running in editor
            if (fc.Project.mode == fc.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* fc.EVENT.COMPONENT_ADD */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* fc.EVENT.COMPONENT_ADD */:
                    this.loadConfig();
                    this.node.addEventListener("renderPrepare" /* fc.EVENT.RENDER_PREPARE */, this.move);
                    break;
            }
        };
        async loadConfig() {
            let response = await fetch("config.json");
            this.config = await response.json();
        }
        move = (_event) => {
            let posBodyPart = this.node.mtxLocal.translation.toVector2();
            if (this.moveActive) {
                // Wenn Snake aus dem Stillstand kommt
                if (this.direction.equals(fc.Vector2.ZERO())) {
                    if (this.nextDirections[0] !== undefined)
                        this.direction = this.nextDirections.shift();
                    if (this.nextPoints[0] !== undefined)
                        this.toNextPoint = this.nextPoints.shift();
                }
                // Wenn Snake um die Kurve geht. So lange bis der Bodypart den ehmaligen Punkt vom Head erreicht hat 
                if (this.inTurn) {
                    if (this.toNextPoint.equals(fc.Vector2.ZERO())) {
                        if (this.nextPoints[0] !== undefined)
                            this.toNextPoint = this.nextPoints.shift();
                    }
                    if (this.toNextPoint.x.toFixed(2) == posBodyPart.x.toFixed(2) && this.toNextPoint.y.toFixed(2) == posBodyPart.y.toFixed(2)) {
                        if (this.nextDirections[0] != undefined)
                            this.direction = this.nextDirections.shift();
                        else
                            this.direction = this.headDirection;
                        if (this.nextPoints[0] !== undefined)
                            this.toNextPoint = this.nextPoints.shift();
                        else {
                            this.inTurn = false;
                            this.toNextPoint = fc.Vector2.ZERO();
                        }
                        if (this.isTail) {
                            let rotation = this.nextRotation.shift();
                            this.node.getChild(0).mtxLocal.rotateZ(rotation);
                            this.node.getChild(1).mtxLocal.rotateZ(rotation);
                        }
                    }
                }
                this.node.mtxLocal.translate(fc.Vector2.SCALE(this.direction, this.config["speed"]).toVector3());
            }
            else {
                let nearestGridPoint = new fc.Vector2(Math.round(posBodyPart.x), Math.round(posBodyPart.y));
                this.node.mtxLocal.translation = nearestGridPoint.toVector3();
            }
        };
    }
    Script.BodyPart = BodyPart;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fc = FudgeCore;
    var fUi = FudgeUserInterface;
    class GameState extends fc.Mutable {
        musicVolume = 1;
        constructor() {
            super();
            let domVui = document.querySelector("div#vui");
            new fUi.Controller(this, domVui);
        }
        reduceMutator(_mutator) { }
    }
    Script.GameState = GameState;
})(Script || (Script = {}));
var Script;
(function (Script_1) {
    var fc = FudgeCore;
    fc.Debug.info("Main Program Template running!");
    let viewport;
    let snake;
    let head;
    let body;
    let tail;
    let grid;
    let direction = fc.Vector2.ZERO();
    let directionOld = fc.Vector2.ZERO();
    let faceDirection = 0;
    let themaSound;
    let config;
    let gameState;
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        viewport = _event.detail;
        // Positionierung der Kamera
        viewport.camera.mtxPivot.translate(new fc.Vector3(0, -5, 10));
        viewport.camera.mtxPivot.rotate(new fc.Vector3(-30, 180, 0));
        // Grid und Snake holen
        let graph = viewport.getBranch();
        grid = graph.getChildrenByName("Grid")[0].getChildrenByName("Ground")[0];
        // Config laden
        let response = await fetch("config.json");
        config = await response.json();
        gameState = new Script_1.GameState();
        // Snake Teile holen
        snake = graph.getChildrenByName("Snake")[0];
        head = snake.getChildrenByName("Head")[0];
        body = snake.getChildrenByName("Body")[0];
        tail = snake.getChildrenByName("Tail")[0];
        themaSound = head.getComponent(fc.ComponentAudio);
        if (!themaSound.isPlaying)
            themaSound.play(true);
        fc.AudioManager.default.listenTo(graph);
        fc.Loop.addEventListener("loopFrame" /* fc.EVENT.LOOP_FRAME */, update);
        fc.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // fc.Physics.simulate();  // if physics is included and used
        let posHead = head.mtxLocal.translation;
        let nearestGridPoint = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
        let nearGridPoint = posHead.toVector2().equals(nearestGridPoint, 2 * config["speed"]);
        let faceDirectionOld = faceDirection;
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
            if (direction.equals(fc.Vector2.SCALE(directionOld, -1))) {
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
        if (!direction.equals(directionOld)) {
            // Body 
            body.getChildren().forEach(function (bodyPart) {
                let Script = bodyPart.getComponent(Script_1.BodyPart);
                Script.headDirection = direction;
                if (direction.equals(fc.Vector2.ZERO()))
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
            let tailScript = tail.getComponent(Script_1.BodyPart);
            tailScript.headDirection = direction;
            tailScript.isTail = true;
            if (direction.equals(fc.Vector2.ZERO()))
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
        head.mtxLocal.translate(fc.Vector2.SCALE(direction, config["speed"]).toVector3());
        // User Interface
        themaSound.volume = gameState.musicVolume;
        viewport.draw();
        //fc.AudioManager.default.update();
    }
    function blocked(_posCheck) {
        let check = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
        return (!check);
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map