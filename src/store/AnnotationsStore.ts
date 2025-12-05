import {create} from "zustand";

export const useAnnotationsStore = create<any>((set) => ({
    image : null,
    setImage: (img: any) => set({image: img}),
}));