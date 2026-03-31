declare module '@prisma/client' {
  interface PrismaClientOptions {
    datasourceUrl?: string;
  }

  export class PrismaClient {
    constructor(options?: PrismaClientOptions);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(eventType: 'beforeExit', callback: () => Promise<void> | void): void;
  }
}
