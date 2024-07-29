import React, { useCallback ,useEffect} from "react";
import { useState } from "react";
import './Lobby.css'
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Context/SocketProvider";
const LobbyScreen=()=>{
    const[email,setEmail]=useState("")
    const[room,setRoom]=useState("")
    const socket=useSocket()
    const navigate=useNavigate()
    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault()
        socket.emit('room:join',{email,room})
    },[email,room,socket])

const handleJoinRoom=useCallback((data)=>{
    const {email,room}=data
    navigate(`/room/${room}`)
},[])
 
useEffect(()=>{
    socket.on('room:join',handleJoinRoom)
    return ()=>{
        socket.off('room:join',handleJoinRoom)
    }
},[socket,handleJoinRoom])


    return(
        <div>
            <h1 className="heading">LetsMeet</h1>
            <form onSubmit={handleSubmitForm}>
                {/* <label  htmlFor="email">Email Id</label> */}
                <input type='email' id="email" className="input"
                placeholder="Enter Email Id"
                 value={email} 
                 onChange={(e)=>setEmail(e.target.value)}/>
                <br/>
                {/* <label  htmlFor="room">Room Id</label> */}
                <input type='text' className="input" id="room"
                placeholder="Enter Room Id"
                value={room} 
                onChange={(e)=>setRoom(e.target.value)}/>
                <br/>
                <button className="button-52">Enter Room</button>
            </form>
        </div>
    )
}
export default LobbyScreen