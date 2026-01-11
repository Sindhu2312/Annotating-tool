// Custom hook for annotation management
import { useCallback } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { resizeCanvasToImage as resizeCanvasToImageUtil } from "../utils/canvas.utils";

interface UseAnnotationsProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}

export const useAnnotations = ({ canvasRef, imgRef }: UseAnnotationsProps) => {
    const { setCtx, ctx } = useAnnotationsStore();

    const resizeCanvasToImage = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;

        if (!canvas || !img) return;

        resizeCanvasToImageUtil(canvas, img, setCtx);
    }, [canvasRef, imgRef, setCtx]);

    const clearAnnotations = useCallback(() => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [ctx, canvasRef]);

    return {
        resizeCanvasToImage,
        clearAnnotations
    };
};
