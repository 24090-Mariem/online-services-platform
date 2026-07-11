const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

let io = null;

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;
      if (!token) return next(new Error('Non authentifié'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.lastTokenUpdate = Date.now();
      next();
    } catch {
      next(new Error('Token invalide ou expiré'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    socket.on('token:update', (newToken) => {
      try {
        const decoded = verifyAccessToken(newToken);
        socket.userId = decoded.id;
        socket.lastTokenUpdate = Date.now();
      } catch {
        socket.emit('auth:expired');
        socket.disconnect(true);
      }
    });

    socket.heartbeatInterval = setInterval(() => {
      const timeSinceUpdate = Date.now() - socket.lastTokenUpdate;

      if (timeSinceUpdate < 30 * 60 * 1000) {
        return;
      }

      try {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies.token;
        if (!token) {
          socket.emit('auth:expired');
          socket.disconnect(true);
          return;
        }
        verifyAccessToken(token);
        socket.lastTokenUpdate = Date.now();
      } catch {
        socket.emit('auth:expired');
        socket.disconnect(true);
      }
    }, 5 * 60 * 1000);

    socket.on('disconnect', () => {
      if (socket.heartbeatInterval) {
        clearInterval(socket.heartbeatInterval);
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = { initIO, getIO };
