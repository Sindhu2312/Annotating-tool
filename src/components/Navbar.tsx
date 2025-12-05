import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="flex gap-4 p-3 fixed top-0 left-8">
            <Link to="/">Home</Link>
            <Link to="/gallery">Gallery</Link>
        </nav>
    )
}

export default Navbar;