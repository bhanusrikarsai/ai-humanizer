import handler from './index.js';

export default async function humanizeRoute(req, res) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/humanize';
  }
  return handler(req, res);
}
