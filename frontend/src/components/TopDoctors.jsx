import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorItemCard from './DoctorItemCard'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const TopDoctors = () => {

  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const displayedDoctors = doctors ? doctors.slice(0, 10) : [];

  useEffect(() => {
    if (displayedDoctors.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayedDoctors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [displayedDoctors.length]);

  return (
    <section className="py-12 text-center min-h-[70vh] mt-12 px-4 sm:px-6">
      {/* Title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text font-display">
        Choose Help. Not Suffering.
      </h2>
      <div className="w-16 h-1 bg-peach mx-auto my-4 rounded"></div>

      <div className="flex flex-col md:flex-row items-center justify-center mt-8 gap-12 md:gap-20">
        {/* Image Slider */}
        <div className="relative w-full max-w-[500px] h-[350px] flex items-center justify-center overflow-hidden">
          {displayedDoctors.map((c, i) => {
            const total = displayedDoctors.length;
            const position = (i - index + total) % total;

            // Default values (hidden)
            let x = 0;
            let scale = 0.8;
            let opacity = 0;
            let zIndex = 0;

            const offset = isMobile ? 100 : 180;
            const hiddenOffset = isMobile ? -250 : -400;

            if (position === 0) {
              // Center
              x = 0;
              scale = 1.1;
              opacity = 1;
              zIndex = 10;
            } else if (position === 1 && total > 1) {
              // Right
              x = offset;
              scale = 0.9;
              opacity = 0.8;
              zIndex = 5;
            } else if (position === total - 1 && total > 2) {
              // Left
              x = -offset;
              scale = 0.9;
              opacity = 0.8;
              zIndex = 5;
            } else {
              // Hidden
              x = hiddenOffset;
              opacity = 0;
            }

            return (
              <motion.div
                key={c._id || i}
                className="absolute flex flex-col items-center"
                animate={{ x, scale, opacity, zIndex }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className={`object-cover rounded-2xl shadow-md transition-all ${position === 0 ? "w-44 h-56" : "w-32 h-44"
                    }`}
                />
                {position === 0 && (
                  <div className="mt-6 text-center">
                    <h3 className="font-semibold text-lg text-text">
                      {c.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{c.degree}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        {/* Right Content */}
        <div className="max-w-xl text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold text-text mb-5">
            Counselling Therapy Sessions With Licensed & Verified Experts
          </h3>
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            Highly qualified team of some of the best names in psychology who
            deliver improved well-being to you. Carefully vetted through a
            rigorous selection process. Trained and experienced in all
            psychotherapy techniques.
          </p>

          {/* Features */}
          <div className="flex items-center justify-center md:justify-start gap-6 sm:gap-10 mb-6 text-orange-500">
            <div className="text-center text-3xl sm:text-4xl">
              🎥
              <p className="text-sm sm:text-lg font-medium text-gray-700">Video Session</p>
            </div>
            <div className="text-center text-3xl sm:text-4xl">
              🎤
              <p className="text-sm sm:text-lg font-medium text-gray-700">Audio Session</p>
            </div>
            <div className="text-center text-3xl sm:text-4xl">
              💬
              <p className="text-sm sm:text-lg font-medium text-gray-700">Chat Session</p>
            </div>
          </div>

          {/* More Info */}
          <ul className="space-y-2 text-text font-semibold text-base sm:text-lg">
            <li>English And All Regional Indian Languages</li>
            <li>100% Private & Secure Platform</li>
            <li>24/7 Support</li>
          </ul>

          {/* Button */}
          <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className="mt-6 bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition">
            View All Counselors
          </button>
        </div>
      </div>

    </section>

  )
}

export default TopDoctors
