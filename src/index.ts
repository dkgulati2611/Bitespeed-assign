import express from 'express';
import { AppDataSource } from './data-source';

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// Placeholder for /identify route
app.post('/identify', (req, res) => {
  res.send('To be implemented');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 