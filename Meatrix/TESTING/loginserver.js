import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 300;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Basic route to serve the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public","LoginPage.html"));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    message: "Server is running", 
    timestamp: new Date().toISOString() 
  });
});

// Dashboard route (where users go after login)
app.get("/dashboard", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Meatrix Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c5282; }
        .menu { display: flex; gap: 15px; margin: 20px 0; }
        .menu a { padding: 10px 15px; background: #4caf50; color: white; text-decoration: none; border-radius: 4px; }
        .menu a:hover { background: #388e3c; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Meatrix Dashboard</h1>
        <p>You have successfully logged in to the Livestock Management System.</p>
        
        <div class="menu">
          <a href="/livestock">Livestock Management</a>
          <a href="/meat-batches">Meat Batches</a>
          <a href="/sales">Sales Records</a>
          <a href="/analytics">Analytics</a>
        </div>
        
        <h2>System Information</h2>
        <p>This is a demonstration dashboard. In a real application, you would see:</p>
        <ul>
          <li>Livestock inventory and health records</li>
          <li>Meat production batches</li>
          <li>Sales and distribution data</li>
          <li>Analytics and reporting</li>
        </ul>
        
        <p><a href="/">← Back to Login</a></p>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Login page available at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});