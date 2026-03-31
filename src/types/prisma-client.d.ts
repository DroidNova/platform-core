declare module '@prisma/client' {
  interface PrismaClientOptions {
    datasources?: {
      db?: {
        url?: string;
      };
    };
  }

  export class PrismaClient {
    constructor(options?: PrismaClientOptions);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(eventType: 'beforeExit', callback: () => Promise<void> | void): void;
  }
}
