import React from 'react'
import Hero from '../components/hero'
import Categories from '../components/Categories'
import NewArrivals from '../components/NewArrivals'
import FeaturedBooks from '../components/FeaturedBooks'
import PopularBooks from '../components/PopularBooks'
import NewsLetter from '../components/NewsLetter'
import Achivements from '../components/Achivements'

const Library = () => {
  return (
    <>
      <Hero /> 
      <Categories />
      <NewArrivals />
      <FeaturedBooks />
      <PopularBooks />
      <Achivements />
      <NewsLetter />
    </>
  )
}

export default Library