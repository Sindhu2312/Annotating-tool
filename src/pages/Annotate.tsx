import { useEffect, useRef } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import * as pdfjsLib from "pdfjs-dist";
import { RightPanel } from "./RightPanel/RightPanel";
import colors from "./Colors/Colors";

const Annotatepage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const { drawing, setDrawing, 
            image,
            strokeColor,
            pdfDoc, setPdfDoc,
            ctx, setCtx, savePageAnnotation, pageNum, getPageAnnotation } = useAnnotationsStore();


    const saveCurrentAnnotations = () => {
        if (canvasRef.current && image?.type === 'pdf') {
        const canvasData = canvasRef.current.toDataURL('image/png');
        savePageAnnotation(pageNum, canvasData);
        }
    };

    const loadAnnotations = async (pageNumber: number) => {
        const savedData = getPageAnnotation(pageNumber);
        if (!canvasRef.current) return;
        
        const drawCtx = canvasRef.current.getContext("2d");
        if (!drawCtx) return;
        
        // Clear canvas first
        drawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Load saved annotations if they exist
        if (savedData) {
        const img = new Image();
        img.onload = () => {
            drawCtx.drawImage(img, 0, 0);
        };
        img.src = savedData;
        }
    };

    const resizeCanvasToImage = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;

        if (!canvas || !img) return;

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
        if(context){
            context.setTransform(1, 0, 0, 1, 0, 0); // No scaling needed
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

    // Ensure exact match
    canvas.width = pdfCanvas.width;
    canvas.height = pdfCanvas.height;

    canvas.style.width = pdfCanvas.clientWidth + "px";  // Use clientWidth
    canvas.style.height = pdfCanvas.clientHeight + "px"; // Use clientHeight

    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';

    const context = canvas.getContext("2d");
    if(context) {
        // Reset any previous transforms
        context.resetTransform();
        
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

    // SAVE current page annotations before switching
    if (num !== pageNum && image?.type === 'pdf') {
      saveCurrentAnnotations();
    }

    try {
      const page = await pdf.getPage(num);
      
      let scale = 1.0;
      const baseViewport = page.getViewport({ scale: 1 });
      const maxWidth = 850;
      
      scale = (maxWidth / baseViewport.width) * 1.3;
      scale = Math.min(scale, 2.0);
      
      const viewport = page.getViewport({ scale });

      const canvas = pdfCanvasRef.current!;
      const context = canvas.getContext("2d")!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({ 
        canvasContext: context,
        viewport,
      }).promise;

      resizeCanvasToPDF();
      
      // LOAD annotations for the new page
      setTimeout(() => {
        loadAnnotations(num);
      }, 100);
      
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  // ADD: Save annotations when component unmounts
  useEffect(() => {
    return () => {
      if (image?.type === 'pdf') {
        saveCurrentAnnotations();
      }
    };
  }, [pageNum]);

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


    const startDrawing = (e: any) => {
        if (!ctx || !canvasRef.current) return;
        setDrawing(true);

        const rect = canvasRef.current.getBoundingClientRect();
        let x, y;
        if (image.type === 'image' && imgRef.current) {
            // Use canvas scaling (canvas overlays displayed image)
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;
            x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
            y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
        } else {
            // Use canvas scaling (PDF)
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;
            x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
            y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!drawing || !ctx || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        ctx.strokeStyle = strokeColor;
        let x, y;
        if (image.type === 'image' && imgRef.current) {
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;
            x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
            y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
        } else {
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;
            x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
            y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;
        }
        ctx.lineTo(x, y);
        ctx.stroke();
    };


    return (
            <div className="flex h-screen overflow-hidden">
                <div className="bg-gray-900 flex-1 p-4 flex items-center justify-center overflow-hidden min-w-0">
                    <div
                        className="relative select-none shadow rounded-lg w-[900px] h-[700px] max-w-full max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden"
                    >
                        <div className="relative w-full flex justify-center p-4">
                            <div className="bg-white relative inline-block max-w-full">
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
                                    className="block w-full max-w-full"
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
    )
}

export default Annotatepage;