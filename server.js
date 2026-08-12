import app from './src/app.js';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';


const getNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {

      if (iface.internal === false && iface.family === 'IPv4') {
        ips.push({
          interface: interfaceName,
          address: iface.address
        });
      }
    }
  }
  return ips;
};

const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on:`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Local: http://127.0.0.1:${PORT}`);


  const networkIPs = getNetworkIPs();
  if (networkIPs.length > 0) {
    console.log(` Network Access:`);
    networkIPs.forEach(ip => {
      console.log(`http://${ip.address}:${PORT} (${ip.interface})`);
    });
  }

  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});


app.get('/wifi-info', (req, res) => {
  const networkIPs = getNetworkIPs();
  res.json({
    success: true,
    data: {
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrls: networkIPs.map(ip => ({
        url: `http://${ip.address}:${PORT}`,
        interface: ip.interface
      })),
      allIps: networkIPs
    }
  });
});

app.get('/my-ip', (req, res) => {
  const networkIPs = getNetworkIPs();
  const ips = networkIPs.map(ip => ip.address);
  res.json({
    success: true,
    localIp: ips[0] || 'No network IP found',
    allIps: ips,
    serverUrl: ips[0] ? `http://${ips[0]}:${PORT}` : null
  });
});


const gracefulShutdown = () => {
  console.log(' Received shutdown signal, closing server...');

  server.close((err) => {
    if (err) {
      console.error('Error closing server:', err);
      process.exit(1);
    }

    console.log('Server closed successfully');
    process.exit(0);
  });


  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});