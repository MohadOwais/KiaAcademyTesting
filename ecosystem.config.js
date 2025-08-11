module.exports = {
  apps: [
    {
      name: "kiacademy-next-app",         // Name for the PM2 process
      script: "npm",                     // Using npm as the script runner
      args: "start",                     // Runs `npm start` to start the Next.js server
      cwd: "/home/azureuser/build",      // Updated to match your app's directory
      exec_mode: "cluster",              // For multi-core utilization
      instances: "max",                  // Auto-detects CPU cores
      autorestart: true,                 // Automatically restarts on crashes
      watch: false,                      // Avoid watching in production mode
      env: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "azureuser",                      // SSH username
      host: "kiacademy.in",                  // Server hostname
      ref: "origin/master",                  // Git branch to deploy
      repo: "git@github.com:username/repo.git", // Replace with your actual repo URL
      path: "/home/azureuser/build",         // Path where your code will be deployed
      'pre-deploy-local': '',                
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''                        
    }
  }
};
