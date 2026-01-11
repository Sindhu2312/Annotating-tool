// Canvas utility functions

/**
 * Configure canvas context with default drawing settings
 */
export const configureCanvasContext = (
    context: CanvasRenderingContext2D,
    setCtx: (ctx: CanvasRenderingContext2D | null) => void
): void => {
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    setCtx(context);
};

/**
 * Get scaled coordinates from mouse/touch event
 */
export const getScaledCoordinates = (
    e: any,
    canvas: HTMLCanvasElement
): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
};

/**
 * Resize annotation canvas to match image dimensions
 */
export const resizeCanvasToImage = (
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    setCtx: (ctx: CanvasRenderingContext2D | null) => void
): void => {
    // Set canvas size to match displayed image size
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    canvas.style.width = img.clientWidth + "px";
    canvas.style.height = img.clientHeight + "px";

    // Position canvas exactly over image
    canvas.style.position = 'absolute';
    canvas.style.left = img.offsetLeft + "px";
    canvas.style.top = img.offsetTop + "px";

    const context = canvas.getContext("2d");
    if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0); // No scaling needed
        configureCanvasContext(context, setCtx);
    }
};

/**
 * Resize annotation canvas to match PDF canvas dimensions
 * Uses pixel dimensions directly to avoid any scaling issues
 */
export const resizeCanvasToPDF = (
    canvas: HTMLCanvasElement,
    pdfCanvas: HTMLCanvasElement,
    setCtx: (ctx: CanvasRenderingContext2D | null) => void
): void => {
    // Use pixel dimensions for both canvas size and display size
    // This ensures 1:1 mapping between canvas pixels and displayed pixels
    canvas.width = pdfCanvas.width;
    canvas.height = pdfCanvas.height;

    // Set display size to match pixel dimensions exactly
    canvas.style.width = pdfCanvas.width + "px";
    canvas.style.height = pdfCanvas.height + "px";

    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';

    // Also ensure PDF canvas displays at its pixel size
    pdfCanvas.style.width = pdfCanvas.width + "px";
    pdfCanvas.style.height = pdfCanvas.height + "px";

    const context = canvas.getContext("2d");
    if (context) {
        // Reset any previous transforms
        context.resetTransform();
        configureCanvasContext(context, setCtx);
    }
};

/**
 * Clear canvas content
 */
export const clearCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Load image data onto canvas
 */
export const loadImageOnCanvas = (
    canvas: HTMLCanvasElement,
    imageData: string
): Promise<void> => {
    return new Promise((resolve) => {
        const drawCtx = canvas.getContext("2d");
        if (!drawCtx) {
            resolve();
            return;
        }

        // Clear canvas first
        drawCtx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = () => {
            drawCtx.drawImage(img, 0, 0);
            resolve();
        };
        img.onerror = () => resolve();
        img.src = imageData;
    });
};

/**
 * Get canvas data as PNG data URL
 */
export const getCanvasDataURL = (canvas: HTMLCanvasElement): string => {
    return canvas.toDataURL('image/png');
};
