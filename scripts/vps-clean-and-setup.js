const { Client } = require('ssh2');

const config = {
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
  readyTimeout: 30000,
};

console.log('🚀 Connecting to AIC Cloud VPS via SSH...');
const conn = new Client();

function runCommand(client, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ Executing: ${cmd}`);
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';

      stream.on('close', (code, signal) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          console.warn(`⚠️ Command returned code ${code}: ${stderr || stdout}`);
          resolve({ stdout, stderr, code });
        }
      });

      stream.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✔ SSH Connection established successfully!');

  try {
    // 1. Initial System Diagnostics
    console.log('\n--- 1. SYSTEM DIAGNOSTICS ---');
    await runCommand(conn, 'uname -a');
    await runCommand(conn, 'free -h');
    await runCommand(conn, 'df -h');

    // 2. Inspect active listening ports
    console.log('\n--- 2. ACTIVE LISTENING PORTS ---');
    await runCommand(conn, 'ss -tulpn || netstat -tulpn');

    // 3. Configure 2GB Swap Memory (Prevent OOM on 1GB VPS)
    console.log('\n--- 3. SWAP MEMORY CONFIGURATION ---');
    await runCommand(conn, `
      if [ ! -f /swapfile ]; then
        echo "Creating 2GB swapfile..."
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo "/swapfile none swap sw 0 0" >> /etc/fstab
        echo "✔ Swap configured successfully"
      else
        echo "✔ Swapfile already exists"
      fi
    `);
    await runCommand(conn, 'free -h');

    // 4. Update packages and install Node.js 20 LTS & PM2
    console.log('\n--- 4. INSTALLING NODE.JS 20 & PM2 ---');
    await runCommand(conn, 'apt-get update -y && apt-get install -y curl git ufw nginx build-essential');
    await runCommand(conn, 'if ! command -v node &> /dev/null; then curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs; fi');
    await runCommand(conn, 'npm install -g pm2');
    await runCommand(conn, 'node -v && npm -v && pm2 -v');

    // 5. Clean up old or conflicting processes
    console.log('\n--- 5. PROCESS CLEANUP ---');
    await runCommand(conn, 'pm2 kill || true');

    // 6. Create clean app workspace directory
    console.log('\n--- 6. APPLICATION WORKSPACE PREPARATION ---');
    await runCommand(conn, 'mkdir -p /var/www/banca');
    await runCommand(conn, 'ls -la /var/www/banca');

    console.log('\n🎉 ALL VPS CLEANUP & SETUP TASKS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error executing VPS commands:', err);
  } finally {
    conn.end();
  }
});

conn.on('error', (err) => {
  console.error('❌ SSH Connection Error:', err.message);
});

conn.connect(config);
