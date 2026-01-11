import { useAnnotationsStore } from "../../store/AnnotationsStore";
import { useState } from "react";
import { useDownload } from "../../hooks/useDownload";

interface RightPanelProps {
    colors: any[];
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    renderPage: (pageNum: number) => void;
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
}

export const RightPanel = ({ colors, canvasRef, renderPage, pdfCanvasRef, imgRef }: RightPanelProps) => {
    const { image, strokeColor, setStrokeColor, ctx, pdfDoc, pageNum, setPageNum } = useAnnotationsStore();
    const [open, setOpen] = useState(false);

    // Use custom download hook
    const { handleDownload } = useDownload({ canvasRef, pdfCanvasRef, imgRef });

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
                <div className="mt-auto relative">
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
                    {(open && image?.type === "pdf") && (
                        <div className="absolute ml-30 bottom-0 p-2 bg-gray-700 rounded">
                            <p className="text-sm mb-1">Format:</p>
                            <div className="flex gap-2">
                            <button
                                className="px-2 py-1 rounded text-xs bg-blue-500 hover:bg-blue-600"
                                onClick={() => { setOpen(false); handleDownload('png'); }}
                            >
                                PNG
                            </button>
                            <button
                                className="px-2 py-1 rounded text-xs bg-blue-500 hover:bg-blue-600"
                                onClick={() => { setOpen(false); handleDownload('pdf'); }}
                            >
                                PDF
                            </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}