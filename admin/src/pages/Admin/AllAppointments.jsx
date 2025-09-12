import React, { useEffect, useContext } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className="flex-1 p-6 min-h-screen bg-gray-50">
      <p className="mb-5 text-2xl font-semibold text-gray-800">All Appointments</p>

      <div className="bg-white border rounded-xl shadow-sm text-sm max-h-[80vh] overflow-y-auto">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 text-gray-600 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Table Rows */}
        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition"
          >
            {/* Index */}
            <p className="max-sm:hidden">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img src={item.userData.image} className="w-8 h-8 rounded-full object-cover" alt="" />
              <p className="font-medium">{item.userData.name}</p>
            </div>

            {/* Age */}
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>

            {/* Date & Time */}
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            {/* Doctor */}
            <div className="flex items-center gap-2">
              <img src={item.docData.image} className="w-8 h-8 rounded-full object-cover bg-gray-200" alt="" />
              <p>{item.docData.name}</p>
            </div>

            {/* Fees */}
            <p className="font-medium">{currency}{item.amount}</p>

            {/* Action */}
            {item.cancelled ? (
              <p className="text-red-500 text-xs font-semibold">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-xs font-semibold">Completed</p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-8 h-8 cursor-pointer"
                src={assets.cancel_icon}
                alt="Cancel"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllAppointments
