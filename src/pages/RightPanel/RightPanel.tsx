// import { useAnnotationsStore } from "../../store/AnnotationsStore";

// export const RightPanel = (colors:any) => {
//     const { image, setStrokeColor } = useAnnotationsStore();
//     return (
//         <div className="w-84 bg-gray-100 p-4 border-xs flex flex-col shrink-0">
//                 <h2 className="text-lg font-bold mb-4 break-all">{image.Filename}</h2>
//                 <div className="space-y-2">
//                     {colors.map((color:any)=>{
//                         return (<div key={color.name}>
//                             <div className={`w-5 h-5 rounded-full ${color.dot}`}
//                             onClick={() => setStrokeColor(color.name.toLowerCase())}
//                             ></div>
//                         </div>
//                         )
//                     })}
//                 </div>
//                 <div>
//                     <button
//                         className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
//                         onClick={() => {
//                             if(ctx && canvasRef.current){
//                                 ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//                             }
//                         }}
//                     >
//                         Clear Annotations
//                     </button>
//                 </div>
//         </div>
//     );
// }