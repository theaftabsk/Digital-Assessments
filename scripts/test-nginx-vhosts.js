const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    curl -I -H "Host: assessment.greatcampus.tech" http://127.0.0.1:80
    echo "---"
    curl -I -H "Host: api.assessment.greatcampus.tech" http://127.0.0.1:80/api/v1/super-admin/dashboard
  `, (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
});
conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
