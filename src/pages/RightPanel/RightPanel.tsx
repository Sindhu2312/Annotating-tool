import { useAnnotationsStore } from "../../store/AnnotationsStore";

export const RightPanel = ({ colors, canvasRef, renderPage }: 
    { colors: any[], canvasRef: React.RefObject<HTMLCanvasElement | null>,
        renderPage: (pageNum: number) => void
     }) => {
    const { image, setStrokeColor, ctx, pdfDoc, pageNum, setPageNum} = useAnnotationsStore();
    return (
        <div className="w-84 bg-gray-100 p-4 border-l flex flex-col shrink-0">
                <h2 className="text-lg font-bold mb-4 break-all">{image.Filename}</h2>
                
                {image.type === "pdf" && pdfDoc && (
                    <div className="mb-4 p-3 bg-white rounded shadow">
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
                
                <div className="space-y-2">
                    {colors.map((color)=>{
                        return (<div key={color.name}>
                            <div className={`w-5 h-5 rounded-full ${color.dot}`}
                            onClick={() => setStrokeColor(color.name.toLowerCase())}
                            ></div>
                        </div>
                        )
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
                {/* <div className="mt-auto">
                    <button onClick={() => navigate("/")}>
                        Home
                    </button>
                </div> */}
            </div>
    );
}