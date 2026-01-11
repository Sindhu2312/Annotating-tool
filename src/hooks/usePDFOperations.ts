// Custom hook for PDF operations
import { useCallback, useRef } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { loadPDFDocument, renderPDFPageToCanvas } from "../utils/pdf.utils";
import { resizeCanvasToPDF, loadImageOnCanvas } from "../utils/canvas.utils";
import type * as pdfjsLib from "pdfjs-dist";

interface UsePDFOperationsProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const usePDFOperations = ({ canvasRef, pdfCanvasRef }: UsePDFOperationsProps) => {
    const { 
        setPdfDoc, setCtx, 
        pageNum, image, 
        savePageAnnotation, getPageAnnotation 
    } = useAnnotationsStore();

    // Use refs to avoid dependency cycles
    const pageNumRef = useRef(pageNum);
    pageNumRef.current = pageNum;
    
    const imageRef = useRef(image);
    imageRef.current = image;

    const saveCurrentAnnotations = useCallback(() => {
        if (canvasRef.current && imageRef.current?.type === 'pdf') {
            const canvasData = canvasRef.current.toDataURL('image/png');
            savePageAnnotation(pageNumRef.current, canvasData);
        }
    }, [canvasRef, savePageAnnotation]);

    const loadAnnotations = useCallback(async (pageNumber: number) => {
        const savedData = getPageAnnotation(pageNumber);
        if (!canvasRef.current) return;

        const drawCtx = canvasRef.current.getContext("2d");
        if (!drawCtx) return;

        // Clear canvas first
        drawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Load saved annotations if they exist
        if (savedData) {
            await loadImageOnCanvas(canvasRef.current, savedData);
        }
    }, [canvasRef, getPageAnnotation]);

    const resizeCanvasToPDFCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const pdfCanvas = pdfCanvasRef.current;

        if (!canvas || !pdfCanvas) return;

        resizeCanvasToPDF(canvas, pdfCanvas, setCtx);
    }, [canvasRef, pdfCanvasRef, setCtx]);

    const renderPage = useCallback(async (num: number, pdf: pdfjsLib.PDFDocumentProxy | null = null) => {
        const pdfToUse = pdf || useAnnotationsStore.getState().pdfDoc;
        if (!pdfToUse || !pdfCanvasRef.current) return;

        // SAVE current page annotations before switching
        if (num !== pageNumRef.current && imageRef.current?.type === 'pdf') {
            saveCurrentAnnotations();
        }

        try {
            await renderPDFPageToCanvas(pdfToUse, num, pdfCanvasRef.current);
            resizeCanvasToPDFCanvas();

            // LOAD annotations for the new page
            setTimeout(() => {
                loadAnnotations(num);
            }, 100);

        } catch (error) {
            console.error("Error rendering page:", error);
        }
    }, [pdfCanvasRef, saveCurrentAnnotations, resizeCanvasToPDFCanvas, loadAnnotations]);

    const loadPDF = useCallback(async (fileData: string) => {
        try {
            const pdf = await loadPDFDocument(fileData);
            setPdfDoc(pdf);
            renderPage(1, pdf);
        } catch (error) {
            console.error("Error loading PDF:", error);
        }
    }, [setPdfDoc, renderPage]);

    return {
        loadPDF,
        renderPage,
        saveCurrentAnnotations,
        loadAnnotations,
        resizeCanvasToPDFCanvas
    };
};
