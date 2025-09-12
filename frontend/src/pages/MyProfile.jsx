// <<<<<<< HEAD
import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)

    // Function to update user profile data using API
    const updateUserProfileData = async () => {

        try {

            const formData = new FormData();

            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
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

    return userData ? (
        <div className='min-h-screen  py-8 px-4'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-2'>My Profile</h1>
                    <p className='text-gray-600'>Manage your personal information and preferences</p>
                </div>

                <div className=' rounded-3xl shadow-xl p-8 md:p-12'>
                    {/* Profile Image Section */}
                    <div className='flex justify-center mb-8'>
                        {isEdit
                            ? <label htmlFor='image' className='group'>
                                <div className='relative cursor-pointer'>
                                    <img 
                                        className='w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200 group-hover:border-primary transition-all duration-300 shadow-lg' 
                                        src={image ? URL.createObjectURL(image) : userData.image} 
                                        alt="Profile" 
                                    />
                                    <div className='absolute inset-0 bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                        <div className='bg-white rounded-full p-3'>
                                            <img className='w-6 h-6' src={assets.upload_icon} alt="Upload" />
                                        </div>
                                    </div>
                                </div>
                                <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                            </label>
                            : <img 
                                className='w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg' 
                                src={userData.image} 
                                alt="Profile" 
                            />
                        }
                    </div>

                    {/* Name Section */}
                    <div className='text-center mb-8'>
                        {isEdit
                            ? <input 
                                className='text-3xl md:text-4xl font-bold text-gray-800 text-center bg-transparent border-b-2 border-gray-300 focus:border-primary outline-none transition-colors duration-300 w-full max-w-md' 
                                type="text" 
                                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                value={userData.name || ''} 
                                placeholder="Enter your name"
                            />
                            : <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>{userData.name}</h2>
                        }
                    </div>

                    <div className='grid md:grid-cols-2 gap-8'>
                        {/* Contact Information */}
                        <div className='bg-gray-50 rounded-2xl p-6'>
                            <h3 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
                                <span className=' text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3'>📞</span>
                                Contact Information
                            </h3>
                            
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm font-medium text-gray-600 block mb-1'>Email Address</label>
                                    <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                        <p className='text-primary font-medium'>{userData.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className='text-sm font-medium text-gray-600 block mb-1'>Phone Number</label>
                                    {isEdit
                                        ? <input 
                                            className='w-full bg-white rounded-lg p-3 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300' 
                                            type="text" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                            value={userData.phone || ''} 
                                            placeholder="Enter phone number"
                                        />
                                        : <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                            <p className='text-gray-800'>{userData.phone}</p>
                                        </div>
                                    }
                                </div>

                                <div>
                                    <label className='text-sm font-medium text-gray-600 block mb-1'>Address</label>
                                    {isEdit
                                        ? <div className='space-y-2'>
                                            <input 
                                                className='w-full bg-white rounded-lg p-3 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300' 
                                                type="text" 
                                                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                                value={userData.address?.line1 || ''} 
                                                placeholder="Address Line 1"
                                            />
                                            <input 
                                                className='w-full bg-white rounded-lg p-3 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300' 
                                                type="text" 
                                                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                                value={userData.address?.line2 || ''} 
                                                placeholder="Address Line 2"
                                            />
                                        </div>
                                        : <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                            <p className='text-gray-800'>{userData.address?.line1}</p>
                                            {userData.address?.line2 && <p className='text-gray-800'>{userData.address.line2}</p>}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className='bg-gray-50 rounded-2xl p-6'>
                            <h3 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
                                <span className=' text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3'>👤</span>
                                Basic Information
                            </h3>
                            
                            <div className='space-y-4'>
                                <div>
                                    <label className='text-sm font-medium text-gray-600 block mb-1'>Gender</label>
                                    {isEdit
                                        ? <select 
                                            className='w-full bg-white rounded-lg p-3 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                            value={userData.gender || 'Not Selected'}
                                        >
                                            <option value="Not Selected">Not Selected</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        : <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                            <p className='text-gray-800'>{userData.gender}</p>
                                        </div>
                                    }
                                </div>

                                <div>
                                    <label className='text-sm font-medium text-gray-600 block mb-1'>Date of Birth</label>
                                    {isEdit
                                        ? <input 
                                            className='w-full bg-white rounded-lg p-3 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300' 
                                            type='date' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                            value={userData.dob || ''} 
                                        />
                                        : <div className='bg-white rounded-lg p-3 border border-gray-200'>
                                            <p className='text-gray-800'>{userData.dob}</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className='flex justify-center mt-8'>
                        {isEdit
                            ? <div className='flex gap-4'>
                                <button 
                                    onClick={updateUserProfileData} 
                                    className='bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
                                >
                                    Save Changes
                                </button>
                                <button 
                                    onClick={() => setIsEdit(false)} 
                                    className='bg-gray-500 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
                                >
                                    Cancel
                                </button>
                            </div>
                            : <button 
                                onClick={() => setIsEdit(true)} 
                                className='bg-text text-white px-12 py-3 rounded-full font-medium hover:bg-text/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
                            >
                                Edit Profile
                            </button>
                        }
                    </div>
                </div>
        </div>
    ) : null
}

export default MyProfile
// =======

//   const updateUserProfile = async () => {
//     try {
//       const formData = new FormData();
//       formData.append("name", userData.name);
//       formData.append("phone", userData.phone);
//       formData.append("address", JSON.stringify(userData.address || {}));
//       formData.append("gender", userData.gender);
//       formData.append("dob", userData.dob);

//       image && formData.append("image", image);

//       const { data } = await axios.post(
//         backendUrl + "/api/user/update-profile",
//         formData,
//         { headers: { token } }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         await loadUserProfileData();
//         setIsEdit(false);
//         setImage(false);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 flex flex-col shadow-lg">
//       {/* Banner */}
//       <div className="relative w-full h-60 sm:h-72 bg-gray-200">
//         <img
//           src={assets.banner_pic}
//           alt="Banner"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Profile Info Section */}
//       <div className="relative px-6 sm:px-16 pb-16">
//         {/* Profile Picture */}
//         <div className="absolute -top-20 sm:-top-24 left-6 sm:left-16">
//           <label htmlFor="image" className="cursor-pointer">
//             <img
//               className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
//               src={image ? URL.createObjectURL(image) : userData.image}
//               alt="Profile"
//             />
//             {isEdit && (
//               <input
//                 id="image"
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={(e) => setImage(e.target.files[0])}
//               />
//             )}
//           </label>
//         </div>

//         {/* Header Info */}
//         <div className="mt-20 sm:mt-28 flex flex-col sm:flex-row sm:items-center gap-4">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">
//               {userData.name}
//             </h2>
//             <p className="text-gray-500">@{userData.nickname || "user"}</p>
//           </div>

//           {/* Edit / Save Buttons */}
//           <div className="sm:ml-auto flex gap-3">
//             {isEdit ? (
//               <>
//                 <button
//                   className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium shadow hover:bg-blue-600 transition"
//                   onClick={updateUserProfile}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="px-6 py-2.5 rounded-full font-medium shadow bg-gray-200 hover:bg-gray-300 transition"
//                   onClick={() => setIsEdit(false)}
//                 >
//                   Cancel
//                 </button>
//               </>
//             ) : (
//               <button
//                 className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium shadow hover:bg-blue-600 transition"
//                 onClick={() => setIsEdit(true)}
//               >
//                 Edit Profile
//               </button>
//             )}
//           </div>
//         </div>

//         {/* About Info */}
//         <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {/* Full Name */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Full Name
//             </label>
//             {isEdit ? (
//               <input
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 type="text"
//                 value={userData.name}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, name: e.target.value }))
//                 }
//               />
//             ) : (
//               <p className="text-gray-800">{userData.name}</p>
//             )}
//           </div>

//           {/* Phone */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Phone
//             </label>
//             {isEdit ? (
//               <input
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 type="text"
//                 value={userData.phone}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, phone: e.target.value }))
//                 }
//               />
//             ) : (
//               <p className="text-gray-800">{userData.phone}</p>
//             )}
//           </div>

//           {/* Gender */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Gender
//             </label>
//             {isEdit ? (
//               <select
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 value={userData.gender}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, gender: e.target.value }))
//                 }
//               >
//                 <option>Male</option>
//                 <option>Female</option>
//                 <option>Other</option>
//               </select>
//             ) : (
//               <p className="text-gray-800">{userData.gender}</p>
//             )}
//           </div>

//           {/* DOB */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Date of Birth
//             </label>
//             {isEdit ? (
//               <input
//                 type="date"
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 value={userData.dob?.slice(0, 10) || ""}
//                 onChange={(e) =>
//                   setUserData((prev) => ({ ...prev, dob: e.target.value }))
//                 }
//               />
//             ) : (
//               <p className="text-gray-800">{userData.dob?.slice(0, 10)}</p>
//             )}
//           </div>

//           {/* Address Line 1 */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Address Line 1
//             </label>
//             {isEdit ? (
//               <input
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 type="text"
//                 value={userData.address?.line1 || ""}
//                 onChange={(e) =>
//                   setUserData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, line1: e.target.value },
//                   }))
//                 }
//               />
//             ) : (
//               <p className="text-gray-800">{userData.address?.line1}</p>
//             )}
//           </div>

//           {/* Address Line 2 */}
//           <div>
//             <label className="block text-gray-600 text-sm font-medium mb-1">
//               Address Line 2
//             </label>
//             {isEdit ? (
//               <input
//                 className="w-full border border-gray-200 rounded-md px-4 py-2"
//                 type="text"
//                 value={userData.address?.line2 || ""}
//                 onChange={(e) =>
//                   setUserData((prev) => ({
//                     ...prev,
//                     address: { ...prev.address, line2: e.target.value },
//                   }))
//                 }
//               />
//             ) : (
//               <p className="text-gray-800">{userData.address?.line2}</p>
//             )}
//           </div>
//         </div>

//         {/* Email Section */}
//         <div className="mt-12">
//           <p className="text-gray-600 text-sm font-medium mb-3">
//             My Email Address
//           </p>
//           <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
//             <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-500 font-semibold">
//               @
//             </div>
//             <div>
//               <p className="text-gray-800">{userData.email}</p>
//               <p className="text-xs text-gray-500">Verified</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyProfile;
// >>>>>>> master
