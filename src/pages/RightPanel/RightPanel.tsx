import { useAnnotationsStore } from "../../store/AnnotationsStore";

interface RightPanelProps {
    colors: any[];
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    renderPage: (pageNum: number) => void;
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}

export const RightPanel = ({ colors, canvasRef, renderPage, pdfCanvasRef, imgRef }: RightPanelProps) => {
    const { image, strokeColor, setStrokeColor, ctx, pdfDoc, pageNum, setPageNum} = useAnnotationsStore();

    const handleDownload = () => {
        const mergeCanvas = document.createElement('canvas');
        const mergeCtx = mergeCanvas.getContext('2d');
        
        if (!mergeCtx) return;

        let filename = '';

        if (image.type === 'image' && imgRef.current && canvasRef.current) {
            mergeCanvas.width = imgRef.current.naturalWidth;
            mergeCanvas.height = imgRef.current.naturalHeight;
            mergeCtx.drawImage(imgRef.current, 0, 0);
            mergeCtx.drawImage(canvasRef.current, 0, 0);
            filename = `${image.Filename.split('.')[0]}_annotated.png`;
        } else if (image.type === 'pdf' && pdfCanvasRef.current && canvasRef.current) {
            mergeCanvas.width = pdfCanvasRef.current.width;
            mergeCanvas.height = pdfCanvasRef.current.height;
            mergeCtx.drawImage(pdfCanvasRef.current, 0, 0);
            mergeCtx.drawImage(canvasRef.current, 0, 0);
            filename = `${image.Filename.split('.')[0]}_page${pageNum}_annotated.png`;
        } else return;

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
                <div className="mt-auto">
                    <button className="bg-fuchsia-950 rounded-xl px-4 py-2"
                    onClick={handleDownload}>
                        Download
                    </button>
                </div>
            </div>
    );
}