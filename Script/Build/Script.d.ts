declare namespace Script {
    import fc = FudgeCore;
    class BodyPart extends fc.ComponentScript {
        static readonly iSubclass: number;
        nextDirections: fc.Vector2[];
        nextPoints: fc.Vector2[];
        moveActive: boolean;
        headDirection: fc.Vector2;
        inTurn: boolean;
        toNearestGridPoint: boolean;
        isTail: boolean;
        nextRotation: number[];
        private direction;
        private toNextPoint;
        private config;
        constructor();
        hndEvent: (_event: Event) => void;
        private loadConfig;
        private move;
        private moveToNearestGridPoint;
    }
}
declare namespace Script {
    import fc = FudgeCore;
    class GameState extends fc.Mutable {
        musicVolume: number;
        constructor();
        protected reduceMutator(_mutator: fc.Mutator): void;
    }
}
declare namespace Script {
    import fc = FudgeCore;
    class HeadPart extends fc.ComponentScript {
        static readonly iSubclass: number;
        direction: fc.Vector2;
        newDirection: boolean;
        newFaceDirection: number;
        toNearestGridPoint: boolean;
        private config;
        constructor();
        hndEvent: (_event: Event) => void;
        private loadConfig;
        private move;
        private moveToNearestGridPoint;
    }
}
declare namespace Script {
}
