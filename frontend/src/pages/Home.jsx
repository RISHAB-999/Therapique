import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import InformaticArticles from '../components/InfomaticsArticles'
import { AppContext } from '../context/AppContext'
import { ScrollFadeInOut } from '../components/ScrollReveal'

import ResilienceBanner from '../components/ResilienceBanner'

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

      {/* Animated Resilience Banner Divider */}
      <ResilienceBanner />

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