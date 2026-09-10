const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const localArchive = path.join(__dirname, '..', 'banca_source.tar.gz');
const remoteArchive = '/var/www/banca_source.tar.gz';

const conn = new Client();

function exec(client, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`▶ [REMOTE CMD]: ${cmd}`);
    console.log(`======================================================`);
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (d) => {
        stdout += d.toString();
        process.stdout.write(d);
      });
      stream.stderr.on('data', (d) => {
        stderr += d.toString();
        process.stderr.write(d);
      });
      stream.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          console.warn(`⚠️ Exited with code ${code}`);
          resolve({ stdout, stderr, code });
        }
      });
    });
  });
}

conn.on('ready', () => {
  console.log('✔ Connected to VPS via SSH');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    console.log(`📤 Uploading ${localArchive} to VPS (${remoteArchive})...`);
    const readStream = fs.createReadStream(localArchive);
    const writeStream = sftp.createWriteStream(remoteArchive);

    writeStream.on('close', async () => {
      console.log('✔ Upload complete!');

      try {
        // 1. Unpack project
        await exec(conn, `
          mkdir -p /var/www/banca
          tar -xzf /var/www/banca_source.tar.gz -C /var/www/banca
          if [ -d "/var/www/banca/super admin" ]; then
            rm -rf /var/www/banca/super-admin
            mv "/var/www/banca/super admin" /var/www/banca/super-admin
          fi
          ls -la /var/www/banca
        `);

        // 2. Setup backend .env & Prisma Database
        await exec(conn, `
          cat << 'EOF' > /var/www/banca/backend/.env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/gratecmasse?schema=public"
JWT_SECRET="super-secret-jwt-key-banca-arm"
PORT=4000
CANDIDATE_PORTAL_URL="https://assessment.greatcampus.tech"
EOF
          cd /var/www/banca/backend
          npm install --production=false
          npx prisma db push --accept-data-loss
          npm run build
        `);

        // 3. Build candidate-portal
        await exec(conn, `
          cd /var/www/banca/candidate-portal
          cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL="https://api.assessment.greatcampus.tech"
NEXT_PUBLIC_API_BASE_URL="https://api.assessment.greatcampus.tech"
EOF
          npm install --production=false
          npm run build
        `);

        // 4. Build admin-portal
        await exec(conn, `
          cd /var/www/banca/admin-portal
          cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL="https://api.assessment.greatcampus.tech"
NEXT_PUBLIC_API_BASE_URL="https://api.assessment.greatcampus.tech"
EOF
          npm install --production=false
          npm run build
        `);

        // 5. Build super-admin
        await exec(conn, `
          cd /var/www/banca/super-admin
          cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL="https://api.assessment.greatcampus.tech"
NEXT_PUBLIC_API_BASE_URL="https://api.assessment.greatcampus.tech"
EOF
          npm install --production=false
          npm run build
        `);

        // 6. PM2 Ecosystem Configuration and Launch
        await exec(conn, `
          cat << 'EOF' > /var/www/banca/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "/var/www/banca/backend",
      script: "dist/src/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      },
      max_memory_restart: "250M"
    },
    {
      name: "candidate-portal",
      cwd: "/var/www/banca/candidate-portal",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "250M"
    },
    {
      name: "admin-portal",
      cwd: "/var/www/banca/admin-portal",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      max_memory_restart: "250M"
    },
    {
      name: "super-admin",
      cwd: "/var/www/banca/super-admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      },
      max_memory_restart: "250M"
    }
  ]
};
EOF
          pm2 delete all || true
          pm2 start /var/www/banca/ecosystem.config.js
          pm2 save
          pm2 status
        `);

        // 7. Verify ports listening
        await exec(conn, 'ss -tulpn | grep -E ":(3000|3001|3002|4000|80)"');

        console.log('\n🎉🎉 DEPLOYMENT COMPLETED! ALL SITES SHOULD BE LIVE! 🎉🎉');
      } catch (deployErr) {
        console.error('Deployment error:', deployErr);
      } finally {
        conn.end();
      }
    });

    readStream.pipe(writeStream);
  });
});

conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
