import handler from '../index.js';

export default async function authRoute(req, res) {
  return handler(req, res);
}
