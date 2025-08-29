import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bolbona15203118",
  // Bolbona15203118
  // Shihab14032001
  database: "livestockdb",
});
console.log("Connected to the database.");