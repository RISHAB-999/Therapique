import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from "lucide-react";

const DoctorItemCard = ({ item, index }) => {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
      className="bg-white rounded-2xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 hover:-translate-y-2" 
      key={index}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Button */}
        <button className="absolute top-4 right-4 bg-secondary rounded-full p-3 opacity-0 group-hover:opacity-100 group-hover:bg-peach transition-all duration-300">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <div className="relative z-10 bg-white p-6 text-center group-hover:bg-peach/40 transition-colors duration-300">
        <div className={`flex items-center justify-center gap-2 text-sm mt-2 ${item.available ? 'text-green-500' : "text-gray-500"}`}>
          <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p>
          <p>{item.available ? 'Available' : "Not Available"}</p>
        </div>
        <h3 className="text-xl font-serif font-medium text-gray-800 group-hover:text-gray-900">
          {item.name}
        </h3>

        <p className="text-md py-2 font-serif font-medium text-gray-700">
          {item.speciality}
        </p>
      </div>
    </div>
  )
}

export default DoctorItemCard
