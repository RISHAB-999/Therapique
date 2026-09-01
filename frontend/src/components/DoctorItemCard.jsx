import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight } from "lucide-react";
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const DoctorItemCard = ({ item, index, isStacked = false }) => {
  const navigate = useNavigate()
  const { token } = useContext(AppContext)

  const handleCardClick = () => {
    if (!token) {
      toast.info('Please log in or create an account to book an appointment with a doctor')
      navigate('/login', { state: { message: 'Please log in or create an account to book an appointment with a doctor', context: 'doctor' } })
    } else {
      navigate(`/appointment/${item._id}`)
      scrollTo(0, 0)
    }
  }

  return (
    <div 
      onClick={handleCardClick} 
      className={`bg-white rounded-3xl overflow-hidden font-sans group cursor-pointer transition-all duration-300 flex flex-col h-full border border-[#EADBCE] ${
        isStacked 
          ? 'shadow-xl shadow-stone-900/15 active:scale-[0.98]' 
          : 'hover:-translate-y-2 shadow-sm hover:shadow-xl hover:bg-[#FAF5EE] hover:border-[#D4C3B3]'
      }`}
      key={index}
    >
      {/* Doctor Image Container (Larger portrait on mobile) */}
      <div className="relative overflow-hidden w-full h-[320px] sm:h-72 shrink-0 bg-[#FAF5EE] flex items-center justify-center">
        <img
          src={item.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop";
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Availability Badge on Top Right */}
        <div className="absolute top-3.5 right-3.5 z-30 bg-white border border-[#EADBCE] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md select-none pointer-events-none group-hover:bg-[#FAF5EE] transition-colors">
          <span className={`w-2 h-2 rounded-full shrink-0 ${item.available ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-gray-400'}`} />
          <span className="text-gray-900 text-xs font-bold tracking-tight">{item.available ? 'Available' : 'Not Available'}</span>
        </div>
      </div>

      {/* Doctor Info Section */}
      <div className="p-5 sm:p-6 bg-white group-hover:bg-[#FAF5EE] transition-colors duration-300 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-tight group-hover:text-[#7C3AED] transition-colors">
            {item.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
            {item.speciality}
          </p>
        </div>

        {/* View Profile Action Row */}
        <div className="mt-4 pt-3.5 border-t border-[#F3E8DE] group-hover:border-[#EADBCE] transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#7C3AED] group-hover:underline">
              View Profile
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#7C3AED] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

export default DoctorItemCard
