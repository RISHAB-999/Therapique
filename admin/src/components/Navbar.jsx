import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <div className='sticky top-0 z-40 bg-white border-b border-slate-200/80 px-3 sm:px-8 py-3 flex justify-between items-center shadow-2xs'>
      <div className='flex items-center gap-2 text-xs min-w-0'>
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(prev => !prev)}
          className="md:hidden p-1.5 -ml-1 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <NavLink to='/' className="shrink-0">
          <h1 className="font-therapique text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
            therapique
          </h1>
        </NavLink>
        <span className='border px-2 sm:px-2.5 py-0.5 rounded-full border-purple-200 bg-purple-50 text-purple-700 font-extrabold text-[10px] sm:text-xs shrink-0 truncate max-w-[100px] sm:max-w-none'>
          {aToken ? 'Admin' : 'Doctor Portal'}
        </span>
      </div>
      <button 
        onClick={logout} 
        className='bg-gray-900 hover:bg-purple-600 text-white text-xs sm:text-sm font-bold px-3 sm:px-8 py-1.5 sm:py-2 rounded-full transition cursor-pointer shrink-0 shadow-2xs ml-2'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar