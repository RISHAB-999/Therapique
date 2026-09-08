import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import ImageCropperModal from '../components/ImageCropperModal'
import CustomDropdown from '../components/ui/CustomDropdown'
import DateInput from '../components/ui/DateInput'

const MyProfile = () => {
    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [rawImgFile, setRawImgFile] = useState(null)
    const [showCropper, setShowCropper] = useState(false)

    const [savedAddresses, setSavedAddresses] = useState([])

    useEffect(() => {
        let list = []
        try {
            const stored = localStorage.getItem('saved_addresses')
            if (stored) list = JSON.parse(stored)
        } catch (e) {}

        if (!list || list.length === 0) {
            let userAddr = userData?.address || {}
            if (typeof userAddr === 'string') {
                try { userAddr = JSON.parse(userAddr) } catch(e) {}
            }
            list = [
                {
                    type: 'Home',
                    street: userAddr.street || userAddr.line1 || 'House No. 88, Shalimar Bagh',
                    city: userAddr.city || userAddr.line2 || 'New Delhi',
                    state: userAddr.state || 'Delhi',
                    country: userAddr.country || 'India',
                    zipcode: userAddr.zipcode || '110088'
                },
                {
                    type: 'Office',
                    street: 'Flat 304, Sector 6, Dwarka',
                    city: 'New Delhi',
                    state: 'Delhi',
                    country: 'India',
                    zipcode: '110075'
                }
            ]
        } else if (list.length === 1) {
            list.push({
                type: 'Office',
                street: 'Flat 304, Sector 6, Dwarka',
                city: 'New Delhi',
                state: 'Delhi',
                country: 'India',
                zipcode: '110075'
            })
        }

        list = list.map((a, idx) => ({
            ...a,
            type: a.type || (idx === 0 ? 'Home' : 'Office')
        })).slice(0, 2)

        setSavedAddresses(list)
    }, [userData])

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setRawImgFile(e.target.files[0])
            setShowCropper(true)
            e.target.value = ''
        }
    }

    const handleCropComplete = (croppedFile) => {
        setImage(croppedFile)
        setShowCropper(false)
        setIsEdit(true)
    }

    const handleAddressChange = (index, field, value) => {
        setSavedAddresses(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();

            formData.append('name', userData.name || '')
            formData.append('phone', userData.phone || '')
            formData.append('address', JSON.stringify(savedAddresses[0] || userData.address || {}))
            formData.append('gender', userData.gender || 'Not Selected')
            formData.append('dob', userData.dob || '')

            if (image) {
                formData.append('image', image)
            }

            localStorage.setItem('saved_addresses', JSON.stringify(savedAddresses))

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success("Profile & saved addresses updated successfully!")
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    if (!userData) {
        return (
            <div className='min-h-[75vh] flex flex-col items-center justify-center gap-4 py-16 text-center max-padd-container'>
                <div className='w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2' />
                <h3 className='text-xl font-bold text-gray-800'>Loading your profile...</h3>
                <p className='text-sm text-gray-500 max-w-sm'>If you are not logged in, please log in to view your personal profile and address settings.</p>
                <div className='flex gap-4 mt-2'>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className='bg-black text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition cursor-pointer'
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className='bg-[#F3E8DE] text-gray-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#EADBCE] transition cursor-pointer'
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen py-6 sm:py-8 w-full max-w-5xl mx-auto overflow-x-hidden'>
            {/* Header */}
            <div className='text-center mb-6 sm:mb-8 px-2'>
                <h1 className='font-therapique text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-2'>
                    <span className='font-bold'>My</span>{' '}
                    <span className='font-normal underline decoration-gray-400 underline-offset-4'>Profile</span>
                </h1>
                <p className='text-gray-600 text-xs sm:text-sm md:text-base font-medium'>Manage your personal information and saved shipping addresses</p>
            </div>

            <div className='rounded-3xl shadow-[0_8px_30px_rgba(70,56,48,0.06)] p-3.5 sm:p-8 md:p-10 bg-[#FAF5EE] border border-[#EADBCE] w-full max-w-full overflow-hidden'>
                {/* Profile Image Section */}
                <div className='flex flex-col items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
                    <div className="relative group w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48">
                        <label 
                            htmlFor='image' 
                            className='w-full h-full rounded-3xl overflow-hidden border-4 border-[#FDF7F3] shadow-lg bg-[#F3E8DE] flex items-center justify-center relative cursor-pointer block'
                        >
                            <img 
                                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105' 
                                src={image ? URL.createObjectURL(image) : userData.image} 
                                alt="Profile" 
                            />
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black text-white flex items-center justify-center mb-1.5 shadow-md group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-extrabold tracking-wide">Change Photo</span>
                            </div>
                        </label>
                        <input onChange={handleFileSelect} type="file" id="image" accept="image/*" hidden />
                    </div>

                    <label htmlFor='image' className='inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#F3E8DE] text-gray-800 border border-[#EADBCE] hover:bg-[#EADBCE] transition-all cursor-pointer shadow-2xs text-center'>
                        <span>Change & Crop Profile Picture</span>
                    </label>
                </div>

                {/* Name Section */}
                <div className='text-center mb-6 sm:mb-8 px-2'>
                    {isEdit ? (
                        <input 
                            className='text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center bg-[#FDF7F3] border-b-2 border-purple-400 focus:border-purple-600 outline-none transition-colors duration-300 w-full max-w-xs sm:max-w-md p-1.5 sm:p-2 rounded-t-xl' 
                            type="text" 
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                            value={userData.name || ''} 
                            placeholder="Enter your name"
                        />
                    ) : (
                        <h2 className='text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words'>{userData.name}</h2>
                    )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start w-full max-w-full'>
                    {/* Contact Information & Both Saved Addresses */}
                    <div className='bg-[#FDF7F3] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 border border-[#EADBCE] space-y-4 sm:space-y-5 shadow-xs w-full max-w-full overflow-hidden'>
                        <h3 className='text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-[#EADBCE] pb-3'>
                            <span className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F3E8DE] text-gray-800 flexCenter text-xs sm:text-sm shrink-0'>📞</span>
                            <span className='truncate'>Contact & Shipping Addresses</span>
                        </h3>
                        
                        <div className='space-y-3.5 sm:space-y-4'>
                            <div>
                                <label className='text-[10px] sm:text-xs font-extrabold uppercase text-gray-500 block mb-1'>Email Address</label>
                                <div className='bg-[#FAF5EE] rounded-xl p-2.5 sm:p-3 border border-[#EADBCE] overflow-hidden'>
                                    <p className='text-purple-700 font-bold text-xs sm:text-sm truncate'>{userData.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className='text-[10px] sm:text-xs font-extrabold uppercase text-gray-500 block mb-1'>Phone Number</label>
                                {isEdit ? (
                                    <input 
                                        className='w-full bg-[#FAF5EE] rounded-xl p-2.5 sm:p-3 border border-[#EADBCE] focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-xs sm:text-sm font-medium' 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                        value={userData.phone || ''} 
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className='bg-[#FAF5EE] rounded-xl p-2.5 sm:p-3 border border-[#EADBCE] text-xs sm:text-sm font-medium text-gray-900'>
                                        <p>{userData.phone || '8130758753'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Saved Shipping Addresses Section */}
                            <div className='space-y-3 pt-2'>
                                <div className='flex items-center justify-between gap-2'>
                                    <label className='text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-800 block'>
                                        Saved Delivery Addresses ({savedAddresses.length}/2)
                                    </label>
                                    <span className='text-[10px] font-bold text-gray-400 shrink-0'>Max 2 Addresses</span>
                                </div>

                                {savedAddresses.map((addr, index) => (
                                    <div key={index} className='bg-[#FAF5EE] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#EADBCE] space-y-2 relative w-full max-w-full overflow-hidden'>
                                        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-[#EADBCE] pb-2'>
                                            {isEdit ? (
                                                <div className='flex flex-wrap items-center gap-1 sm:gap-1.5'>
                                                    {['Home', 'Office', 'Other'].map((t) => {
                                                        const isSelected = (addr.type || (index === 0 ? 'Home' : 'Office')) === t;
                                                        return (
                                                            <button
                                                                key={t}
                                                                type='button'
                                                                onClick={() => handleAddressChange(index, 'type', t)}
                                                                className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                                                                    isSelected
                                                                        ? 'bg-black text-white border-black shadow-xs'
                                                                        : 'bg-[#FDF7F3] text-gray-700 border-[#EADBCE] hover:bg-[#F3E8DE]'
                                                                }`}
                                                            >
                                                                <span>{t === 'Office' ? '🏢' : t === 'Other' ? '📍' : '🏠'}</span>
                                                                <span>{t}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <span className='text-[11px] sm:text-xs font-bold text-gray-800 bg-[#F3E8DE] border border-[#EADBCE] px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1.5'>
                                                    {addr.type === 'Office' ? '🏢 Office Address' : addr.type === 'Other' ? '📍 Other Address' : '🏠 Home Address'}
                                                </span>
                                            )}
                                            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0'>
                                                Address #{index + 1}
                                            </span>
                                        </div>

                                        {isEdit ? (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 w-full'>
                                                <input 
                                                    className='w-full bg-[#FDF7F3] rounded-lg p-2 sm:p-2.5 border border-[#EADBCE] text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'street', e.target.value)} 
                                                    value={addr.street || addr.line1 || ''} 
                                                    placeholder="Street / House No."
                                                />
                                                <input 
                                                    className='w-full bg-[#FDF7F3] rounded-lg p-2 sm:p-2.5 border border-[#EADBCE] text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)} 
                                                    value={addr.city || addr.line2 || ''} 
                                                    placeholder="City"
                                                />
                                                <input 
                                                    className='w-full bg-[#FDF7F3] rounded-lg p-2 sm:p-2.5 border border-[#EADBCE] text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)} 
                                                    value={addr.state || ''} 
                                                    placeholder="State"
                                                />
                                                <input 
                                                    className='w-full bg-[#FDF7F3] rounded-lg p-2 sm:p-2.5 border border-[#EADBCE] text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)} 
                                                    value={addr.country || ''} 
                                                    placeholder="Country"
                                                />
                                            </div>
                                        ) : (
                                            <div className='space-y-1 text-xs text-gray-700 font-medium pt-0.5 break-words'>
                                                <p className='font-bold text-gray-900 leading-relaxed'>
                                                    {addr.street || addr.line1}
                                                </p>
                                                <p className='text-gray-500'>
                                                    {[addr.city, addr.state, addr.country, addr.zipcode].filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className='bg-[#FDF7F3] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 border border-[#EADBCE] space-y-4 sm:space-y-5 shadow-xs w-full max-w-full overflow-visible relative z-20'>
                        <h3 className='text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-[#EADBCE] pb-3'>
                            <span className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F3E8DE] text-gray-800 flexCenter text-xs sm:text-sm shrink-0'>👤</span>
                            <span className='truncate'>Basic Information</span>
                        </h3>
                        
                        <div className='space-y-3.5 sm:space-y-4'>
                            <div>
                                <label className='text-[10px] sm:text-xs font-extrabold uppercase text-gray-500 block mb-1'>Gender</label>
                                {isEdit ? (
                                    <CustomDropdown
                                        value={userData.gender || 'Not Selected'}
                                        onChange={(val) => setUserData(prev => ({ ...prev, gender: val }))}
                                        options={['Not Selected', 'Male', 'Female']}
                                        minWidth="w-full"
                                    />
                                ) : (
                                    <div className='bg-[#FAF5EE] rounded-xl p-2.5 sm:p-3 border border-[#EADBCE] text-xs sm:text-sm font-medium text-gray-900'>
                                        <p>{userData.gender || 'Not Specified'}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className='text-[10px] sm:text-xs font-extrabold uppercase text-gray-500 block mb-1'>Date of Birth</label>
                                {isEdit ? (
                                    <DateInput
                                        value={userData.dob || ''}
                                        onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                                        onClear={() => setUserData(prev => ({ ...prev, dob: '' }))}
                                        className="w-full"
                                    />
                                ) : (
                                    <div className='bg-[#FAF5EE] rounded-xl p-2.5 sm:p-3 border border-[#EADBCE] text-xs sm:text-sm font-medium text-gray-900'>
                                        <p>{userData.dob || 'Not Specified'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit / Save Action Buttons */}
                <div className='mt-8 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-4 w-full'>
                    {isEdit ? (
                        <>
                            <button 
                                onClick={updateUserProfileData} 
                                className='bg-black hover:bg-gray-800 text-white font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-md cursor-pointer'
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => setIsEdit(false)} 
                                className='bg-[#F3E8DE] hover:bg-[#EADBCE] text-gray-800 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm transition-all duration-300 cursor-pointer'
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='bg-black hover:bg-gray-800 text-white font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm transition-all duration-300 shadow-md cursor-pointer'
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Image Cropper Modal */}
            <ImageCropperModal
                isOpen={showCropper}
                imageFile={rawImgFile}
                onCropComplete={handleCropComplete}
                onClose={() => setShowCropper(false)}
            />
        </div>
    )
}

export default MyProfile
