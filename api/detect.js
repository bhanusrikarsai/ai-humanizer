import handler from './index.js';

export default async function detectRoute(req, res) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/detect';
  }
  return handler(req, res);
}
