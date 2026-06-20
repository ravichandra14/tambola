import API from './axios';

export const startGame = (roomId) => API.post('/games/start', { roomId });
export const getGame = (id) => API.get(`/games/${id}`);
export const getMyTicket = (gameId) => API.get(`/games/${gameId}/my-ticket`);
export const pauseGame = (id) => API.patch(`/games/${id}/pause`);
export const resumeGame = (id) => API.patch(`/games/${id}/resume`);
export const endGame = (id) => API.patch(`/games/${id}/end`);
export const callNumber = (id) => API.post(`/games/${id}/call-number`);
