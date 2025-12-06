import {create} from "zustand";

interface AnnotationsStore {
    drawing : boolean;
    image : any;
    pageNum : number;
    strokeColor : string;
    pdfDoc : any;
    ctx : CanvasRenderingContext2D | null;

    setImage : (img: any) => void;
    setDrawing : (drawing: boolean) => void;
    setPageNum : (pageNum: number) => void;
    setStrokeColor : (color: string) => void;
    setPdfDoc : (pdfDoc: any) => void;
    setCtx : (ctx: CanvasRenderingContext2D | null) => void;
}
export const useAnnotationsStore = create<AnnotationsStore>((set) => ({
    image : null,
    drawing: false,
    pageNum: 1,
    strokeColor: "red",
    pdfDoc: null,
    ctx: null,

    setDrawing: (drawing: boolean) => set({drawing}),
    setImage: (img: any) => set({image: img}),
    setPageNum: (pageNum: number) => set({pageNum}),
    setStrokeColor: (color: string) => set({strokeColor: color}),
    setPdfDoc: (pdfDoc: any) => set({pdfDoc}),
    setCtx: (ctx: CanvasRenderingContext2D | null) => set({ctx}),
}));