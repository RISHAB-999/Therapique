import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { dummyOrders } from '../assets/data'
import axios from 'axios'

const MyOrders = () => {
    const { currency, backendUrl, navigate } = useContext(ShopContext)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUserOrders = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setOrders([])
            setLoading(false)
            return
        }

        try {
            const { data } = await axios.get(backendUrl + '/api/user/user-orders', { headers: { token } })
            if (data.success && data.orders && data.orders.length > 0) {
                setOrders(data.orders)
            } else {
                setOrders([])
            }
        } catch (error) {
            console.log(error)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserOrders()
    }, [])

    return (
        <div className='max-padd-container py-16 pt-2'>
            <Title
                title1={"My Orders"}
                title2={"List"}
                titleStyles={"pb-10"} />
            {loading ? (
                <div className='text-center py-10 text-gray-500'>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className='text-center py-10'>
                    <p className='text-gray-500 font-medium text-base'>No Book Orders Placed Yet</p>
                </div>
            ) : orders.map((order) => (
                <div key={order._id} className='bg-blue-50 p-3 mt-4 rounded-xl border border-blue-100 shadow-sm'>
                    {/* Book List */}
                    <div className='flex flex-col lg:flex-row gap-4 mb-3'>
                        {order.items.map((item, index) => {
                            const itemImg = item.image || item.book?.image?.[0] || item.book?.image;
                            const itemName = item.name || item.book?.name;
                            const itemPrice = item.price || item.offerPrice || item.book?.offerPrice;
                            return (
                                <div key={index} className='flex gap-x-3 items-center'>
                                    <div className='flexCenter rounded-lg overflow-hidden shrink-0 bg-white p-1 ring-1 ring-slate-900/5'>
                                        <img src={itemImg} alt="orderImg" className='h-20 w-16 object-contain rounded-md' />
                                    </div>
                                    <div className='w-full block'>
                                        <h5 className='h5 capitalize line-clamp-1 text-gray-800 font-semibold'>{itemName}</h5>
                                        <div className='flex flex-wrap gap-3 max-sm:gap-y-1 mt-1'>
                                            <div className='flex items-center gap-x-2'>
                                                <h5 className='medium-14 text-gray-600'>Price:</h5>
                                                <p className='font-medium'>{currency}{itemPrice}</p>
                                            </div>
                                            <div className='flex items-center gap-x-2'>
                                                <h5 className='medium-14 text-gray-600'>Quantity:</h5>
                                                <p className='font-medium'>{item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Order Summary */}
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-gray-200 pt-3'>
                        <div className='flex flex-col gap-1.5'>
                            <div className='flex items-center gap-x-2'>
                                <h5 className='medium-14 text-gray-700'>OrderId:</h5>
                                <p className='text-gray-500 text-xs font-mono break-all'>{order._id}</p>
                            </div>
                            <div className='flex gap-4 flex-wrap'>
                                <div className='flex items-center gap-x-2'>
                                    <h5 className='medium-14 text-gray-700'>Payment Status:</h5>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.payment || order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {order.payment || order.isPaid ? "Done" : "Pending"}
                                    </span>
                                </div>
                                <div className='flex items-center gap-x-2'>
                                    <h5 className='medium-14 text-gray-700'>Method:</h5>
                                    <p className='text-purple-600 text-sm font-semibold uppercase'>{order.paymentMethod}</p>
                                </div>
                            </div>
                            <div className='flex gap-4 flex-wrap'>
                                <div className='flex items-center gap-x-2'>
                                    <h5 className='medium-14 text-gray-700'>Date:</h5>
                                    <p className='text-gray-500 text-sm'>{order.date ? new Date(order.date).toDateString() : new Date(order.createdAt).toDateString()}</p>
                                </div>
                                <div className='flex items-center gap-x-2'>
                                    <h5 className='medium-14 text-gray-700'>Amount:</h5>
                                    <p className='text-gray-900 font-bold text-sm'>{currency}{order.amount}</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-x-2'>
                                <h5 className='medium-14 text-gray-700'>Status:</h5>
                                <div className='flex items-center gap-1.5'>
                                    <span className='w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse' />
                                    <p className='text-gray-700 font-medium text-sm'>{order.status || 'Order Placed'}</p>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/track-order/${order._id}`)} className='btn-secondary !py-1.5 !px-3 !text-xs rounded-lg hover:bg-purple-600 cursor-pointer'>Track Order</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MyOrders