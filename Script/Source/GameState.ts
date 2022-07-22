namespace Script {
  import fc = FudgeCore;
  import fUi = FudgeUserInterface;

  export class GameState extends fc.Mutable {
    public masterVolume: number = 1; 
    public musicVolume: number = 0.5;
    public sfxVolume: number = 1;

    public score: number = 0;
    public isGameOver: boolean = false

    public constructor() {
      super();
      let domVui: HTMLDivElement = document.querySelector("div#vui");
      new fUi.Controller(this, domVui);
    }

    public gameOver(): void {
      this.isGameOver = true;

      document.querySelector("div#gameOver").setAttribute("class", "");
      document.querySelector("span#yourScore").innerHTML = this.score.toString();
    }

    protected reduceMutator(_mutator: fc.Mutator): void { /* */ }
  }
}