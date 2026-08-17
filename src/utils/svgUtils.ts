export const SVG_NAMESPACE =
    "http://www.w3.org/2000/svg";

export function createSvgElement<
    K extends keyof SVGElementTagNameMap
>(
    tag: K
): SVGElementTagNameMap[K] {

    return document.createElementNS(
        SVG_NAMESPACE
        ,tag
    );
}

export function setSvgAttributes(
    element: SVGElement
    ,attributes: Record<
        string
        ,string | number
    >
): void {

    for (
        const [
            name
            ,value
        ] of Object.entries(
            attributes
        )
    ) {
        element.setAttribute(
            name
            ,String(
                value
            )
        );
    }
}

export function createSvg(
    width: number
    ,height: number
): SVGSVGElement {

    const svg =
        createSvgElement(
            "svg"
        );

    setSvgAttributes(
        svg
        ,{
            "width": width
            ,"height": height
        }
    );

    return svg;
}

export function clearElement(
    element: Element
): void {

    while (
        element.firstChild
    ) {
        element.removeChild(
            element.firstChild
        );
    }
}

export function createHitTarget(
    source: SVGElement
    ,centerX: number
    ,centerY: number
    ,interactionSize: number = 20
): SVGElement {

    if (
        source
        instanceof SVGLineElement
    ) {

        const hitTarget =
            source.cloneNode(
                true
            ) as SVGLineElement;

        const sourceStrokeWidth =
            Number(
                source.getAttribute(
                    "stroke-width"
                )
            ) || 0;

        setSvgAttributes(
            hitTarget
            ,{
                "stroke": "transparent"
                ,"stroke-width":
                    Math.max(
                        sourceStrokeWidth
                        ,interactionSize
                    )
                ,"pointer-events": "stroke"
                ,"cursor": "pointer"
            }
        );

        return hitTarget;
    }

    const hitTarget =
        createSvgElement(
            "circle"
        );

    setSvgAttributes(
        hitTarget
        ,{
            "cx": centerX
            ,"cy": centerY
            ,"r": interactionSize
            ,"fill": "transparent"
            ,"pointer-events": "all"
            ,"cursor": "pointer"
        }
    );

    return hitTarget;
}