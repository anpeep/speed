const fs = require('fs');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

// 1. Create HTTP Server to serve dashboard.html locally
const server = http.createServer((req, res) => {
    // Default root URL serves dashboard.html
    let filePath = path.join(__dirname, req.url === '/' ? 'dashboard.html' : req.url);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }
        
        // Set correct content type
        let ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'application/javascript';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// 2. Attach WebSocket server to the same HTTP server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('⚡ New player extension connected!');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Broadcast player stats to all connected dashboards (projector & spectator views)
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (e) {
            console.error('Invalid message format:', message);
        }
    });

    ws.on('close', () => {
        console.log('🔌 Player disconnected.');
    });
});

// 3. Start listening on port 8080
server.listen(8080, '0.0.0.0', () => {
    console.log('===================================================');
    console.log('🎮 SPEEDRUN CANTINA SERVER STARTED!');
    console.log('📡 Open Dashboard on Projector: http://10.70.2.100:8080');
    console.log('⚠️ Put this IP in your extension: const SERVER_IP = "10.70.2.100";');
    console.log('===================================================');
});
