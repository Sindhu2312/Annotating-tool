// Custom hook for canvas drawing operations
import { useCallback } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { getScaledCoordinates } from "../utils/canvas.utils";

interface UseCanvasDrawingProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useCanvasDrawing = ({ canvasRef }: UseCanvasDrawingProps) => {
    const { drawing, setDrawing, strokeColor, ctx } = useAnnotationsStore();

    const startDrawing = useCallback((e: any) => {
        if (!ctx || !canvasRef.current) return;
        setDrawing(true);

        const { x, y } = getScaledCoordinates(e, canvasRef.current);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }, [ctx, canvasRef, setDrawing]);

    const draw = useCallback((e: any) => {
        if (!drawing || !ctx || !canvasRef.current) return;

        ctx.strokeStyle = strokeColor;
        const { x, y } = getScaledCoordinates(e, canvasRef.current);
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [drawing, ctx, canvasRef, strokeColor]);

    const stopDrawing = useCallback(() => {
        setDrawing(false);
    }, [setDrawing]);

    return {
        startDrawing,
        draw,
        stopDrawing,
        drawing
    };
};
