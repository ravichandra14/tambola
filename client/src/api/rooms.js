import API from './axios';

export const createRoom = (data) => API.post('/rooms/create', data);
export const getRoomByCode = (code) => API.get(`/rooms/${code}`);
export const joinRoom = (code) => API.post(`/rooms/${code}/join`);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const removePlayer = (roomId, playerId) => API.delete(`/rooms/${roomId}/remove-player/${playerId}`);
