import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import ImageCropperModal from '../../components/ImageCropperModal'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
  const { currency, backendUrl } = useContext(AppContext)
  
  const [isEdit, setIsEdit] = useState(false)
  const [docImg, setDocImg] = useState(false)
  const [rawImgFile, setRawImgFile] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRawImgFile(e.target.files[0])
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedFile) => {
    setDocImg(croppedFile)
    setShowCropper(false)
    setIsEdit(true)
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      const formData = new FormData()
      
      formData.append('fees', profileData.fees)
      formData.append('about', profileData.about)
      formData.append('available', profileData.available)
      formData.append('address', JSON.stringify(profileData.address))

      if (docImg) {
        formData.append('image', docImg)
      }

      const { data } = await axios.post(
        backendUrl + '/api/doctor/update-profile', 
        formData, 
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        setDocImg(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  if (!profileData) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8 w-full'>
        <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-500 font-semibold text-sm'>Loading Profile Details...</p>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full max-w-[1400px] mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">Doctor Profile</h1>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">
            Manage your practice credentials, consultation fee, biography, and profile photo
          </p>
        </div>
        
        {/* Availability Status Badge */}
        <div className={`self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border shrink-0 ${
          profileData.available 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${profileData.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{profileData.available ? 'Available for Consultations' : 'Currently Unavailable'}</span>
        </div>
      </div>

      {/* Main Profile Card Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* Left Column (4 Cols): Avatar Photo & Doctor Info Badge */}
        <div className="lg:col-span-4 p-5 sm:p-8 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col items-center justify-center text-center space-y-5">
          <div className="relative group w-44 h-44 sm:w-56 sm:h-56">
            {/* Avatar Image Box */}
            <label 
              htmlFor="doc-img-input"
              className="w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-purple-50 flex items-center justify-center relative cursor-pointer block"
            >
              <img
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                src={docImg ? URL.createObjectURL(docImg) : profileData.image}
                alt={profileData.name}
              />

              {/* Camera Upload Overlay Matching Pic 1 */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-3 sm:p-4 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-1.5 sm:mb-2 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[11px] sm:text-xs font-extrabold tracking-wide">Change & Crop Photo</span>
                <span className="text-[9px] sm:text-[10px] text-purple-200 mt-0.5 font-medium">Click to adjust & crop photo</span>
              </div>
            </label>

            {/* Hidden File Input */}
            <input
              onChange={handleFileSelect}
              type="file"
              id="doc-img-input"
              accept="image/*"
              hidden
            />
          </div>

          {/* Quick Change Photo Action Button */}
          <label 
            htmlFor="doc-img-input"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Change & Crop Profile Picture</span>
          </label>

          {/* Doctor Info Pills */}
          <div className="space-y-2 w-full max-w-xs">
            <h2 className="text-lg sm:text-2xl font-black text-gray-800 tracking-tight">
              {profileData.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                {profileData.degree} — {profileData.speciality}
              </span>
            </div>
            <div className="pt-1">
              <span className="text-[11px] sm:text-xs font-bold text-gray-600 bg-slate-200/70 px-3 py-1 rounded-lg inline-block">
                🎓 {profileData.experience} Experience
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (8 Cols): Structured Bio, Fee, Address & Actions */}
        <div className="lg:col-span-8 p-5 sm:p-8 space-y-5 sm:space-y-6 flex flex-col justify-between">
          <div className="space-y-5 sm:space-y-6">
            
            {/* Clinical Biography */}
            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-purple-700 block">
                Clinical Biography & Practice Philosophy
              </label>
              {isEdit ? (
                <textarea
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                  className="w-full text-xs sm:text-sm font-medium text-gray-800 bg-slate-50 border border-purple-200 rounded-2xl p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-purple-600/30 transition-all resize-none leading-relaxed"
                  rows={4}
                  value={profileData.about || ''}
                  placeholder="Describe your therapy approach, clinical experience, and patient care focus..."
                />
              ) : (
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-purple-50/30 p-3.5 sm:p-4 rounded-2xl border border-purple-100/60">
                  {profileData.about || 'No biography details provided.'}
                </p>
              )}
            </div>

            {/* Fees & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Consultation Fee */}
              <div className="bg-purple-50/50 p-4 sm:p-5 rounded-2xl border border-purple-100/80 space-y-2">
                <label className="text-[10px] sm:text-[11px] font-extrabold text-purple-700 uppercase tracking-wider block">
                  Consultation Fee
                </label>
                {isEdit ? (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-sm sm:text-base font-extrabold text-purple-700">{currency}</span>
                    <input
                      type="number"
                      onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                      className="w-full text-sm sm:text-base font-extrabold text-gray-800 focus:outline-none"
                      value={profileData.fees || ''}
                    />
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-gray-800">{currency} {profileData.fees}</span>
                    <span className="text-xs font-semibold text-gray-400">/ session</span>
                  </div>
                )}
              </div>

              {/* Clinic Address */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider block">
                  Clinic / Practice Address
                </label>
                {isEdit ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                      className="w-full text-xs font-semibold text-gray-800 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                      value={profileData.address?.line1 || ''}
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                      className="w-full text-xs font-semibold text-gray-800 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                      value={profileData.address?.line2 || ''}
                      placeholder="City, State & Pincode"
                    />
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-gray-700 leading-relaxed">
                    <p className="font-bold text-gray-900">{profileData.address?.line1 || 'Street Address'}</p>
                    <p className="text-gray-500">{profileData.address?.line2 || 'City, State'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Toggle Checkbox */}
            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <input
                type="checkbox"
                id="availability-check"
                disabled={!isEdit}
                onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                checked={profileData.available}
                className="w-4 h-4 sm:w-5 sm:h-5 accent-purple-600 rounded cursor-pointer shrink-0"
              />
              <label htmlFor="availability-check" className="text-xs font-extrabold text-gray-800 cursor-pointer">
                Available for Receiving Patient Bookings
              </label>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            {isEdit ? (
              <>
                <button
                  onClick={() => {
                    setIsEdit(false)
                    setDocImg(false)
                    getProfileData()
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-gray-600 hover:bg-slate-100 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 shadow-md hover:shadow-lg transition cursor-pointer text-center disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 shadow-md hover:shadow-lg transition cursor-pointer text-center"
              >
                Edit Practice Profile
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropper}
        imageFile={rawImgFile}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}

export default DoctorProfile