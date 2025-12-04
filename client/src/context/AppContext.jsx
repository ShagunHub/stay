import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useUser, useAuth} from "@clerk/clerk-react";
import {toast} from 'react-hot-toast';
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext= createContext();

export const AppProvider=({children})=>{
const currency = import.meta.env.VITE_CURRENCY || "$";
const navigate=useNavigate();
const {user}=useUser();
const {getToken}=useAuth();

const [isOwner, setIsOwner]=useState(false);
const [showHotelReg, setShowHotelReg]=useState(false);
const [searchedCities, setSearchedCities]=useState([]);
const [rooms,setRooms]=useState([]);

const fetchRooms=async()=>{
    try{
const {data}=await axios.get('/api/rooms');
if(data.success){
    setRooms(data.rooms)
} else{
    toast.error(data.message);
}
    } catch(error){
        toast
    }
}
useEffect(()=>{
    fetchRooms();
},[])

const syncUserToDB=async()=>{
    try{
        // First, sync user to DB
        const syncData = await axios.post('/api/user/sync', {
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.firstName + " " + user.lastName,
            image: user.imageUrl
        });
        
        if(syncData.data.success){
            console.log("User synced to DB");
        }
    } catch(error){
        console.error("Sync error:", error.message);
    }
}

const fetchUser=async()=>{
    try{
       const {data} = await axios.get('/api/user', {headers:{Authorization:`Bearer ${await getToken()}`}});
       if(data.success){
        setIsOwner(data.role==="hotelOwner");
        setSearchedCities(data.recentSearchedCities);
       }
       else{
        setTimeout(()=>{
            fetchUser()
        },3000)
       }
    } catch(error){
       console.error("Fetch user error:", error.message);
    }
}

useEffect(()=>{
    if(user){
        syncUserToDB().then(()=>fetchUser());     
    }
},[user, getToken])
    const value={
        currency, navigate, user, getToken, isOwner, setIsOwner, axios, showHotelReg, setShowHotelReg, searchedCities, 
        setSearchedCities, rooms, setRooms
    }
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext=()=>useContext(AppContext);