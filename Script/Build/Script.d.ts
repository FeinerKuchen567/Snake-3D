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
        constructor(_bodyPart?: BodyPart);
        hndEvent: (_event: Event) => void;
        private loadConfig;
        private move;
        private moveToNearestGridPoint;
        getCurrentDirection(): fc.Vector2;
    }
}
declare namespace Script {
    import fc = FudgeCore;
    class Food extends fc.Node {
        private position;
        constructor(_position: fc.Vector2);
        spawn(): Promise<void>;
        private setPosition;
        private newPosition;
        getPosition(): fc.Vector2;
    }
}
declare namespace Script {
    import fc = FudgeCore;
    class GameState extends fc.Mutable {
        masterVolume: number;
        musicVolume: number;
        sfxVolume: number;
        score: number;
        isGameOver: boolean;
        constructor();
        gameOver(): void;
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
        private food;
        constructor();
        hndEvent: (_event: Event) => void;
        private loadConfig;
        private move;
        private moveToNearestGridPoint;
        private getFoodPosition;
    }
}
declare namespace Script {
}
