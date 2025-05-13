const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

wss.on('connection', ws => {
  console.log('🔌 Новый клиент подключён');

  ws.on('message', message => {
    try {
      const data = JSON.parse(message.toString());
      const room = data.room || 'default';

      if (!rooms[room]) rooms[room] = [];
      const msg = { name: data.name, message: data.message, room };

      if (data.private && data.to) {
        msg.private = true;
        
        wss.clients.forEach(client => {
          if (
            client.readyState === WebSocket.OPEN &&
            client !== ws &&
            client.userName === data.to
          ) {
            client.send(JSON.stringify(msg));
          }
        });
        return;
      }

      ws.userName = data.name;

      rooms[room].push(msg);
      if (rooms[room].length > 50) rooms[room] = rooms[room].slice(-50);

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (err) {
      console.error('❌ Ошибка обработки сообщения:', err);
    }
  });

  ws.on('close', () => {
    console.log('❎ Клиент отключился');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер работает на порту ${PORT}`);
});
