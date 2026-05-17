import { asyncHandler } from '../utils/errors.js';
import { loadRecommendationsForUser, loadSearchHistoryForUser, recordFlightSearchForUser } from '../services/flightDataService.js';

function getAuthenticatedUserId(req) {
  return Number(req.user?.id || req.user?.user_id || 0);
}

export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || getAuthenticatedUserId(req) || 0);
  res.json(await loadRecommendationsForUser(userId));
});

export const saveSearchHistory = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const saved = await recordFlightSearchForUser(userId, req.body || {});
  res.status(201).json(saved);
});

export const getSearchHistory = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  res.json(await loadSearchHistoryForUser(userId, Number(req.query.limit || 12)));
});
