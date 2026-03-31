export class PrismaClient {
  constructor(options?: { adapter?: unknown });
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $on(eventType: 'beforeExit', callback: () => Promise<void> | void): void;
}
