const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPage = path.join(__dirname, '..', 'candidate-portal', 'src', 'app', 'page.tsx');
    const localExam = path.join(__dirname, '..', 'candidate-portal', 'src', 'app', 'exam', 'page.tsx');

    sftp.fastPut(localPage, '/var/www/banca/candidate-portal/src/app/page.tsx', () => {
      sftp.fastPut(localExam, '/var/www/banca/candidate-portal/src/app/exam/page.tsx', () => {
        conn.exec('cd /var/www/banca/candidate-portal && npm run build && pm2 restart candidate-portal', (execErr, stream) => {
          stream.on('data', d => process.stdout.write(d));
          stream.on('close', () => {
            console.log('✔ Candidate portal rebuilt and reloaded on VPS!');
            conn.end();
          });
        });
      });
    });
  });
});
conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
