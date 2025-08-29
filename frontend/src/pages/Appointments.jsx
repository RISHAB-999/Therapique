import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'

const Appointments = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol } = useContext(AppContext)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    setDocSlots([])

    let today = new Date()

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

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
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        })
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots(prev => ([...prev, timeSlots]))
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  return docInfo && (
    <div className="p-4">
      <section className="py-16 px-4 text-center font-sans">
        {/* Subtitle */}
        <p className="text-gray-600 text-sm mb-4">
          {docInfo.speciality}
        </p>

        {/* Name + Title */}
        <h1 className="text-5xl md:text-6xl font-serif text-gray-900 font-normal">
          {docInfo.name}
          <h3 className="ml-2 text-2xl py-2 font-serif font-normal text-gray-900">
            {docInfo.degree}
          </h3>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
          {docInfo.about}
        </p>

        {/* -------- Booking Slots -------- */}
        <div className="w-full flex justify-center mt-8">
          <div className="w-full max-w-2xl font-medium text-gray-800 text-center">
            <h3 className="text-xl font-serif mb-4">Booking Slots</h3>

            {/* Date Slots */}
            <div className="flex gap-4 items-center justify-center w-full overflow-x-auto hide-scrollbar pb-2">
              {docSlots.length > 0 &&
                docSlots.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setSlotIndex(index)}
                    className={`flex flex-col items-center justify-center min-w-20 px-4 py-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm
            ${slotIndex === index
                        ? "bg-text text-white shadow-md scale-105"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow"
                      }`}
                  >
                    <p className="font-semibold">
                      {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                    </p>
                    <p className="text-sm mt-1">
                      {item[0] && item[0].datetime.getDate()}
                    </p>
                  </div>
                ))}
            </div>

            {/* Time Slots */}
            <div className="flex items-center justify-center gap-3 w-full overflow-x-auto hide-scrollbar mt-6 pb-2">
              {docSlots.length > 0 &&
                docSlots[slotIndex].map((item, index) => (
                  <p
                    key={index}
                    onClick={() => setSlotTime(item.time)}
                    className={`text-sm flex-shrink-0 px-6 py-2.5 rounded-full cursor-pointer transition-all duration-300
            ${item.time === slotTime
                        ? "bg-text text-white shadow-md scale-105"
                        : "bg-gray-50 text-gray-600 border border-gray-300 hover:border-gray-400 hover:shadow"
                      }`}
                  >
                    {item.time.toLowerCase()}
                  </p>
                ))}
            </div>

            {/* Button */}
            <button className="mt-6 px-8 py-3 rounded-full bg-[#1c1917] text-white font-semibold text-sm hover:bg-gray-800 transition duration-300">
              Book an appointment
            </button>
          </div>
        </div>


        {/* Button */}
        {/* <div className="mt-8">
          <button className="px-8 py-3 rounded-full bg-[#1c1917] text-white font-semibold text-sm hover:bg-gray-800 transition duration-300">
            Book a consultation
          </button>
        </div> */}
      </section>
      <div className="flex justify-center items-center">
        <img
          src={docInfo.image} // replace with your doctor image
          alt="Doctor"
          className="rounded-2xl w-[500px] object-cover shadow-md bg-secondary"
        />
      </div>
      {/* -------- Doctor Details -------- */}
      {/* <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

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
      </div> */}


      {/* -------- Credentials, Modalities, Areas of Focus -------- */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">

          {/* Credentials */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6">
            <h2 className="text-xl font-serif mb-3">Credentials</h2>

            {docInfo.credential &&
              Object.values(docInfo.credential)
                .filter((line) => line && line.trim() !== "") // ✅ ignore empty/null lines
                .map((line, index) => (
                  <p key={index} className="text-gray-700 mt-1">
                    {line}
                  </p>
                ))}
          </div>

          {/* Modalities */}
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <h2 className="text-xl font-serif mb-3">Modalities</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {docInfo.modalities &&
                Object.values(docInfo.modalities)
                  .filter((line) => line && line.trim() !== "") // ✅ ignore empty/null lines
                  .map((line, index) => (
                    <li key={index} className="text-gray-700 mt-1">
                      {line}
                    </li>
                  ))}
            </ul>
          </div>

          {/* Areas of Focus */}
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <h2 className="text-xl font-serif mb-3">Areas of Focus</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {docInfo.areaoffocus &&
                Object.values(docInfo.areaoffocus)
                  .filter((line) => line && line.trim() !== "") // ✅ ignore empty/null lines
                  .map((line, index) => (
                    <li key={index} className="text-gray-700 mt-1">
                      {line}
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>

      {/* -------- Related Doctors -------- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointments
