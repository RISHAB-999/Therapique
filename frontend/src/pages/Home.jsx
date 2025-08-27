// import Header from '../components/Header'
import Header from '../components/Header1'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import FeaturedInSection from '../components/FeaturedInSection'
import ResilienceSection from '../components/ResilienceSection'
import TeamSection from '../components/TeamSection'
import TherapySection from '../components/TherapySection'

const Home = () => {
  return (
    <div>
      <Header />
      <FeaturedInSection />
      <ResilienceSection />
      <TeamSection />
      <TherapySection />
      {/* <SpecialityMenu /> */}
      {/* <TopDoctors /> */}
      {/* <Banner /> */}
    </div>
  )
}

export default Home