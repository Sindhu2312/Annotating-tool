import { Link, useLocation } from "react-router-dom";


const Navbar = () => {
    const location = useLocation();
    if (location.pathname === "/annotate") {
        return (
            <nav className="flex gap-4 p-3 fixed top-0 left-8">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/home.png" alt="home" className="w-6 h-6" />
                </Link>
            </nav>
        );
    }
    return (
        <nav className="flex gap-4 p-3 fixed top-0 left-8">
            <Link to="/">Home</Link>
            <Link to="/gallery">Gallery</Link>
        </nav>
    );
}

export default Navbar;