class PeerService {
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
        // send to signaling server
      }
    };

    this.peer.ontrack = (event) => {
      console.log("Remote stream received:", event.streams);
      // attach event.streams[0] to <video>
    };

    this.peer.onconnectionstatechange = () => {
      console.log("Connection state:", this.peer.connectionState);
    };
  }

  async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  async getAnswer(offer) {
    try {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    } catch (err) {
      console.error("Error creating answer:", err);
    }
  }

  async setRemoteDescription(answer) {
    try {
      await this.peer.setRemoteDescription(answer);
    } catch (err) {
      console.error("Error setting remote description:", err);
    }
  }

  async addIceCandidate(candidate) {
    if (candidate) {
      try {
        await this.peer.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  }

  close() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }
}

export default new PeerService();
