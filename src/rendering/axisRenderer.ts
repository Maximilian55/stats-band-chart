export function drawCategorySeparator(
    svg: SVGSVGElement
    ,x: number
    ,top: number
    ,bottom: number
    ,angled: boolean
): void {
    const svgNamespace =
        "http://www.w3.org/2000/svg";

    const path =
        document.createElementNS(
            svgNamespace
            ,"path"
        );
    
    let pathData =
        `M ${x} ${top} ` +
        `L ${x} ${bottom}`;

    if (angled) {
        
        const extension =
            18;

        pathData +=
            ` L ${x + extension} ${bottom + extension}`
    }

    path.setAttribute(
        "d"
        ,pathData
    );

    path.setAttribute(
        "fill"
        ,"none"
    );

    path.setAttribute(
        "stroke"
        ,"#D9D9D9"
    );

    path.setAttribute(
        "stroke-width"
        ,"1"
    );

    svg.appendChild(
        path
    );
}