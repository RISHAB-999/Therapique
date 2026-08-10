import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='space-y-6 w-full max-w-7xl mx-auto'>
      <div className="border-b border-slate-200/80 pb-3">
        <h1 className='text-xl sm:text-2xl font-black text-gray-800 tracking-tight'>All Doctors</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">Manage doctor availability status and practice profiles across the platform</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full'>
        {doctors && doctors.map((item, index) => (
          <div 
            className='border border-slate-200/80 rounded-2xl overflow-hidden cursor-pointer group flex flex-col bg-white shadow-sm hover:shadow-md transition-all duration-300' 
            key={index}
          >
            <div className='w-full h-64 bg-purple-50/50 overflow-hidden group-hover:bg-purple-100/60 transition-colors duration-300 shrink-0 relative'>
              <img 
                className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500' 
                src={item.image} 
                alt={item.name} 
              />
            </div>

            <div className='p-4 flex-1 flex flex-col justify-between space-y-3'>
              <div>
                <p className='text-gray-900 text-sm font-extrabold line-clamp-1 group-hover:text-purple-700 transition-colors'>
                  {item.name}
                </p>
                <p className='text-gray-500 text-xs font-semibold line-clamp-1 mt-0.5'>
                  {item.speciality}
                </p>
              </div>

              <div className='flex items-center gap-2 text-xs pt-2.5 border-t border-slate-100'>
                <input 
                  onChange={() => changeAvailability(item._id)} 
                  type="checkbox" 
                  checked={item.available} 
                  className='cursor-pointer w-4 h-4 accent-purple-600 rounded shrink-0'
                />
                <p className={`font-bold text-xs ${item.available ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsList