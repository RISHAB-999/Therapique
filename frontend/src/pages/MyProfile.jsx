import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const { token, backendUrl, userData, setUserData, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address || {}));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col shadow-lg">
      {/* Banner */}
      <div className="relative w-full h-60 sm:h-72 bg-gray-200">
        <img
          src={assets.banner_pic}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 sm:px-16 pb-16">
        {/* Profile Picture */}
        <div className="absolute -top-20 sm:-top-24 left-6 sm:left-16">
          <label htmlFor="image" className="cursor-pointer">
            <img
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
              src={image ? URL.createObjectURL(image) : userData.image}
              alt="Profile"
            />
            {isEdit && (
              <input
                id="image"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            )}
          </label>
        </div>

        {/* Header Info */}
        <div className="mt-20 sm:mt-28 flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {userData.name}
            </h2>
            <p className="text-gray-500">@{userData.nickname || "user"}</p>
          </div>

          {/* Edit / Save Buttons */}
          <div className="sm:ml-auto flex gap-3">
            {isEdit ? (
              <>
                <button
                  className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium shadow hover:bg-blue-600 transition"
                  onClick={updateUserProfile}
                >
                  Save
                </button>
                <button
                  className="px-6 py-2.5 rounded-full font-medium shadow bg-gray-200 hover:bg-gray-300 transition"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium shadow hover:bg-blue-600 transition"
                onClick={() => setIsEdit(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* About Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Full Name */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Full Name
            </label>
            {isEdit ? (
              <input
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-800">{userData.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Phone
            </label>
            {isEdit ? (
              <input
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-800">{userData.phone}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Gender
            </label>
            {isEdit ? (
              <select
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            ) : (
              <p className="text-gray-800">{userData.gender}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Date of Birth
            </label>
            {isEdit ? (
              <input
                type="date"
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                value={userData.dob?.slice(0, 10) || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-800">{userData.dob?.slice(0, 10)}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Address Line 1
            </label>
            {isEdit ? (
              <input
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                type="text"
                value={userData.address?.line1 || ""}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
            ) : (
              <p className="text-gray-800">{userData.address?.line1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Address Line 2
            </label>
            {isEdit ? (
              <input
                className="w-full border border-gray-200 rounded-md px-4 py-2"
                type="text"
                value={userData.address?.line2 || ""}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            ) : (
              <p className="text-gray-800">{userData.address?.line2}</p>
            )}
          </div>
        </div>

        {/* Email Section */}
        <div className="mt-12">
          <p className="text-gray-600 text-sm font-medium mb-3">
            My Email Address
          </p>
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-500 font-semibold">
              @
            </div>
            <div>
              <p className="text-gray-800">{userData.email}</p>
              <p className="text-xs text-gray-500">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
