import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { AppContext } from '../context/AppContext'
import { dummyAddress } from '../assets/data'
import axios from 'axios'
import { toast } from 'react-toastify'

const TokenCoinSVG = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
        <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
    </svg>
)

const DEFAULT_FALLBACK_ADDRESS = {
    type: 'Home',
    firstName: 'Rishab',
    lastName: 'Negi',
    email: 'rishabn090@gmail.com',
    phone: '8130758753',
    street: 'Flat 304, Sector 6, Dwarka',
    line1: 'Flat 304, Sector 6, Dwarka',
    line2: '',
    city: 'New Delhi',
    state: 'Delhi',
    zipcode: '110075',
    country: 'India'
}

const CartTotal = () => {
    const { navigate, books = [], currency, cartItems = {}, setCartItems, method, setMethod, getCartAmount, getCartCount, getBookPriceWithFormat, delivery_charges, backendUrl } = useContext(ShopContext)
    const { userData } = useContext(AppContext)
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedaddress, setSelectedAddress] = useState(null)
    const [loading, setLoading] = useState(false)

    // Sync saved shipping addresses (MAX 2 ADDRESSES LIMIT)
    useEffect(() => {
        let saved = []
        try {
            const stored = localStorage.getItem('saved_addresses')
            if (stored) saved = JSON.parse(stored)
        } catch(e) {}

        let initialList = []
        if (Array.isArray(saved) && saved.length > 0) {
            initialList = saved
        } else if (userData) {
            let userAddr = userData.address || {}
            if (typeof userAddr === 'string') {
                try { userAddr = JSON.parse(userAddr) } catch(e) {}
            }
            const profileAddr = {
                firstName: userData.name?.split(' ')[0] || userAddr.firstName || 'Rishab',
                lastName: userData.name?.split(' ').slice(1).join(' ') || userAddr.lastName || 'Negi',
                email: userData.email || userAddr.email || 'rishabn090@gmail.com',
                phone: userData.phone || userAddr.phone || '8130758753',
                street: userAddr.street || userAddr.line1 || 'Flat 304, Sector 6, Dwarka',
                line1: userAddr.line1 || userAddr.street || 'Flat 304, Sector 6, Dwarka',
                line2: userAddr.line2 || '',
                city: userAddr.city || 'New Delhi',
                state: userAddr.state || 'Delhi',
                zipcode: userAddr.zipcode || userAddr.pincode || '110075',
                country: userAddr.country || 'India'
            }
            initialList = [profileAddr]
        } else if (Array.isArray(dummyAddress) && dummyAddress.length > 0) {
            initialList = dummyAddress.slice(0, 2)
        } else {
            initialList = [DEFAULT_FALLBACK_ADDRESS]
        }

        // Keep strictly unique & max 2 saved addresses
        const uniqueAddresses = initialList.filter((addr, index, self) => 
            addr && index === self.findIndex((a) => a && (a.street || a.line1) === (addr.street || addr.line1))
        ).slice(0, 2)

        setAddresses(uniqueAddresses)
        if (uniqueAddresses.length > 0 && !selectedaddress) {
            setSelectedAddress(uniqueAddresses[0])
        }
    }, [userData])

    const initPay = (order, orderId, token) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Synr1hf0zc3IAl',
            amount: order.amount,
            currency: order.currency,
            name: 'Therapique Books',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        backendUrl + '/api/user/verify-book-order-razorpay',
                        { ...response, orderId },
                        { headers: { token } }
                    );
                    if (data.success) {
                        toast.success(data.message);
                        setCartItems({});
                        try { localStorage.removeItem('cartItems') } catch(e){}
                        navigate('/my-orders');
                    } else {
                        toast.error(data.message);
                    }
                } catch (err) {
                    console.log(err);
                    toast.error(err.message);
                }
            },
            prefill: {
                name: userData?.name || 'User',
                email: userData?.email || ''
            },
            theme: {
                color: '#81C784'
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleOrder = async () => {
        if (getCartCount() === 0) {
            return toast.error("Your cart is empty!");
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to proceed with your order");
            return navigate('/login');
        }

        const orderItems = Object.entries(cartItems).map(([cartKey, qty]) => {
            const [itemId, format] = cartKey.split('___');
            const item = books.find(b => String(b._id) === String(itemId) || String(b.id) === String(itemId));
            const fmtName = format || 'Standard Paperback';
            const unitPrice = getBookPriceWithFormat ? getBookPriceWithFormat(item, fmtName) : (item?.offerPrice || 999);

            return {
                _id: item?._id || itemId,
                name: `${item?.name || item?.title || 'Book'} (${fmtName})`,
                price: unitPrice,
                quantity: Number(qty) || 1,
                image: Array.isArray(item?.image) && item.image.length > 0 ? item.image[0] : (typeof item?.image === 'string' ? item.image : '')
            };
        }).filter(item => item && item.quantity > 0);

        const cartAmt = getCartAmount ? getCartAmount() : 0;
        const totalAmount = cartAmt + delivery_charges + (cartAmt * 2) / 100;
        const activeAddr = selectedaddress || addresses[0] || DEFAULT_FALLBACK_ADDRESS;

        try {
            setLoading(true);
            if (method === 'COD') {
                const { data } = await axios.post(
                    backendUrl + '/api/user/place-book-order-cod',
                    { items: orderItems, amount: totalAmount, address: activeAddr },
                    { headers: { token } }
                );
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    try { localStorage.removeItem('cartItems') } catch(e){}
                    navigate('/my-orders');
                } else {
                    toast.error(data.message);
                }
            } else if (method === 'RazorPay') {
                const { data } = await axios.post(
                    backendUrl + '/api/user/create-book-order-razorpay',
                    { items: orderItems, amount: totalAmount, address: activeAddr },
                    { headers: { token } }
                );
                if (data.success) {
                    initPay(data.order, data.orderId, token);
                } else {
                    toast.error(data.message);
                }
            } else if (method === 'Tokens') {
                if (Math.round(userData?.therapiqueCoins || 0) < Math.round(totalAmount)) {
                    setLoading(false);
                    return toast.error(`Insufficient Tokens! Total required is ${Math.round(totalAmount)}, but your balance is ${Math.round(userData?.therapiqueCoins || 0)}.`);
                }

                const { data } = await axios.post(
                    backendUrl + '/api/user/place-book-order-tokens',
                    { items: orderItems, amount: totalAmount, address: activeAddr },
                    { headers: { token } }
                );
                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    try { localStorage.removeItem('cartItems') } catch(e){}
                    navigate('/my-orders');
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAddress = (e, addrToRemove) => {
        e.stopPropagation();
        const updated = addresses.filter(a => (a.street || a.line1) !== (addrToRemove.street || addrToRemove.line1));
        setAddresses(updated);
        localStorage.setItem('saved_addresses', JSON.stringify(updated));

        if ((selectedaddress?.street || selectedaddress?.line1) === (addrToRemove.street || addrToRemove.line1)) {
            setSelectedAddress(updated[0] || null);
        }
        toast.success("Address removed!");
    };

    const cartAmt = getCartAmount ? getCartAmount() : 0;
    const grandTotal = Math.round(cartAmt > 0 ? cartAmt + delivery_charges + (cartAmt * 2) / 100 : 0);
    const activeAddressDisplay = selectedaddress || addresses[0];

    const formattedAddressStr = activeAddressDisplay
        ? [activeAddressDisplay.street || activeAddressDisplay.line1, activeAddressDisplay.city, activeAddressDisplay.state, activeAddressDisplay.country].filter(Boolean).join(', ')
        : "Flat 304, Sector 6, Dwarka, New Delhi, Delhi, India";

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#EADBCE] pb-3'>
                <h3 className='text-base sm:text-lg font-black text-gray-900 tracking-tight'>
                    Order Details
                </h3>
                <span className='text-xs font-bold bg-[#F3E8DE] text-gray-800 border border-[#EADBCE] px-3 py-1 rounded-full'>
                    {getCartCount ? getCartCount() : 0} {getCartCount && getCartCount() === 1 ? 'Item' : 'Items'}
                </span>
            </div>

            {/* Shipping Address Selector */}
            <div className='bg-[#FDF7F3] p-3.5 rounded-2xl border border-[#EADBCE] relative'>
                <div className='flex items-center justify-between mb-1'>
                    <h4 className='text-xs font-extrabold text-gray-700 uppercase tracking-wider'>Where to ship your order?</h4>
                    <button 
                        onClick={() => setShowAddress(!showAddress)} 
                        className='text-purple-700 text-xs font-extrabold hover:underline cursor-pointer flex items-center gap-1'
                    >
                        <span>Change</span>
                        <span className='text-[10px]'>{showAddress ? '▲' : '▼'}</span>
                    </button>
                </div>

                <p className='text-xs text-gray-800 font-bold leading-relaxed mt-1'>
                    {formattedAddressStr}
                </p>

                {/* Dropdown with Max 2 Saved Addresses & Remove Action */}
                {showAddress && (
                    <div className='absolute top-full left-0 right-0 mt-2 bg-[#FAF5EE] text-xs shadow-2xl rounded-2xl z-30 overflow-hidden border border-[#EADBCE]'>
                        <div className='p-2 bg-[#F3E8DE] border-b border-[#EADBCE] text-[11px] font-extrabold text-gray-800 flex items-center justify-between'>
                            <span>Select Shipping Address</span>
                            <span>({addresses.length}/2 Saved)</span>
                        </div>

                        {addresses.slice(0, 2).map((addr, index) => {
                            const isSelected = (selectedaddress?.street || selectedaddress?.line1) === (addr.street || addr.line1);
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => {
                                        setSelectedAddress(addr);
                                        setShowAddress(false);
                                        toast.info("Shipping address updated!");
                                    }} 
                                    className={`p-3 cursor-pointer flex items-center justify-between border-b border-[#EADBCE] transition-colors ${
                                        isSelected 
                                            ? 'bg-[#FDF7F3] text-gray-900 font-extrabold border-l-4 border-l-black' 
                                            : 'hover:bg-[#F3E8DE] text-gray-700 font-medium'
                                    }`}
                                >
                                    <div className='flex-1 pr-2 min-w-0'>
                                        <div className='flex items-center gap-1.5 mb-0.5'>
                                            <span className='text-[10px] font-bold text-gray-800 bg-[#F3E8DE] px-1.5 py-0.2 rounded border border-[#EADBCE] shrink-0'>
                                                {addr.type === 'Office' ? '🏢 Office' : addr.type === 'Other' ? '📍 Other' : '🏠 Home'}
                                            </span>
                                            <p className='text-xs font-bold line-clamp-1 text-gray-900'>
                                                {addr.street || addr.line1}
                                            </p>
                                        </div>
                                        <p className='text-[11px] text-gray-500 font-medium'>
                                            {[addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-1.5 shrink-0'>
                                        {isSelected ? (
                                            <span className='text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full shadow-2xs'>
                                                ✓ Active
                                            </span>
                                        ) : (
                                            <span className='text-[10px] font-bold text-gray-700 bg-[#F3E8DE] border border-[#EADBCE] px-2 py-0.5 rounded-md hover:bg-[#EADBCE]'>
                                                Select
                                            </span>
                                        )}

                                        {addresses.length > 1 && (
                                            <button
                                                onClick={(e) => handleRemoveAddress(e, addr)}
                                                title="Remove this address"
                                                className='p-1 hover:bg-red-100 text-red-500 rounded-md transition-colors text-xs cursor-pointer'
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Add New Address button or Max limit helper */}
                        {addresses.length >= 2 ? (
                            <div className='p-2.5 bg-amber-50 border-t border-amber-100 text-center space-y-1'>
                                <p className='text-[11px] font-bold text-amber-800'>
                                    ⚠️ Max 2 saved addresses reached.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowAddress(false);
                                        navigate("/address-form");
                                    }}
                                    className='text-[11px] font-extrabold text-purple-700 hover:underline cursor-pointer'
                                >
                                    + Replace / Edit Address →
                                </button>
                            </div>
                        ) : (
                            <p 
                                onClick={() => {
                                    setShowAddress(false);
                                    navigate("/address-form");
                                }} 
                                className='p-3 text-center font-extrabold cursor-pointer bg-[#FDF7F3] text-purple-700 hover:bg-[#F3E8DE] transition-colors border-t border-[#EADBCE] text-xs'
                            >
                                + Add New Address ({addresses.length}/2 Saved)
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Method Selector Grid */}
            <div className='space-y-2.5'>
                <label className='text-xs font-extrabold text-gray-700 uppercase tracking-wider block'>
                    Select Payment Method:
                </label>
                <div className='grid grid-cols-1 gap-2.5'>
                    {/* 1. Cash on Delivery */}
                    <div
                        onClick={() => setMethod("COD")}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                            method === "COD"
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-[#FDF7F3] text-gray-700 border-[#EADBCE] hover:bg-[#F3E8DE]'
                        }`}
                    >
                        <div className='flex items-center gap-3 min-w-0'>
                            <span className={`w-8 h-8 rounded-xl flexCenter text-xs shrink-0 ${method === "COD" ? "bg-white/20 text-white" : "bg-[#F3E8DE] text-gray-800"}`}>🚚</span>
                            <div className='min-w-0'>
                                <h5 className='font-bold text-xs sm:text-sm leading-tight truncate'>Cash on Delivery</h5>
                                <p className={`text-[10px] sm:text-xs truncate ${method === "COD" ? "text-gray-300" : "text-gray-400"}`}>Pay when delivered</p>
                            </div>
                        </div>
                        {method === "COD" && (
                            <span className='text-[10px] font-bold bg-white text-black px-2.5 py-1 rounded-full whitespace-nowrap shrink-0'>
                                ✓ Active
                            </span>
                        )}
                    </div>

                    {/* 2. RazorPay (UPI & Cards) */}
                    <div
                        onClick={() => setMethod("RazorPay")}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                            method === "RazorPay"
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-[#FDF7F3] text-gray-700 border-[#EADBCE] hover:bg-[#F3E8DE]'
                        }`}
                    >
                        <div className='flex items-center gap-3 min-w-0'>
                            <span className={`w-8 h-8 rounded-xl flexCenter text-xs shrink-0 ${method === "RazorPay" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>💳</span>
                            <div className='min-w-0'>
                                <h5 className='font-bold text-xs sm:text-sm leading-tight truncate'>RazorPay (UPI & Cards)</h5>
                                <p className={`text-[10px] sm:text-xs truncate ${method === "RazorPay" ? "text-gray-300" : "text-gray-400"}`}>GPay, PhonePe, Cards</p>
                            </div>
                        </div>
                        {method === "RazorPay" && (
                            <span className='text-[10px] font-bold bg-white text-black px-2.5 py-1 rounded-full whitespace-nowrap shrink-0'>
                                ✓ Active
                            </span>
                        )}
                    </div>

                    {/* 3. Therapique Tokens (Stacked cleanly with zero horizontal overflow) */}
                    <div
                        onClick={() => setMethod("Tokens")}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                            method === "Tokens"
                                ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
                                : 'bg-[#FDF7F3] text-gray-700 border-[#EADBCE] hover:bg-[#F3E8DE]'
                        }`}
                    >
                        <div className='flex items-center gap-3 min-w-0 flex-1'>
                            <TokenCoinSVG className="w-8 h-8 shrink-0 drop-shadow-md" />
                            <div className='min-w-0 flex-1'>
                                <h5 className='font-bold text-xs sm:text-sm leading-tight truncate'>
                                    Therapique Tokens
                                </h5>
                                <div className='flex items-center gap-1.5 mt-0.5'>
                                    <span className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1 truncate ${
                                        method === "Tokens" ? "text-amber-100" : "text-gray-500"
                                    }`}>
                                        <span>Balance:</span>
                                        <span className={`font-black ${method === "Tokens" ? "text-white" : "text-amber-800"}`}>
                                            {Math.round(userData?.therapiqueCoins || 0)}
                                        </span>
                                        <span>Coins</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        {method === "Tokens" && (
                            <span className='text-[10px] sm:text-xs font-extrabold bg-white text-amber-900 px-3 py-1 rounded-full whitespace-nowrap shrink-0 shadow-sm'>
                                ✓ Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Price Calculations */}
            <div className='bg-[#FDF7F3] p-3.5 rounded-2xl border border-[#EADBCE] space-y-2 text-xs text-gray-700'>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>Subtotal Price</span>
                    <span className='font-bold text-gray-800'>{currency}{cartAmt}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>Shipping & Handling</span>
                    <span className='font-bold text-gray-800'>{currency}{cartAmt === 0 ? "0.00" : `${delivery_charges}.00`}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>GST / Tax (2%)</span>
                    <span className='font-bold text-gray-800'>{currency}{(cartAmt * 2) / 100}</span>
                </div>
                <div className='border-t border-[#EADBCE] pt-2.5 flex justify-between items-center text-sm font-extrabold text-gray-900'>
                    <span>Total Amount</span>
                    <span className='text-base text-purple-700'>{currency}{grandTotal}</span>
                </div>
            </div>

            {/* Token Balance Info Banner */}
            {method === 'Tokens' && (
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-center justify-between ${
                    Math.round(userData?.therapiqueCoins || 0) >= Math.round(grandTotal)
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                    <div>
                        <span className='font-extrabold block'>
                            {Math.round(userData?.therapiqueCoins || 0) >= Math.round(grandTotal) ? '✔ Sufficient Token Balance' : '⚠️ Insufficient Tokens Balance'}
                        </span>
                        <span className='text-[11px] sm:text-xs text-gray-600'>
                            Available: <strong>{Math.round(userData?.therapiqueCoins || 0)}</strong> | Remaining: <strong>{Math.max(0, Math.round((userData?.therapiqueCoins || 0) - grandTotal))}</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Main Checkout Action Button */}
            <button 
                onClick={handleOrder} 
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    method === 'Tokens'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-amber-500/20'
                        : 'bg-black hover:bg-gray-800 text-white shadow-sm'
                }`}
            >
                {loading ? (
                    <span>Processing Order...</span>
                ) : method === 'Tokens' ? (
                    <span className='flex items-center gap-2'>
                        <TokenCoinSVG className="w-5 h-5" /> Pay {grandTotal} Tokens
                    </span>
                ) : (
                    <span>Proceed to Place Order ({currency}{grandTotal}) →</span>
                )}
            </button>
        </div>
    );
};

export default CartTotal