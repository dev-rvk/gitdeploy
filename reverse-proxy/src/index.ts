import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxy();

const PORT = 8000;
const BASE_URL = "https://vercel-project-files.s3.ap-south-1.amazonaws.com"

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split('.')[0]

  const proxyUrl = `${BASE_URL}/${subdomain}`
  
  // Proxy the request
  proxy.web(req, res, { target: proxyUrl, changeOrigin: true }, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Proxy Error');
    }
  });

});

// append 'index.html' to thr root '/' route if not mentioned
proxy.on('proxyReq', (proxyReq, req, res) => {
    if (req.url === '/') {
      proxyReq.path += 'index.html';
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
