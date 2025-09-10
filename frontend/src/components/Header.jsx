import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[83vh]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6 items-center">

                {/* -------- Left Side -------- */}
                <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
                        Empowering change <br className="hidden sm:block" />
                        through personalized <br className="hidden sm:block" />
                        therapy and{" "}
                        <span className="inline-flex gap-1">
                            <span className="text-pink-400">✿</span>
                            <span className="text-orange-400">✿</span>
                            <span className="text-blue-400">✿</span>
                        </span>{" "}
                        counseling
                    </h1>

                    <p className="text-gray-600 text-base sm:text-lg">
                        Find the resources you need to face your current challenges with our
                        expert team of licensed therapists and counselors in Ontario and
                        throughout Canada.
                    </p>

                    <button className="bg-black text-white px-6 py-3 rounded-full shadow-md hover:bg-gray-800 transition">
                        <Link to="/doctors">Book a FREE consultation →</Link>
                    </button>

                    {/* Therapy Types */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base sm:text-lg mt-6">
                        <a href="#" className="text-gray-800 hover:text-black">
                            Individual Therapy →
                        </a>
                        <a href="#" className="text-gray-800 hover:text-black">
                            Family Therapy →
                        </a>
                        <a href="#" className="text-gray-800 hover:text-black">
                            Couple Therapy →
                        </a>
                        <a href="#" className="text-gray-800 hover:text-black">
                            Adolescent Therapy →
                        </a>
                    </div>
                </div>

                {/* -------- Right Side -------- */}
                <div className="flex justify-center items-center">
                    <img
                        className="w-64 sm:w-72 md:w-[650px] h-auto object-cover rounded-xl shadow-lg"
                        src={assets.home}
                        alt="Therapist"
                    />
                </div>
            </div>
        </div>
    )
}

export default Header
