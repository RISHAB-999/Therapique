import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'

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
    <form onSubmit={onSubmitHandler} className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <p className="mb-4 text-lg font-semibold">Add Doctor</p>

      <div className="bg-white px-6 sm:px-8 py-8 border rounded-lg w-full max-w-5xl mx-auto max-h-[85vh] overflow-y-auto shadow-sm">
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
              <p className="text-sm">Your name</p>
              <input onChange={e => setName(e.target.value)} value={name}
                className="border rounded px-3 py-2 w-full" type="text" placeholder="Name" required />
            </div>

            <div>
              <p className="text-sm">Doctor Email</p>
              <input onChange={e => setEmail(e.target.value)} value={email}
                className="border rounded px-3 py-2 w-full" type="email" placeholder="Email" required />
            </div>

            <div>
              <p className="text-sm">Set Password</p>
              <input onChange={e => setPassword(e.target.value)} value={password}
                className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" required />
            </div>

            <div>
              <p className="text-sm">Experience</p>
              <select onChange={e => setExperience(e.target.value)} value={experience}
                className="border rounded px-2 py-2 w-full">
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Years</option>
                <option value="3 Year">3 Years</option>
                <option value="4 Year">4 Years</option>
                <option value="5 Year">5 Years</option>
                <option value="6 Year">6 Years</option>
                <option value="8 Year">8 Years</option>
                <option value="9 Year">9 Years</option>
                <option value="10 Year">10 Years</option>
              </select>
            </div>

            <div>
              <p className="text-sm">Fees</p>
              <input onChange={e => setFees(e.target.value)} value={fees}
                className="border rounded px-3 py-2 w-full" type="number" placeholder="Doctor fees" required />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-sm">Speciality</p>
              <select onChange={e => setSpeciality(e.target.value)} value={speciality}
                className="border rounded px-2 py-2 w-full">
                <option value="Clinical Psychologist">Clinical Psychologist</option>
                <option value="Counseling Psychologist">Counseling Psychologist</option>
                <option value="Child & Adolescent Therapist">Child & Adolescent Therapist</option>
                <option value="Marriage & Family Therapist">Marriage & Family Therapist</option>
                <option value="Trauma Therapist">Trauma Therapist</option>
                <option value="Addiction Counselor">Addiction Counselor</option>
                <option value="Cognitive Behavioral Therapist (CBT)">CBT Therapist</option>
                <option value="Art & Music Therapist">Art & Music Therapist</option>
              </select>
            </div>

            <div>
              <p className="text-sm">Degree</p>
              <input onChange={e => setDegree(e.target.value)} value={degree}
                className="border rounded px-3 py-2 w-full" type="text" placeholder="Degree" required />
            </div>

            <div>
              <p className="text-sm">Address</p>
              <input onChange={e => setAddress1(e.target.value)} value={address1}
                className="border rounded px-3 py-2 w-full mb-2" type="text" placeholder="Address 1" required />
              <input onChange={e => setAddress2(e.target.value)} value={address2}
                className="border rounded px-3 py-2 w-full" type="text" placeholder="Address 2" required />
            </div>
          </div>
        </div>

        {/* About Doctor */}
        <div className="mt-6">
          <p className="mb-2 text-sm">About Doctor</p>
          <textarea onChange={e => setAbout(e.target.value)} value={about}
            className="w-full px-4 pt-2 border rounded resize-none" rows={5} placeholder="Write about doctor"></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button type="submit" className="bg-black px-8 py-3 text-white rounded-full hover:bg-black/90 transition">
            Add doctor
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddDoctor
