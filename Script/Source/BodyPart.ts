namespace Script {
  import fc = FudgeCore;
  fc.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  interface Config {
    [key: string]: number | string | Config;
  }
  export class BodyPart extends fc.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = fc.Component.registerSubclass(BodyPart);
    // Properties may be mutated by users in the editor via the automatically created user interface
    
    public nextDirections: fc.Vector2[] = [];
    public nextPoints: fc.Vector2[] = [];
    public moveActive: boolean = false;
    public headDirection: fc.Vector2 = fc.Vector2.ZERO();
    public inTurn: boolean = false;

    public toNearestGridPoint: boolean = false;

    // Für den "Tail"
    public isTail: boolean = false;
    public nextRotation: number[] = [];

    private direction: fc.Vector2 = fc.Vector2.ZERO();
    private toNextPoint: fc.Vector2 = fc.Vector2.ZERO();
    private config: Config;

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
      let posBodyPart: fc.Vector2 = this.node.mtxLocal.translation.toVector2();
      let nearestGridPoint: fc.Vector2 = new fc.Vector2(Math.round(posBodyPart.x), Math.round(posBodyPart.y));

      if(this.toNearestGridPoint) {
          this.moveToNearestGridPoint(nearestGridPoint.toVector3());
          this.toNearestGridPoint = false;
      }

      if(this.moveActive) {
        // Wenn Snake aus dem Stillstand kommt
        if(this.direction.equals(fc.Vector2.ZERO())){
          if(this.nextDirections[0] !== undefined)
            this.direction = this.nextDirections.shift();
          if(this.nextPoints[0] !== undefined)
            this.toNextPoint = this.nextPoints.shift();
        }

        // Wenn Snake um die Kurve geht. So lange bis der Bodypart den ehmaligen Punkt vom Head erreicht hat 
        if(this.inTurn){
          if(this.toNextPoint.equals(fc.Vector2.ZERO())){
            if(this.nextPoints[0] !== undefined)
              this.toNextPoint = this.nextPoints.shift();
          }

          if(this.toNextPoint.x.toFixed(2) == posBodyPart.x.toFixed(2) && this.toNextPoint.y.toFixed(2) == posBodyPart.y.toFixed(2)){

            if(this.nextDirections[0] != undefined)
              this.direction = this.nextDirections.shift();
            else 
              this.direction = this.headDirection;
            
            if(this.nextPoints[0] !== undefined)
              this.toNextPoint = this.nextPoints.shift();
            else {
              this.inTurn = false;
              this.toNextPoint = fc.Vector2.ZERO();
            }

            if(this.isTail) {
              let rotation: number = this.nextRotation.shift();
              this.node.getChild(0).mtxLocal.rotateZ(rotation);
              this.node.getChild(1).mtxLocal.rotateZ(rotation);
            }
          }
        }

        this.node.mtxLocal.translate(fc.Vector2.SCALE(this.direction, <number>this.config["speed"]).toVector3());
      }
    }

    private moveToNearestGridPoint(_nearestGridPoint: fc.Vector3): void {
      this.node.mtxLocal.translation = _nearestGridPoint;
    }

    // protected reduceMutator(_mutator: fc.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}