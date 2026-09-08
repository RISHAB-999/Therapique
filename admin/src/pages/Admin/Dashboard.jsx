import React, { useContext, useEffect, useMemo } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import DonutChart from '../../components/DonutChart'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (aToken) {
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
  }, [aToken])

  const defaultBookImg = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
  const defaultDocImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"

  const getItemImage = (item) => {
    if (!item) return defaultBookImg
    if (Array.isArray(item.image) && item.image.length > 0) {
      const first = item.image[0]
      if (typeof first === 'string' && first.trim()) return first
      if (first && typeof first.url === 'string' && first.url.trim()) return first.url
    }
    if (typeof item.image === 'string' && item.image.trim()) return item.image
    return defaultBookImg
  }

  // Derive appointment stats from dashData with robust fallback
  const appointmentStats = useMemo(() => {
    if (dashData?.appointmentStats) {
      return dashData.appointmentStats
    }
    const apps = dashData?.latestAppointments || []
    return {
      total: dashData?.appointments || apps.length,
      completed: apps.filter(a => !a.cancelled && a.isCompleted).length,
      cancelled: apps.filter(a => a.cancelled).length,
      upcoming: apps.filter(a => !a.cancelled && !a.isCompleted).length,
    }
  }, [dashData])

  // Derive book order stats from dashData with robust fallback
  const bookOrderStats = useMemo(() => {
    if (dashData?.bookOrderStats) {
      return dashData.bookOrderStats
    }
    const orders = dashData?.latestBookOrders || []
    return {
      total: dashData?.bookOrdersCount || orders.length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      processing: orders.filter(o => ['Order Placed', 'Packing & Preparing', 'Shipped', 'Out for Delivery', 'Processing', 'Pending'].includes(o.status) || (!['Delivered', 'Cancelled', 'Refunded'].includes(o.status))).length,
      cancelled: orders.filter(o => ['Cancelled', 'Refunded'].includes(o.status)).length,
    }
  }, [dashData])

  return (
    dashData && (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-800 tracking-tight'>Admin Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Overview of active doctors, appointment bookings, library catalog, and store orders</p>
        </div>

        {/* Top Metric Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          
          {/* Card 1: Active Doctors */}
          <div 
            onClick={() => navigate('/doctors-list')}
            className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer h-28"
          >
            <img className="w-14 h-14 shrink-0" src={assets.doctor_icon} alt="Doctors" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{dashData.doctors || 0}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Doctors</p>
            </div>
          </div>

          {/* Card 2: Appointments */}
          <div 
            onClick={() => navigate('/all-appointments')}
            className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer h-28"
          >
            <img className="w-14 h-14 shrink-0" src={assets.appointments_icon} alt="Appointments" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{dashData.appointments || 0}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointments</p>
            </div>
          </div>

          {/* Card 3: Registered Patients */}
          <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition h-28">
            <img className="w-14 h-14 shrink-0" src={assets.patients_icon} alt="Patients" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{dashData.patients || 0}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Patients</p>
            </div>
          </div>

          {/* Card 4: Library Books & Orders */}
          <div 
            onClick={() => navigate('/book-list')}
            className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer h-28"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50/80 flex items-center justify-center border border-amber-200/60 shrink-0">
              <img className="w-8 h-8 object-contain" src={assets.library_icon} alt="Library" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-2xl font-bold text-gray-800">{dashData.books || 45}</p>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                  {dashData.bookOrdersCount || 0} Orders
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5 truncate">Library Books</p>
            </div>
          </div>

        </div>

        {/* Visual Analytics Charts Section (Appointment & Book Orders Donut Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Chart 1: Appointment Overview */}
          <DonutChart
            title="Appointment Overview"
            subtitle="Status distribution of patient consultations"
            total={appointmentStats.total}
            totalLabel="Appointments"
            idPrefix="app-donut"
            data={[
              {
                label: 'Completed',
                shortLabel: 'Completed',
                value: appointmentStats.completed,
                color: '#10B981',
                gradient: ['#34D399', '#059669'],
              },
              {
                label: 'Cancelled',
                shortLabel: 'Cancelled',
                value: appointmentStats.cancelled,
                color: '#F43F5E',
                gradient: ['#FB7185', '#E11D48'],
              },
              {
                label: 'Upcoming / Pending',
                shortLabel: 'Upcoming',
                value: appointmentStats.upcoming,
                color: '#8B5CF6',
                gradient: ['#A78BFA', '#6D28D9'],
              },
            ]}
          />

          {/* Chart 2: Book Orders Overview */}
          <DonutChart
            title="Book Orders Overview"
            subtitle="Fulfillment and delivery status of library book orders"
            total={bookOrderStats.total}
            totalLabel="Orders"
            idPrefix="order-donut"
            data={[
              {
                label: 'Delivered',
                shortLabel: 'Delivered',
                value: bookOrderStats.delivered,
                color: '#10B981',
                gradient: ['#34D399', '#047857'],
              },
              {
                label: 'Processing',
                shortLabel: 'Processing',
                value: bookOrderStats.processing,
                color: '#F59E0B',
                gradient: ['#FBBF24', '#D97706'],
              },
              {
                label: 'Cancelled / Refunded',
                shortLabel: 'Cancelled',
                value: bookOrderStats.cancelled,
                color: '#EF4444',
                gradient: ['#F87171', '#B91C1C'],
              },
            ]}
          />
        </div>

        {/* Overview Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Panel 1: Latest Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <img className="w-5 h-5" src={assets.list_icon} alt="" />
                  <p className="font-bold text-sm text-gray-800 uppercase tracking-wider">Latest Appointments</p>
                </div>
                <button 
                  onClick={() => navigate('/all-appointments')}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  View All Appointments
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
                  dashData.latestAppointments.slice(0, 5).map((item, index) => (
                    <div
                      className="flex items-center px-6 py-3.5 gap-4 hover:bg-gray-50/80 transition text-xs"
                      key={index}
                    >
                      <img
                        className="rounded-full w-10 h-10 object-cover border border-gray-200 shrink-0"
                        src={item.docData?.image || defaultDocImg}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = defaultDocImg;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold truncate">{item.docData?.name}</p>
                        <p className="text-gray-500 font-medium">Booking on {slotDateFormat(item.slotDate)}</p>
                      </div>
                      {item.cancelled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Completed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cancelAppointment(item._id)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                          title="Cancel Consultation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400 font-semibold">
                    No doctor appointments scheduled
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel 2: Latest Book Store Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <img className="w-5 h-5 object-contain" src={assets.order_icon} alt="Orders" />
                  <p className="font-bold text-sm text-gray-800 uppercase tracking-wider">Latest Book Store Orders</p>
                </div>
                <button 
                  onClick={() => navigate('/book-orders')}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  View All Orders
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {dashData.latestBookOrders && dashData.latestBookOrders.length > 0 ? (
                  dashData.latestBookOrders.slice(0, 5).map((order, index) => {
                    const firstItem = order.items?.[0]
                    const coverImg = getItemImage(firstItem)
                    return (
                      <div
                        key={order._id || index}
                        className="flex items-center px-6 py-3.5 gap-4 hover:bg-gray-50/80 transition text-xs"
                      >
                        {/* Book Cover Photo */}
                        <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-2xs bg-gray-100">
                          <img 
                            src={coverImg} 
                            alt="" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = defaultBookImg;
                            }}
                            className="w-full h-full object-cover object-center" 
                          />
                        </div>

                        {/* Title & Buyer */}
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-gray-900 font-bold leading-snug truncate">
                            {firstItem?.title || firstItem?.name || 'Therapy Book'}
                            {order.items?.length > 1 && (
                              <span className="text-purple-600 text-[10px] ml-1.5 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                +{order.items.length - 1} more
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 font-medium mt-0.5">
                            By <span className="text-gray-700 font-semibold">{order.address?.firstName ? `${order.address.firstName} ${order.address.lastName}` : order.address?.name || 'Customer'}</span>
                          </p>
                        </div>

                        {/* Amount & Status */}
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-gray-900 text-sm">{currency}{order.amount}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {order.status || 'Order Placed'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400 font-semibold space-y-1">
                    <p>No book orders placed yet</p>
                    <button 
                      onClick={() => navigate('/add-book')}
                      className="text-purple-600 text-[11px] font-bold hover:underline"
                    >
                      + Add New Books to Library Catalog
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    )
  )
}

export default Dashboard
