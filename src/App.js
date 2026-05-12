import { Route, Routes, BrowserRouter, Outlet } from 'react-router-dom'
import ZoonNavbar from './components/zoon-navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'

function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <ZoonNavbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
