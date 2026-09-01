import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import CustomDropdown from '../../components/ui/CustomDropdown'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { backendUrl, aToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (!docImg) return toast.error('Image Not Selected')

      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })
      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setPassword('')
        setEmail('')
        setExperience('1 Year')
        setFees('')
        setAbout('')
        setSpeciality('Clinical Psychologist')
        setDegree('')
        setAddress1('')
        setAddress2('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="border-b border-slate-200/80 pb-3">
        <h1 className='text-xl sm:text-2xl font-black text-gray-800 tracking-tight'>Add Doctor</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">Register a new therapist or medical specialist to the platform</p>
      </div>

      <div className="bg-white p-6 sm:p-8 border border-slate-200/80 rounded-3xl w-full shadow-xs">
        {/* Upload */}
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="w-16 h-16 object-cover bg-gray-100 rounded-full"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="upload"
            />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        {/* Two Columns (responsive) */}
        <div className="flex flex-col lg:flex-row gap-8 text-gray-700">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Your Name</p>
              <input onChange={e => setName(e.target.value)} value={name}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="text" placeholder="Dr. Full Name" required />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Doctor Email</p>
              <input onChange={e => setEmail(e.target.value)} value={email}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="email" placeholder="doctor@therapique.com" required />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Set Password</p>
              <input onChange={e => setPassword(e.target.value)} value={password}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="password" placeholder="Min. 8 characters" required />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Experience</p>
              <CustomDropdown
                value={experience}
                onChange={setExperience}
                options={[
                  '1 Year', '2 Years', '3 Years', '4 Years', '5 Years',
                  '6 Years', '8 Years', '9 Years', '10 Years'
                ]}
                minWidth="w-full"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Consultation Fees</p>
              <input onChange={e => setFees(e.target.value)} value={fees}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="number" placeholder="Consultation fee amount" required />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Speciality</p>
              <CustomDropdown
                value={speciality}
                onChange={setSpeciality}
                options={[
                  'Clinical Psychologist',
                  'Counseling Psychologist',
                  'Child & Adolescent Therapist',
                  'Marriage & Family Therapist',
                  'Trauma Therapist',
                  'Addiction Counselor',
                  'Cognitive Behavioral Therapist (CBT)',
                  'Art & Music Therapist'
                ]}
                minWidth="w-full"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Degree / Qualifications</p>
              <input onChange={e => setDegree(e.target.value)} value={degree}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="text" placeholder="e.g. M.Phil in Clinical Psychology" required />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 mb-1.5">Clinic / Practice Address</p>
              <input onChange={e => setAddress1(e.target.value)} value={address1}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs mb-2" type="text" placeholder="Address Line 1" required />
              <input onChange={e => setAddress2(e.target.value)} value={address2}
                className="w-full h-10 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs" type="text" placeholder="Address Line 2" required />
            </div>
          </div>
        </div>

        {/* About Doctor */}
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-700 mb-1.5">Clinical Biography & Philosophy</p>
          <textarea onChange={e => setAbout(e.target.value)} value={about}
            className="w-full p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs resize-none leading-relaxed" rows={4} placeholder="Write a summary of the doctor's clinical background, treatment modalities, and therapeutic approach..."></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button type="submit" className="px-8 py-3 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs hover:shadow transition active:scale-95 cursor-pointer">
            Register Doctor
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddDoctor
