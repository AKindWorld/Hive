// src/services/peerService.js
import Peer from 'peerjs';

const initPeer = (peerId) => {
  return new Peer(peerId, {
    host: '0.peerjs.com', // Or use a free PeerJS server or local one
    port: 443, // Modify as per your server
    path: '/',
    secure: true,
  });
};

export default initPeer;
