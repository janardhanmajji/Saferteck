const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json()); 


app.use((req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}`;
  console.log(logEntry);
  fs.appendFile('server.log', logEntry + '\n', (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  next();
});


app.post('/createFile', async (req, res) => {
  const { filename, content, password } = req.body;
  if (!filename || !content) {
    return res.status(400).send('Both filename and content are required.');
  }

  if (password !== 'optionalPassword') {
    return res.status(401).send('Unauthorized');
  }

  try {
    await fs.writeFile(filename, content);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error creating file:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/getFiles', async (req, res) => {
  try {
    const files = await fs.readdir(__dirname);
    res.json(files);
  } catch (err) {
    console.error('Error getting files:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/getFile', async (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).send('Filename parameter is required.');
  }

  try {
    const fileContent = await fs.readFile(filename, 'utf-8');
    res.send(fileContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(400).send('File not found');
    }
    console.error('Error getting file content:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.put('/modifyFile', async (req, res) => {
  const { filename, content, password } = req.body;
  if (!filename || !content) {
    return res.status(400).send('Both filename and content are required.');
  }

  if (password !== 'optionalPassword') {
    return res.status(401).send('Unauthorized');
  }

  try {
    await fs.writeFile(filename, content);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error modifying file:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.delete('/deleteFile', async (req, res) => {
  const { filename, password } = req.body;
  if (!filename) {
    return res.status(400).send('Filename parameter is required.');
  }

  if (password !== 'optionalPassword') {
    return res.status(401).send('Unauthorized');
  }

  try {
    await fs.unlink(filename);
    res.sendStatus(200);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(400).send('File not found');
    }
    console.error('Error deleting file:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
