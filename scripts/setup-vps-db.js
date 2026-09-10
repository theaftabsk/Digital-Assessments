const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    # Ensure database exists and set password for postgres user
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123456';"
    sudo -u postgres psql -c "CREATE DATABASE gratecmasse;" || echo "Database might already exist"
    sudo -u postgres psql -c "\\l"
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
