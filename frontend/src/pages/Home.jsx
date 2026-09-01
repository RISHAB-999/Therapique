import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import InformaticArticles from '../components/InfomaticsArticles'
import { AppContext } from '../context/AppContext'
import { ScrollFadeInOut } from '../components/ScrollReveal'

const Home = () => {
  const { userData } = useContext(AppContext)

  return (
    <div className="space-y-4 sm:space-y-8">
      <ScrollFadeInOut>
        <Header />
      </ScrollFadeInOut>

      <ScrollFadeInOut>
        <SpecialityMenu />
      </ScrollFadeInOut>

      {/* Section Divider */}
      <ScrollFadeInOut>
        <div
          className="relative text-center rounded-t-[100%] py-12 sm:py-20 px-6 mt-8 sm:mt-14 
    bg-[linear-gradient(to_bottom,theme(colors.green.600),theme(colors.green.400),theme(colors.green.300),theme(colors.background))] 
    text-gray-900"
        >
          <div className="flex items-end justify-center min-h-[120px] sm:min-h-[180px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug max-w-2xl mx-auto font-therapique">
              Building resilience together <br />
              with <span className="font-bold text-[#463830]">Therapique 🌼🌸</span> <br />
              on your path to well-being
            </h2>
          </div>
        </div>
      </ScrollFadeInOut>

      <ScrollFadeInOut>
        <TopDoctors />
      </ScrollFadeInOut>

      <ScrollFadeInOut>
        <InformaticArticles />
      </ScrollFadeInOut>

      {!userData && (
        <Banner />
      )}
    </div>
  )
}

export default Home