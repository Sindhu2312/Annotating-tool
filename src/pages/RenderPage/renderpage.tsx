// import { useAnnotationsStore } from "../../store/AnnotationsStore";


// export const renderPage = async (
//     num: number,
//     pdfCanvasRef?: React.RefObject<HTMLCanvasElement | null>,
//     canvasRef?: React.RefObject<HTMLCanvasElement | null>,
    
// ) => {

//         const {pdfDoc, setCtx}= useAnnotationsStore();
//         const pdf = pdfDoc;
//         if (!pdf) return;

//         const resizeCanvasToPDF = () => {
//         const canvas = canvasRef?.current;
//         const pdfCanvas = pdfCanvasRef?.current;

//         if (!canvas || !pdfCanvas) return;

//         canvas.width = pdfCanvas.width;
//         canvas.height = pdfCanvas.height;

//         canvas.style.width = pdfCanvas.style.width;
//         canvas.style.height = pdfCanvas.style.height;

//         const context = canvas.getContext("2d");
//         if(context){
//             context.lineWidth = 3;
//             context.lineJoin = "round";
//             context.lineCap = "round";
//             setCtx(context);
//         }
//     };
//         try {
//             const page = await pdf.getPage(num);
            
//             // Calculate scale to fit width and allow vertical scroll
//             let scale = 1.0;
//             const baseViewport = page.getViewport({ scale: 1 });
//             const maxWidth = 850;
            
//             // Scale to fit width, allow height to extend
//             scale = (maxWidth / baseViewport.width) * 1.3; // 1.3x for better zoom
//             scale = Math.min(scale, 2.0); // Cap at 2x
            
//             const viewport = page.getViewport({ scale });

//             const canvas = pdfCanvasRef?.current!;
//             const context = canvas.getContext("2d")!;

//             canvas.height = viewport.height;
//             canvas.width = viewport.width;

//             // Clear canvas before rendering
//             context.clearRect(0, 0, canvas.width, canvas.height);

//             await page.render({ 
//                 canvasContext: context,
//                 viewport,
//             }).promise;

//             // Clear annotations when changing pages
//             if (canvasRef?.current) {
//                 const drawCtx = canvasRef.current.getContext("2d");
//                 if (drawCtx) {
//                     drawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//                 }
//             }

//             resizeCanvasToPDF();
//         } catch (error) {
//             console.error("Error rendering page:", error);
//         }
//     };