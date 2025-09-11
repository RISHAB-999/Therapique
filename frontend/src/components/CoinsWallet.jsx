import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const CoinsWallet = () => {
  const navigate = useNavigate()
  const { userData } = useContext(AppContext)
  return (
    <div
      onClick={() => navigate('/coins-shop')}
      className='gap-1 flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 rounded-full cursor-pointer hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg'
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
        <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
      </svg>
      <span className='text-white font-semibold text-sm'>
        {userData.therapiqueCoins || 0}
      </span>
    </div>
  )
}

export default CoinsWallet
