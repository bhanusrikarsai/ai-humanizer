import handler from './index.js';

export default async function catchallRoute(req, res) {
  return handler(req, res);
}
