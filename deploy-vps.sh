#!/bin/bash
set -e

# ==============================================================================
# 🚀 AUTOMATED DEPLOYMENT SCRIPT FOR UBUNTU 24.04 (1GB RAM VPS)
# ==============================================================================

echo "=========================================================="
echo "⚡ Step 1: Configuring 2GB Swap Memory (Prevent OOM on 1GB RAM)"
echo "=========================================================="
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "✔ Swap configured successfully!"
else
  echo "✔ Swap already active."
fi

echo "=========================================================="
echo "📦 Step 2: System Update & Installing Essentials"
echo "=========================================================="
apt-get update -y
apt-get install -y curl git ufw nginx build-essential

# Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 Process Manager globally
npm install -g pm2

echo "✔ Node.js $(node -v) & PM2 installed!"

echo "=========================================================="
echo "🛡️ Step 3: Firewall & Ports"
echo "=========================================================="
ufw allow 20110/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 3000/tcp || true
ufw allow 3001/tcp || true
ufw allow 3002/tcp || true
ufw allow 4000/tcp || true

echo "=========================================================="
echo "📁 Step 4: PM2 Ecosystem Configuration"
echo "=========================================================="

cat << 'EOF' > /root/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "banca-backend",
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

echo "✔ Configuration ready!"
echo "=========================================================="
echo "🎉 Server preparation complete!"
echo "=========================================================="
