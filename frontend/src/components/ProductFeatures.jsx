import React from 'react'
import { TbArrowBackUp, TbTruckDelivery } from 'react-icons/tb'
import { RiSecurePaymentLine } from 'react-icons/ri'

const ProductFeatures = () => {
    return (
        <div className='mt-12 bg-blue-50/70 p-6 rounded-2xl border border-blue-100/80 shadow-sm'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
                <div className='flex items-start gap-x-4 p-4 rounded-xl bg-white/80 border border-blue-100/50 shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-3xl shrink-0 p-3 bg-yellow-50 rounded-xl text-yellow-600'>
                        <TbArrowBackUp />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-800 text-base mb-1 capitalize'>Easy Return</h4>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                            Hassle-free 7-day return policy. Easily exchange or return any book if you're not 100% satisfied.
                        </p>
                    </div>
                </div>

                <div className='flex items-start gap-x-4 p-4 rounded-xl bg-white/80 border border-blue-100/50 shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-3xl shrink-0 p-3 bg-red-50 rounded-xl text-red-500'>
                        <TbTruckDelivery />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-800 text-base mb-1 capitalize'>Fast Delivery</h4>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                            Swift dispatch within 24 hours. Express shipping with live step-by-step order tracking.
                        </p>
                    </div>
                </div>

                <div className='flex items-start gap-x-4 p-4 rounded-xl bg-white/80 border border-blue-100/50 shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-3xl shrink-0 p-3 bg-blue-50 rounded-xl text-blue-600'>
                        <RiSecurePaymentLine />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-800 text-base mb-1 capitalize'>Secure Payment</h4>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                            100% encrypted & secure payments via Razorpay, UPI, cards, and Cash on Delivery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductFeatures