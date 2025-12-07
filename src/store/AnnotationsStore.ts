import {create} from "zustand";

interface AnnotationsStore {
    drawing : boolean;
    image : any;
    pageNum : number;
    strokeColor : string;
    pdfDoc : any;
    ctx : CanvasRenderingContext2D | null;
    pageAnnotations: Map<number, string>;

    setImage : (img: any) => void;
    setDrawing : (drawing: boolean) => void;
    setPageNum : (pageNum: number) => void;
    setStrokeColor : (color: string) => void;
    setPdfDoc : (pdfDoc: any) => void;
    setCtx : (ctx: CanvasRenderingContext2D | null) => void;
    savePageAnnotation: (pageNum: number, canvasData: string) => void;
    getPageAnnotation: (pageNum: number) => string | undefined;
    clearPageAnnotation: (pageNum: number) => void;
    clearAllAnnotations: () => void;
}
export const useAnnotationsStore = create<AnnotationsStore>((set,get) => ({
    image : null,
    drawing: false,
    pageNum: 1,
    strokeColor: "red",
    pdfDoc: null,
    ctx: null,
    pageAnnotations: new Map<number, string>(),

    setDrawing: (drawing: boolean) => set({drawing}),
    setImage: (image) => set({ 
        image, 
        pageNum: 1,
        pageAnnotations: new Map() // Reset annotations when new file loads
    }),
    setPageNum: (pageNum: number) => set({pageNum}),
    setStrokeColor: (color: string) => set({strokeColor: color}),
    setPdfDoc: (pdfDoc: any) => set({pdfDoc}),
    setCtx: (ctx: CanvasRenderingContext2D | null) => set({ctx}),
    savePageAnnotation: (pageNum, canvasData) => set((state) => {
        const newAnnotations = new Map(state.pageAnnotations);
        if (canvasData) {
        newAnnotations.set(pageNum, canvasData);
        } else {
        newAnnotations.delete(pageNum);
        }
        return { pageAnnotations: newAnnotations };
    }),
    
    getPageAnnotation: (pageNum) => {
        return get().pageAnnotations.get(pageNum);
    },
    
    clearPageAnnotation: (pageNum) => set((state) => {
        const newAnnotations = new Map(state.pageAnnotations);
        newAnnotations.delete(pageNum);
        return { pageAnnotations: newAnnotations };
    }),
    
    clearAllAnnotations: () => set({ pageAnnotations: new Map() }),
}));