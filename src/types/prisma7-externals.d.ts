declare module '@prisma/adapter-pg' {
  export class PrismaPg {
    constructor(options: { connectionString: string });
  }
}

declare module 'prisma/config' {
  export function env(name: string): string;

  export function defineConfig(config: {
    schema: string;
    migrations?: { path: string };
    datasource?: { url: string };
  }): unknown;
}
