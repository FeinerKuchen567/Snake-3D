namespace Script {
    import fc = FudgeCore;
    fc.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    interface Config {
      [key: string]: number | string | Config;
    }
    
    export class HeadPart extends fc.ComponentScript {
      // Register the script as component for use in the editor via drag&drop
      public static readonly iSubclass: number = fc.Component.registerSubclass(HeadPart);
      // Properties may be mutated by users in the editor via the automatically created user interface
      
      public direction: fc.Vector2 = fc.Vector2.ZERO();

      public newDirection: boolean = false;
      public newFaceDirection: number = 0;

      public toNearestGridPoint: boolean = false;

      private config: Config;
      private food: Food;
  
      constructor() {
        super();
        this.serialize();
        
  
        // Don't start when running in editor
        if (fc.Project.mode == fc.MODE.EDITOR)
          return;
  
        // Listen to this component being added to or removed from a node
        this.addEventListener(fc.EVENT.COMPONENT_ADD, this.hndEvent);
      }
  
      // Activate the functions of this component as response to events
      public hndEvent = (_event: Event): void => {
        switch (_event.type) {
          case fc.EVENT.COMPONENT_ADD:
            this.loadConfig();
            this.node.addEventListener(fc.EVENT.RENDER_PREPARE, this.move);
            break;
        }
      }
  
      private async loadConfig(): Promise<void> {
        let response: Response = await fetch("config.json");
        this.config = await response.json();
      }
  
      private move = (_event: Event): void => {
        let posHead: fc.Vector2 = this.node.mtxLocal.translation.toVector2();
        let nearestGridPoint: fc.Vector2 = new fc.Vector2(Math.round(posHead.x), Math.round(posHead.y));
  
        if(this.toNearestGridPoint) {
          this.moveToNearestGridPoint(nearestGridPoint.toVector3());
          this.toNearestGridPoint = false;
        }
        

        // Kopf drehen, wenn sich die Richtung ändert
        if(this.newDirection) {
          this.node.getChild(0).mtxLocal.rotateZ(this.newFaceDirection);
          this.node.getChild(1).mtxLocal.rotateZ(this.newFaceDirection);
          this.newDirection = false;
        }

        this.node.mtxLocal.translate(fc.Vector2.SCALE(this.direction, <number>this.config["speed"]).toVector3());

        if(posHead.equals(this.getFoodPosition(), 2 * <number>this.config["speed"])){
          this.food.dispatchEvent(new CustomEvent("eatFood"));
          this.node.getComponents(fc.ComponentAudio)[1].play(true);
        }
      }

      private moveToNearestGridPoint(_nearestGridPoint: fc.Vector3): void {
        this.node.mtxLocal.translation = _nearestGridPoint;
      }

      private getFoodPosition(): fc.Vector2 {
        if(this.food == null)
          this.food = <Food>this.node.getParent().getParent().getChildrenByName("Food")[0];
        
        return this.food.getPosition();
      }
  
      // protected reduceMutator(_mutator: fc.Mutator): void {
      //   // delete properties that should not be mutated
      //   // undefined properties and private fields (#) will not be included by default
      // }
    }
  }