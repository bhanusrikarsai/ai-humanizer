import handler from './index.js';

export default async function checkDetectorsRoute(req, res) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/check-detectors';
  }
  return handler(req, res);
}
