import React,{useEffect,useCallback,useState} from "react";
import { useSocket } from "../Context/SocketProvider";
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const RoomPage=()=>{

const socket=useSocket()

const[remoteSocketId,setRemoteSocketId]=useState(null)

const [myStream,setMyStream]=useState(null)

const [remoteStream,setRemoteStream]=useState(null)

const handleUserJoined=useCallback(({email,id})=>{
    console.log(`email ${email} joined the room`)
    setRemoteSocketId(id)
},[])


const handleCallUser=useCallback(async()=>{
    const stream=await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true})
    const offer=await peer.getOffer()
    socket.emit('user:call',{to:remoteSocketId,offer})
    setMyStream(stream)
},[remoteSocketId,socket])


const handleIncomingCall=useCallback(
async({from,offer})=>{
    setRemoteSocketId(from)
    const stream=await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
    })
    console.log(`incoming call from ${from} and Offer ${offer}`)
    const ans= await peer.getAnswer(offer)
    socket.emit('call:accepted',{to:from,ans})
    setMyStream(stream)

},[socket])


const sendStreams = useCallback(()=>{
    for(const track of myStream.getTracks()){
        peer.peer.addTrack(track,myStream)
    }
},[myStream])

const handleCallAccepted=useCallback(
    async({from,ans})=>{
        await peer.setLocalDescription(ans)
        console.log('Call Accepted')
        sendStreams()
    },[sendStreams]
)


const handleNegotiationNeeded=useCallback(async()=>{
    const offer=await peer.getOffer()
    socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
},[remoteSocketId, socket])


const handleNegoNeedIncoming=useCallback(async({from,offer})=>{
    const ans=await peer.getAnswer(offer)
    socket.emit('peer:nego:done',{to:from,ans})
},[socket])


const handleNegoNeedFinal=useCallback(async(ans)=>{
    await peer.setLocalDescription(ans)
},[])



useEffect(()=>{
    peer.peer.addEventListener('negotiationneeded',handleNegotiationNeeded)
    return ()=>{
        peer.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded)
    }
},[handleNegotiationNeeded])



useEffect(()=>{
    peer.peer.addEventListener('track',async ev=>{
        const remoteStream=ev.streams
        setRemoteStream(remoteStream[0])
    })
},[])



useEffect(()=>{
    socket.on('user:joined',handleUserJoined)
    socket.on('incoming:call',handleIncomingCall)
    socket.on('call:accepted',handleCallAccepted)
    socket.on('peer:nego:needed',handleNegoNeedIncoming)
    socket.on('peer:nego:done',handleNegoNeedFinal)


    return ()=>{
        socket.off('user:joined',handleUserJoined)
        socket.off('incoming:call',handleIncomingCall)
        socket.off('call:accepted',handleCallAccepted)
        socket.off('peer:nego:needed',handleNegoNeedIncoming)
        socket.off('peer:nego:done',handleNegoNeedFinal)
    }
    
},[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal])

    return (
        <div>
            <h1>Room Page</h1>
            <h3>{remoteSocketId?'Connected':'No one in room'}</h3>
            {
                myStream && <button onClick={sendStreams}>Send Video</button>
            }
            {
                remoteSocketId && <button onClick={handleCallUser}>Call</button>
            }

            {            
                myStream &&
                <>   
                <h1>My Stream</h1>
                <ReactPlayer 
                playing 
                muted 
                height="250px" 
                width="300px" 
                url={myStream}/>
                </>
 
            }
            {            
                remoteStream &&
                <>   
                <h1>Remote Stream</h1>
                <ReactPlayer
                playing 
                muted 
                height="250px"
                width="300px"
                url={remoteStream}/>
                </>
 
            }
        </div>
    )
}
export default RoomPage