import handler from './index.js';

export default async function presetsRoute(req, res) {
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api/presets';
  }
  return handler(req, res);
}
