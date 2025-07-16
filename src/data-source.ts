import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Contact } from './entity/Contact';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  synchronize: true,
  logging: false,
  entities: [Contact],
  migrations: [],
  subscribers: [],
}); 