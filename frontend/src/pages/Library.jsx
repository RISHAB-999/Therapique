import React from 'react'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import NewArrivals from '../components/NewArrivals'
import FeaturedBooks from '../components/FeaturedBooks'
import PopularBooks from '../components/PopularBooks'
import NewsLetter from '../components/NewsLetter'
import Achivements from '../components/Achivements'

const Library = () => {
  return (
    <div className='w-full overflow-x-clip'>
      <Hero /> 
      <Categories />
      <NewArrivals />
      <FeaturedBooks />
      <PopularBooks />
      <Achivements />
      <NewsLetter />
    </div>
  )
}

export default Library