import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from "lucide-react";

const SpecialityCard = ({ item, index }) => {
  return (
    <Link 
      onClick={() => scrollTo(0, 0)} 
      className="bg-white rounded-2xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 hover:-translate-y-2 block" 
      key={index} 
      to={`/doctors/${item.speciality}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.speciality}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />

      </div>
      <div className="relative z-10 bg-white p-6 text-center group-hover:bg-peach/40 transition-colors duration-300">
        <h3 className="text-lg font-serif font-medium text-gray-800 group-hover:text-gray-900">
          {item.speciality}
        </h3>
      </div>
    </Link>
  )
}

export default SpecialityCard
