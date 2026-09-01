import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaInstagram, FaLinkedinIn, FaXTwitter, FaEnvelope, FaPhone, FaShieldHeart } from 'react-icons/fa6'

const Footer = () => {
    const navigate = useNavigate()

    const handleNav = (path) => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        navigate(path)
    }

    return (
        <footer className="bg-[#241E1A] text-[#C4B6A6] mt-24 border-t border-[#382F29] relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#EADBCE]/40 to-transparent shadow-[0_0_12px_rgba(234,219,206,0.5)]" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#382F29]">
                    {/* Column 1: Brand & Mission (Spans 2 cols on lg) */}
                    <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
                        <h2 
                            onClick={() => handleNav('/')} 
                            className="font-therapique text-3xl sm:text-4xl text-white tracking-wide cursor-pointer inline-block drop-shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                        >
                            therapique
                        </h2>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#B0A294] max-w-md">
                            Therapique is your dedicated sanctuary to heal, grow, and thrive. We connect you with accredited, compassionate therapists and curated psychological resources—making professional care private, accessible, and deeply personal.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-2">
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-[#322A24] hover:bg-purple-600 text-white flexCenter transition-all duration-300 shadow-sm hover:scale-105 hover:shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                                title="Instagram"
                            >
                                <FaInstagram className="text-sm" />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-[#322A24] hover:bg-blue-600 text-white flexCenter transition-all duration-300 shadow-sm hover:scale-105 hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                                title="LinkedIn"
                            >
                                <FaLinkedinIn className="text-sm" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-[#322A24] hover:bg-black text-white flexCenter transition-all duration-300 shadow-sm hover:scale-105"
                                title="Twitter / X"
                            >
                                <FaXTwitter className="text-sm" />
                            </a>
                            <a 
                                href="mailto:hello@therapique.com"
                                className="w-9 h-9 rounded-xl bg-[#322A24] hover:bg-emerald-600 text-white flexCenter transition-all duration-300 shadow-sm hover:scale-105"
                                title="Email Us"
                            >
                                <FaEnvelope className="text-sm" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Discover & Services */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            Discover
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                            <li onClick={() => handleNav('/')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Home
                            </li>
                            <li onClick={() => handleNav('/doctors')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Find Therapists
                            </li>
                            <li onClick={() => handleNav('/Library')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Mental Health Library
                            </li>
                            <li onClick={() => handleNav('/Shop')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Psychology Books
                            </li>
                            <li onClick={() => handleNav('/coins-shop')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Token Wallet & Shop
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Company & Trust */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            Company
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                            <li onClick={() => handleNav('/about')} className="hover:text-white transition-colors cursor-pointer w-max">
                                About Therapique
                            </li>
                            <li onClick={() => handleNav('/contact')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Contact & Support
                            </li>
                            <li onClick={() => handleNav('/my-appointments')} className="hover:text-white transition-colors cursor-pointer w-max">
                                My Consultations
                            </li>
                            <li onClick={() => handleNav('/my-orders')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Order Tracking
                            </li>
                            <li onClick={() => handleNav('/privacy-terms')} className="hover:text-white transition-colors cursor-pointer w-max">
                                Privacy & Terms
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Get in Touch & Crisis Help */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            Get in Touch
                        </h4>
                        <div className="space-y-2.5 text-xs sm:text-sm">
                            <a href="tel:+918920800490" className="flex items-center gap-2 hover:text-white transition-colors">
                                <FaPhone className="text-emerald-400 text-xs shrink-0" />
                                <span>+91 8920800490</span>
                            </a>
                            <a href="mailto:hello@therapique.com" className="flex items-center gap-2 hover:text-white transition-colors">
                                <FaEnvelope className="text-purple-400 text-xs shrink-0" />
                                <span className="truncate">hello@therapique.com</span>
                            </a>
                        </div>

                        {/* Emergency Helpline Banner */}
                        <div className="mt-4 p-3 rounded-xl bg-[#2D2621] border border-[#3E342D] space-y-1">
                            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                                <FaShieldHeart className="text-xs shrink-0" />
                                <span>24/7 Crisis Support</span>
                            </div>
                            <p className="text-[11px] text-[#A69788] leading-tight">
                                If in distress, call national toll-free helpline <strong className="text-white">1800-599-0019</strong> or dial <strong>112</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Glowing Copyright */}
                <div className="pt-6 text-center">
                    <p className="text-xs sm:text-sm font-bold tracking-wider text-[#FAF5EE] drop-shadow-[0_0_12px_rgba(234,219,206,0.65)] hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.85)] transition-all duration-300">
                        © {new Date().getFullYear()} Therapique — All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default React.memo(Footer)