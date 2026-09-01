import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const envBackendUrl = import.meta.env.VITE_BACKEND_URL
    const backendUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:4000'
      : (envBackendUrl || 'http://localhost:4000')

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting Doctors using API (with silent background polling support)
    const getDoctorData = useCallback(async (isSilent = false) => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else if (!isSilent) {
                toast.error(data.message)
            }
        } catch (error) {
            if (!isSilent) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }, [backendUrl])

    // Getting User Profile using API
    const loadUserProfileData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
                setToken('')
                localStorage.removeItem('token')
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, token])

    // Initial load + Realtime Background Polling and Focus-sync
    useEffect(() => {
        getDoctorData()
        if (token) {
            loadUserProfileData()
        }

        // 1. Live background polling every 15 seconds to sync availability & wallet without CPU churn
        const interval = setInterval(() => {
            getDoctorData(true)
            if (token) {
                loadUserProfileData()
            }
        }, 15000)

        // 2. Tab switch / Window focus sync
        const handleFocus = () => {
            getDoctorData(true)
            if (token) {
                loadUserProfileData()
            }
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                getDoctorData(true)
                if (token) {
                    loadUserProfileData()
                }
            }
        }

        window.addEventListener('focus', handleFocus)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', handleFocus)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [getDoctorData, token, loadUserProfileData])

    const [heroReady, setHeroReady] = useState(() => {
        // If not on root home page, hero is ready immediately
        return typeof window !== 'undefined' && window.location.pathname !== '/'
    })

    const value = useMemo(() => ({
        doctors, getDoctorData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        heroReady, setHeroReady
    }), [doctors, getDoctorData, currencySymbol, backendUrl, token, userData, loadUserProfileData, heroReady])
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider