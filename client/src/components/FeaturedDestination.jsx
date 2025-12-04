import React from 'react'
import HotelCard from './HotelCard.jsx'
import Title from './Title.jsx'
import {useAppContext} from '../context/AppContext.jsx';
import { useLocation } from 'react-router-dom';

const FeaturedDestination = () => {
  const {rooms, navigate}=useAppContext();
  const location = useLocation();
  const isRoomsPage = location.pathname === '/rooms';

  const roomsToDisplay = isRoomsPage ? (rooms || []) : (rooms || []).slice(0,4)

  return (roomsToDisplay.length > 0) && (
    <div id="experience" className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
    <Title title={isRoomsPage ? 'All Rooms' : 'Featured Destination'} subTitle={isRoomsPage ? 'Explore all available rooms and find your perfect stay.' : 'Discover our handpicked selection of expectional properties around the world, offering unparalleled luxury and unforgettable experiences.'}/>

      <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
        {roomsToDisplay.map((room,index)=>(
            <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
      {!isRoomsPage && <button onClick={()=>{navigate('/rooms'); window.scrollTo(0,0)}}
      className='my-16 px-4 py-2  text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'>
      View All Destinations
      </button>}
    </div>
  )
}

export default FeaturedDestination
