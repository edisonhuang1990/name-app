const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/api/amap/geocode')) {
        try {
            const key = process.env.AMAP_KEY || '';
            const q = new URL(req.url, 'http://localhost:3001');
            const addressParam = q.searchParams.get('address') || '';
            console.log(`[AMAP] Requesting geocode for: ${addressParam}, Key present: ${!!key}`);
            
            if (!key) {
                console.error('[AMAP] Error: AMAP_KEY not set');
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: 'AMAP_KEY not set' }));
                return;
            }

            const city = q.searchParams.get('city') || '';
            if (!addressParam) {
                 res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                 res.end(JSON.stringify({ error: 'address required' }));
                 return;
            }
            const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(addressParam)}${city ? `&city=${encodeURIComponent(city)}` : ''}&key=${key}`;
            const resp = await fetch(url);
            const data = await resp.json();
            console.log('[AMAP] Response:', JSON.stringify(data));
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(data));
        } catch (e) {
            console.error('[AMAP] Exception:', e);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'proxy error: ' + e.message }));
        }
        return;
    }
    let filePath = '.' + req.url;
    if (filePath == './') filePath = './index.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
    }

    fs.readFile(path.join(__dirname, filePath), (error, content) => {
        if (error) {
            if(error.code == 'ENOENT'){
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(3001, () => {
    console.log('Server running at http://localhost:3001/');
});
