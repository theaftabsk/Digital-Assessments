const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', async () => {
  console.log('✔ Connected to VPS via SSH');

  function exec(cmd) {
    return new Promise((resolve) => {
      console.log(`\n▶ [CMD]: ${cmd}`);
      conn.exec(cmd, (err, stream) => {
        if (err) {
          console.error(err);
          return resolve();
        }
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('close', () => resolve());
      });
    });
  }

  try {
    console.log('=== BEFORE CLEANUP DISK USAGE ===');
    await exec('df -h /');

    console.log('=== FINDING LARGEST DIRECTORIES ===');
    await exec('du -ahx / 2>/dev/null | sort -rh | head -n 25');

    console.log('=== CLEANING OLD PROJECTS & LEFTOVERS ===');
    // Check what is inside /var/www and /root
    await exec('ls -lh /var/www /root');

    // Remove old codelab or dead projects in /var/www or /root if any
    await exec('rm -rf /var/www/codelab* /root/.npm/_cacache /root/.cache');

    console.log('=== CLEANING APT CACHE & ORPHAN PACKAGES ===');
    await exec('apt-get autoremove --purge -y');
    await exec('apt-get clean');
    await exec('rm -rf /var/lib/apt/lists/*');

    console.log('=== VACUUMING SYSTEMD LOGS & LOG ROTATIONS ===');
    await exec('journalctl --vacuum-size=20M');
    await exec('find /var/log -type f -name "*.gz" -delete');
    await exec('find /var/log -type f -name "*.1" -delete');
    await exec('find /var/log -type f -name "*.log" -exec truncate -s 0 {} +');

    console.log('=== CLEANING DOCKER / CONTAINERD IF UNUSED ===');
    await exec('docker system prune -a --volumes -f 2>/dev/null || true');

    console.log('=== CLEANING TEMPORARY DIRECTORIES ===');
    await exec('rm -rf /tmp/* /var/tmp/*');

    console.log('=== AFTER CLEANUP DISK USAGE ===');
    await exec('df -h /');
  } catch (e) {
    console.error('Cleanup error:', e);
  } finally {
    conn.end();
  }
});

conn.connect({
  host: '148.113.1.66',
  port: 20110,
  username: 'root',
  password: 'VNciiCMQZjd07itn',
});
