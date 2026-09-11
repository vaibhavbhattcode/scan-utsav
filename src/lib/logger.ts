type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };
    
    // In production, this could send logs to Datadog, Sentry, AWS CloudWatch, etc.
    const logString = JSON.stringify(payload);
    
    switch (level) {
      case "info":
        console.info(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "error":
        console.error(logString);
        break;
      case "debug":
        console.debug(logString);
        break;
    }
  }

  info(message: string, meta?: any) { this.log("info", message, meta); }
  warn(message: string, meta?: any) { this.log("warn", message, meta); }
  error(message: string, meta?: any) { this.log("error", message, meta); }
  debug(message: string, meta?: any) { this.log("debug", message, meta); }
}

export const logger = new Logger();
