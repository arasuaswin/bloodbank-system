const { execSync } = require('child_process');

console.log('Starting application initialization...');

try {
    console.log('Running Prisma DB Push...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Only seed if needed. The seed script checks internally.
    console.log('Running Database Seeding...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });

    console.log('Database setup completed successfully.');
} catch (error) {
    console.error('Warning: Database setup encountered an error:', error.message);
    // We don't exit here because we want the app to try starting anyway.
    // Connectivity issues will be visible in the app logs.
}

console.log('Starting Next.js Server...');
require('./server.js');
