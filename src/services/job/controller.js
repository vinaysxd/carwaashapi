const jobService = require('./service');
const { getPaginationParams, paginatedResponse } = require('../../utils/pagination');

async function getTodayJobs(req, res, next) {
  try {
    const result = await jobService.getTodayJobs(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyJobs(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { jobs, total } = await jobService.getMyJobs(req.user.id, { limit, offset });
    res.json({ success: true, ...paginatedResponse(jobs, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

async function startJob(req, res, next) {
  try {
    const result = await jobService.startJob(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function completeJob(req, res, next) {
  try {
    const result = await jobService.completeJob(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function skipJob(req, res, next) {
  try {
    const reason = req.body?.reason || '';
    const result = await jobService.skipJob(req.params.id, req.user.id, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function uploadPhotos(req, res, next) {
  try {
    const { before_photo, after_photo } = req.body;
    const result = await jobService.uploadPhotos(req.params.id, req.user.id, { before_photo, after_photo });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodayJobs, getMyJobs, startJob, completeJob, skipJob, uploadPhotos };
