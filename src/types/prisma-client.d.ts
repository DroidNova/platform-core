declare module '@prisma/client' {
  export class PrismaClient {
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(eventType: 'beforeExit', callback: () => Promise<void> | void): void;
  }
}
