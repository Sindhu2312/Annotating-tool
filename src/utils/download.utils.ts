// Download utility functions
import { PDFDocument } from "pdf-lib";

/**
 * Create a merge canvas combining base image/PDF with annotations
 */
export const createMergeCanvas = (
    baseCanvas: HTMLCanvasElement | HTMLImageElement,
    annotationCanvas: HTMLCanvasElement,
    useNaturalSize: boolean = false
): HTMLCanvasElement => {
    const mergeCanvas = document.createElement('canvas');
    const mergeCtx = mergeCanvas.getContext('2d')!;

    if (useNaturalSize && baseCanvas instanceof HTMLImageElement) {
        // For images, use natural dimensions
        mergeCanvas.width = baseCanvas.naturalWidth;
        mergeCanvas.height = baseCanvas.naturalHeight;
        mergeCtx.drawImage(baseCanvas, 0, 0);
        // Scale annotation canvas to match image's natural size
        mergeCtx.drawImage(
            annotationCanvas,
            0, 0, baseCanvas.clientWidth, baseCanvas.clientHeight,
            0, 0, baseCanvas.naturalWidth, baseCanvas.naturalHeight
        );
    } else if (baseCanvas instanceof HTMLCanvasElement) {
        // For PDF canvas, use canvas dimensions directly
        mergeCanvas.width = baseCanvas.width;
        mergeCanvas.height = baseCanvas.height;
        mergeCtx.drawImage(baseCanvas, 0, 0);
        mergeCtx.drawImage(annotationCanvas, 0, 0);
    }

    return mergeCanvas;
};

/**
 * Download canvas as PNG file
 */
export const downloadCanvasAsPNG = (
    canvas: HTMLCanvasElement,
    filename: string
): void => {
    canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 'image/png');
};

/**
 * Load image from data URL
 */
export const loadImageFromDataURL = (dataURL: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataURL;
    });
};

/**
 * Convert canvas to PNG bytes
 */
export const canvasToPNGBytes = (canvas: HTMLCanvasElement): Promise<Uint8Array> => {
    return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
            if (blob) {
                const buffer = await blob.arrayBuffer();
                resolve(new Uint8Array(buffer as ArrayBuffer));
            }
        }, 'image/png');
    });
};

/**
 * Create annotated PDF with all page annotations
 */
export const createAnnotatedPDF = async (
    originalPdfUrl: string,
    numPages: number,
    getAnnotation: (pageNum: number) => string | null | undefined,
    _canvasDimensions?: { width: number; height: number } | null
): Promise<Blob> => {
    const pdfBytes = await fetch(originalPdfUrl).then(res => res.arrayBuffer());
    const pdfDocLib = await PDFDocument.load(pdfBytes);
    const pages = pdfDocLib.getPages();

    for (let i = 1; i <= numPages; i++) {
        const annotations = getAnnotation(i);

        if (annotations) {
            const img = await loadImageFromDataURL(annotations);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(img, 0, 0);
            }

            const pngBytes = await canvasToPNGBytes(tempCanvas);
            const pngImage = await pdfDocLib.embedPng(pngBytes);
            const page = pages[i - 1];
            
            // Get the actual content area of the page
            // Some PDFs have different MediaBox/CropBox which can cause offset issues
            const mediaBox = page.getMediaBox();
            const cropBox = page.getCropBox();
            
            // Use CropBox if it exists, otherwise use MediaBox
            // CropBox defines the visible area of the page
            const box = cropBox || mediaBox;
            
            const pageWidth = box.width;
            const pageHeight = box.height;
            const offsetX = box.x;
            const offsetY = box.y;
            
            // Draw annotation to cover the visible page area
            page.drawImage(pngImage, {
                x: offsetX,
                y: offsetY,
                width: pageWidth,
                height: pageHeight,
            });
        }
    }

    const modifiedPdfBytes = await pdfDocLib.save();
    const ab = new ArrayBuffer(modifiedPdfBytes.byteLength);
    new Uint8Array(ab).set(modifiedPdfBytes);
    return new Blob([ab], { type: 'application/pdf' });
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
