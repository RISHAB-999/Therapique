import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const handleJoinSession = (appointment) => {
    // Use the roomId saved when appointment was created
    if (!appointment.roomId) {
      alert("No session room has been created for this appointment yet.");
      return;
    }

    // Pass doctor email to session page for identification
    const doctorEmail = appointment.docData?.email || "doctor@therapique.com";

    navigate(`/session/${appointment.roomId}`, {
      state: { doctorEmail, role: "doctor" }
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <p className="mb-4 text-lg font-semibold">All Appointments</p>

      <div className="bg-white border rounded-lg text-sm max-h-[80vh] overflow-y-auto shadow-sm">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-2 py-3 px-6 border-b bg-gray-50">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Table Rows */}
        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-3 items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition"
          >
            {/* Index */}
            <p className="hidden sm:block">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img
                src={item.userData.image}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
              <p className="truncate">{item.userData.name}</p>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs border border-primary px-2 py-0.5 rounded-full inline-block">
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>

            {/* Age */}
            <p className="hidden sm:block">{calculateAge(item.userData.dob)}</p>

            {/* Date & Time */}
            <p className="text-sm">
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>

            {/* Fees */}
            <p>{currency}{item.amount}</p>

            {/* Action */}
            <div className="flex items-center gap-2">
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex gap-2">
                  {/* Join Session Button */}
                  {item.payment && (
                    <button
                      onClick={() => handleJoinSession(item)}
                      className="px-3 py-1 text-xs sm:text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
                    >
                      Join Session
                    </button>
                  )}

                  {/* Cancel Icon */}
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-8 sm:w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="cancel"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorAppointments
