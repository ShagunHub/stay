import React , {useState} from 'react'
import HotelCard from './HotelCard.jsx'
import Title from './Title.jsx'
import {useAppContext} from '../context/AppContext.jsx';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const RecommendedHotel = () => {
  const {rooms, searchedCities}=useAppContext();
  const [recommended, setRecommended]=useState([]);
  const location = useLocation();
  const isRoomsPage = location.pathname === '/rooms';

  const roomsToDisplay = isRoomsPage ? (rooms || []) : (rooms || []).slice(0,4)

  useEffect(()=>{
    if(searchedCities.length > 0){
      const filteredHotels = rooms.slice().filter(room=> searchedCities.includes(room.hotel.city));
      setRecommended(filteredHotels);
    }
  },[rooms, searchedCities])

  return (recommended.length > 0) && (
    <div id="experience" className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
    <Title title={isRoomsPage ? 'All Rooms' : 'Recommendd Hotels'} subTitle={isRoomsPage ? 'Explore all available rooms and find your perfect stay.' : 'Discover our handpicked selection of expectional properties around the world, offering unparalleled luxury and unforgettable experiences.'}/>

      <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
        {recommended.slice(0,4).map((room,index)=>(
            <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    
    </div>
  )
}

export default RecommendedHotel
