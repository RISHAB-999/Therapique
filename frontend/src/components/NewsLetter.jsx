import React from 'react'
import { FaFacebookF, FaGithub, FaInstagram } from 'react-icons/fa6'
const NewsLetter = () => {
  return (
    <section className='max-padd-container py-8 mt-2'>
      <div className='flexBetween flex-wrap gap-7'>
        <div>
          <h4 className='bold-14 uppercase tracking-wider'>Subscribe NewsLetter</h4>
          <p className=''>Get latest information on Events, Sales & Offers.</p>
        </div>
        <div>
          <div className='flex bg-white'>
            <input type='email' placeholder='Email  Address...' className='p-4 bg-white w-[222px] sm:w-[266px] outline-none text-[13px]'/>
            <button className='btn-secondary hover:bg-purple-500 !rounded-none !text-[13px] !font-bold uppercase'>Submit</button>
          </div>
        </div>
        <div className='flex gap-x-3 pr-14'>
          <div className='h-8 w-8 rounded-full hover:bg-purple-400 hover:text-white flexCenter transition-all duration-500'><FaFacebookF /></div>
          <div className='h-8 w-8 rounded-full hover:bg-purple-400 hover:text-white flexCenter transition-all duration-500'><FaInstagram /></div>
          <div className='h-8 w-8 rounded-full hover:bg-purple-400 hover:text-white flexCenter transition-all duration-500'><FaGithub/></div>
        </div>
      </div>
    </section>
  )
}

export default NewsLetter