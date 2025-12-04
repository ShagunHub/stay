import React, { useState } from 'react'
import Title from '../../components/Title'
import assets from '../../assets/assets'
import { useAppContext } from '../../context/AppContext.jsx'
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

// Function to compress image
const compressImage = async (file) => {
    const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true, // Use web worker for better performance
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        return file; // Return original file if compression fails
    }
};

const AddRoom = () => {

  const {axios, getToken} = useAppContext();

    const[images,setImages]=useState({
        1:null,
        2:null,
        3:null,
        4:null
    })
    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        amenities: {
            'Free WiFi': false,
            'Air Conditioning': false,
            'Breakfast Included': false,
            'Parking': false,
            'Pool Access': false,
            'Mountain View': false,
        }
    })
    const [loading, setLoading] = useState(false);
   const onSubmitHandler=async(e)=>{
    e.preventDefault();
    if(!inputs.roomType || !inputs.pricePerNight || !inputs.amenities || !Object.values(images).some(image=> image)){
      toast.error("Please fill all the details");
      return;
    }
    setLoading(true);
    try{
    const formData=new FormData();
    formData.append('roomType', inputs.roomType);
    formData.append('pricePerNight', inputs.pricePerNight);
   //converting Amenities to Array & keeping only enabled Amenities
   const amenities=Object.keys(inputs.amenities).filter(amenity=> inputs.amenities[amenity]);
    formData.append('amenities', JSON.stringify(amenities));

    //Adding Images to formData
    Object.keys(images).forEach(key=>{
    images[key] && formData.append('images', images[key]);
    })
    const {data} = await axios.post('/api/rooms/', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
    })
    if(data.success){
      toast.success(data.message)
      setInputs({
        roomType: '',
        pricePerNight: 0,
         amenities: {
     'Free WiFi': false,
     'Free Breakfast': false,
     'Room Service': false,
     'Pool Access': false,
     'Mountain View': false,
 }
      })
      setImages({ 1:null, 2:null, 3:null, 4:null })
    }
    else{
      toast.error(data.message)
    }
    }catch(error){
      toast.error(error.message);
    } finally{
      setLoading(false);

    }
   }
  return (
    <form onSubmit={onSubmitHandler}>
      <Title align='left' font='outfit' title='Add Room' subTitle='Fill in the details carefully and accurate room details,pricing,and amenities, to enhance the user booking experience. '/>
  <p className='text-gray-800 mt-10'>Images</p>
  <div className='flex gap-4'>
{Object.keys(images).map((key)=>(
    <label htmlFor={`roomImage${key}`} key={key}>
        <img src={images[key] ? URL.createObjectURL(images[key]): assets.uploadArea} alt=" " className="w-20 h-20 object-cover rounded"/>
        <input type="file" accept="image" id={`roomImage${key}`} hidden onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
                const compressedFile = await compressImage(file);
                setImages({...images, [key]: compressedFile});
            }
        }}/>
    </label>
))}
  </div>
  <div className='w-full flex max-sm:flex-col gap-4 mt-4'>
    <div className='flex-1 max-w-48'>
<p className='text-gray-800 mt-4'>Room Type</p>
    <select value={inputs.roomType} onChange={e=>setInputs({...inputs, roomType: e.target.value})} className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'>
    <option value="">Select Room Type</option>
       <option value="Single Bed">Single Bed</option>
       <option value="Double Bed">Double Bed</option>
       <option value="Luxury Room">Luxury Room</option>
       <option value="Family Suite">Family Suite</option>
</select>
    </div>
    <div>
      <p className='text-gray-800 mt-4'>Price<span className='text-xs'>/night </span>
      </p>
      <input type="number" placeholder='0' value={inputs.pricePerNight} onChange={e=>setInputs({...inputs, pricePerNight: e.target.value})} className='border border-gray-300 mt-1 rounded p-2 w-24'/>
    </div>
  </div>
  <p className='text-gray-800 mt-4'>Amenities</p>
  <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm'>
   {Object.keys(inputs.amenities).map((amenity,index)=>(
    <div key={index} className='flex items-center gap-2'>
    <input type="checkbox" id={`amenities${index+1}`} checked={inputs.amenities[amenity]} onChange={()=>setInputs({...inputs, amenities:{...inputs.amenities,[amenity]:!inputs.amenities[amenity]}})}/>
    <label htmlFor={`amenities${index+1}`} >{amenity}</label>
    </div>
   ))}
  </div>
  <button className='bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer' disabled={loading}>{loading ? 'Adding....' : "Add Room"}</button>
    </form>
  )
}

export default AddRoom
