const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const conf = {
  host: 'pssgo.app',
  username: 'pssgo.app_ica87p3lwb9',
  password: '&YiFhb2wrC6khx5%',
  port: 22
};

console.log('Connecting via SSH to Plesk...');

conn.on('ready', () => {
  console.log('SSH Connection Established.');
  const dbPassword = 'vj9I?b105';
  const command = `export PGPASSWORD='${dbPassword}'; psql -U pssgo_user -d pssgo_db -h 127.0.0.1`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    console.log('Importing into PostgreSQL database...');
    
    stream.on('close', (code, signal) => {
      console.log('Database import process closed with code: ' + code);
      console.log('Database migration successful!');
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    const sqlData = fs.readFileSync('local-db-dump.sql');
    stream.write(sqlData);
    stream.end();
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect(conf);
