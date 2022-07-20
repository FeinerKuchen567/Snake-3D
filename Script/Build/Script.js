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
        toNearestGridPoint = false;
        // Für den "Tail"
        isTail = false;
        nextRotation = [];
        direction = fc.Vector2.ZERO();
        toNextPoint = fc.Vector2.ZERO();
        config;
        constructor(_bodyPart = null) {
            super();
            this.serialize();
            if (_bodyPart != null) {
                this.nextDirections = _bodyPart.nextDirections;
                this.nextPoints = _bodyPart.nextPoints;
                this.moveActive = _bodyPart.moveActive;
                this.headDirection = _bodyPart.headDirection;
                this.inTurn = _bodyPart.inTurn;
                this.toNearestGridPoint = _bodyPart.toNearestGridPoint;
                this.direction = _bodyPart.direction;
                this.toNextPoint = _bodyPart.toNextPoint;
                this.config = _bodyPart.config;
            }
            else {
                this.loadConfig();
            }
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
            let nearestGridPoint = new fc.Vector2(Math.round(posBodyPart.x), Math.round(posBodyPart.y));
            if (this.toNearestGridPoint) {
                this.moveToNearestGridPoint(nearestGridPoint.toVector3());
                this.toNearestGridPoint = false;
            }
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
                    if (this.toNextPoint.equals(posBodyPart, this.config["speed"])) {
                        this.moveToNearestGridPoint(nearestGridPoint.toVector3());
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
        };
        moveToNearestGridPoint(_nearestGridPoint) {
            this.node.mtxLocal.translation = _nearestGridPoint;
        }
        getCurrentDirection() {
            return this.direction;
        }
    }
    Script.BodyPart = BodyPart;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fc = FudgeCore;
    class Food extends fc.Node {
        position = fc.Vector2.ZERO();
        constructor(_position) {
            super("Food");
            this.position = _position;
            this.spawn();
            this.addEventListener("eatFood", this.newPosition);
        }
        async spawn() {
            let mesh = new fc.MeshSphere("Food", 4, 2);
            let material = new fc.Material("Red", fc.ShaderFlat, new fc.CoatRemissive(fc.Color.CSS("red", 1), 1, 0));
            this.addComponent(new fc.ComponentMesh(mesh));
            this.addComponent(new fc.ComponentMaterial(material));
            this.addComponent(new fc.ComponentTransform());
            this.setPosition();
        }
        setPosition(_position = this.position) {
            if (!_position.equals(this.position)) {
                this.position = _position;
            }
            this.mtxLocal.translation = fc.Vector3.ZERO();
            this.mtxLocal.translate(this.position.toVector3(0.5));
        }
        newPosition(_event) {
            let randomX = new fc.Random().getRangeFloored(0, 15);
            let randomY = new fc.Random().getRangeFloored(0, 15);
            _event.target.setPosition(new fc.Vector2(randomX, randomY));
            _event.target.getParent().dispatchEvent(new CustomEvent("bodyExtend"));
        }
        getPosition() {
            return this.position;
        }
    }
    Script.Food = Food;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fc = FudgeCore;
    var fUi = FudgeUserInterface;
    class GameState extends fc.Mutable {
        masterVolume = 1;
        musicVolume = 0.5;
        sfxVolume = 1;
        score = 0;
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
(function (Script) {
    var fc = FudgeCore;
    fc.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class HeadPart extends fc.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = fc.Component.registerSubclass(HeadPart);
        // Properties may be mutated by users in the editor via the automatically created user interface
        direction = fc.Vector2.ZERO();
        newDirection = false;
        newFaceDirection = 0;
        toNearestGridPoint = false;
        config;
        food;
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
            let posHead = this.node.mtxLocal.translation.toVector2();
            let nearestGridPoint = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
            if (this.toNearestGridPoint) {
                this.moveToNearestGridPoint(nearestGridPoint.toVector3());
                this.toNearestGridPoint = false;
            }
            // Kopf drehen, wenn sich die Richtung ändert
            if (this.newDirection) {
                this.node.getChild(0).mtxLocal.rotateZ(this.newFaceDirection);
                this.node.getChild(1).mtxLocal.rotateZ(this.newFaceDirection);
                this.newDirection = false;
            }
            this.node.mtxLocal.translate(fc.Vector2.SCALE(this.direction, this.config["speed"]).toVector3());
            if (posHead.equals(this.getFoodPosition(), 2 * this.config["speed"])) {
                this.food.dispatchEvent(new CustomEvent("eatFood"));
                this.node.getComponents(fc.ComponentAudio)[1].play(true);
            }
        };
        moveToNearestGridPoint(_nearestGridPoint) {
            this.node.mtxLocal.translation = _nearestGridPoint;
        }
        getFoodPosition() {
            if (this.food == null)
                this.food = this.node.getParent().getParent().getChildrenByName("Food")[0];
            return this.food.getPosition();
        }
    }
    Script.HeadPart = HeadPart;
})(Script || (Script = {}));
var Script;
(function (Script_1) {
    var fc = FudgeCore;
    fc.Debug.info("Main Program Template running!");
    let viewport;
    let grid;
    let snake;
    let head;
    let headScript;
    let body;
    let tail;
    let food;
    let score = 1;
    let direction = fc.Vector2.ZERO();
    let directionOld = fc.Vector2.ZERO();
    let faceDirection = 0;
    let themaSound;
    let eatingSound;
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
        gameState.score = score;
        // Snake Teile holen
        snake = graph.getChildrenByName("Snake")[0];
        head = snake.getChildrenByName("Head")[0];
        headScript = head.getComponent(Script_1.HeadPart);
        body = snake.getChildrenByName("Body")[0];
        tail = snake.getChildrenByName("Tail")[0];
        food = new Script_1.Food(new fc.Vector2(6, 6));
        graph.addChild(food);
        graph.addEventListener("bodyExtend", bodyExtend);
        themaSound = head.getComponents(fc.ComponentAudio)[0];
        eatingSound = head.getComponents(fc.ComponentAudio)[1];
        if (!themaSound.isPlaying)
            themaSound.play(true);
        fc.AudioManager.default.listenTo(graph);
        fc.Loop.addEventListener("loopFrame" /* fc.EVENT.LOOP_FRAME */, update);
        fc.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // fc.Physics.simulate();  // if physics is included and used
        let posHead = head.mtxLocal.translation.toVector2();
        let nearestGridPoint = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
        let nearGridPoint = posHead.equals(nearestGridPoint, 2 * config["speed"]);
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
            if (!direction.equals(directionOld) || direction.magnitudeSquared == 0) {
                headScript.toNearestGridPoint = true;
                body.getChildren().forEach(function (bodyPart) {
                    bodyPart.getComponent(Script_1.BodyPart).toNearestGridPoint = true;
                });
                tail.getComponent(Script_1.BodyPart).toNearestGridPoint = true;
            }
        }
        // Head
        // Richtungsänderung
        if (faceDirection != faceDirectionOld) {
            headScript.newFaceDirection = faceDirectionOld - faceDirection;
            headScript.newDirection = true;
        }
        headScript.direction = direction;
        // Übergabe der neuen Richtung an ComponentScript einzelner Body-Teile + Tail 
        if (!direction.equals(directionOld)) {
            // Body 
            body.getChildren().forEach(function (bodyPart) {
                let Script = bodyPart.getComponent(Script_1.BodyPart);
                Script.headDirection = headScript.direction;
                if (direction.equals(fc.Vector2.ZERO()))
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
            let tailScript = tail.getComponent(Script_1.BodyPart);
            tailScript.headDirection = headScript.direction;
            tailScript.isTail = true;
            if (direction.equals(fc.Vector2.ZERO()))
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
    function blocked(_posCheck) {
        let check = grid.getChild(_posCheck.y)?.getChild(_posCheck.x)?.getChild(0);
        return (!check);
    }
    function bodyExtend(_event) {
        // Neuer Node
        let newBodyPart = new fc.Node("Body-" + addLeadingZeros(score, 2));
        score += 1;
        gameState.score = score;
        // Alle Components zuweisen
        let staringBodyPart = body.getChildrenByName("Body-Start")[0];
        newBodyPart.addComponent(new fc.ComponentMesh(staringBodyPart.getComponent(fc.ComponentMesh).mesh));
        newBodyPart.addComponent(new fc.ComponentMaterial(staringBodyPart.getComponent(fc.ComponentMaterial).material));
        newBodyPart.addComponent(new fc.ComponentTransform);
        newBodyPart.addComponent(new Script_1.BodyPart(tail.getComponent(Script_1.BodyPart)));
        // Position von Teil geben & Tail verschieben
        newBodyPart.getComponent(fc.ComponentMesh).mtxPivot.translateZ(0.5);
        newBodyPart.mtxLocal.translation = tail.mtxLocal.translation;
        tail.mtxLocal.translate(fc.Vector2.SCALE(tail.getComponent(Script_1.BodyPart).getCurrentDirection(), -1).toVector3(0));
        // An den Graph hängen
        body.appendChild(newBodyPart);
    }
    function addLeadingZeros(num, totalLength) {
        return String(num).padStart(totalLength, '0');
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map