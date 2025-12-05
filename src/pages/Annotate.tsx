import { useEffect, useRef, useState } from "react";
import { useAnnotationsStore } from "../store/AnnotationsStore";
import { useNavigate } from "react-router-dom";

const Annotatepage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState("red");
    const navigate = useNavigate();

    const {image} = useAnnotationsStore();
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

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const context = canvas.getContext("2d");
    if(context){
        context.lineWidth = 3;
        context.lineJoin = "round";
        context.lineCap = "round";
        setCtx(context);
    }
  };

  useEffect(() => {
    resizeCanvasToImage();
    window.addEventListener("resize", resizeCanvasToImage);
    return () => window.removeEventListener("resize", resizeCanvasToImage);
  }, []);

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

  const stopDrawing = () => {
    setDrawing(false);
  };

    return (
        <div className="flex h-screen">
            <div className="flex-1 p-4 flex items-center justify-center">
                <div className="relative">
                <img 
                    ref={imgRef}
                    src={image.file} 
                    alt={image.Filename} 
                    className="max-w-full max-h-full object-contain"
                    onLoad={resizeCanvasToImage} 
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                </div>
            </div>
            <div className="w-64 bg-gray-50 p-4 border-l flex flex-col">
                <h2 className="text-lg font-bold mb-4 break-all">{image.Filename}</h2>
                <div className="space-y-2">
                    {colors.map((color)=>{
                        return (<div key={color.name}>
                            <div className={`w-5 h-5 rounded-full ${color.dot}`}
                            onClick={() => setStrokeColor(color.name)}
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
                <div className="mt-auto">
                    <button onClick={() => navigate("/")}>
                        Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Annotatepage;