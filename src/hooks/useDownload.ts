// Custom hook for download operations
import { useState, useCallback } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { 
    createMergeCanvas, 
    downloadCanvasAsPNG, 
    createAnnotatedPDF, 
    downloadBlob 
} from "../utils/download.utils";

interface UseDownloadProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}

export const useDownload = ({ canvasRef, pdfCanvasRef, imgRef }: UseDownloadProps) => {
    const { image, pdfDoc, pageNum, savePageAnnotation, getPageAnnotation } = useAnnotationsStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const saveCurrentAnnotations = useCallback(() => {
        if (canvasRef.current && image?.type === 'pdf') {
            const canvasData = canvasRef.current.toDataURL('image/png');
            savePageAnnotation(pageNum, canvasData);
        }
    }, [canvasRef, image, pageNum, savePageAnnotation]);

    const downloadAsPNG = useCallback(() => {
        let filename = '';
        let mergeCanvas: HTMLCanvasElement | null = null;

        if (image.type === 'image' && imgRef.current && canvasRef.current) {
            mergeCanvas = createMergeCanvas(imgRef.current, canvasRef.current, true);
            filename = `${image.Filename.split('.')[0]}_annotated.png`;
        } else if (image.type === 'pdf' && pdfCanvasRef.current && canvasRef.current) {
            mergeCanvas = createMergeCanvas(pdfCanvasRef.current, canvasRef.current, false);
            filename = `${image.Filename.split('.')[0]}_page${pageNum}_annotated.png`;
        }

        if (!mergeCanvas) return;

        saveCurrentAnnotations();
        downloadCanvasAsPNG(mergeCanvas, filename);
    }, [image, imgRef, canvasRef, pdfCanvasRef, pageNum, saveCurrentAnnotations]);

    const downloadAsPDF = useCallback(async () => {
        if (!image || image.type !== 'pdf' || !pdfDoc) return;

        setIsProcessing(true);
        saveCurrentAnnotations();

        try {
            // Get the current canvas dimensions to pass along for proper scaling
            const canvasDimensions = canvasRef.current 
                ? { width: canvasRef.current.width, height: canvasRef.current.height }
                : null;
                
            const getAnnotation = (pageNumber: number) => {
                return getPageAnnotation(pageNumber) || 
                    (pageNumber === pageNum ? canvasRef.current?.toDataURL('image/png') : null);
            };

            const blob = await createAnnotatedPDF(
                image.file,
                pdfDoc.numPages,
                getAnnotation,
                canvasDimensions
            );

            downloadBlob(blob, `${image.Filename.split('.')[0]}_annotated.pdf`);
        } catch (error) {
            console.error('Error creating PDF:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [image, pdfDoc, pageNum, canvasRef, saveCurrentAnnotations, getPageAnnotation]);

    const handleDownload = useCallback((format?: 'png' | 'pdf') => {
        if (image?.type === 'pdf' && format === 'pdf') {
            downloadAsPDF();
        } else {
            downloadAsPNG();
        }
    }, [image, downloadAsPDF, downloadAsPNG]);

    return {
        handleDownload,
        downloadAsPNG,
        downloadAsPDF,
        isProcessing,
        saveCurrentAnnotations
    };
};
