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

const CartTotal = () => {
    const { navigate, books, currency, cartItems, setCartItems, method, setMethod, getCartAmount, getCartCount, getBookPriceWithFormat, delivery_charges, backendUrl } = useContext(ShopContext)
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
        if (saved && saved.length > 0) {
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
            initialList = [profileAddr, dummyAddress[0]]
        } else {
            initialList = dummyAddress.slice(0, 2)
        }

        // Keep strictly unique & max 2 saved addresses
        const uniqueAddresses = initialList.filter((addr, index, self) => 
            index === self.findIndex((a) => (a.street || a.line1) === (addr.street || addr.line1))
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
            const item = books.find(b => b._id === itemId);
            const fmtName = format || 'Standard Paperback';
            const unitPrice = getBookPriceWithFormat ? getBookPriceWithFormat(item, fmtName) : item?.offerPrice;

            return {
                _id: itemId,
                name: `${item?.name || 'Book'} (${fmtName})`,
                price: unitPrice,
                quantity: qty,
                image: item?.image
            };
        });

        const totalAmount = getCartAmount() + delivery_charges + (getCartAmount() * 2) / 100;
        const activeAddr = selectedaddress || addresses[0] || dummyAddress[0];

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

    const grandTotal = Math.round(getCartAmount() > 0 ? getCartAmount() + delivery_charges + (getCartAmount() * 2) / 100 : 0);
    const activeAddressDisplay = selectedaddress || addresses[0];

    const formattedAddressStr = activeAddressDisplay
        ? [activeAddressDisplay.street || activeAddressDisplay.line1, activeAddressDisplay.city, activeAddressDisplay.state, activeAddressDisplay.country].filter(Boolean).join(', ')
        : "45, Block A, Vasant Kunj, New Delhi, Delhi, India";

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-slate-200/80 pb-3'>
                <h3 className='text-lg font-black text-gray-800 tracking-tight'>
                    Order Details
                </h3>
                <span className='text-xs font-extrabold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full'>
                    {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
                </span>
            </div>

            {/* Shipping Address Selector */}
            <div className='bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 relative'>
                <div className='flex items-center justify-between mb-1'>
                    <h4 className='text-xs font-extrabold text-gray-700 uppercase tracking-wider'>Where to ship your order?</h4>
                    <button 
                        onClick={() => setShowAddress(!showAddress)} 
                        className='text-purple-600 text-xs font-extrabold hover:underline cursor-pointer flex items-center gap-1'
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
                    <div className='absolute top-full left-0 right-0 mt-2 bg-white ring-1 ring-slate-900/10 text-xs shadow-2xl rounded-2xl z-30 overflow-hidden border border-purple-100'>
                        <div className='p-2 bg-purple-50/60 border-b border-purple-100 text-[11px] font-extrabold text-purple-700 flex items-center justify-between'>
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
                                    className={`p-3 cursor-pointer flex items-center justify-between border-b border-slate-100 transition-colors ${
                                        isSelected 
                                            ? 'bg-purple-50 text-purple-800 font-extrabold border-l-4 border-l-purple-600' 
                                            : 'hover:bg-slate-50 text-gray-700 font-medium'
                                    }`}
                                >
                                    <div className='flex-1 pr-2 min-w-0'>
                                        <div className='flex items-center gap-1.5 mb-0.5'>
                                            <span className='text-[10px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded border border-purple-200 shrink-0'>
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
                                            <span className='text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-2xs'>
                                                ✓ Active
                                            </span>
                                        ) : (
                                            <span className='text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md hover:bg-purple-200'>
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
                                className='p-3 text-center font-extrabold cursor-pointer bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border-t border-purple-100 text-xs'
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
                <div className='grid grid-cols-1 gap-2'>
                    {/* 1. Cash on Delivery */}
                    <div
                        onClick={() => setMethod("COD")}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            method === "COD"
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                                : 'bg-white text-gray-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                    >
                        <div className='flex items-center gap-2.5'>
                            <span className={`w-7 h-7 rounded-lg flexCenter text-xs ${method === "COD" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"}`}>🚚</span>
                            <div>
                                <h5 className='font-bold text-xs leading-tight'>Cash on Delivery</h5>
                                <p className={`text-[10px] ${method === "COD" ? "text-purple-100" : "text-gray-400"}`}>Pay when delivered</p>
                            </div>
                        </div>
                        {method === "COD" && <span className='text-[10px] font-black bg-white text-purple-600 px-2 py-0.5 rounded-full'>✓ Active</span>}
                    </div>

                    {/* 2. RazorPay (UPI & Cards) */}
                    <div
                        onClick={() => setMethod("RazorPay")}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            method === "RazorPay"
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                                : 'bg-white text-gray-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                    >
                        <div className='flex items-center gap-2.5'>
                            <span className={`w-7 h-7 rounded-lg flexCenter text-xs ${method === "RazorPay" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>💳</span>
                            <div>
                                <h5 className='font-bold text-xs leading-tight'>RazorPay (UPI & Cards)</h5>
                                <p className={`text-[10px] ${method === "RazorPay" ? "text-purple-100" : "text-gray-400"}`}>GPay, PhonePe, Cards</p>
                            </div>
                        </div>
                        {method === "RazorPay" && <span className='text-[10px] font-black bg-white text-purple-600 px-2 py-0.5 rounded-full'>✓ Active</span>}
                    </div>

                    {/* 3. Therapique Tokens */}
                    <div
                        onClick={() => setMethod("Tokens")}
                        className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            method === "Tokens"
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-200'
                                : 'bg-white text-gray-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                    >
                        <div className='flex items-center gap-2.5'>
                            <TokenCoinSVG className="w-7 h-7 shrink-0 drop-shadow-xs" />
                            <div>
                                <div className='flex items-center gap-1.5'>
                                    <h5 className='font-bold text-xs leading-tight'>Therapique Tokens</h5>
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${method === "Tokens" ? "bg-amber-700/60 text-white" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
                                        <TokenCoinSVG className="w-3.5 h-3.5" />
                                        <span>{Math.round(userData?.therapiqueCoins || 0)}</span>
                                    </span>
                                </div>
                                <p className={`text-[10px] ${method === "Tokens" ? "text-amber-100" : "text-gray-400"}`}>Pay with coin balance</p>
                            </div>
                        </div>
                        {method === "Tokens" && <span className='text-[10px] font-black bg-white text-amber-700 px-2 py-0.5 rounded-full shadow-xs'>✓ Active</span>}
                    </div>
                </div>
            </div>

            {/* Price Calculations */}
            <div className='bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-gray-700'>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>Subtotal Price</span>
                    <span className='font-bold text-gray-800'>{currency}{getCartAmount()}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>Shipping & Handling</span>
                    <span className='font-bold text-gray-800'>{currency}{getCartAmount() === 0 ? "0.00" : `${delivery_charges}.00`}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='font-medium'>GST / Tax (2%)</span>
                    <span className='font-bold text-gray-800'>{currency}{(getCartAmount() * 2) / 100}</span>
                </div>
                <div className='border-t border-slate-200 pt-2.5 flex justify-between items-center text-sm font-extrabold text-gray-900'>
                    <span>Total Amount</span>
                    <span className='text-base text-purple-700'>{currency}{grandTotal}</span>
                </div>
            </div>

            {/* Token Balance Info Banner */}
            {method === 'Tokens' && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-center justify-between ${
                    Math.round(userData?.therapiqueCoins || 0) >= Math.round(grandTotal)
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                    <div>
                        <span className='font-extrabold block'>
                            {Math.round(userData?.therapiqueCoins || 0) >= Math.round(grandTotal) ? '✔ Sufficient Token Balance' : '⚠️ Insufficient Tokens Balance'}
                        </span>
                        <span>
                            Available: <strong>{Math.round(userData?.therapiqueCoins || 0)}</strong> | Remaining after order: <strong>{Math.max(0, Math.round((userData?.therapiqueCoins || 0) - grandTotal))}</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Main Checkout Action Button */}
            <button 
                onClick={handleOrder} 
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    method === 'Tokens'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
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