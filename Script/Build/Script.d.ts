declare namespace Script {
    import fc = FudgeCore;
    class BodyPart extends fc.ComponentScript {
        static readonly iSubclass: number;
        nextDirections: fc.Vector2[];
        nextPoints: fc.Vector2[];
        moveActive: boolean;
        headDirection: fc.Vector2;
        inTurn: boolean;
        isTail: boolean;
        nextRotation: number[];
        private direction;
        private toNextPoint;
        private speed;
        constructor();
        hndEvent: (_event: Event) => void;
        private move;
    }
}
declare namespace Script {
}
