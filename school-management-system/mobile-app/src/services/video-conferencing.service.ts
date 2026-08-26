import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export interface VideoRoom {
  roomId: string;
  roomName: string;
  participants: Participant[];
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'ended';
}

export interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'parent' | 'admin';
  joinedAt?: Date;
  isSpeaking?: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

class VideoConferencingService {
  private static instance: VideoConferencingService;
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();

  private constructor() {}

  public static getInstance(): VideoConferencingService {
    if (!VideoConferencingService.instance) {
      VideoConferencingService.instance = new VideoConferencingService();
    }
    return VideoConferencingService.instance;
  }

  /**
   * Initialize socket connection for signaling
   */
  public async connect(userId: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        query: { userId, userName },
      });

      this.socket.on('connect', () => {
        console.log('Connected to video conferencing server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.setupSocketListeners();
    });
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners() {
    if (!this.socket) return;

    // Handle new participant joining
    this.socket.on('participant-joined', (participant: Participant) => {
      console.log('Participant joined:', participant);
      this.handleParticipantJoined(participant);
    });

    // Handle participant leaving
    this.socket.on('participant-left', (participantId: string) => {
      console.log('Participant left:', participantId);
      this.handleParticipantLeft(participantId);
    });

    // Handle incoming offer
    this.socket.on('offer', async ({ offer, from }) => {
      console.log('Received offer from:', from);
      await this.handleOffer(offer, from);
    });

    // Handle incoming answer
    this.socket.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
      await this.handleAnswer(answer, from);
    });

    // Handle ICE candidate
    this.socket.on('ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);
      await this.handleIceCandidate(candidate, from);
    });

    // Handle chat messages
    this.socket.on('chat-message', (message: Message) => {
      console.log('Received chat message:', message);
      this.handleChatMessage(message);
    });

    // Handle room updates
    this.socket.on('room-updated', (room: VideoRoom) => {
      console.log('Room updated:', room);
      this.handleRoomUpdate(room);
    });
  }

  /**
   * Create or join a video room
   */
  public async joinRoom(roomId: string, userId: string, userName: string, role: string): Promise<VideoRoom> {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('join-room', { roomId, userId, userName, role }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.room);
        }
      });
    });
  }

  /**
   * Leave current room
   */
  public async leaveRoom(roomId: string): Promise<void> {
    if (!this.socket) return;

    this.socket.emit('leave-room', { roomId });
    this.cleanupLocalStream();
    this.closeAllPeerConnections();
  }

  /**
   * Get local media stream (camera and microphone)
   */
  public async getLocalStream(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    try {
      const constraints = {
        video: videoEnabled ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * Toggle video on/off
   */
  public toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  /**
   * Toggle audio on/off
   */
  public toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  /**
   * Send chat message in room
   */
  public sendChatMessage(roomId: string, content: string, type: 'text' | 'file' = 'text'): void {
    if (!this.socket) return;

    this.socket.emit('chat-message', {
      roomId,
      content,
      type,
      timestamp: new Date(),
    });
  }

  /**
   * Share screen (for teachers)
   */
  public async shareScreen(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      this.peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      return screenStream;
    } catch (error) {
      console.error('Failed to share screen:', error);
      throw new Error('Failed to share screen');
    }
  }

  /**
   * Stop screen sharing
   */
  public stopScreenSharing(localStream: MediaStream): void {
    const videoTrack = localStream.getVideoTracks()[0];
    
    this.peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    });
  }

  /**
   * Handle participant joined event
   */
  private async handleParticipantJoined(participant: Participant) {
    if (this.localStream) {
      await this.createPeerConnection(participant.id);
      const offer = await this.peerConnections.get(participant.id)?.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });

      if (offer) {
        await this.peerConnections.get(participant.id)?.setLocalDescription(offer);
        this.socket?.emit('offer', {
          offer,
          to: participant.id,
        });
      }
    }
  }

  /**
   * Handle participant left event
   */
  private handleParticipantLeft(participantId: string) {
    this.closePeerConnection(participantId);
    this.remoteStreams.delete(participantId);
  }

  /**
   * Handle incoming WebRTC offer
   */
  private async handleOffer(offer: RTCSessionDescriptionInit, from: string) {
    await this.createPeerConnection(from);
    
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket?.emit('answer', {
        answer,
        to: from,
      });
    }
  }

  /**
   * Handle incoming WebRTC answer
   */
  private async handleAnswer(answer: RTCSessionDescriptionInit, from: string) {
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(candidate: RTCIceCandidateInit, from: string) {
    const pc = this.peerConnections.get(from);
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(message: Message) {
    // Emit event for UI to handle
    console.log('Chat message received:', message);
  }

  /**
   * Handle room update
   */
  private handleRoomUpdate(room: VideoRoom) {
    // Emit event for UI to handle
    console.log('Room updated:', room);
  }

  /**
   * Create peer connection for a participant
   */
  private async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', {
          candidate: event.candidate,
          to: participantId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', participantId);
      if (event.streams && event.streams[0]) {
        this.remoteStreams.set(participantId, event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    this.peerConnections.set(participantId, pc);
    return pc;
  }

  /**
   * Close peer connection for a participant
   */
  private closePeerConnection(participantId: string) {
    const pc = this.peerConnections.get(participantId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(participantId);
    }
  }

  /**
   * Close all peer connections
   */
  private closeAllPeerConnections() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
  }

  /**
   * Cleanup local stream
   */
  private cleanupLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Disconnect from server
   */
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanupLocalStream();
    this.closeAllPeerConnections();
  }
}

export const videoConferencingService = VideoConferencingService.getInstance();
export default videoConferencingService;
