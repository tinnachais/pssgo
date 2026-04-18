const { Client } = require('ssh2');

const conn = new Client();

const conf = {
  host: 'pssgo.app',
  username: 'pssgo.app_ica87p3lwb9',
  password: '&YiFhb2wrC6khx5%',
  port: 22
};

conn.on('ready', () => {
  const command = `export PGPASSWORD='vj9I?b105'; psql -U pssgo_user -d pssgo_db -h 127.0.0.1 -c "\\dt"`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', (code, signal) => {
      console.log('--- Output ---');
      console.log(out);
      conn.end();
    }).on('data', (data) => {
      out += data.toString();
    }).stderr.on('data', (data) => {
      out += 'ERR: ' + data.toString();
    });
  });
}).connect(conf);
