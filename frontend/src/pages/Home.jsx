import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import InformaticArticles from '../components/InfomaticsArticles'
import { AppContext } from '../context/AppContext'

const Home = () => {
  const { userData } = useContext(AppContext)

  return (
    <div>
      <Header />
      <SpecialityMenu />

      {/* Section Divider */}
      <div
        className="relative text-center rounded-t-[100%] py-32 px-6 mt-20 
  bg-[linear-gradient(to_bottom,theme(colors.green.600),theme(colors.green.400),theme(colors.green.300),theme(colors.background))] 
  text-gray-900"
      >


        <div className="flex items-end justify-center min-h-[200px]">
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug max-w-2xl mx-auto">
            Building resilience together <br />
            with <span className="font-bold text-[#463830]">Therapique 🌼🌸</span> <br />
            on your path to well-being
          </h2>
        </div>
      </div>

      <TopDoctors />
      <InformaticArticles />
      {!userData && <Banner />}
    </div>
  )
}

export default Home