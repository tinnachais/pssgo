const { Client } = require('ssh2');
const net = require('net');

const conn = new Client();
const LOCAL_PORT = 54320;

conn.on('ready', () => {
  console.log('SSH ready. Starting local proxy server...');
  const server = net.createServer((sock) => {
    conn.forwardOut(sock.remoteAddress, sock.remotePort, '127.0.0.1', 5432, (err, stream) => {
      if (err) {
        console.error('Forwarding error:', err);
        sock.end();
        return;
      }
      sock.pipe(stream).pipe(sock);
    });
  }).listen(LOCAL_PORT, () => {
    console.log(`Tunnel active! Local port ${LOCAL_PORT} mapped to Plesk PostgreSQL.`);
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: 'pssgo.app',
  username: 'pssgo.app_ica87p3lwb9',
  password: '&YiFhb2wrC6khx5%',
  port: 22
});
