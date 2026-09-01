import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { FaBagShopping, FaArrowRight } from 'react-icons/fa6'
import { Receipt } from 'lucide-react'
import ReceiptModal from '../components/ReceiptModal'
import PaginationControls from '../components/PaginationControls'

const MyOrders = () => {
    const { currency, backendUrl, books = [], navigate, sanitizeImageUrl } = useContext(ShopContext)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null)
    const [showReceiptModal, setShowReceiptModal] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const displayedOrders = orders.slice(startIndex, startIndex + itemsPerPage)

    const fetchUserOrders = async (isSilent = false) => {
        const token = localStorage.getItem('token')
        if (!token) {
            setOrders([])
            if (!isSilent) setLoading(false)
            return
        }

        try {
            if (!isSilent) setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/user/user-orders', { headers: { token } })
            if (data.success && data.orders && data.orders.length > 0) {
                setOrders(data.orders)
            } else {
                setOrders([])
            }
        } catch (error) {
            console.log(error)
            if (!isSilent) setOrders([])
        } finally {
            if (!isSilent) setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserOrders()
        const interval = setInterval(() => {
            fetchUserOrders(true)
        }, 3000)

        const handleFocus = () => fetchUserOrders(true)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUserOrders(true)
            }
        }

        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return (
        <div className='max-padd-container py-12 pt-4 min-h-[75vh]'>
            <Title
                title1={"My Orders"}
                title2={"List"}
                titleStyles={"pb-8"} />

            {loading ? (
                <div className='min-h-[50vh] flex flex-col items-center justify-center gap-3 py-16 text-center'>
                    <div className='w-9 h-9 border-4 border-[#81C784] border-t-transparent rounded-full animate-spin' />
                    <p className='text-gray-600 font-semibold text-xs sm:text-sm'>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className='min-h-[50vh] flex flex-col items-center justify-center gap-4 py-16 text-center'>
                    <div className='w-16 h-16 bg-[#F3E8DE] text-gray-700 rounded-full flexCenter text-2xl shadow-inner border border-[#EADBCE]'>
                        <FaBagShopping />
                    </div>
                    <h3 className='text-xl font-bold text-gray-900'>No Book Orders Placed Yet</h3>
                    <p className='text-gray-600 text-sm max-w-sm'>When you purchase books, your order details and live delivery tracking will appear here.</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className='bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-md mt-1'
                    >
                        Explore Books
                    </button>
                </div>
            ) : (
                <div className='space-y-4'>
                    {displayedOrders.map((order) => (
                        <div 
                            key={order._id} 
                            className='bg-[#FAF5EE] p-4 sm:p-5 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.03)] hover:shadow-md transition-all duration-300'
                        >
                            {/* Book List in Order */}
                            <div className='flex flex-col gap-3 mb-4'>
                                {order.items.map((item, index) => {
                                    const itemName = item.name || item.book?.name || item.title || 'Book';
                                    const itemPrice = item.price || item.offerPrice || item.book?.offerPrice || 0;
                                    
                                    // Robust image resolution: direct image, book object, or catalog lookup
                                    const matchedBook = books.find(b => 
                                        (item._id && String(b._id) === String(item._id)) || 
                                        (item.book && String(b._id) === String(item.book._id || item.book)) ||
                                        (b.title && itemName.toLowerCase().includes(b.title.toLowerCase()))
                                    );

                                    let rawImg = item.image || item.book?.image?.[0] || item.book?.image || matchedBook?.image?.[0] || matchedBook?.image;
                                    if (Array.isArray(rawImg)) rawImg = rawImg[0];
                                    
                                    const cleanImg = sanitizeImageUrl 
                                        ? sanitizeImageUrl(rawImg) 
                                        : (typeof rawImg === 'string' ? rawImg.replace(/^http:\/\/(localhost|127\.0\.0\.1):4000/, backendUrl) : '');

                                    return (
                                        <div key={index} className='flex gap-3 sm:gap-4 items-center'>
                                            <div className='w-14 sm:w-16 h-18 sm:h-20 bg-[#FDF7F3] rounded-xl overflow-hidden p-1 border border-[#EADBCE] shrink-0 flexCenter'>
                                                {cleanImg ? (
                                                    <img 
                                                        src={cleanImg} 
                                                        alt={itemName} 
                                                        className='h-full w-full object-contain' 
                                                        onError={(e) => {
                                                            if (matchedBook?.image?.[0] && e.target.src !== matchedBook.image[0]) {
                                                                e.target.src = sanitizeImageUrl ? sanitizeImageUrl(matchedBook.image[0]) : matchedBook.image[0];
                                                            } else {
                                                                e.target.onerror = null;
                                                                e.target.src = '/vite.svg';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <span className='text-2xl'>📖</span>
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h5 className='text-sm sm:text-base font-bold text-gray-900 truncate'>{itemName}</h5>
                                                <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600 font-medium'>
                                                    <div>
                                                        <span>Price: </span>
                                                        <span className='font-bold text-gray-900'>{currency}{itemPrice}</span>
                                                    </div>
                                                    <div>
                                                        <span>Quantity: </span>
                                                        <span className='font-bold text-gray-900'>{item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Details & Summary Bar */}
                            <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-[#EADBCE] pt-3.5'>
                                <div className='flex flex-col gap-1.5 w-full lg:w-auto'>
                                    <div className='flex items-center gap-2 text-xs'>
                                        <span className='font-extrabold text-gray-700'>OrderId:</span>
                                        <span className='text-gray-500 font-mono text-[11px] break-all'>{order._id}</span>
                                    </div>
                                    <div className='flex items-center gap-3 sm:gap-4 flex-wrap text-xs'>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='font-extrabold text-gray-700'>Payment Status:</span>
                                            <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
                                                order.payment || order.isPaid 
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                                {order.payment || order.isPaid ? "Done" : "Pending"}
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='font-extrabold text-gray-700'>Method:</span>
                                            <span className='text-purple-700 font-extrabold uppercase'>{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3 sm:gap-4 flex-wrap text-xs'>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='font-extrabold text-gray-700'>Date:</span>
                                            <span className='text-gray-600'>{order.date ? new Date(order.date).toDateString() : new Date(order.createdAt).toDateString()}</span>
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='font-extrabold text-gray-700'>Amount:</span>
                                            <span className='text-gray-900 font-extrabold text-sm'>{currency}{order.amount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full lg:w-auto pt-3 border-t border-[#EADBCE] lg:border-t-0'>
                                    <div className='flex items-center gap-2 text-xs'>
                                        <span className='font-extrabold text-gray-700'>Status:</span>
                                        <div className='flex items-center gap-1.5 bg-[#FDF7F3] border border-[#EADBCE] px-3 py-1 rounded-full'>
                                            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
                                            <span className='text-gray-800 font-bold text-xs'>{order.status || 'Order Placed'}</span>
                                        </div>
                                    </div>

                                    {/* Receipt and Track Order Buttons in the Same Line */}
                                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                                        <button 
                                            onClick={() => {
                                                setSelectedReceiptOrder(order)
                                                setShowReceiptModal(true)
                                            }} 
                                            className='flex-1 sm:flex-initial bg-[#FAF5EE] hover:bg-emerald-50 border border-[#EADBCE] hover:border-emerald-300 text-gray-800 hover:text-emerald-700 font-extrabold py-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-2xs text-center'
                                        >
                                            Receipt
                                        </button>

                                        <button 
                                            onClick={() => navigate(`/track-order/${order._id}`)} 
                                            className='flex-1 sm:flex-initial bg-black hover:bg-gray-800 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap text-center'
                                        >
                                            <span>Track Order</span>
                                            <FaArrowRight className='text-xs' />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={orders.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(pg) => {
                            setCurrentPage(pg)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val)
                            setCurrentPage(1)
                        }}
                        rowsOptions={[5, 10, 20]}
                        itemLabel="orders"
                        className="mt-6"
                    />
                </div>
            )}

            {/* Receipt Printer Modal Popup */}
            {showReceiptModal && selectedReceiptOrder && (
                <ReceiptModal
                    isOpen={showReceiptModal}
                    onClose={() => {
                        setShowReceiptModal(false)
                        setSelectedReceiptOrder(null)
                    }}
                    data={selectedReceiptOrder}
                    type="order"
                />
            )}
        </div>
    )
}

export default MyOrders