const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('systemctl status cloudflared --no-pager 2>/dev/null || which cloudflared', (err, stream) => {
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
