import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointments = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorData, userData,loadUserProfileData } = useContext(AppContext)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const [docInfo, setDocInfo] = useState(false)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online') // 'online' or 'coins'

  const navigate = useNavigate()

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    setDocSlots([])

    //geting current date
    let today = new Date()

    for (let i = 0; i < 7; i++) {

      //getting date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // setting end time of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const slotTime = formattedTime

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

        if (isSlotAvailable) {

          // Add slot to array
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        // Increment current time by 30 min
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }


  const bookAppointment = async () => {

    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    const date = docSlots[slotIndex][0].datetime

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "_" + month + "_" + year

    try {
      let data;
      
      if (paymentMethod === 'coins') {
        // Book with coins
        const response = await axios.post(backendUrl + '/api/user/book-appointment-coins', 
          { docId, slotDate, slotTime }, 
          { headers: { token } }
        )
        data = response.data
      } else {
        // Book with regular payment
        const response = await axios.post(backendUrl + '/api/user/book-appointment', 
          { docId, slotDate, slotTime }, 
          { headers: { token } }
        )
        data = response.data
      }

      if (data.success) {
        toast.success(data.message)
        getDoctorData()
        loadUserProfileData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])
  return docInfo && (
    <div>
      {/* -------- Doctor Details -------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* -------- Doc Info -------- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality} </p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* -------- Doctor About -------- */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About
              <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
              {docInfo.about}
            </p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/* -------- Booking Slots -------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`flex flex-col items-center justify-center min-w-20 px-4 py-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm
            ${slotIndex === index
                  ? "bg-text text-white shadow-md scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow"
                }`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]} </p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} className={`text-sm flex-shrink-0 px-6 py-2.5 rounded-full cursor-pointer transition-all duration-300
            ${item.time === slotTime
                ? "bg-text text-white shadow-md scale-105"
                : "bg-gray-50 text-gray-600 border border-gray-300 hover:border-gray-400 hover:shadow"
              }`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        {/* Payment Method Selection */}
        {slotTime && (
          <div className='mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Choose Payment Method</h3>
            
            <div className='space-y-3'>
              {/* Online Payment Option */}
              <div 
                onClick={() => setPaymentMethod('online')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'online' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      paymentMethod === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'online' && <div className='w-2 h-2 bg-white rounded-full m-0.5'></div>}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Online Payment</p>
                      <p className='text-sm text-gray-600'>Pay with card/UPI via Razorpay</p>
                    </div>
                  </div>
                  <p className='text-lg font-bold text-gray-900'>{currencySymbol}{docInfo.fees}</p>
                </div>
              </div>

              {/* Therapique Coins Option */}
              <div 
                onClick={() => setPaymentMethod('coins')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'coins' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      paymentMethod === 'coins' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'coins' && <div className='w-2 h-2 bg-white rounded-full m-0.5'></div>}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Therapique Coins</p>
                      <p className='text-sm text-gray-600'>
                        Your therapiqueCoins: {userData.therapiqueCoins} coins
                        {userData.therapiqueCoins < docInfo.fees && (
                          <span className='text-red-500 ml-2'>
                            (Need {docInfo.fees - userData.therapiqueCoins} more)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center'>
                      <svg className="w-5 h-5 text-yellow-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                      </svg>
                      <span className='text-lg font-bold text-gray-900'>{docInfo.fees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insufficient coins warning */}
            {paymentMethod === 'coins' && userData.therapiqueCoins < docInfo.fees && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center'>
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span className='text-red-700 text-sm'>
                    Insufficient coins. 
                    <button 
                      onClick={() => navigate('/coins-shop')} 
                      className='text-red-800 underline ml-1 hover:no-underline'
                    >
                      Buy more coins
                    </button>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {slotTime && (
          <button 
            onClick={bookAppointment} 
            disabled={paymentMethod === 'coins' && userData.therapiqueCoins < docInfo.fees}
            className={`mt-6 px-8 py-3 rounded-full text-white font-semibold text-sm transition duration-300 ${
              paymentMethod === 'coins' && userData.therapiqueCoins < docInfo.fees
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#1c1917] hover:bg-gray-800'
            }`}
          >
            {paymentMethod === 'coins' ? (
              <div className='flex items-center'>
                <svg className="w-4 h-4 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                Book with Coins ({docInfo.fees})
              </div>
            ) : (
              'Book an appointment'
            )}
          </button>
        )}
      </div>
      {/* -------- Listing Related Doctors -------- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointments