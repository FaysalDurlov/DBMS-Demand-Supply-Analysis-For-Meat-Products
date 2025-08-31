export let users = [
  {
    id: "admin",
    email: "admin@meatrix.com",
    password: "admin123",
    userType: "admin",
    name: "System Administrator",
    createdAt: new Date().toISOString()
  },
  {
    id: "farmer1",
    email: "farmer@meatrix.com",
    password: "farmer123",
    userType: "farmer",
    name: "John Farmer",
    createdAt: new Date().toISOString()
  },
  {
    id: "agent1",
    email: "agent@meatrix.com",
    password: "agent123",
    userType: "agent",
    name: "Sarah Agent",
    createdAt: new Date().toISOString()
  }
];