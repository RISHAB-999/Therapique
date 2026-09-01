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
        const interval = setInterval(fetchOrder, 4000)
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

        const orderTime = order.date || Date.now()
        const now = Date.now()
        const diffInHours = (now - orderTime) / (1000 * 60 * 60)

        let timeStep = 0
        if (diffInHours >= 72) timeStep = 3
        else if (diffInHours >= 48) timeStep = 2
        else if (diffInHours >= 24) timeStep = 1

        return Math.max(dbStep, timeStep)
    }

    const activeStep = getActiveStep()

    const displayStatus = (() => {
        if (!order) return 'Order Placed'
        const status = order.status ? order.status.toLowerCase() : ''
        if (status === 'paid' || status === 'order placed' || status === 'cod' || status === 'razorpay') {
            return steps[activeStep].label
        }
        return order.status || steps[activeStep].label
    })()

    return (
        <div className='max-padd-container py-12 pt-4 min-h-[85vh]'>
            {/* Back Button */}
            <div className='flex items-center justify-between mb-6'>
                <button
                    onClick={() => navigate('/my-orders')}
                    className='flex items-center gap-2 text-xs font-bold text-gray-800 bg-[#FAF5EE] hover:bg-[#F3E8DE] border border-[#EADBCE] px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer shadow-2xs'
                >
                    <FaArrowLeft className='text-[10px]' /> Back to My Orders
                </button>
            </div>

            <Title title1={"Track"} title2={"Order"} titleStyles={"pb-6"} />

            {loading ? (
                <div className='min-h-[50vh] flex flex-col items-center justify-center gap-3 py-16 text-center'>
                    <div className='w-9 h-9 border-4 border-[#81C784] border-t-transparent rounded-full animate-spin' />
                    <p className='text-gray-600 font-semibold text-xs sm:text-sm'>Loading order tracking...</p>
                </div>
            ) : !order ? (
                <div className='text-center py-16 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE] p-6'>
                    <h4 className='text-lg font-bold text-gray-800 mb-1'>Order Not Found</h4>
                    <p className='text-xs text-gray-500 mb-5'>We couldn't find order details for ID: {orderId}</p>
                    <button
                        onClick={() => navigate('/my-orders')}
                        className='bg-black hover:bg-gray-800 text-white font-bold py-2 px-5 text-xs rounded-xl cursor-pointer shadow-sm'
                    >
                        View My Orders
                    </button>
                </div>
            ) : (
                <div className='space-y-6'>
                    {/* Top Overview Banner */}
                    <div className='bg-black rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden'>
                        <div className='absolute -right-8 -bottom-8 opacity-10 pointer-events-none'>
                            <FaTruck className='text-9xl' />
                        </div>
                        <div className='flex flex-wrap justify-between items-start gap-4 relative z-10'>
                            <div>
                                <span className='text-[11px] uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full font-bold backdrop-blur-xs flex items-center gap-1.5 w-max mb-1'>
                                    <span className='w-2 h-2 rounded-full bg-emerald-400 animate-ping' /> Live Tracking
                                </span>
                                <h3 className='text-2xl sm:text-3xl font-black mt-2 capitalize tracking-tight'>
                                    {displayStatus}
                                </h3>
                                <p className='text-gray-300 text-xs mt-1 font-mono'>
                                    Order ID: <span className='text-white font-bold'>{order._id}</span>
                                </p>
                            </div>
                            <div className='text-right max-sm:text-left bg-white/10 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-white/15'>
                                <p className='text-[10px] text-gray-300 uppercase tracking-wider font-bold'>Estimated Delivery</p>
                                <p className='text-base sm:text-lg font-bold text-white mt-0.5'>
                                    {new Date((order.date || Date.now()) + 3 * 24 * 60 * 60 * 1000).toDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step Timeline Track Bar */}
                    <div className='bg-[#FAF5EE] p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_rgba(70,56,48,0.03)] border border-[#EADBCE]'>
                        <h4 className='text-sm sm:text-base font-bold text-gray-900 mb-6 flex items-center gap-2'>
                            <FaTruck className='text-purple-700' /> Delivery Progress Timeline
                        </h4>
                        
                        <div className='relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0'>
                            {/* Horizontal Progress Line Track (Desktop) */}
                            <div className='hidden md:block absolute top-6 left-[6%] right-[6%] h-1.5 bg-[#EADBCE] rounded-full z-0 overflow-hidden'>
                                <div 
                                    className='h-full bg-black rounded-full transition-all duration-700 ease-in-out'
                                    style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {/* Vertical Progress Line Track (Mobile) */}
                            <div className='block md:hidden absolute top-6 bottom-6 left-6 -translate-x-1/2 w-1 bg-[#EADBCE] rounded-full z-0 overflow-hidden'>
                                <div 
                                    className='w-full bg-black rounded-full transition-all duration-700 ease-in-out'
                                    style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {steps.map((step, idx) => {
                                const IconComponent = step.icon
                                const isCompleted = idx <= activeStep
                                const isCurrent = idx === activeStep
                                return (
                                    <div key={idx} className='relative z-10 flex md:flex-col items-center gap-3.5 md:gap-2.5 text-left md:text-center w-full md:w-auto'>
                                        {/* Step Icon Badge */}
                                        <div className={`w-11 h-11 rounded-2xl flexCenter transition-all duration-500 shadow-xs shrink-0 ${
                                            isCurrent 
                                                ? 'bg-black text-white ring-4 ring-black/10 scale-105'
                                                : isCompleted
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-[#FDF7F3] text-gray-400 border border-[#EADBCE]'
                                        }`}>
                                            <IconComponent className='text-base' />
                                        </div>

                                        {/* Step Label & Desc */}
                                        <div>
                                            <h5 className={`text-xs sm:text-sm font-bold capitalize ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step.label}
                                            </h5>
                                            <p className='text-[11px] text-gray-500 max-w-[130px] mt-0.5'>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className='bg-[#FAF5EE] p-5 sm:p-6 rounded-3xl shadow-[0_4px_20px_rgba(70,56,48,0.03)] border border-[#EADBCE]'>
                        <h4 className='text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2'>
                            <FaBoxOpen className='text-purple-700' /> Items in Package ({order.items.length})
                        </h4>
                        <div className='divide-y divide-[#EADBCE]'>
                            {order.items.map((item, idx) => {
                                const itemImg = item.image || item.book?.image?.[0] || item.book?.image
                                const itemName = item.name || item.book?.name || 'Book'
                                const itemPrice = item.price || item.offerPrice || item.book?.offerPrice || 0
                                return (
                                    <div key={idx} className='py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0'>
                                        <div className='flex items-center gap-3.5'>
                                            <div className='w-14 h-18 bg-[#FDF7F3] rounded-xl overflow-hidden p-1 border border-[#EADBCE] flexCenter shrink-0'>
                                                {itemImg ? (
                                                    <img src={itemImg} alt={itemName} className='w-full h-full object-contain' />
                                                ) : (
                                                    <span className='text-xl'>📖</span>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className='font-bold text-gray-900 text-xs sm:text-sm line-clamp-1'>{itemName}</h5>
                                                <p className='text-xs text-gray-600 mt-1'>Quantity: <span className='font-bold text-gray-900'>{item.quantity}</span></p>
                                            </div>
                                        </div>
                                        <div className='text-right shrink-0'>
                                            <p className='font-extrabold text-gray-900 text-sm'>{currency}{itemPrice * item.quantity}</p>
                                            <p className='text-[11px] text-gray-500 font-mono'>{currency}{itemPrice} each</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Shipping Address & Payment Summary */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5 items-start'>
                        {/* Shipping Address */}
                        <div className='bg-[#FAF5EE] p-5 rounded-3xl shadow-[0_4px_20px_rgba(70,56,48,0.03)] border border-[#EADBCE]'>
                            <h4 className='text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2'>
                                <FaLocationDot className='text-purple-700' /> Shipping Address
                            </h4>
                            {order.address ? (
                                <div className='text-xs sm:text-sm text-gray-700 space-y-1 bg-[#FDF7F3] p-3.5 rounded-2xl border border-[#EADBCE]'>
                                    <p className='font-bold text-gray-900'>{order.address.street || order.address.line1}</p>
                                    <p>{[order.address.city, order.address.state].filter(Boolean).join(', ')}</p>
                                    <p className='font-medium text-gray-600'>{order.address.country}</p>
                                </div>
                            ) : (
                                <p className='text-xs text-gray-400'>Standard Shipping Address</p>
                            )}
                        </div>

                        {/* Payment Summary */}
                        <div className='bg-[#FAF5EE] p-5 rounded-3xl shadow-[0_4px_20px_rgba(70,56,48,0.03)] border border-[#EADBCE]'>
                            {(() => {
                                const itemsSubtotal = order.items ? order.items.reduce((sum, item) => {
                                    const itemPrice = item.price || item.offerPrice || item.book?.offerPrice || 0;
                                    return sum + itemPrice * item.quantity;
                                }, 0) : 0;
                                const shippingFee = delivery_charges || 100;
                                const taxGst = (itemsSubtotal * 2) / 100;

                                return (
                                    <>
                                        <div className='flex items-center justify-between mb-3'>
                                            <h4 className='text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2'>
                                                <FaReceipt className='text-purple-700' /> Payment Details
                                            </h4>
                                            <button
                                                onClick={() => setShowBreakdown(!showBreakdown)}
                                                className='flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 bg-[#F3E8DE] px-2.5 py-1 rounded-lg transition cursor-pointer border border-[#EADBCE]'
                                            >
                                                <span>{showBreakdown ? "Hide" : "Breakdown"}</span>
                                                {showBreakdown ? <FaChevronUp className='text-[9px]' /> : <FaChevronDown className='text-[9px]' />}
                                            </button>
                                        </div>
                                        
                                        <div className='space-y-2 text-xs sm:text-sm bg-[#FDF7F3] p-3.5 rounded-2xl border border-[#EADBCE]'>
                                            <div className='flex justify-between text-gray-700'>
                                                <span>Payment Method:</span>
                                                <span className='font-extrabold text-purple-700 uppercase'>{order.paymentMethod}</span>
                                            </div>
                                            <div className='flex justify-between text-gray-700'>
                                                <span>Payment Status:</span>
                                                <span className={`font-extrabold px-2 py-0.5 text-xs rounded-full ${
                                                    order.payment ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                }`}>
                                                    {order.payment ? 'Paid' : 'Pending'}
                                                </span>
                                            </div>

                                            {showBreakdown && (
                                                <div className='pt-2.5 mt-2 border-t border-[#EADBCE] space-y-1.5 text-xs text-gray-600'>
                                                    <div className='flex justify-between'>
                                                        <span>Items Subtotal:</span>
                                                        <span className='font-bold text-gray-900'>{currency}{itemsSubtotal}</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span>Shipping Fee:</span>
                                                        <span className='font-bold text-gray-900'>{currency}{shippingFee}.00</span>
                                                    </div>
                                                    <div className='flex justify-between'>
                                                        <span>GST / Tax (2%):</span>
                                                        <span className='font-bold text-gray-900'>{currency}{taxGst}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className='border-t border-[#EADBCE] pt-2.5 flex justify-between text-sm font-black text-gray-900'>
                                                <span>Total Paid:</span>
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
