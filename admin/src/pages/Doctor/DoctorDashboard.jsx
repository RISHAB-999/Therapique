<<<<<<< HEAD
import React from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
=======
import React, { useContext, useEffect } from 'react'
>>>>>>> master
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
<<<<<<< HEAD

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)


  useEffect(() => {

    if (dToken) {
      getDashData()
    }

  }, [dToken])

  return dashData && (
    <div className='m-5'>

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p></div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
              }
=======
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return dashData && (
    <div className="m-5 space-y-6">

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-12 sm:w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-semibold text-gray-600">
              {currency} {dashData.earnings}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-12 sm:w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-semibold text-gray-600">
              {dashData.appointments}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-12 sm:w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-semibold text-gray-600">
              {dashData.patients}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white rounded-lg overflow-hidden border">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b bg-gray-50">
          <img className="w-5 sm:w-6" src={assets.list_icon} alt="" />
          <p className="font-semibold text-sm sm:text-base">Latest Bookings</p>
        </div>

        <div className="divide-y">
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 py-3 gap-3 hover:bg-gray-50 transition"
            >
              {/* Patient Info */}
              <div className="flex items-center gap-3 flex-1">
                <img className="rounded-full w-10 h-10 object-cover" src={item.userData.image} alt="" />
                <div className="text-sm">
                  <p className="text-gray-800 font-medium">{item.userData.name}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Booking on {slotDateFormat(item.slotDate)}
                  </p>
                </div>
              </div>

              {/* Status / Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-xs font-medium">Completed</p>
                ) : (
                  <div className="flex gap-2">
                    <img 
                      onClick={() => cancelAppointment(item._id)} 
                      className="w-8 sm:w-10 cursor-pointer" 
                      src={assets.cancel_icon} 
                      alt="Cancel" 
                    />
                    <img 
                      onClick={() => completeAppointment(item._id)} 
                      className="w-8 sm:w-10 cursor-pointer" 
                      src={assets.tick_icon} 
                      alt="Complete" 
                    />
                  </div>
                )}
              </div>
>>>>>>> master
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

<<<<<<< HEAD
export default DoctorDashboard
=======
export default DoctorDashboard
>>>>>>> master
