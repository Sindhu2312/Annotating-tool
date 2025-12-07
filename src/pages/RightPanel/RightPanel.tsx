import { useAnnotationsStore } from "../../store/AnnotationsStore";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
interface RightPanelProps {
    colors: any[];
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    renderPage: (pageNum: number) => void;
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}

export const RightPanel = ({ colors, canvasRef, renderPage, pdfCanvasRef, imgRef }: RightPanelProps) => {
    const { image, strokeColor, setStrokeColor, ctx, pdfDoc, pageNum, 
        setPageNum, savePageAnnotation, getPageAnnotation,clearPageAnnotation} = useAnnotationsStore();
    const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf'>('png');
    const [isProcessing, setIsProcessing] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDownload = (format?: 'png' | 'pdf') => {
        const mergeCanvas = document.createElement('canvas');
        const mergeCtx = mergeCanvas.getContext('2d');
        if (!mergeCtx) return;

        let filename = '';
        // Use passed format or current state
        const chosenFormat = format || downloadFormat;
        if (image?.type === 'pdf' && chosenFormat === 'pdf') {
            downloadAsPDF();
            return;
        }
        if (image.type === 'image' && imgRef.current && canvasRef.current) {
            mergeCanvas.width = imgRef.current.naturalWidth;
            mergeCanvas.height = imgRef.current.naturalHeight;
            mergeCtx.drawImage(imgRef.current, 0, 0);
            // Scale annotation canvas to match image's natural size
            mergeCtx.drawImage(
                canvasRef.current,
                0, 0, imgRef.current.clientWidth, imgRef.current.clientHeight,
                0, 0, imgRef.current.naturalWidth, imgRef.current.naturalHeight
            );
            filename = `${image.Filename.split('.')[0]}_annotated.png`;
        } else if (image.type === 'pdf' && pdfCanvasRef.current && canvasRef.current) {
            mergeCanvas.width = pdfCanvasRef.current.width;
            mergeCanvas.height = pdfCanvasRef.current.height;
            mergeCtx.drawImage(pdfCanvasRef.current, 0, 0);
            mergeCtx.drawImage(canvasRef.current, 0, 0);
            filename = `${image.Filename.split('.')[0]}_page${pageNum}_annotated.png`;
        } else return;

        saveCurrentAnnotations();
        mergeCanvas.toBlob((blob) => {
            if (!blob) return;
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    // Save current annotations
    const saveCurrentAnnotations = () => {
    if (canvasRef.current && image?.type === 'pdf') {
        const canvasData = canvasRef.current.toDataURL('image/png');
        savePageAnnotation(pageNum, canvasData);
    }
    };

    // Download all pages as PDF
    const downloadAsPDF = async () => {
    if (!image || image.type !== 'pdf' || !pdfDoc) return;
    
    setIsProcessing(true);
    saveCurrentAnnotations();

    try {
        const pdfBytes = await fetch(image.file).then(res => res.arrayBuffer());
        const pdfDocLib = await PDFDocument.load(pdfBytes);
        const pages = pdfDocLib.getPages();

        for (let i = 1; i <= pdfDoc.numPages; i++) {
        const annotations = getPageAnnotation(i) || 
                            (i === pageNum ? canvasRef.current?.toDataURL('image/png') : null);
        
        if (annotations) {
            const img = new Image();
            await new Promise((resolve) => {
            img.onload = resolve;
            img.src = annotations;
            });

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            }

            const pngBytes = await new Promise<Uint8Array>((resolve) => {
            tempCanvas.toBlob(async (blob) => {
                if (blob) {
                const buffer = await blob.arrayBuffer();
                // Fix: Explicitly cast to ArrayBuffer
                resolve(new Uint8Array(buffer as ArrayBuffer));
                }
            }, 'image/png');
            });

            const pngImage = await pdfDocLib.embedPng(pngBytes);
            const page = pages[i - 1];
            page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
            });
        }
        }

        const modifiedPdfBytes = await pdfDocLib.save();
        const ab = new ArrayBuffer(modifiedPdfBytes.byteLength);
        new Uint8Array(ab).set(modifiedPdfBytes);
        const blob = new Blob([ab], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${image.Filename.split('.')[0]}_annotated.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error creating PDF:', error);
    } finally {
        setIsProcessing(false);
    }
    };

    return (
        <div className="w-84 bg-gray-800 p-5 flex flex-col border-l shrink-0">
                <h2 className="text-lg font-bold mb-4 break-all">{image.Filename}</h2>
                
                {image.type === "pdf" && pdfDoc && (
                    <div className="mb-4 p-3 rounded shadow">
                        <p className="text-sm font-semibold mb-2">Page {pageNum} of {pdfDoc.numPages}</p>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                onClick={() => {
                                    if (pageNum > 1) {
                                        const newPage = pageNum - 1;
                                        setPageNum(newPage);
                                        renderPage(newPage);
                                    }
                                }}
                                disabled={pageNum <= 1}
                            >
                                Prev
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                                onClick={() => {
                                    if (pdfDoc && pageNum < pdfDoc.numPages) {
                                        const newPage = pageNum + 1;
                                        setPageNum(newPage);
                                        renderPage(newPage);
                                    }
                                }}
                                disabled={pageNum >= pdfDoc.numPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-2 grid grid-cols-7 gap-2">
                    {colors.map((color)=>{
                        return (<div key={color.name}>
                                    <div className={`w-5 h-5 rounded-full ${color.dot} hover:scale-110 cursor-pointer border-2 border-gray-300 ${strokeColor === color.hex ? 'ring-4 ring-gray-500' : ''}`}
                                      onClick={() => setStrokeColor(color.hex)}>
                                    </div>
                                </div>)
                    })}
                </div>
                <div>
                    <button
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                        onClick={() => {
                            if(ctx && canvasRef.current){
                                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                            }
                        }}
                    >
                        Clear Annotations
                    </button>
                </div>
                {/* Show format selection only for PDFs, and trigger download on selection */}
                {(open && image?.type === "pdf") && (
                    <div className="mb-2 p-2 bg-gray-700 rounded">
                        <p className="text-sm mb-1">Format:</p>
                        <div className="flex gap-2">
                        <button
                            className={`px-2 py-1 rounded text-xs ${
                            downloadFormat === 'png' ? 'bg-blue-500' : 'bg-gray-600'
                            }`}
                            onClick={() => { setOpen(false); handleDownload('png'); }}
                        >
                            PNG
                        </button>
                        <button
                            className={`px-2 py-1 rounded text-xs ${
                            downloadFormat === 'pdf' ? 'bg-blue-500' : 'bg-gray-600'
                            }`}
                            onClick={() => { setOpen(false); handleDownload('pdf'); }}
                        >
                            PDF
                        </button>
                        </div>
                    </div>
                )}
                <div className="mt-auto">
                    <button className="bg-fuchsia-950 rounded-xl px-4 py-2"
                        onClick={() => {
                            if (image?.type === 'pdf') {
                                setOpen(true);
                            } else {
                                handleDownload();
                            }
                        }}>
                        Download
                    </button>
                </div>
            </div>
    );
}