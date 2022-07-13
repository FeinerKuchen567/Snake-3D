namespace Script {
  import fc = FudgeCore;
  fc.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class BodyPart extends fc.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = fc.Component.registerSubclass(BodyPart);
    // Properties may be mutated by users in the editor via the automatically created user interface

    public nextDirections: fc.Vector2[] = [];
    public nextPoints: fc.Vector2[] = [];
    public moveActive: boolean = false;
    public headDirection: fc.Vector2 = fc.Vector2.ZERO();
    public inTurn: boolean = false;

    // Für den "Tail"
    public isTail: boolean = false;
    public rotation: number = 0;

    private direction: fc.Vector2 = fc.Vector2.ZERO();
    private toNextPoint: fc.Vector2 = fc.Vector2.ZERO();

    private speed: number = 0.04;

    constructor() {
      super();

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
          this.node.addEventListener(fc.EVENT.RENDER_PREPARE, this.move);
          break;
      }
    }

    private move = (_event: Event): void => {
      let posBodyPart: fc.Vector2 = this.node.mtxLocal.translation.toVector2();

      // TODO: Fix Bug where Body runns away, when turning to much!

      if(this.moveActive) {
        if(this.inTurn){
          if(this.direction.equals(fc.Vector2.ZERO())){
            if(this.nextDirections[0] !== undefined)
              this.direction = this.nextDirections.shift();
            if(this.nextPoints[0] !== undefined)
              this.toNextPoint = this.nextPoints.shift();
          }
          
          if(this.toNextPoint.x.toFixed(2) == posBodyPart.x.toFixed(2) && this.toNextPoint.y.toFixed(2) == posBodyPart.y.toFixed(2)){
            this.inTurn = false;
            this.direction = fc.Vector2.ZERO();
            this.toNextPoint = fc.Vector2.ZERO();
            this.node.mtxLocal.translate(fc.Vector2.SCALE(this.headDirection, this.speed).toVector3());

            if(this.isTail) {
              this.node.getChild(0).mtxLocal.rotateZ(this.rotation);
              this.node.getChild(1).mtxLocal.rotateZ(this.rotation);
            }
          }
          else {
            this.node.mtxLocal.translate(fc.Vector2.SCALE(this.direction, this.speed).toVector3());
          }
        }
        else {
          this.node.mtxLocal.translate(fc.Vector2.SCALE(this.headDirection, this.speed).toVector3());
        }
      }
      else {
        let nearestGridPoint: fc.Vector2 = new fc.Vector2(Math.round(posBodyPart.x), Math.round(posBodyPart.y));
        this.node.mtxLocal.translation = nearestGridPoint.toVector3();
      }
    }

    // protected reduceMutator(_mutator: fc.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}