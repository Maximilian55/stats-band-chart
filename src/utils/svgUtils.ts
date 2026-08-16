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
            ,String(value)
        );
    }
}