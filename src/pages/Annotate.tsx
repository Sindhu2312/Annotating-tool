import { useEffect, useRef } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import * as pdfjsLib from "pdfjs-dist";
import { RightPanel } from "./RightPanel/RightPanel";

const Annotatepage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const { drawing, setDrawing, 
            image,
            strokeColor,
            pdfDoc, setPdfDoc,
            ctx, setCtx} = useAnnotationsStore();

    
    const colors = [
    { name: "Red", dot: "bg-red-500" },
    { name: "Blue", dot: "bg-blue-500" },
    { name: "Green", dot: "bg-green-500" },
    { name: "Yellow", dot: "bg-yellow-500" },
    ];

    const resizeCanvasToImage = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;

        if (!canvas || !img) return;

        canvas.width = img.naturalWidth;  //original image size
        canvas.height = img.naturalHeight;

        canvas.style.width = img.clientWidth + "px"; //displayed size of image
        canvas.style.height = img.clientHeight + "px";

        canvas.style.left = img.offsetLeft + "px"; // distace from nearest parent 
        canvas.style.top = img.offsetTop + "px";

        const context = canvas.getContext("2d");
        if(context){
            const scaleX =  img.naturalWidth / img.clientWidth;
            const scaleY =  img.naturalHeight / img.clientHeight;
            context.setTransform(scaleX, 0, 0, scaleY, 0, 0);  // b,c=0 undistored drawing
            // e,f=0 no translation

            context.lineWidth = 3;
            context.lineJoin = "round";
            context.lineCap = "round";
            setCtx(context);
        }
    };

    const resizeCanvasToPDF = () => {
        const canvas = canvasRef.current;
        const pdfCanvas = pdfCanvasRef.current;

        if (!canvas || !pdfCanvas) return;

        canvas.width = pdfCanvas.width;
        canvas.height = pdfCanvas.height;

        canvas.style.width = pdfCanvas.style.width;
        canvas.style.height = pdfCanvas.style.height;

        const context = canvas.getContext("2d");
        if(context){
            context.lineWidth = 3;
            context.lineJoin = "round";
            context.lineCap = "round";
            setCtx(context);
        }
    };

    const loadPDF = async (fileData: string) => {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).toString();

            const loadingTask = pdfjsLib.getDocument({
                url: fileData,
                verbosity: 0
            });
            const pdf = await loadingTask.promise;

            setPdfDoc(pdf);
            renderPage(1, pdf);
        } catch (error) {
            console.error("Error loading PDF:", error);
        }
    };

    const renderPage = async (num: number, pdf = pdfDoc) => {
        if (!pdf) return;

        try {
            const page = await pdf.getPage(num);
            
            // Calculate scale to fit width and allow vertical scroll
            let scale = 1.0;
            const baseViewport = page.getViewport({ scale: 1 });
            const maxWidth = 850;
            
            // Scale to fit width, allow height to extend
            scale = (maxWidth / baseViewport.width) * 1.3; // 1.3x for better zoom
            scale = Math.min(scale, 2.0); // Cap at 2x
            
            const viewport = page.getViewport({ scale });

            const canvas = pdfCanvasRef.current!;
            const context = canvas.getContext("2d")!;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Clear canvas before rendering
            context.clearRect(0, 0, canvas.width, canvas.height);

            await page.render({ 
                canvasContext: context,
                viewport,
            }).promise;

            // Clear annotations when changing pages
            if (canvasRef.current) {
                const drawCtx = canvasRef.current.getContext("2d");
                if (drawCtx) {
                    drawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }

            resizeCanvasToPDF();
        } catch (error) {
            console.error("Error rendering page:", error);
        }
    };

  useEffect(() => {
    if (image.type === "pdf") {
        loadPDF(image.file);
    }
  }, [image]);

  useEffect(() => {
    if (image.type === "image") {
        resizeCanvasToImage();
    }
    
    const handleResize = () => {
        if (image.type === "image") {
            resizeCanvasToImage();
        }
    };
    
    window.addEventListener("resize", handleResize);

    const handleGlobalMouseUp = () => {
        setDrawing(false);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    
    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mouseup", handleGlobalMouseUp);  //to clean up on unmount
        window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [image.type]);

  const startDrawing = (e:any) => {
    if (!ctx || !canvasRef.current) return;
    setDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
  };

  const draw = (e:any) => {
    if (!drawing || !ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    ctx.strokeStyle = strokeColor;

    ctx.lineTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    ctx.stroke();
  };


    return (
            <div className="flex h-screen overflow-hidden">
                <div className="flex-1 p-4 flex items-center justify-center overflow-hidden min-w-0">
                    <div
                        className="relative select-none shadow rounded-lg w-[900px] h-[700px] max-w-full max-h-[calc(100vh-5rem)] overflow-y-auto "
                    >
                        <div className="relative w-full flex justify-center p-4">
                            <div className="relative inline-block bg-white">
                            {image.type === "image" && (
                                <img
                                    ref={imgRef}
                                    src={image.file}
                                    alt={image.Filename}
                                    className="block select-none pointer-events-none max-w-full max-h-full object-contain"
                                    onLoad={resizeCanvasToImage}
                                    draggable={false}
                                />
                            )}

                            {image.type === "pdf" && (
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
            
            <RightPanel colors={colors} canvasRef={canvasRef} renderPage={renderPage} />
        </div>
    )
}

export default Annotatepage;