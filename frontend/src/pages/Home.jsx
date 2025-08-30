import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import { AppContext } from '../context/AppContext'

const Home = () => {
  const { userData } = useContext(AppContext)

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      {!userData && <Banner />}
    </div>
  )
}

export default Home