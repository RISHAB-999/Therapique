import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { coinPackages } from '../data'
import axios from 'axios'
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
  const initCoinsPay = (order, packageData) => {
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
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Therapique Coins Shop</h1>
          <p className="text-xl text-gray-600 mb-8">Purchase coins to book appointments with our therapists</p>

          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">Current Balance</p>
              <div className="flex items-center justify-center mt-2">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                    <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                    <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">{userData.therapiqueCoins}</span>
                <span className="text-lg text-gray-500 ml-2">coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {coinPackages.map((pkg) => (
            <div key={pkg.id} className={`relative rounded-xl border-2 p-6 ${pkg.color} ${pkg.popular ? 'transform scale-105' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">{pkg.coins}</div>
                  <div className="text-sm text-gray-600">Base Coins</div>
                  {pkg.bonus > 0 && (
                    <div className="mt-1">
                      <span className="text-green-600 font-semibold">+ {pkg.bonus} Bonus</span>
                    </div>
                  )}
                  <div className="text-lg font-semibold text-gray-700 mt-2">
                    Total: {pkg.coins + pkg.bonus} coins
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {currencySymbol}{pkg.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currencySymbol}{(pkg.price / (pkg.coins + pkg.bonus)).toFixed(2)} per coin
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full px-4 py-2 rounded-lg text-white font-semibold transition-colors ${pkg.button} disabled:opacity-50 disabled:cursor-not-allowed`}
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
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use Therapique Coins?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600">Book appointments instantly without payment processing delays</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                  <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
                  <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bonus Coins</h3>
              <p className="text-gray-600">Get bonus coins with larger packages for extra value</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Easy</h3>
              <p className="text-gray-600">Secure transactions with easy coin management</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {userData.coinsTransactions && userData.coinsTransactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {userData.coinsTransactions.reverse().slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 bg-green-100`}>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${transaction.type === 'purchase' ? 'text-green-600' :
                    transaction.type === 'spend' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {transaction.type === 'purchase' ? '+' : transaction.type === 'spend' ? '-' : ''}{transaction.amount}
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
