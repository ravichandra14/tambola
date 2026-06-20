import API from './axios';

export const submitClaim = (data) => API.post('/claims/submit', data);
export const approveClaim = (id) => API.patch(`/claims/${id}/approve`);
export const rejectClaim = (id) => API.patch(`/claims/${id}/reject`);
export const getGameClaims = (gameId) => API.get(`/claims/game/${gameId}`);
