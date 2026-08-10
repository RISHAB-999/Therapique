import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { FaCheck, FaBoxOpen, FaTruck, FaHouse, FaArrowLeft, FaLocationDot, FaReceipt, FaChevronDown, FaChevronUp } from 'react-icons/fa6'

const TrackOrder = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const { currency, backendUrl, delivery_charges } = useContext(ShopContext)
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showBreakdown, setShowBreakdown] = useState(false)

    const handleStatusUpdate = async (newStatus) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/update-order-status`, {
                orderId: order._id,
                status: newStatus
            })
            if (data.success) {
                setOrder(prev => ({ ...prev, status: newStatus }))
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/order/${orderId}`, {
                    headers: { token }
                })
                if (data.success) {
                    setOrder(data.order)
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
        // Poll every 3 seconds for live real-time updates from database
        const interval = setInterval(fetchOrder, 3000)
        return () => clearInterval(interval)
    }, [orderId, backendUrl])

    // Order status steps
    const steps = [
        { label: 'Order Placed', desc: 'Order confirmed & received', icon: FaCheck, key: 'Order Placed' },
        { label: 'Processing', desc: 'Packed & ready for dispatch', icon: FaBoxOpen, key: 'Processing' },
        { label: 'Out for Delivery', desc: 'In transit with courier partner', icon: FaTruck, key: 'Out for Delivery' },
        { label: 'Delivered', desc: 'Package delivered to address', icon: FaHouse, key: 'Delivered' }
    ]

    // Determine current active step index (0 to 3) based on explicit status or elapsed time
    const getActiveStep = () => {
        if (!order) return 0
        const status = order.status ? order.status.toLowerCase() : ''
        
        let dbStep = 0
        if (status.includes('delivered')) dbStep = 3
        else if (status.includes('shipped') || status.includes('transit') || status.includes('out')) dbStep = 2
        else if (status.includes('process') || status.includes('pack')) dbStep = 1

        // Calculate progress based on time elapsed since order creation date
        const orderTime = order.date || Date.now()
        const now = Date.now()
        const diffInHours = (now - orderTime) / (1000 * 60 * 60)

        let timeStep = 0
        if (diffInHours >= 72) timeStep = 3  // 3 days elapsed (e.g. July 31st) -> Delivered!
        else if (diffInHours >= 48) timeStep = 2
        else if (diffInHours >= 24) timeStep = 1

        return Math.max(dbStep, timeStep)
    }

    const activeStep = getActiveStep()

    // Status text for the banner
    const displayStatus = (() => {
        if (!order) return 'Order Placed'
        const status = order.status ? order.status.toLowerCase() : ''
        if (status === 'paid' || status === 'order placed' || status === 'cod' || status === 'razorpay') {
            return steps[activeStep].label
        }
        return order.status || steps[activeStep].label
    })()

    return (
        <div className='max-padd-container py-12 pt-6 min-h-[85vh]'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <button
                    onClick={() => navigate('/my-orders')}
                    className='flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer'
                >
                    <FaArrowLeft className='text-xs' /> Back to My Orders
                </button>
            </div>

            <Title title1={"Track"} title2={"Order"} titleStyles={"pb-6"} />

            {loading ? (
                <div className='flexCenter py-20 text-gray-500 font-medium'>Loading order details...</div>
            ) : !order ? (
                <div className='text-center py-16 bg-blue-50/50 rounded-2xl border border-blue-100'>
                    <h4 className='text-lg font-bold text-gray-700 mb-2'>Order Not Found</h4>
                    <p className='text-sm text-gray-500 mb-6'>We couldn't find order details for ID: {orderId}</p>
                    <button
                        onClick={() => navigate('/my-orders')}
                        className='btn-secondary !py-2 !px-6 text-sm rounded-xl'
                    >
                        View My Orders
                    </button>
                </div>
            ) : (
                <div className='space-y-8'>
                    {/* Top Overview Banner */}
                    <div className='bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden'>
                        <div className='absolute -right-10 -bottom-10 opacity-15 pointer-events-none'>
                            <FaTruck className='text-9xl' />
                        </div>
                        <div className='flex flex-wrap justify-between items-start gap-4 relative z-10'>
                            <div>
                                <span className='text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full font-semibold backdrop-blur-sm flex items-center gap-1.5 w-max mb-1'>
                                    <span className='w-2 h-2 rounded-full bg-green-400 animate-ping' /> Live Tracking
                                </span>
                                <h3 className='text-2xl sm:text-3xl font-extrabold mt-3 capitalize tracking-wide'>
                                    {displayStatus}
                                </h3>
                                <p className='text-white/80 text-sm mt-1 font-mono'>
                                    Order ID: <span className='text-white font-bold'>{order._id}</span>
                                </p>
                            </div>
                            <div className='text-right max-sm:text-left bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20'>
                                <p className='text-xs text-white/80 uppercase tracking-wider font-semibold'>Estimated Delivery</p>
                                <p className='text-lg sm:text-xl font-bold text-white mt-0.5'>
                                    {new Date((order.date || Date.now()) + 3 * 24 * 60 * 60 * 1000).toDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step Timeline Track Bar */}
                    <div className='bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-100'>
                        <h4 className='text-base font-bold text-gray-800 mb-8 flex items-center gap-2'>
                            <FaTruck className='text-purple-600' /> Delivery Progress Timeline
                        </h4>
                        
                        <div className='relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0'>
                            {/* Horizontal Progress Line Track (Desktop) */}
                            <div className='hidden md:block absolute top-6 left-[6%] right-[6%] h-1.5 bg-gray-200 rounded-full z-0 overflow-hidden'>
                                <div 
                                    className='h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-in-out'
                                    style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {/* Vertical Progress Line Track (Mobile) */}
                            <div className='block md:hidden absolute top-6 bottom-6 left-6 -translate-x-1/2 w-1 bg-gray-200 rounded-full z-0 overflow-hidden'>
                                <div 
                                    className='w-full bg-gradient-to-b from-green-500 via-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-in-out'
                                    style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {steps.map((step, idx) => {
                                const IconComponent = step.icon
                                const isCompleted = idx <= activeStep
                                const isCurrent = idx === activeStep
                                return (
                                    <div key={idx} className='relative z-10 flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center w-full md:w-auto'>
                                        {/* Step Icon Badge */}
                                        <div className={`w-12 h-12 rounded-2xl flexCenter transition-all duration-500 shadow-md ${
                                            isCurrent 
                                                ? 'bg-purple-600 text-white ring-4 ring-purple-200 scale-110'
                                                : isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                                        }`}>
                                            <IconComponent className='text-lg' />
                                        </div>

                                        {/* Step Label & Desc */}
                                        <div>
                                            <h5 className={`text-sm font-bold capitalize ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {step.label}
                                            </h5>
                                            <p className='text-xs text-gray-500 max-w-[140px] mt-0.5'>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>



                    {/* Ordered Items List */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
                        <h4 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
                            <FaBoxOpen className='text-purple-600' /> Items in Package ({order.items.length})
                        </h4>
                        <div className='divide-y divide-gray-100'>
                            {order.items.map((item, idx) => {
                                const itemImg = item.image || item.book?.image?.[0] || item.book?.image
                                const itemName = item.name || item.book?.name
                                const itemPrice = item.price || item.offerPrice || item.book?.offerPrice
                                return (
                                    <div key={idx} className='py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0'>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-16 h-20 bg-slate-50 rounded-xl overflow-hidden p-1 border border-slate-100 flexCenter shrink-0'>
                                                <img src={itemImg} alt={itemName} className='w-full h-full object-contain' />
                                            </div>
                                            <div>
                                                <h5 className='font-bold text-gray-800 text-sm line-clamp-1'>{itemName}</h5>
                                                <p className='text-xs text-gray-500 mt-1'>Quantity: <span className='font-semibold text-gray-700'>{item.quantity}</span></p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-extrabold text-gray-800 text-sm'>{currency}{itemPrice * item.quantity}</p>
                                            <p className='text-xs text-gray-400'>{currency}{itemPrice} each</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Shipping Address & Payment Summary */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                        {/* Shipping Address */}
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
                            <h4 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
                                <FaLocationDot className='text-purple-600' /> Shipping Address
                            </h4>
                            {order.address ? (
                                <div className='text-sm text-gray-600 space-y-1 bg-purple-50/50 p-4 rounded-xl border border-purple-100'>
                                    <p className='font-bold text-gray-800'>{order.address.street}</p>
                                    <p>{order.address.city}, {order.address.state}</p>
                                    <p className='font-medium text-gray-700'>{order.address.country}</p>
                                </div>
                            ) : (
                                <p className='text-sm text-gray-400'>Standard Shipping Address</p>
                            )}
                        </div>

                        {/* Payment Summary */}
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
                            {(() => {
                                const itemsSubtotal = order.items ? order.items.reduce((sum, item) => {
                                    const itemPrice = item.price || item.offerPrice || item.book?.offerPrice || 0;
                                    return sum + itemPrice * item.quantity;
                                }, 0) : 0;
                                const shippingFee = delivery_charges || 100;
                                const taxGst = (itemsSubtotal * 2) / 100;

                                return (
                                    <>
                                        <div className='flex items-center justify-between mb-4'>
                                            <h4 className='text-base font-bold text-gray-800 flex items-center gap-2'>
                                                <FaReceipt className='text-purple-600' /> Payment Details
                                            </h4>
                                            <button
                                                onClick={() => setShowBreakdown(!showBreakdown)}
                                                className='flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer'
                                            >
                                                {showBreakdown ? "Hide Breakdown" : "Show Breakdown"}
                                                {showBreakdown ? <FaChevronUp className='text-[10px]' /> : <FaChevronDown className='text-[10px]' />}
                                            </button>
                                        </div>
                                        
                                        <div className='space-y-2 text-sm bg-blue-50/50 p-4 rounded-xl border border-blue-100 transition-all duration-300'>
                                            <div className='flex justify-between text-gray-600'>
                                                <span>Payment Method:</span>
                                                <span className='font-bold text-purple-700 uppercase'>{order.paymentMethod}</span>
                                            </div>
                                            <div className='flex justify-between text-gray-600'>
                                                <span>Payment Status:</span>
                                                <span className={`font-semibold px-2 py-0.5 text-xs rounded-full ${order.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {order.payment ? 'Paid' : 'Pending'}
                                                </span>
                                            </div>

                                            {/* Itemized Payment Breakdown */}
                                            {showBreakdown && (
                                                <div className='pt-3 mt-2 border-t border-blue-200/70 space-y-2 text-xs text-gray-600 transition-all duration-300'>
                                                    <div className='flex justify-between'>
                                                        <span>Items Subtotal:</span>
                                                        <span className='font-medium text-gray-800'>{currency}{itemsSubtotal}</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span>Shipping & Handling Fee:</span>
                                                        <span className='font-medium text-gray-800'>{currency}{shippingFee}.00</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span>Tax & GST (2%):</span>
                                                        <span className='font-medium text-gray-800'>{currency}{taxGst}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <hr className='border-gray-200 my-2' />
                                            <div className='flex justify-between text-base font-extrabold text-gray-900'>
                                                <span>Total Amount Paid:</span>
                                                <span className='text-purple-700'>{currency}{order.amount || (itemsSubtotal + shippingFee + taxGst)}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrackOrder
