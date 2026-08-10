import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CircularChartCard = ({ appointmentsCount = 0, latestAppointments = [] }) => {
  const completedCount = latestAppointments.filter(a => a.isCompleted).length
  const cancelledCount = latestAppointments.filter(a => a.cancelled).length
  const total = Math.max(1, appointmentsCount)
  const activePct = appointmentsCount === 0 ? 100 : Math.round((completedCount / total) * 100) || 75

  // SVG Circle stroke dash calculations (radius = 46, circumference = 2 * PI * 46 ~ 289.03)
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (activePct / 100) * circumference

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-gray-800 text-base">Practice Performance</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Consultation Fulfillment Rate</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            Live Stats
          </span>
        </div>

        {/* SVG Circular Donut Chart - Perfectly Centered */}
        <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="purpleChartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-purple-50"
              strokeWidth="10"
              stroke="currentColor"
              fill="none"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#purpleChartGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text Badge inside donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-black text-gray-800 tracking-tight leading-none">
              {activePct}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 mt-1">
              Fulfillment
            </span>
          </div>
        </div>
      </div>

      {/* Chart Breakdown Legend */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="font-semibold text-gray-700">Completed Sessions</span>
          </div>
          <span className="font-extrabold text-gray-900">{completedCount}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-semibold text-gray-700">Active Bookings</span>
          </div>
          <span className="font-extrabold text-gray-900">{Math.max(0, appointmentsCount - (completedCount + cancelledCount))}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold text-gray-700">Cancelled Sessions</span>
          </div>
          <span className="font-extrabold text-gray-900">{cancelledCount}</span>
        </div>
      </div>
    </div>
  )
}

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  if (!dashData) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8'>
        <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-500 font-semibold text-sm'>Loading Doctor Dashboard...</p>
      </div>
    )
  }

  const latestList = dashData.latestAppointments || []

  return (
    <div className="p-6 sm:p-8 space-y-6 w-full max-w-[1600px] mx-auto">
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Doctor Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Overview of your consultations, revenue, and active patient requests</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Practice</span>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Earnings Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flexCenter p-2.5 group-hover:bg-purple-600 transition-colors duration-300 shrink-0">
            <img className="w-full h-full object-contain" src={assets.earning_icon} alt="Earnings" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {currency}{dashData.earnings || 0}
            </p>
            <p className="text-gray-400 font-semibold text-xs mt-0.5">Total Revenue</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flexCenter p-2.5 group-hover:bg-indigo-600 transition-colors duration-300 shrink-0">
            <img className="w-full h-full object-contain" src={assets.appointments_icon} alt="Appointments" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {dashData.appointments || 0}
            </p>
            <p className="text-gray-400 font-semibold text-xs mt-0.5">Total Bookings</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flexCenter p-2.5 group-hover:bg-emerald-600 transition-colors duration-300 shrink-0">
            <img className="w-full h-full object-contain" src={assets.patients_icon} alt="Patients" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {dashData.patients || 0}
            </p>
            <p className="text-gray-400 font-semibold text-xs mt-0.5">Unique Patients</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Bookings Table + Right Circular Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (2 Cols): Latest Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img className="w-5 h-5 object-contain" src={assets.list_icon} alt="List" />
                <h3 className="font-extrabold text-gray-800 text-sm sm:text-base">Latest Consultation Bookings</h3>
              </div>
              <span className="text-xs font-extrabold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {latestList.length} Recent
              </span>
            </div>

            {latestList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {latestList.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-3 hover:bg-purple-50/20 transition-all duration-200"
                  >
                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <img 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs" 
                        src={item.userData?.image || assets.upload_area} 
                        alt={item.userData?.name || 'Patient'} 
                      />
                      <div>
                        <h5 className="text-gray-800 font-bold text-sm">
                          {item.userData?.name || 'Patient'}
                        </h5>
                        <p className="text-gray-500 text-xs mt-0.5 font-medium flex items-center gap-1.5">
                          <span>Booking on</span>
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {slotDateFormat(item.slotDate)} | {item.slotTime}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status / Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-xs font-bold text-gray-600 font-mono sm:mr-2">
                        {currency}{item.amount}
                      </span>

                      {item.cancelled ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                          Completed
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <img
                            onClick={() => cancelAppointment(item._id)}
                            className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
                            src={assets.cancel_icon}
                            alt="Cancel"
                          />
                          <img
                            onClick={() => completeAppointment(item._id)}
                            className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
                            src={assets.tick_icon}
                            alt="Complete"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flexCenter p-3.5 shadow-inner">
                  <img className="w-full h-full object-contain" src={assets.appointments_icon} alt="Appointments" />
                </div>
                <h4 className="text-gray-800 font-bold text-base">No Recent Bookings Yet</h4>
                <p className="text-gray-400 text-xs max-w-sm">
                  Your upcoming patient appointments and consultation requests will automatically appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Clean Donut Chart Card */}
        <div className="lg:col-span-1">
          <CircularChartCard 
            appointmentsCount={dashData.appointments || 0} 
            latestAppointments={latestList} 
          />
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
