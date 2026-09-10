const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✔ Connected to VPS');
  conn.exec(`
    # Kill any standalone processes using 3000, 3001, 3002, 4000, 5000
    fuser -k 3000/tcp || true
    fuser -k 3001/tcp || true
    fuser -k 3002/tcp || true
    fuser -k 4000/tcp || true
    fuser -k 5000/tcp || true
    
    echo "=== Active listening TCP ports ==="
    ss -tulpn | grep -E ":(3000|3001|3002|4000|5000|80|443|22|20110)" || echo "Ports are completely clear!"
  `, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => process.stdout.write(d));
    stream.on('close', () => {
      conn.end();
    });
  });
});
conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
