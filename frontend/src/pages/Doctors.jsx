import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorItemCard from '../components/DoctorItemCard'

const Doctors = () => {

  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const navigate = useNavigate()

  const { doctors } = useContext(AppContext)
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div className='my-10'>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm  transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p
            onClick={() => speciality === 'Clinical Psychologist' ? navigate('/doctors') : navigate('/doctors/Clinical Psychologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Clinical Psychologist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Clinical Psychologist
          </p>
          <p
            onClick={() => speciality === 'Counseling Psychologist' ? navigate('/doctors') : navigate('/doctors/Counseling Psychologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Counseling Psychologist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Counseling Psychologist
          </p>
          <p
            onClick={() => speciality === 'Child & Adolescent Therapist' ? navigate('/doctors') : navigate('/doctors/Child & Adolescent Therapist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Child & Adolescent Therapist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Child & Adolescent Therapist
          </p>
          <p
            onClick={() => speciality === 'Marriage & Family Therapist' ? navigate('/doctors') : navigate('/doctors/Marriage & Family Therapist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Marriage & Family Therapist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Marriage & Family Therapist
          </p>
          <p
            onClick={() => speciality === 'Trauma Therapist' ? navigate('/doctors') : navigate('/doctors/Trauma Therapist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Trauma Therapist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Trauma Therapist
          </p>
          <p
            onClick={() => speciality === 'Addiction Counselor' ? navigate('/doctors') : navigate('/doctors/Addiction Counselor')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Addiction Counselor' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Addiction Counselor
          </p>
          <p
            onClick={() => speciality === 'Cognitive Behavioral Therapist (CBT)' ? navigate('/doctors') : navigate('/doctors/Cognitive Behavioral Therapist (CBT)')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Cognitive Behavioral Therapist (CBT)' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Cognitive Behavioral Therapist (CBT)
          </p>
          <p
            onClick={() => speciality === 'Art & Music Therapist' ? navigate('/doctors') : navigate('/doctors/Art & Music Therapist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Art & Music Therapist' ? 'bg-[#E2E5FF] text-black' : ''}`}
          >
            Art & Music Therapist
          </p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => (
            <DoctorItemCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Doctors