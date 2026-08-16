export function getNiceStep(
    min: number
    ,max: number
    ,targetTickCounter: number
): number {

        const range =
            Math.abs(max - min)
        
        if (range === 0) {
            return 1;
        }

        const roughStep =
            range / targetTickCounter
        
        const magnitude =
            Math.pow(
                10
                ,Math.floor(
                    Math.log10(
                        roughStep
                    )
                )
            );
        
        const normalized =
            roughStep / magnitude;

        let niceNormalized: number;
        
        if (normalized <= 1) {
            niceNormalized = 1;
        }

        else if (normalized <= 2) {
            niceNormalized = 2;
        }

        else if (normalized <= 5) {
            niceNormalized = 5;
        }

        else {
            niceNormalized = 10;
        }

        return (
            niceNormalized * magnitude
        );

}
