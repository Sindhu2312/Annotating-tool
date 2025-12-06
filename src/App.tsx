import { Link, Routes, Route } from 'react-router-dom';
// import './App.css'
import Uploadpage from './pages/Upload';
import Navbar from './components/Navbar';
import Annotatepage from './pages/Annotate';
function App() {

  return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden bg-gray-900">
          <Routes>
            <Route path="/" element={<Uploadpage/>} />
            {/* <Route path="/upload" element={<Uploadpage/>} /> */}
            <Route path="/annotate" element={<Annotatepage/>} />
          </Routes>
        </div>
      </div>
  )
}

export default App
