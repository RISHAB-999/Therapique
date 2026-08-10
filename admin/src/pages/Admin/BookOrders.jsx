import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

const BookOrders = () => {
  const { aToken } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/book/orders', {
        headers: { aToken }
      })
      if (data.success) {
        setOrders(data.orders.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  const handleStatusChange = async (event, orderId) => {
    const status = event.target.value
    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/update-status',
        { orderId, status },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleClearOrders = async () => {
    if (!window.confirm("Are you sure you want to clear all order history?")) return
    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/clear-orders',
        {},
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getItemImage = (item) => {
    if (!item) return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
    if (Array.isArray(item.image) && item.image.length > 0 && typeof item.image[0] === 'string') return item.image[0]
    if (typeof item.image === 'string') return item.image
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"
  }

  useEffect(() => {
    if (aToken) {
      fetchOrders(true)
      const interval = setInterval(() => fetchOrders(false), 10000)
      return () => clearInterval(interval)
    }
  }, [aToken])

  return (
    <div className='space-y-6 w-full max-w-[1600px] mx-auto'>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className='text-2xl sm:text-3xl font-black text-gray-900 tracking-tight'>Book & Library Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Manage customer orders, shipping details, book format quantities, and dispatch statuses</p>
        </div>
        <div className='flex items-center gap-3 self-start sm:self-auto'>
          {orders.length > 0 && (
            <button
              onClick={handleClearOrders}
              className='text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full transition-colors cursor-pointer flex items-center gap-1.5'
            >
              <img className='w-4 h-4 object-contain' src={assets.delete_icon} alt="" />
              <span>Clear All Orders</span>
            </button>
          )}
          <span className="text-xs sm:text-sm font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-full shadow-2xs">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className='min-h-[40vh] flex flex-col items-center justify-center gap-3 p-8'>
          <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
          <p className='text-xs sm:text-sm text-gray-500 font-semibold'>Loading library orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-xs'>
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flexCenter mx-auto text-3xl">
            📦
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Orders Received Yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">Customer book orders placed via the frontend store will appear here for processing.</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map((order, index) => (
            <div
              key={order._id || index}
              className='bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200'
            >
              {/* Order Card Container - Top Aligned 3-Box Subcard Layout */}
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
                
                {/* Box 1: Purchased Books Sub-Card (5 cols) */}
                <div className='lg:col-span-5 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/70 shadow-2xs space-y-4'>
                  <div className='flex items-center justify-between border-b border-slate-200/70 pb-3'>
                    <div className='flex items-center gap-2'>
                      <img className='w-5 h-5 object-contain' src={assets.books_icon} alt="" />
                      <h4 className='text-xs sm:text-sm font-black uppercase tracking-wider text-purple-700'>
                        Purchased Books ({order.items?.length || 0})
                      </h4>
                    </div>
                    <span className='text-xs text-gray-600 font-extrabold bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs'>
                      {new Date(order.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className='space-y-3 max-h-[360px] overflow-y-auto pr-1'>
                    {order.items && order.items.map((item, idx) => {
                      const imgUrl = getItemImage(item)
                      return (
                        <div key={idx} className='text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-200 transition-colors'>
                          
                          {/* Book Cover Photo Thumbnail */}
                          <div className='w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-100'>
                            <img 
                              src={imgUrl} 
                              alt={item.title || item.name || 'Book'} 
                              className='w-full h-full object-cover object-center' 
                            />
                          </div>

                          <div className='flex-1 min-w-0 pr-1 space-y-1'>
                            <p className='font-black text-gray-900 text-sm sm:text-base leading-snug break-words'>
                              {item.title || item.name || 'Therapy Book'}
                            </p>
                            <p className='text-xs text-gray-500 font-medium'>
                              Format: <span className='text-purple-700 font-extrabold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100'>{item.size || item.format || 'Paperback'}</span>
                            </p>
                          </div>

                          <span className='font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl text-xs sm:text-sm shrink-0 border border-purple-200'>
                            x{item.quantity || 1}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Box 2: Customer Shipping Address Sub-Card (4 cols) */}
                <div className='lg:col-span-4 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/70 shadow-2xs space-y-4'>
                  <div className='flex items-center gap-2 border-b border-slate-200/70 pb-3'>
                    <img className='w-5 h-5 object-contain' src={assets.location_icon} alt="" />
                    <h4 className='text-xs sm:text-sm font-black uppercase tracking-wider text-purple-700'>
                      Shipping Address
                    </h4>
                  </div>

                  <div className='space-y-2 text-xs sm:text-sm text-gray-600 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs'>
                    <p className='font-black text-gray-900 text-base'>
                      {order.address?.firstName ? `${order.address.firstName} ${order.address.lastName}` : order.address?.name || 'Customer'}
                    </p>
                    <p className='text-gray-700 font-semibold leading-relaxed'>
                      {order.address?.line1 || order.address?.street || ''} {order.address?.line2 || ''}
                    </p>
                    <p className='text-gray-500 font-semibold'>
                      {order.address?.city || ''}, {order.address?.state || ''} {order.address?.zipcode || order.address?.pincode ? `- ${order.address?.zipcode || order.address?.pincode}` : ''}
                    </p>
                    <div className='pt-2.5 mt-2 border-t border-slate-100 space-y-1.5'>
                      <div className='text-purple-700 font-black text-xs sm:text-sm flex items-center gap-2 break-all'>
                        <span>✉️</span>
                        <span>{order.address?.email || (typeof order.userId === 'object' ? order.userId?.email : '') || 'rishabn090@gmail.com'}</span>
                      </div>
                      <div className='text-purple-700 font-black text-xs sm:text-sm flex items-center gap-2'>
                        <span>📞</span>
                        <span>{order.address?.phone || order.phone || (typeof order.userId === 'object' ? order.userId?.phone : '') || '8130758753'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 3: Payment Summary & Status Sub-Card (3 cols) */}
                <div className='lg:col-span-3 bg-purple-50/50 rounded-2xl p-6 border border-purple-200/70 shadow-2xs space-y-5'>
                  <div className='flex items-center gap-2 border-b border-purple-200/60 pb-3'>
                    <img className='w-5 h-5 object-contain' src={assets.purchase_order_icon} alt="" />
                    <h4 className='text-xs sm:text-sm font-black uppercase tracking-wider text-purple-700'>
                      Order Summary
                    </h4>
                  </div>

                  <div className='space-y-3 bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs'>
                    <div className='flex items-baseline justify-between border-b border-slate-100 pb-2.5'>
                      <span className='text-xs font-black text-gray-400 uppercase tracking-wider'>Total Amount</span>
                      <span className='text-2xl font-black text-gray-900'>{currency} {order.amount}</span>
                    </div>

                    <div className='flex items-center justify-between text-xs sm:text-sm pt-1'>
                      <span className='text-gray-500 font-semibold'>Payment Method:</span>
                      <span className='font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 text-xs uppercase'>
                        {order.paymentMethod || 'Online'}
                      </span>
                    </div>

                    <div className='flex items-center justify-between text-xs sm:text-sm'>
                      <span className='text-gray-500 font-semibold'>Payment Status:</span>
                      <span className={`font-black text-xs px-2.5 py-1 rounded-lg ${order.payment ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {order.payment ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Status */}
                  <div className='space-y-2 pt-1'>
                    <div className='flex items-center justify-between'>
                      <label className='text-xs font-extrabold text-purple-700 uppercase tracking-wider block flex items-center gap-1.5'>
                        <span className='animate-pulse text-amber-500 text-sm'>⚡</span> Delivery Status
                      </label>
                    </div>

                    <div className='p-3.5 bg-white rounded-2xl border border-purple-200/80 shadow-2xs'>
                      <div className='flex items-center justify-between bg-purple-50/60 p-3 rounded-xl border border-purple-100'>
                        <span className='text-xs sm:text-sm font-black text-purple-900 flex items-center gap-2'>
                          {order.status === 'Order Placed' && '📦 Order Placed'}
                          {order.status === 'Packing & Preparing' || order.status === 'Packing' ? '🏷️ Packing & Preparing' : null}
                          {order.status === 'Shipped' && '🚚 Shipped'}
                          {order.status === 'Out for Delivery' && '🚴‍♂️ Out for Delivery'}
                          {order.status === 'Delivered' && '✅ Delivered'}
                          {order.status === 'Cancelled' && '❌ Cancelled'}
                        </span>
                        <span className='text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0'>
                          Live
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookOrders
