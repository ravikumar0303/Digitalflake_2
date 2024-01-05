// const express = require('express');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3001;

// app.use(bodyParser.json());

// // MySQL connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'welcome',
//   database: 'test',
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL');
// });

// -----------------------------------------Endpoint to add a category
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'welcome',
  database: 'test',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// User signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error signing up:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ success: true, message: 'Signup successful' });
  });
});

// User login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// Add category
app.post('/api/addCategory', (req, res) => {
  const { categoryName } = req.body;

  const sql = 'INSERT INTO categories (category_name) VALUES (?)';
  db.query(sql, [categoryName], (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ success: true, message: 'Category added successfully' });
  });
});

// Add product
app.post('/api/addProduct', (req, res) => {
  const { productName, categoryId } = req.body;

  const sql = 'INSERT INTO products (product_name, category_id) VALUES (?, ?)';
  db.query(sql, [productName, categoryId], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ success: true, message: 'Product added successfully' });
  });
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const filePath = req.file.path;
  console.log('File uploaded:', filePath);
  res.json({ success: true, message: 'File uploaded successfully', filePath });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

