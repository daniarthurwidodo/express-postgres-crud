import app from './app';
import { RepositoryFactory } from './repositories/repository.factory';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await RepositoryFactory.closeConnections();
    console.log('Database connections closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await RepositoryFactory.closeConnections();
    console.log('Database connections closed');
  });
});