import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { coinPackages } from '../data'
import axios from 'axios'
import { loadRazorpay } from '../utils/loadRazorpay'
import AnimatedCounter from '../components/AnimatedCounter'
import TiltCard from '../components/TiltCard'

const getGlowColor = (id) => {
  switch (id) {
    case 'basic':
      return 'rgba(59, 130, 246, 0.45)';
    case 'standard':
      return 'rgba(34, 197, 94, 0.45)';
    case 'premium':
      return 'rgba(168, 85, 247, 0.45)';
    case 'mega':
      return 'rgba(249, 115, 22, 0.45)';
    default:
      return 'rgba(255, 255, 255, 0.45)';
  }
};

const CoinsShop = () => {
  const { currencySymbol, backendUrl, token, loadUserProfileData, userData } = useContext(AppContext)
  const [loading, setLoading] = useState('')

  // Coin packages with pricing and bonus
  const handlePurchase = async (packageId) => {
    setLoading(packageId)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/purchase-coins',
        { coinPackage: packageId },
        { headers: { token } }
      )
      if (data.success) {
        // Initialize Razorpay payment
        initCoinsPay(data.order, data.packageData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading('')
    }
  }

  // Function to initialize Razorpay Payment for coins
  const initCoinsPay = async (order, packageData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Therapique Coins',
      description: `Purchase ${packageData.totalCoins} Therapique Coins`,
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verify-coins-payment", response, { headers: { token } });
          if (data.success) {
            toast.success(data.message)
            loadUserProfileData() // Refresh coins data
          } else {
            toast.error("Payment verification failed")
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled")
        }
      },
      theme: {
        color: "#F59E0B"
      }
    };
    try {
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment service failed to load. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Therapique Coins Shop</h1>
          <p className="text-sm sm:text-lg text-gray-600 mb-8">Purchase coins to book appointments with our therapists</p>

          {/* Current Balance */}
          <div className="bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl shadow-[0_4px_24px_rgba(70,56,48,0.05)] p-6 max-w-md mx-auto mb-8">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Current Balance</p>
              <div className="flex items-center justify-center mt-2">
                <div className="bg-yellow-100 p-2 rounded-full mr-3 border border-yellow-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                    <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                    <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={userData?.therapiqueCoins || 0} />
                </span>
                <span className="text-base text-gray-500 ml-2 font-medium">coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {coinPackages.map((pkg) => (
            <TiltCard 
              key={pkg.id} 
              isPopular={pkg.popular}
              glowColor={getGlowColor(pkg.id)}
              className={`relative rounded-3xl border-2 p-6 transition-all duration-300 cursor-pointer shadow-sm ${pkg.color}`}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">{pkg.coins}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Base Coins</div>
                  {pkg.bonus > 0 && (
                    <div className="mt-1">
                      <span className="text-green-700 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-200">+ {pkg.bonus} Bonus</span>
                    </div>
                  )}
                  <div className="text-sm font-bold text-gray-700 mt-2">
                    Total: {pkg.coins + pkg.bonus} coins
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {currencySymbol}{pkg.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currencySymbol}{(pkg.price / (pkg.coins + pkg.bonus)).toFixed(2)} per coin
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full px-4 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm transition-all shadow-md ${pkg.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === pkg.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                      Buy Now
                    </div>
                  )}
                </button>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl shadow-[0_4px_24px_rgba(70,56,48,0.04)] p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Why Use Therapique Coins?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#FDF7F3] rounded-2xl border border-[#EADBCE]">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3 border border-blue-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Instant Booking</h3>
              <p className="text-xs text-gray-600">Book appointments instantly without payment processing delays</p>
            </div>
            <div className="text-center p-4 bg-[#FDF7F3] rounded-2xl border border-[#EADBCE]">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3 border border-green-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                  <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                  <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Bonus Coins</h3>
              <p className="text-xs text-gray-600">Get bonus coins with larger packages for extra value</p>
            </div>
            <div className="text-center p-4 bg-[#FDF7F3] rounded-2xl border border-[#EADBCE]">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3 border border-purple-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Secure & Easy</h3>
              <p className="text-xs text-gray-600">Secure transactions with easy coin management</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {userData?.coinsTransactions && userData.coinsTransactions.length > 0 && (
          <div className="bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl shadow-[0_4px_24px_rgba(70,56,48,0.04)] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Transactions & Refund History</h2>
            <div className="space-y-3">
              {[...userData.coinsTransactions].reverse().slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 sm:p-4 bg-[#FDF7F3] rounded-2xl border border-[#EADBCE]">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3.5 bg-green-100 border border-green-200`}>
                      <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-gray-900">{transaction.description}</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-extrabold ${
                    transaction.type === 'purchase' || transaction.type === 'earn' ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {transaction.type === 'purchase' || transaction.type === 'earn' ? '+' : '-'}{transaction.amount} Tokens
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoinsShop
