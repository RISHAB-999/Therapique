import React, { useContext, useEffect, useMemo } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import DonutChart from '../../components/DonutChart'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)

  // Derive consultation stats with robust fallback
  const appointmentStats = useMemo(() => {
    if (dashData?.appointmentStats) {
      return dashData.appointmentStats
    }
    const apps = dashData?.latestAppointments || []
    return {
      total: dashData?.appointments || apps.length,
      completed: apps.filter(a => a.isCompleted && !a.cancelled).length,
      cancelled: apps.filter(a => a.cancelled).length,
      upcoming: apps.filter(a => !a.cancelled && !a.isCompleted).length,
    }
  }, [dashData])

  useEffect(() => {
    if (dToken) {
      getDashData()
      const interval = setInterval(() => {
        getDashData()
      }, 3000)

      const handleFocus = () => getDashData()
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getDashData()
        }
      }

      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
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

        {/* Right Column (1 Col): Clean Animated Donut Chart Card */}
        <div className="lg:col-span-1">
          <DonutChart
            title="Practice Performance"
            subtitle="Status distribution of patient consultations"
            total={appointmentStats.total}
            totalLabel="Consultations"
            idPrefix="doctor-practice-donut"
            layout="vertical"
            className="h-full"
            data={[
              {
                label: 'Completed Sessions',
                shortLabel: 'Completed',
                value: appointmentStats.completed,
                color: '#10B981',
                gradient: ['#34D399', '#059669'],
              },
              {
                label: 'Active Bookings',
                shortLabel: 'Active',
                value: appointmentStats.upcoming,
                color: '#8B5CF6',
                gradient: ['#A78BFA', '#6D28D9'],
              },
              {
                label: 'Cancelled Sessions',
                shortLabel: 'Cancelled',
                value: appointmentStats.cancelled,
                color: '#EF4444',
                gradient: ['#F87171', '#DC2626'],
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
