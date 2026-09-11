import { IntegrationLog } from './types';

const LOG_STORAGE_KEY = 'autofix_integration_logs';
const MAX_LOGS = 200;

type LogListener = (logs: IntegrationLog[]) => void;

class IntegrationLogger {
  private logs: IntegrationLog[] = [];
  private listeners: Set<LogListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      this.logs = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
    } catch {
      // Storage quota or sandboxing
    }
    this.notify();
  }

  private notify() {
    const copy = [...this.logs];
    this.listeners.forEach((listener) => listener(copy));
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public log(
    level: IntegrationLog['level'],
    event: IntegrationLog['event'],
    message: string,
    details?: Record<string, unknown>
  ): IntegrationLog {
    const entry: IntegrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      event,
      message,
      details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.pop();
    }

    this.persist();
    return entry;
  }

  public info(event: IntegrationLog['event'], message: string, details?: Record<string, unknown>) {
    return this.log('info', event, message, details);
  }

  public warn(event: IntegrationLog['event'], message: string, details?: Record<string, unknown>) {
    return this.log('warn', event, message, details);
  }

  public error(event: IntegrationLog['event'], message: string, details?: Record<string, unknown>) {
    return this.log('error', event, message, details);
  }

  public debug(event: IntegrationLog['event'], message: string, details?: Record<string, unknown>) {
    return this.log('debug', event, message, details);
  }

  public getLogs(): IntegrationLog[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }
}

export const logger = new IntegrationLogger();
