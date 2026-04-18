const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH ready. Executing commands...');
  conn.exec('pwd && ls -la && ls -la httpdocs/public/uploads/vehicles || ls -la pssgo/public/uploads/vehicles', (err, stream) => {
    if (err) throw err;
    let dataOut = '';
    stream.on('close', (code, signal) => {
      console.log('Final output:\n' + dataOut);
      conn.end();
    }).on('data', (data) => {
      dataOut += data.toString();
    }).stderr.on('data', (data) => {
      dataOut += '--STDERR--\n' + data.toString();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: 'pssgo.app',
  username: 'pssgo.app_ica87p3lwb9',
  password: '&YiFhb2wrC6khx5%',
  port: 22
});
