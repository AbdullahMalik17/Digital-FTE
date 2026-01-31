try {
  console.log('Attempting to load Metro config...');
  const config = require('./metro.config.js');
  console.log('Successfully loaded Metro config!');
} catch (error) {
  console.error('Failed to load Metro config:', error);
  process.exit(1);
}
