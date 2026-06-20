import API from './axios';

export const getHistory = (page = 1) => API.get(`/history?page=${page}&limit=10`);
export const getGameHistory = (gameId) => API.get(`/history/${gameId}`);
