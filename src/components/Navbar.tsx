import { Link, useLocation } from "react-router-dom";


const Navbar = () => {
    const location = useLocation();
    if (location.pathname === "/annotate") {
        return (
            <nav className="flex gap-4 p-3.5 fixed top-3 left-5">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/home.png" alt="home" className="w-6 h-6" />
                </Link>
            </nav>
        );
    }
    return (
        <nav className="flex gap-6 p-4.5 fixed top-0 bg-gray-900 w-full">
            <Link to="/" className="text-gray-500 font-semibold hover:text-white transition">Home</Link>
            <Link to="/gallery" className="text-gray-500 font-semibold hover:text-white transition">Gallery</Link>
        </nav>
    );
}

export default Navbar;