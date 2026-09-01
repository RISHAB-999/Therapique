import React from 'react'
import { TbArrowBackUp, TbTruckDelivery } from 'react-icons/tb'
import { RiSecurePaymentLine } from 'react-icons/ri'

const ProductFeatures = () => {
    return (
        <div className='mt-10 bg-[#FAF5EE] p-5 sm:p-7 rounded-3xl border border-[#EADBCE] shadow-[0_4px_24px_rgba(70,56,48,0.04)]'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                <div className='flex items-start gap-x-4 p-4 sm:p-5 rounded-2xl bg-[#FDF7F3] border border-[#EADBCE] shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-2xl sm:text-3xl shrink-0 p-3 bg-[#F3E8DE] rounded-2xl text-yellow-700 border border-[#EADBCE]'>
                        <TbArrowBackUp />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-sm sm:text-base mb-1 capitalize'>Easy Return</h4>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                            Hassle-free 7-day return policy. Easily exchange or return any book if you're not 100% satisfied.
                        </p>
                    </div>
                </div>

                <div className='flex items-start gap-x-4 p-4 sm:p-5 rounded-2xl bg-[#FDF7F3] border border-[#EADBCE] shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-2xl sm:text-3xl shrink-0 p-3 bg-[#F3E8DE] rounded-2xl text-red-600 border border-[#EADBCE]'>
                        <TbTruckDelivery />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-sm sm:text-base mb-1 capitalize'>Fast Delivery</h4>
                        <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                            Swift dispatch within 24 hours. Express shipping with live step-by-step order tracking.
                        </p>
                    </div>
                </div>

                <div className='flex items-start gap-x-4 p-4 sm:p-5 rounded-2xl bg-[#FDF7F3] border border-[#EADBCE] shadow-xs hover:shadow-md transition-all duration-300'>
                    <div className='text-2xl sm:text-3xl shrink-0 p-3 bg-[#F3E8DE] rounded-2xl text-blue-600 border border-[#EADBCE]'>
                        <RiSecurePaymentLine />
                    </div>
                    <div>
                        <h4 className='font-bold text-gray-900 text-sm sm:text-base mb-1 capitalize'>Secure Payment</h4>
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