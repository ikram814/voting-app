import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true 
});

// ============ ROOMS API ============
export const roomsAPI = {
  // Create room
  createRoom: (data) => api.post('/rooms', data),
  
  // Get all user's rooms
  getRooms: () => api.get('/rooms'),
  
  // Get room details
  getRoom: (roomId) => api.get(`/rooms/${roomId}`),
  
  // Update room
  updateRoom: (roomId, data) => api.put(`/rooms/${roomId}`, data),
  
  // Delete room
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),
  
  // Add member to room
  addMember: (roomId, memberId) => api.post(`/rooms/${roomId}/members`, { memberId }),
  
  // Remove member from room
  removeMember: (roomId, memberId) => api.delete(`/rooms/${roomId}/members/${memberId}`),
  
  // Get available users to add
  getAvailableUsers: (roomId) => api.get(`/rooms/${roomId}/available-users`),
  
  // Create poll in room
  createRoomPoll: (roomId, data) => api.post(`/rooms/${roomId}/polls`, data),
  
  // Get room polls
  getRoomPolls: (roomId) => api.get(`/rooms/${roomId}/polls`),
  
  // Start poll
  startPoll: (roomId, pollId) => api.post(`/rooms/${roomId}/polls/${pollId}/start`),
  
  // Close poll
  closePoll: (roomId, pollId) => api.post(`/rooms/${roomId}/polls/${pollId}/close`),
  
  // Vote in room poll
  voteInRoom: (roomId, pollId, data) => api.post(`/rooms/${roomId}/polls/${pollId}/vote`, data),
  
  // Delete room
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`)
};

export default api;