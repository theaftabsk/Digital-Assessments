const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    pm2 status
    echo "=== Ports ==="
    ss -tulpn | grep -E ":(3000|3001|3002|4000|80)"
    echo "=== Backend logs ==="
    pm2 logs backend --lines 15 --nostream
    echo "=== Testing Local HTTP Responses ==="
    curl -I http://127.0.0.1:3000 || true
    curl -I http://127.0.0.1:4000/api || true
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
