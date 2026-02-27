const BACKEND_URL = process.env.BACKEND_URL || 'https://mandi-deals-backend-production.up.railway.app';

export default async function handler(req, res) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : '';
  
  const targetUrl = `${BACKEND_URL}/${pathString}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    
    // Copy response headers
    Object.entries(response.headers.raw()).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(response.status);
    
    if (data) {
      try {
        res.json(JSON.parse(data));
      } catch {
        res.send(data);
      }
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Backend service unavailable', details: error.message });
  }
}
