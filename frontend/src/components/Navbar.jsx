import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { ShopContext } from '../context/ShopContext'
import CoinsWallet from './CoinsWallet'
import { FaBagShopping } from "react-icons/fa6"

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { token, setToken, userData } = useContext(AppContext)
    const { getCartCount } = useContext(ShopContext)
    const [showMenu, setShowMenu] = useState(false)
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const profileDropdownRef = useRef(null)

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
        setShowProfileDropdown(false)
        navigate('/')
    }

    const handleProfileItemClick = (path) => {
        setShowProfileDropdown(false)
        navigate(path)
    }

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-[#EADBCE] gap-3'>
            {/* Logo */}
            <h1 onClick={() => navigate('/')} className="font-therapique text-2xl sm:text-3xl cursor-pointer shrink-0 text-gray-900">
                therapique
            </h1>

            {/* Desktop Nav Links (Visible on Large screens 1024px+, hidden on mobile/landscape) */}
            <ul className='hidden lg:flex items-center gap-6 xl:gap-8 font-semibold text-xs xl:text-sm whitespace-nowrap text-gray-700'>
                <NavLink to='/' className={({ isActive }) => `py-1 transition-colors ${isActive ? 'text-black font-bold' : 'hover:text-black'}`}>
                    <li className='whitespace-nowrap'>HOME</li>
                </NavLink>
                <NavLink to='/doctors' className={({ isActive }) => `py-1 transition-colors ${isActive ? 'text-black font-bold' : 'hover:text-black'}`}>
                    <li className='whitespace-nowrap'>ALL DOCTORS</li>
                </NavLink>
                <NavLink to='/about' className={({ isActive }) => `py-1 transition-colors ${isActive ? 'text-black font-bold' : 'hover:text-black'}`}>
                    <li className='whitespace-nowrap'>ABOUT</li>
                </NavLink>
                <NavLink to='/contact' className={({ isActive }) => `py-1 transition-colors ${isActive ? 'text-black font-bold' : 'hover:text-black'}`}>
                    <li className='whitespace-nowrap'>CONTACT</li>
                </NavLink>
                <NavLink to='/Library' className={({ isActive }) => `py-1 transition-colors ${isActive ? 'text-black font-bold' : 'hover:text-black'}`}>
                    <li className='whitespace-nowrap'>LIBRARY</li>
                </NavLink>
            </ul>

            {/* Right Action Icons & Profile */}
            <div className='flex items-center gap-2 sm:gap-3.5 shrink-0'>
                {/* Desktop Cart Icon (Hidden on mobile & landscape) */}
                <NavLink to={'/cart'} className='hidden lg:flex items-center'>
                    <div className='relative cursor-pointer p-2 rounded-full hover:bg-[#F3E8DE] transition-colors text-gray-800 flexCenter' title="Cart">
                        <FaBagShopping className='text-lg xl:text-xl text-gray-800' />
                        {getCartCount() > 0 && (
                            <div className='absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#FAF5EE]'>
                                {getCartCount()}
                            </div>
                        )}
                    </div>
                </NavLink>

                {token && userData ? (
                    <div className='flex items-center gap-2 cursor-pointer relative' ref={profileDropdownRef}>
                        <CoinsWallet />
                        <div
                            onClick={() => setShowProfileDropdown((prev) => !prev)}
                            className='flex items-center gap-1.5 sm:gap-2 cursor-pointer relative py-1'
                        >
                            <img className='w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover object-top border border-[#EADBCE]' src={userData.image} alt="" />
                            <img className={`w-2.5 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} src={assets.dropdown_icon} alt="" />
                            
                            {showProfileDropdown && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='absolute top-full right-0 mt-2 text-sm font-medium text-gray-700 z-50 shadow-2xl rounded-2xl bg-[#FDF7F3] border border-[#EADBCE] min-w-52 p-2.5 anim-slide-up backdrop-blur-md'
                                    style={{
                                        boxShadow: '0 12px 36px -4px rgba(70,56,48,0.12), 0 4px 16px -2px rgba(70,56,48,0.08)'
                                    }}
                                >
                                    <div className='px-3 py-2 border-b border-[#EADBCE] mb-1.5'>
                                        <p className='text-xs font-bold text-gray-900 truncate'>{userData.name}</p>
                                        <p className='text-[11px] text-gray-500 truncate'>{userData.email}</p>
                                    </div>
                                    <div className='flex flex-col gap-0.5'>
                                        <p onClick={() => handleProfileItemClick('/my-profile')} className='px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer'>
                                            My Profile
                                        </p>
                                        <p onClick={() => handleProfileItemClick('/my-appointments')} className='px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer'>
                                            My Appointments
                                        </p>
                                        <p onClick={() => handleProfileItemClick('/Shop')} className='px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer'>
                                            Shop
                                        </p>
                                        <p onClick={() => handleProfileItemClick('/my-orders')} className='px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer'>
                                            Orders
                                        </p>
                                        <p onClick={() => handleProfileItemClick('/cart')} className='flex lg:hidden px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer items-center justify-between'>
                                            <span>Cart</span>
                                            {getCartCount() > 0 && (
                                                <span className='bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                                                    {getCartCount()}
                                                </span>
                                            )}
                                        </p>
                                        <p onClick={() => handleProfileItemClick('/coins-shop')} className='px-3 py-2 rounded-xl hover:bg-[#F3E8DE] text-gray-800 font-semibold transition cursor-pointer'>
                                            Buy Coins
                                        </p>
                                        <div className='h-px bg-[#EADBCE] my-1' />
                                        <p onClick={logout} className='px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-bold transition cursor-pointer'>
                                            Logout
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <button onClick={() => navigate('/login')} className='bg-black text-white px-5 sm:px-6 py-2.5 rounded-full shadow-md hover:bg-gray-800 transition font-bold text-xs sm:text-sm hidden lg:block cursor-pointer'>
                        Create account
                    </button>
                )}

                {/* Mobile & Landscape Hamburger Button */}
                <img onClick={() => setShowMenu(true)} className='w-6 lg:hidden cursor-pointer p-0.5' src={assets.menu_icon} alt="Menu" />

                {/* ---- Mobile & Landscape Drawer Menu ---- */}
                <div className={`lg:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-50 overflow-y-auto bg-[#FDF7F3] transition-all`}>
                    <div className='flex items-center justify-between px-5 py-5 border-b border-[#EADBCE]'>
                        <h1 className="font-therapique text-2xl text-gray-900">therapique</h1>
                        <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-6 sm:w-7 cursor-pointer' alt="Close" />
                    </div>
                    <ul className='flex flex-col items-center gap-2 sm:gap-3 mt-6 px-5 text-base sm:text-lg font-medium'>
                        <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-5 py-2 rounded-xl hover:bg-[#F3E8DE] inline-block'>HOME</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-5 py-2 rounded-xl hover:bg-[#F3E8DE] inline-block'>ALL DOCTORS</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-5 py-2 rounded-xl hover:bg-[#F3E8DE] inline-block'>ABOUT</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-5 py-2 rounded-xl hover:bg-[#F3E8DE] inline-block'>CONTACT</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/Library' ><p className='px-5 py-2 rounded-xl hover:bg-[#F3E8DE] inline-block'>LIBRARY</p></NavLink>
                        {!token && (
                            <NavLink onClick={() => setShowMenu(false)} to='/login' className='mt-2'>
                                <button className='bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md'>
                                    Create account
                                </button>
                            </NavLink>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Navbar)