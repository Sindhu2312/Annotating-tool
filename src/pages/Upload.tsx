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
            setImage({
                id: Date.now(),
                Filename: file.name,
                file: reader.result as string,
            });
            navigate("/annotate");
        }

        reader.readAsDataURL(file);
    }
    console.log("Current Image in Store:", image);
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Upload Image</h2>
                <label className="flex flex-col items-center justify-center w-64 h-40 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <p className="text-gray-600">Click to upload</p>
                </label>
            </div>
        </div>
    )
}

export default Uploadpage;