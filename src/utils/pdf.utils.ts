// PDF utility functions
import * as pdfjsLib from "pdfjs-dist";

/**
 * Initialize PDF.js worker
 */
export const initPDFWorker = (): void => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();
};

/**
 * Load a PDF document from file data
 */
export const loadPDFDocument = async (fileData: string): Promise<pdfjsLib.PDFDocumentProxy> => {
    initPDFWorker();
    
    const loadingTask = pdfjsLib.getDocument({
        url: fileData,
        verbosity: 0
    });
    
    return await loadingTask.promise;
};

/**
 * Calculate optimal scale for PDF rendering
 * Uses uniform scaling to maintain exact aspect ratio
 */
export const calculatePDFScale = (
    baseViewport: { width: number; height: number },
    maxWidth: number = 850,
    maxScale: number = 2.0
): number => {
    // Calculate scale based on width constraint
    let scale = maxWidth / baseViewport.width;
    // Ensure we don't exceed maxScale
    scale = Math.min(scale, maxScale);
    return scale;
};

/**
 * Render a PDF page to canvas
 * Returns the original page dimensions for accurate annotation mapping
 */
export const renderPDFPageToCanvas = async (
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement
): Promise<{ originalWidth: number; originalHeight: number; scale: number }> => {
    const page = await pdf.getPage(pageNum);
    
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = calculatePDFScale(baseViewport);
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext("2d")!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    context.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
        canvasContext: context,
        viewport,
    } as any).promise;
    
    return {
        originalWidth: baseViewport.width,
        originalHeight: baseViewport.height,
        scale
    };
};
