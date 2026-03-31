const { defineConfig } = require('prisma/config');

const defaultDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5432/platform_core?schema=public';

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || defaultDatabaseUrl,
  },
});
