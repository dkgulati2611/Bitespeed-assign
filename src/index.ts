import express from 'express';
import { AppDataSource } from './data-source';
import identifyRouter from './routes/identify';

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: unknown) => {
    console.error('Error during Data Source initialization', err);
  });

app.use('/identify', identifyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 