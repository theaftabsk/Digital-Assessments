const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const nginxConfig = `
# 1. Candidate Portal: assessment.greatcampus.tech
server {
    listen 80;
    server_name assessment.greatcampus.tech;

    client_max_body_size 50M;

    # Exact match for root / redirects to https://www.greatcampus.tech/assess
    location = / {
        return 302 https://www.greatcampus.tech/assess;
    }

    # All candidate sessions, proctoring & tests are proxied to port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. Backend API: api.assessment.greatcampus.tech
server {
    listen 80;
    server_name api.assessment.greatcampus.tech;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Client Admin Portal: admin.assessment.greatcampus.tech
server {
    listen 80;
    server_name admin.assessment.greatcampus.tech;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 4. Super Admin Portal: sa.assessment.greatcampus.tech
server {
    listen 80;
    server_name sa.assessment.greatcampus.tech;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('✔ Connected to VPS via SSH');

  function exec(cmd) {
    return new Promise((resolve) => {
      console.log(`▶ [CMD]: ${cmd}`);
      conn.exec(cmd, (err, stream) => {
        if (err) {
          console.error(err);
          return resolve();
        }
        stream.on('data', d => process.stdout.write(d));
        stream.stderr.on('data', d => process.stderr.write(d));
        stream.on('close', () => resolve());
      });
    });
  }

  conn.sftp(async (err, sftp) => {
    if (err) throw err;

    // 1. Update Nginx configuration
    console.log('Updating Nginx configuration with root redirect...');
    const b64 = Buffer.from(nginxConfig).toString('base64');
    await exec(`echo "${b64}" | base64 -d > /etc/nginx/sites-available/greatcampus.conf`);
    await exec('nginx -t && systemctl reload nginx');

    // 2. Upload assess page and next.config.ts to VPS
    console.log('Uploading assess page and next.config.ts to VPS...');
    const localAssess = path.join(__dirname, '..', 'candidate-portal', 'src', 'app', 'assess', 'page.tsx');
    const localConfig = path.join(__dirname, '..', 'candidate-portal', 'next.config.ts');

    await exec('mkdir -p /var/www/banca/candidate-portal/src/app/assess');

    sftp.fastPut(localAssess, '/var/www/banca/candidate-portal/src/app/assess/page.tsx', async () => {
      sftp.fastPut(localConfig, '/var/www/banca/candidate-portal/next.config.ts', async () => {
        console.log('✔ Uploaded assess/page.tsx & next.config.ts!');
        
        // 3. Rebuild candidate-portal and reload PM2
        await exec('cd /var/www/banca/candidate-portal && npm run build && pm2 restart candidate-portal');
        console.log('\n🎉 ALL UPDATES APPLIED SUCCESSFULLY!');
        conn.end();
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
