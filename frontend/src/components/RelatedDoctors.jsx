import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const RelatedDoctors = ({ speciality, docId }) => {
    const { doctors, token } = useContext(AppContext)
    const navigate = useNavigate()
    const [relDoc, setRelDocs] = useState([])

    useEffect(() => {
        if (doctors.length > 0) {
            let doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId && doc.available)
            if (doctorsData.length === 0) {
                doctorsData = doctors.filter((doc) => doc._id !== docId && doc.available)
            }
            if (doctorsData.length === 0) {
                doctorsData = doctors.filter((doc) => doc._id !== docId)
            }
            setRelDocs(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-14 text-gray-900 md:mx-10'>
            <h2 className='text-2xl sm:text-3xl font-medium text-center'>Top Doctors to Book</h2>
            <p className='text-center text-xs sm:text-sm text-gray-500 max-w-md px-4'>
                Simply browse through our extensive list of trusted doctors.
            </p>

            {/* Horizontal Scroll on Mobile, Grid on Tablet/Desktop */}
            <div className='w-full flex sm:grid sm:grid-cols-auto gap-4 pt-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 px-4 sm:px-0 scrollbar-none snap-x snap-mandatory'>
                {relDoc.slice(0, 8).map((item, index) => (
                    <div
                        onClick={() => {
                            if (!token) {
                                toast.info('Please log in or create an account to book an appointment with a doctor')
                                navigate('/login', { state: { message: 'Please log in or create an account to book an appointment with a doctor', context: 'doctor' } })
                            } else {
                                navigate(`/appointment/${item._id}`)
                                scrollTo(0, 0)
                            }
                        }}
                        className='shrink-0 w-52 sm:w-auto snap-start bg-[#FAF5EE] border border-blue-100/80 rounded-2xl overflow-hidden cursor-pointer hover:translate-y-[-6px] hover:shadow-lg transition-all duration-300'
                        key={index}
                    >
                        <div className='w-full h-52 sm:h-56 bg-blue-50/60 overflow-hidden flex items-center justify-center'>
                            <img className='w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300' src={item.image} alt={item.name} />
                        </div>
                        <div className='p-3.5 sm:p-4'>
                            <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${item.available ? 'text-green-600' : 'text-slate-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                                <span>{item.available ? 'Available' : 'Unavailable'}</span>
                            </div>
                            <p className='text-gray-900 text-sm sm:text-base font-bold truncate'>{item.name}</p>
                            <p className='text-gray-500 text-xs truncate mt-0.5'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='bg-blue-50 hover:bg-blue-100 text-gray-700 font-medium px-10 py-2.5 rounded-full text-xs sm:text-sm mt-6 transition-colors'
            >
                View More Doctors →
            </button>
        </div>
    )
}

export default RelatedDoctors