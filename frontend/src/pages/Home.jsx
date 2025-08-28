// import Header from '../components/Header'
import Header from '../components/Header1'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import { Mail } from "lucide-react";
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
      <SupportSection />
      {/* <SpecialityMenu /> */}
      {/* <TopDoctors /> */}
      {/* <Banner /> */}
    </div>
  )
}

export default Home



export function SupportSection() {
  return (
    <section className="text-gray-900 pb-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        
        {/* Left Content */}
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Support That Meets You <br /> Where You Are.
          </h1>
          <p className="my-4 text-base text-gray-600">
            Find the resources you need to face your current challenges with our expert team 
            of licensed therapists across Ontario.
          </p>
        </div>
      </div>
    </section>
  );
}