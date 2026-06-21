import API from './axios';

export const getLeaderboard = (page = 1, limit = 25) => API.get('/leaderboard', { params: { page, limit } });
