const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const conf = {
  host: 'pssgo.app',
  username: 'pssgo.app_ica87p3lwb9',
  password: '&YiFhb2wrC6khx5%',
  port: 22
};

const REMOTE_DIR = 'pssgo';
const LOCAL_TAR = 'deploy.tar.gz';
const REMOTE_TAR = `deploy.tar.gz`;

console.log('Connecting via SSH...');

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('Uploading archive...');
    sftp.fastPut(LOCAL_TAR, REMOTE_TAR, (err) => {
      if (err) throw err;
      console.log('Upload complete. Extracting...');
      
      const commands = [
        `mkdir -p ${REMOTE_DIR}`,
        `tar -xzf ${REMOTE_TAR} -C ${REMOTE_DIR}`,
        `rm ${REMOTE_TAR}`,
        `echo 'Extraction complete!'`
      ];

      conn.exec(commands.join(' && '), (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    });
  });
}).connect(conf);
