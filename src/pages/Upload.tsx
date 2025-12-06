import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnotationsStore } from "../store/AnnotationsStore";

const Uploadpage = () => {

    const fileRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const { setImage, image } = useAnnotationsStore();

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if(!files || files.length === 0) return;
        
        const file = files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const fileType = file.type === "application/pdf" ? "pdf" : "image";
            setImage({
                id: Date.now(),
                Filename: file.name,
                file: reader.result as string,
                type: fileType,
            });
            navigate("/annotate");
        }

        reader.readAsDataURL(file);
    }
    console.log("Current Image in Store:", image);
    return (
        <div className="min-h-screen flex flex-col">
            {/* Top section with typing animation */}
            <div className="pt-20 text-center">
                <h1 className="animate-typing text-4xl font-bold">
                    Let's annotate it!
                </h1>
            </div>

            {/* Center section with upload */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">Upload Image</h2>
                    <label className="flex flex-col items-center justify-center w-64 h-40 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-gray-700 transition bg-gray-700/50">
                        <input 
                            ref={fileRef} 
                            type="file" 
                            accept="image/*,application/pdf" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        <p className="text-gray-600">Click to upload</p>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Uploadpage;