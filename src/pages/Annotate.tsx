import { useEffect, useRef } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { RightPanel } from "./RightPanel/RightPanel";
import colors from "./Colors/Colors";
import { useCanvasDrawing } from "../hooks/useCanvasDrawing";
import { usePDFOperations } from "../hooks/usePDFOperations";
import { useAnnotations } from "../hooks/useAnnotations";

const Annotatepage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const { setDrawing, image } = useAnnotationsStore();

    // Custom hooks for modular functionality
    const { startDrawing, draw } = useCanvasDrawing({ canvasRef });
    const { loadPDF, renderPage, saveCurrentAnnotations } = usePDFOperations({ canvasRef, pdfCanvasRef });
    const { resizeCanvasToImage } = useAnnotations({ canvasRef, imgRef });

    // Save annotations when component unmounts or page changes
    useEffect(() => {
        return () => {
            if (image?.type === 'pdf') {
                saveCurrentAnnotations();
            }
        };
    }, [image?.type, saveCurrentAnnotations]);

    // Load PDF when image changes
    useEffect(() => {
        if (image?.type === "pdf" && image.file) {
            loadPDF(image.file);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image?.file, image?.type]);

    // Handle image resize and global mouse events
    useEffect(() => {
        if (image?.type === "image") {
            resizeCanvasToImage();
        }

        const handleResize = () => {
            if (image?.type === "image") {
                resizeCanvasToImage();
            }
        };

        const handleGlobalMouseUp = () => {
            setDrawing(false);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mouseup", handleGlobalMouseUp);
        window.addEventListener("touchend", handleGlobalMouseUp);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mouseup", handleGlobalMouseUp);
            window.removeEventListener("touchend", handleGlobalMouseUp);
        };
    }, [image?.type, setDrawing, resizeCanvasToImage]);


    return (
        <div className="flex h-screen overflow-hidden">
            <div className="bg-gray-900 flex-1 p-4 flex items-center justify-center overflow-hidden min-w-0">
                <div className="relative select-none shadow rounded-lg w-[900px] h-[700px] max-w-full max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
                    <div className="relative w-full flex justify-center p-4">
                        <div className="bg-white relative inline-block max-w-full">
                            {image?.type === "image" && (
                                <img
                                    ref={imgRef}
                                    src={image.file}
                                    alt={image.Filename}
                                    className="block select-none pointer-events-none max-w-full max-h-full object-contain"
                                    onLoad={resizeCanvasToImage}
                                    draggable={false}
                                />
                            )}

                            {image?.type === "pdf" && (
                                <canvas
                                    ref={pdfCanvasRef}
                                    className="block max-w-full"
                                    style={{ display: 'block' }}
                                />
                            )}

                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 pointer-events-auto"
                                style={{ touchAction: 'none' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <RightPanel
                colors={colors}
                canvasRef={canvasRef}
                renderPage={renderPage}
                pdfCanvasRef={pdfCanvasRef}
                imgRef={imgRef}
            />
        </div>
    );
};

export default Annotatepage;