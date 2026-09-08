import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'
import { Eye, EyeOff } from 'lucide-react'

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { setDToken } = useContext(DoctorContext)
    const { setAToken, backendUrl } = useContext(AdminContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        // Handle login logic here
        if (state === 'Admin') {
            const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
            if (data.success) {
                setAToken(data.token)
                localStorage.setItem('aToken', data.token)
            } else {
                toast.error(data.message)
            }

        } else {
            const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
            if (data.success) {
                setDToken(data.token)
                localStorage.setItem('dToken', data.token)
            } else {
                toast.error(data.message)
            }

        }
    }

    const handleToggleState = (targetState) => {
        setState(targetState)
        setEmail('')
        setPassword('')
        setShowPassword(false)
    }

    return (
        <form onSubmit={onSubmitHandler} autoComplete="off" className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-[#EADBCE] rounded-2xl text-[#5E5E5E] text-sm shadow-lg bg-white'>
                <p className='text-2xl font-semibold m-auto'><span className='text-black font-bold'>{state}</span> Login</p>
                <div className='w-full'>
                    <p className='text-xs font-bold text-gray-700'>Email Address</p>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        name={`${state.toLowerCase()}_email`}
                        autoComplete="off"
                        className='w-full h-11 px-3.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs mt-1.5' 
                        type="email" 
                        required 
                        placeholder="name@therapique.com" 
                    />
                </div>
                <div className='w-full'>
                    <p className='text-xs font-bold text-gray-700'>Password</p>
                    <div className='relative flex items-center mt-1.5'>
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            name={`${state.toLowerCase()}_password`}
                            autoComplete="new-password"
                            className='w-full h-11 pl-3.5 pr-10 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-2xs' 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="••••••••"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-2.5 p-1 text-gray-400 hover:text-gray-700 cursor-pointer rounded-lg'
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <Eye className='w-4 h-4 text-purple-600' /> : <EyeOff className='w-4 h-4 text-gray-400' />}
                        </button>
                    </div>
                </div>
                <button className='w-full h-11 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs hover:shadow transition active:scale-95 cursor-pointer mt-2'>Sign In</button>
                {
                    state === 'Admin'
                        ? <p className='text-xs text-gray-600 mt-1'>Doctor Login? <span onClick={() => handleToggleState('Doctor')} className='text-black font-semibold underline cursor-pointer'>Click here</span></p>
                        : <p className='text-xs text-gray-600 mt-1'>Admin Login? <span onClick={() => handleToggleState('Admin')} className='text-black font-semibold underline cursor-pointer'>Click here</span></p>
                }
            </div>
        </form>
    )
}

export default Login
