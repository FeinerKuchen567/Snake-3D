namespace Script {
  import fc = FudgeCore;
  import fUi = FudgeUserInterface;

  export class GameState extends fc.Mutable {
    public musicVolume: number = 0.5;

    public constructor() {
      super();
      let domVui: HTMLDivElement = document.querySelector("div#vui");
      new fUi.Controller(this, domVui);
    }

    protected reduceMutator(_mutator: fc.Mutator): void { /* */ }
  }
}