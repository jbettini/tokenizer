// simple-server.js - Serveur HTTP minimaliste pour le test
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8545;
let mintCallback = null;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve HTML
    if (req.url === '/' || req.url === '/index.html') {
        const html = fs.readFileSync(path.join(__dirname, 'simple-front.html'), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }
    
    // Mint endpoint
    if (req.url === '/mint' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            const storageType = data.storage || 'ipfs';
            
            console.log(`\n✅ Mint button clicked from frontend! Storage: ${storageType.toUpperCase()}\n`);
            
            if (mintCallback) {
                mintCallback(storageType)
                    .then(result => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            mint: result.mint,
                            metadata: result.metadata,
                            transaction: result.transaction,
                            explorerUrl: `https://explorer.solana.com/address/${result.mint}?cluster=devnet`
                        }));
                    })
                    .catch(error => {
                        console.error('✅ Mint error:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: error.message
                        }));
                    });
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'No mint callback registered'
                }));
            }
        });
        return;
    }
    
    // Shutdown endpoint
    if (req.url === '/shutdown' && req.method === 'POST') {
        console.log('\n✅ Redirecting to explorer, closing connection...\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }
    
    // 404
    res.writeHead(404);
    res.end('Not found');
});

function startServer(callback) {
    mintCallback = callback;
    
    return new Promise((resolve) => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n✅ Frontend available at: http://localhost:${PORT}`);
            console.log('✅ Open this URL in your browser and click "Mint NFT"\n');
            resolve(server);
        });
    });
}

function stopServer() {
    return new Promise((resolve) => {
        server.close(() => {
            console.log('✅ Server stopped');
            resolve();
        });
    });
}

module.exports = { startServer, stopServer };
