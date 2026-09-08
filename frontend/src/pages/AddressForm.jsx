import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const AddressForm = () => {
    const { navigate, backendUrl } = useContext(ShopContext)
    const { userData, loadUserProfileData, token } = useContext(AppContext)

    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);

    // Pre-fill existing user profile details
    useEffect(() => {
        if (userData) {
            const nameParts = (userData.name || "").split(" ")
            const userAddr = userData.address || {}

            setAddress({
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                email: userData.email || "",
                phone: userData.phone || "8130758753",
                street: userAddr.street || userAddr.line1 || "",
                city: userAddr.city || userAddr.line2 || "",
                state: userAddr.state || "",
                zipcode: userAddr.zipcode || "",
                country: userAddr.country || ""
            })
        }
    }, [userData])

    const onChangeHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setAddress((data) => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        if (!token) {
            toast.error("Please login to save delivery address")
            return navigate('/login')
        }

        try {
            setLoading(true)
            const newAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                email: address.email,
                phone: address.phone || '8130758753',
                street: address.street,
                line1: address.street,
                line2: address.city,
                city: address.city,
                state: address.state,
                zipcode: address.zipcode,
                country: address.country
            }

            // Sync with localStorage array capped at 2 addresses maximum
            let currentSaved = []
            try {
                const stored = localStorage.getItem('saved_addresses')
                if (stored) currentSaved = JSON.parse(stored)
            } catch (err) {}

            const updatedSaved = [newAddress, ...currentSaved.filter(a => (a.street || a.line1) !== newAddress.street)].slice(0, 2)
            localStorage.setItem('saved_addresses', JSON.stringify(updatedSaved))

            const formData = new FormData()
            formData.append('name', `${address.firstName} ${address.lastName}`.trim() || userData.name || 'User')
            formData.append('phone', address.phone || userData.phone || '8130758753')
            formData.append('address', JSON.stringify(newAddress))
            formData.append('gender', userData?.gender || 'Not Selected')
            formData.append('dob', userData?.dob || '2000-01-01')

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success("Delivery address saved! (Max 2 saved addresses maintained)")
                await loadUserProfileData()
                navigate('/cart')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-padd-container py-16 pt-6'>
            <div className='max-w-2xl mx-auto'>
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 text-[95%]'>
                    <Title
                        title1={"Delivery"}
                        title2={"Information"}
                        title1Styles={"pb-2"}
                    />
                    <p className='text-xs text-gray-500 font-medium -mt-2 mb-2'>
                        Provide your shipping details for receiving physical book orders & library deliveries.
                    </p>

                    <div className='flex items-center gap-3 bg-purple-50/60 p-3 rounded-2xl border border-purple-100 mb-1'>
                        <label className='text-xs font-black text-purple-700 uppercase tracking-wider shrink-0'>Address Tag / Label:</label>
                        <div className='flex items-center gap-2 flex-1 justify-end'>
                            {['Home', 'Office', 'Other'].map((t) => {
                                const isSelected = (address.type || 'Home') === t;
                                return (
                                    <button
                                        key={t}
                                        type='button'
                                        onClick={() => setAddress(prev => ({ ...prev, type: t }))}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                            isSelected
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-200 scale-105'
                                                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100'
                                        }`}
                                    >
                                        <span>{t === 'Office' ? '🏢' : t === 'Other' ? '📍' : '🏠'}</span>
                                        <span>{t}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3'>
                        <input
                            onChange={onChangeHandler}
                            value={address.firstName}
                            type="text"
                            name='firstName'
                            placeholder='First Name'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                        <input
                            onChange={onChangeHandler}
                            value={address.lastName}
                            type="text"
                            name='lastName'
                            placeholder='Last Name'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                    </div>
                    <input
                        onChange={onChangeHandler}
                        value={address.email}
                        type="email"
                        name='email'
                        placeholder='Email Address'
                        className='w-full h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                        required
                    />
                    <input
                        onChange={onChangeHandler}
                        value={address.phone}
                        type="text"
                        name='phone'
                        placeholder='Phone Number'
                        className='w-full h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                        required
                    />
                    <input
                        onChange={onChangeHandler}
                        value={address.street}
                        type="text"
                        name='street'
                        placeholder='Street Address (House No, Building, Area)'
                        className='w-full h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                        required
                    />
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <input
                            onChange={onChangeHandler}
                            value={address.city}
                            type="text"
                            name='city'
                            placeholder='City'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                        <input
                            onChange={onChangeHandler}
                            value={address.state}
                            type="text"
                            name='state'
                            placeholder='State'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                    </div>
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <input
                            onChange={onChangeHandler}
                            value={address.zipcode}
                            type="text"
                            name='zipcode'
                            placeholder='Zipcode / Pincode'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                        <input
                            onChange={onChangeHandler}
                            value={address.country}
                            type="text"
                            name='country'
                            placeholder='Country'
                            className='w-full sm:w-1/2 h-11 px-3.5 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-[#7C3AED]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs'
                            required
                        />
                    </div>
                    <button 
                        type='submit' 
                        disabled={loading}
                        className='bg-purple-600 hover:bg-purple-700 text-white rounded-xl w-full mt-4 h-12 transition-all duration-300 disabled:opacity-50 cursor-pointer font-extrabold text-xs sm:text-sm shadow-md active:scale-95 flex items-center justify-center'
                    >
                        {loading ? "Saving Address..." : "Save & Sync Delivery Address"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddressForm