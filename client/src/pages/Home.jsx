import React from 'react'
import Hero from '../components/Hero.jsx';
import FeaturedDestination from '../components/FeaturedDestination.jsx';
import ExclusiveOffers from '../components/ExclusiveOffers.jsx';
import Testimonial from '../components/Testimonial.jsx';
import NewsLetter from '../components/NewsLetter.jsx';
import RecommendedHotel from '../components/RecommendedHotel.jsx';
const Home = () => {
  return (
    <>
   <Hero />  
   <RecommendedHotel />
   <FeaturedDestination/> 
   <ExclusiveOffers/>
   <Testimonial/>
    <NewsLetter/>
    </>
  )
}

export default Home
