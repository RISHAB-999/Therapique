import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {
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
      <div className='flex items-center gap-2 text-xs'>
        <NavLink to='/'>
          <h1 className="font-therapique text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
            therapique
          </h1>
        </NavLink>
        <span className='border px-2.5 py-0.5 rounded-full border-purple-200 bg-purple-50 text-purple-700 font-extrabold text-[10px] sm:text-xs shrink-0'>
          {aToken ? 'Admin' : 'Doctor Portal'}
        </span>
      </div>
      <button 
        onClick={logout} 
        className='bg-gray-900 hover:bg-purple-600 text-white text-xs sm:text-sm font-bold px-4 sm:px-8 py-1.5 sm:py-2 rounded-full transition cursor-pointer shrink-0 shadow-2xs'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar