import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { X, LogOut } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const handleClose = () => {
    if (setIsSidebarOpen) setIsSidebarOpen(false)
  }

  const logout = () => {
    handleClose()
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  const renderNavLinks = (isMobile = false) => (
    <>
      {aToken && (
        <ul className={`text-gray-600 space-y-1 ${isMobile ? 'px-3' : 'mt-4'}`}>
          {/* Overview Links */}
          <div className="py-1">
            <span className="px-4 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              Overview
            </span>
          </div>
          <NavLink
            to={'/admin-dashboard'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.home_icon} alt='' />
            <p className='truncate'>Dashboard</p>
          </NavLink>

          {/* Doctor Management Links */}
          <div className="pt-3 pb-1 border-t border-slate-100 my-1">
            <span className="px-4 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              DOCTOR MANAGEMENT
            </span>
          </div>

          <NavLink 
            to={'/all-appointments'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.appointment_icon} alt='' />
            <p className='truncate'>Appointments</p>
          </NavLink>

          <NavLink 
            to={'/add-doctor'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.add_icon} alt='' />
            <p className='truncate'>Add Doctor</p>
          </NavLink>

          <NavLink 
            to={'/doctor-list'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.people_icon} alt='' />
            <p className='truncate'>Doctors List</p>
          </NavLink>

          {/* Library & Book Store Admin Links */}
          <div className="pt-3 pb-1 border-t border-slate-100 my-1">
            <span className="px-4 text-[10px] font-black uppercase text-purple-700 tracking-wider">
              Library & Store
            </span>
          </div>

          <NavLink 
            to={'/add-book'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.add_icon} alt='' />
            <p className='truncate'>Add Book</p>
          </NavLink>

          <NavLink 
            to={'/book-list'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.book_list_icon} alt='' />
            <p className='truncate'>Book List</p>
          </NavLink>

          <NavLink 
            to={'/book-orders'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0 object-contain' src={assets.order_icon} alt='' />
            <p className='truncate'>Book Orders</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className={`text-gray-600 space-y-1 ${isMobile ? 'px-3' : 'mt-4'}`}>
          <NavLink 
            to={'/doctor-dashboard'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.home_icon} alt='' />
            <p className='truncate'>Dashboard</p>
          </NavLink>

          <NavLink 
            to={'/doctor-appointments'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.appointment_icon} alt='' />
            <p className='truncate'>Appointments</p>
          </NavLink>

          <NavLink 
            to={'/doctor-profile'} 
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 py-3.5 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
              isActive ? 'bg-purple-50 text-purple-700 font-extrabold border-l-4 border-purple-600 md:border-l-0 md:border-r-4' : 'hover:bg-slate-50'
            }`}
          >
            <img className='w-5 h-5 shrink-0' src={assets.people_icon} alt='' />
            <p className='truncate'>Profile</p>
          </NavLink>
        </ul>
      )}
    </>
  )

  return (
    <>
      {/* 1. Permanent Desktop Sidebar (Hidden on mobile, w-64 on desktop) */}
      <aside className='hidden md:block w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto z-30'>
        {renderNavLinks(false)}
      </aside>

      {/* 2. Mobile Backdrop (When Drawer is Open) */}
      {isSidebarOpen && (
        <div 
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-Over Drawer Navigation */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl transition-all duration-300 ease-in-out md:hidden overflow-y-auto flex flex-col justify-between ${
          isSidebarOpen 
            ? 'translate-x-0 opacity-100 visible pointer-events-auto' 
            : '-translate-x-full opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="pt-2">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="font-therapique text-2xl font-black text-gray-800 tracking-tight">therapique</h2>
              <span className="border px-2 py-0.5 rounded-full border-purple-200 bg-purple-50 text-purple-700 font-extrabold text-[10px]">
                {aToken ? 'Admin' : 'Doctor'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-500 transition cursor-pointer"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Drawer Navigation Links */}
          <div className="mt-3">
            {renderNavLinks(true)}
          </div>
        </div>

        {/* Drawer Footer with Quick Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar