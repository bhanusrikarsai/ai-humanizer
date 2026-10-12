import handler from './index.js';

export default async function healthRoute(req, res) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/health';
  }
  return handler(req, res);
}
