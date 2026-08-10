import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return (
    <div className='w-14 sm:w-64 bg-white border-r border-slate-200/80 shrink-0 transition-all duration-300 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto z-30'>
      {aToken && (
        <ul className='text-gray-600 mt-4 space-y-1'>
          {/* Overview Links */}
          <div>
            <span className="hidden sm:block px-6 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              Overview
            </span>
          </div>
          <NavLink
            to={'/admin-dashboard'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.home_icon} alt='' />
            <p className='hidden sm:block truncate'>Dashboard</p>
          </NavLink>

          {/* Doctor Management Links */}
          <div className="pt-3 pb-1 border-t border-slate-100 my-1">
            <span className="hidden sm:block px-6 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              DOCTOR MANAGEMENT
            </span>
          </div>

          <NavLink 
            to={'/all-appointments'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.appointment_icon} alt='' />
            <p className='hidden sm:block truncate'>Appointments</p>
          </NavLink>

          <NavLink 
            to={'/add-doctor'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.add_icon} alt='' />
            <p className='hidden sm:block truncate'>Add Doctor</p>
          </NavLink>

          <NavLink 
            to={'/doctor-list'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.people_icon} alt='' />
            <p className='hidden sm:block truncate'>Doctors List</p>
          </NavLink>

          {/* Library & Book Store Admin Links */}
          <div className="pt-3 pb-1 border-t border-slate-100 my-1">
            <span className="hidden sm:block px-6 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              Library & Store
            </span>
          </div>

          <NavLink 
            to={'/add-book'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.add_icon} alt='' />
            <p className='hidden sm:block truncate'>Add Book</p>
          </NavLink>

          <NavLink 
            to={'/book-list'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.book_list_icon} alt='' />
            <p className='hidden sm:block truncate'>Book List</p>
          </NavLink>

          <NavLink 
            to={'/book-orders'} 
            className={({ isActive }) => `flex items-center gap-3 py-3 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.order_icon} alt='' />
            <p className='hidden sm:block truncate'>Book Orders</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className='text-gray-600 mt-4 space-y-1'>
          <NavLink 
            to={'/doctor-dashboard'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.home_icon} alt='' />
            <p className='hidden sm:block truncate'>Dashboard</p>
          </NavLink>

          <NavLink 
            to={'/doctor-appointments'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.appointment_icon} alt='' />
            <p className='hidden sm:block truncate'>Appointments</p>
          </NavLink>

          <NavLink 
            to={'/doctor-profile'} 
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3.5 sm:px-6 cursor-pointer font-bold text-xs sm:text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.people_icon} alt='' />
            <p className='hidden sm:block truncate'>Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  )
}

export default Sidebar