import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'
import ImageCropperModal from '../components/ImageCropperModal'

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
                        className='bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-purple-700 transition cursor-pointer'
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className='bg-gray-100 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition cursor-pointer'
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen py-8 px-4 max-padd-container'>
            {/* Header */}
            <div className='text-center mb-8'>
                <h1 className='text-4xl font-bold text-gray-800 mb-2'>My Profile</h1>
                <p className='text-gray-600'>Manage your personal information and saved shipping addresses</p>
            </div>

            <div className='rounded-3xl shadow-xl p-8 md:p-12 bg-white'>
                {/* Profile Image Section */}
                <div className='flex flex-col items-center justify-center gap-4 mb-8'>
                    <div className="relative group w-44 h-44 sm:w-52 sm:h-52">
                        <label 
                            htmlFor='image' 
                            className='w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-purple-50 flex items-center justify-center relative cursor-pointer block'
                        >
                            <img 
                                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105' 
                                src={image ? URL.createObjectURL(image) : userData.image} 
                                alt="Profile" 
                            />
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-extrabold tracking-wide">Change & Crop Photo</span>
                            </div>
                        </label>
                        <input onChange={handleFileSelect} type="file" id="image" accept="image/*" hidden />
                    </div>

                    <label htmlFor='image' className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-2xs'>
                        <span>Change & Crop Profile Picture</span>
                    </label>
                </div>

                {/* Name Section */}
                <div className='text-center mb-8'>
                    {isEdit ? (
                        <input 
                            className='text-3xl md:text-4xl font-bold text-gray-800 text-center bg-transparent border-b-2 border-purple-300 focus:border-purple-600 outline-none transition-colors duration-300 w-full max-w-md' 
                            type="text" 
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                            value={userData.name || ''} 
                            placeholder="Enter your name"
                        />
                    ) : (
                        <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>{userData.name}</h2>
                    )}
                </div>

                <div className='grid md:grid-cols-2 gap-8 items-start'>
                    {/* Contact Information & Both Saved Addresses */}
                    <div className='bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5'>
                        <h3 className='text-xl font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3'>
                            <span className='w-8 h-8 rounded-full bg-purple-100 text-purple-600 flexCenter text-sm'>📞</span>
                            Contact & Shipping Addresses
                        </h3>
                        
                        <div className='space-y-4'>
                            <div>
                                <label className='text-xs font-extrabold uppercase text-gray-500 block mb-1'>Email Address</label>
                                <div className='bg-white rounded-xl p-3 border border-gray-200'>
                                    <p className='text-purple-600 font-bold text-sm'>{userData.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className='text-xs font-extrabold uppercase text-gray-500 block mb-1'>Phone Number</label>
                                {isEdit ? (
                                    <input 
                                        className='w-full bg-white rounded-xl p-3 border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm font-medium' 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                        value={userData.phone || ''} 
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className='bg-white rounded-xl p-3 border border-gray-200 text-sm font-medium text-gray-800'>
                                        <p>{userData.phone || '8130758753'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Saved Shipping Addresses Section (Displaying Both Addresses!) */}
                            <div className='space-y-3 pt-2'>
                                <div className='flex items-center justify-between'>
                                    <label className='text-xs font-black uppercase tracking-wider text-purple-700 block'>
                                        Saved Delivery Addresses ({savedAddresses.length}/2)
                                    </label>
                                    <span className='text-[10px] font-bold text-gray-400'>Max 2 Addresses</span>
                                </div>

                                {savedAddresses.map((addr, index) => (
                                    <div key={index} className='bg-white p-4 rounded-xl border border-purple-100 shadow-2xs space-y-2 relative'>
                                        <div className='flex items-center justify-between border-b border-gray-100 pb-2'>
                                            {isEdit ? (
                                                <div className='flex items-center gap-1.5'>
                                                    {['Home', 'Office', 'Other'].map((t) => {
                                                        const isSelected = (addr.type || (index === 0 ? 'Home' : 'Office')) === t;
                                                        return (
                                                            <button
                                                                key={t}
                                                                type='button'
                                                                onClick={() => handleAddressChange(index, 'type', t)}
                                                                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                                                    isSelected
                                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-200 scale-105'
                                                                        : 'bg-purple-50/70 text-purple-700 border-purple-200 hover:bg-purple-100'
                                                                }`}
                                                            >
                                                                <span>{t === 'Office' ? '🏢' : t === 'Other' ? '📍' : '🏠'}</span>
                                                                <span>{t}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <span className='text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5'>
                                                    {addr.type === 'Office' ? '🏢 Office Address' : addr.type === 'Other' ? '📍 Other Address' : '🏠 Home Address'}
                                                </span>
                                            )}
                                            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                                Address #{index + 1}
                                            </span>
                                        </div>

                                        {isEdit ? (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'>
                                                <input 
                                                    className='w-full bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'street', e.target.value)} 
                                                    value={addr.street || addr.line1 || ''} 
                                                    placeholder="Street / House No."
                                                />
                                                <input 
                                                    className='w-full bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)} 
                                                    value={addr.city || addr.line2 || ''} 
                                                    placeholder="City"
                                                />
                                                <input 
                                                    className='w-full bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)} 
                                                    value={addr.state || ''} 
                                                    placeholder="State"
                                                />
                                                <input 
                                                    className='w-full bg-slate-50 rounded-lg p-2.5 border border-gray-200 text-xs font-medium focus:bg-white outline-none focus:border-purple-500' 
                                                    type="text" 
                                                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)} 
                                                    value={addr.country || ''} 
                                                    placeholder="Country"
                                                />
                                            </div>
                                        ) : (
                                            <div className='space-y-1 text-xs text-gray-700 font-medium pt-0.5'>
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
                    <div className='bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5'>
                        <h3 className='text-xl font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3'>
                            <span className='w-8 h-8 rounded-full bg-purple-100 text-purple-600 flexCenter text-sm'>👤</span>
                            Basic Information
                        </h3>
                        
                        <div className='space-y-4'>
                            <div>
                                <label className='text-xs font-extrabold uppercase text-gray-500 block mb-1'>Gender</label>
                                {isEdit ? (
                                    <select 
                                        className='w-full bg-white rounded-xl p-3 border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm font-medium' 
                                        onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                        value={userData.gender || 'Not Selected'}
                                    >
                                        <option value="Not Selected">Not Selected</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                ) : (
                                    <div className='bg-white rounded-xl p-3 border border-gray-200 text-sm font-medium text-gray-800'>
                                        <p>{userData.gender || 'Not Specified'}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className='text-xs font-extrabold uppercase text-gray-500 block mb-1'>Date of Birth</label>
                                {isEdit ? (
                                    <input 
                                        className='w-full bg-white rounded-xl p-3 border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm font-medium' 
                                        type="date" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                        value={userData.dob || ''} 
                                    />
                                ) : (
                                    <div className='bg-white rounded-xl p-3 border border-gray-200 text-sm font-medium text-gray-800'>
                                        <p>{userData.dob || 'Not Specified'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit / Save Action Buttons */}
                <div className='mt-10 flex justify-center gap-4'>
                    {isEdit ? (
                        <>
                            <button 
                                onClick={updateUserProfileData} 
                                className='bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer'
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => setIsEdit(false)} 
                                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-8 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer'
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer'
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && rawImgFile && (
                <ImageCropperModal
                    imageFile={rawImgFile}
                    onCropComplete={handleCropComplete}
                    onClose={() => setShowCropper(false)}
                />
            )}
        </div>
    )
}

export default MyProfile
