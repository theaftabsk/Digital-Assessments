const { Client } = require('ssh2');

const nginxConfig = `
# 1. Candidate Portal: assessment.greatcampus.tech
server {
    listen 80;
    server_name assessment.greatcampus.tech;

    client_max_body_size 50M;

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
    return new Promise((resolve, reject) => {
      console.log(`\n▶ [CMD]: ${cmd}`);
      conn.exec(cmd, (err, stream) => {
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
          resolve({ code, stdout, stderr });
        });
      });
    });
  }

  (async () => {
    try {
      console.log('Writing Nginx configuration for greatcampus.tech domains...');
      
      // Write nginx configuration to /etc/nginx/sites-available/greatcampus.conf
      const escapedConfig = Buffer.from(nginxConfig).toString('base64');
      await exec(`echo "${escapedConfig}" | base64 -d > /etc/nginx/sites-available/greatcampus.conf`);

      // Enable the site and disable default if needed
      await exec('ln -sf /etc/nginx/sites-available/greatcampus.conf /etc/nginx/sites-enabled/greatcampus.conf');
      await exec('rm -f /etc/nginx/sites-enabled/default');

      // Test Nginx configuration
      console.log('\nTesting Nginx configuration...');
      const testResult = await exec('nginx -t');
      
      if (testResult.code === 0) {
        console.log('\n✔ Nginx config syntax is valid! Reloading Nginx...');
        await exec('systemctl restart nginx');
        await exec('systemctl status nginx --no-pager');
        console.log('\n🎉 ALL 4 DOMAINS ROUTED VIA NGINX SUCCESSFULLY!');
      } else {
        console.error('❌ Nginx configuration test failed!');
      }
    } catch (e) {
      console.error('Error applying Nginx config:', e);
    } finally {
      conn.end();
    }
  })();
});

conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
