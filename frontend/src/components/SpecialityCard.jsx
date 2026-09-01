import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from "lucide-react";

const SpecialityCard = ({ item, index }) => {
  return (
    <Link 
      onClick={() => scrollTo(0, 0)} 
      className="bg-white rounded-2xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full shadow-sm hover:shadow-md border border-neutral-100" 
      key={index} 
      to={`/doctors/${item.speciality}`}
    >
      <div className="relative overflow-hidden w-full h-36 sm:h-48 md:h-52 shrink-0 bg-[#FAF5EE]">
        <img
          src={item.image}
          alt={item.speciality}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-[60px] sm:min-h-[76px] text-center bg-white group-hover:bg-[#FFF0E6] transition-colors duration-300">
        <h3 className="text-xs sm:text-sm md:text-base font-serif font-medium text-gray-800 group-hover:text-gray-900 leading-snug">
          {item.speciality}
        </h3>
      </div>
    </Link>
  )
}

export default SpecialityCard
