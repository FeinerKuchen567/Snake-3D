namespace Script {
    import fc = FudgeCore;
    
    export class Food extends fc.Node {
        private position: fc.Vector2 = fc.Vector2.ZERO();

        constructor(_position: fc.Vector2) {
            super("Food");
            this.position = _position;
            this.spawn();
            this.addEventListener("eatFood", this.newPosition);
        }

        async spawn(): Promise<void> {
            let mesh: fc.MeshSphere = new fc.MeshSphere("Food", 4, 2);
            let material: fc.Material = new fc.Material("Red", fc.ShaderFlat, new fc.CoatRemissive(fc.Color.CSS("red", 1), 1, 0));

            this.addComponent(new fc.ComponentMesh(mesh));
            this.addComponent(new fc.ComponentMaterial(material));
            this.addComponent(new fc.ComponentTransform());

            this.setPosition();
        }

        private setPosition(_position: fc.Vector2 = this.position): void {
            if(!_position.equals(this.position)){
                this.position = _position;
            }

            this.mtxLocal.translation = fc.Vector3.ZERO();
            this.mtxLocal.translate(this.position.toVector3(0.5));
        }

        private newPosition(_event: CustomEvent): void {
            let randomX = new fc.Random().getRangeFloored(0, 15);
            let randomY = new fc.Random().getRangeFloored(0, 15);
            
            (<Food>_event.target).setPosition(new fc.Vector2(randomX, randomY));
            (<Food>_event.target).getParent().dispatchEvent(new CustomEvent("bodyExtend"));
        }

        public getPosition(): fc.Vector2 {
            return this.position;
        }
    }
}