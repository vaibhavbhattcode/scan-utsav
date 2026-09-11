import { NextResponse } from "next/server";
import { logger } from "./logger";

export class ApiError extends Error {
  public status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type ApiHandler = (req: Request, ...args: any[]) => Promise<NextResponse> | NextResponse;

/**
 * Wrapper for API route handlers to centralize error handling and logging.
 */
export function withErrorHandling(handler: ApiHandler) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      const isApiError = error instanceof ApiError;
      const status = isApiError ? error.status : (error.status || 500);
      
      const errorMessage = error.message || "Internal Server Error";
      
      // Log the error
      if (status >= 500) {
        logger.error(`[API Error] ${req.method} ${req.url}`, {
          error: errorMessage,
          stack: error.stack,
          status
        });
      } else {
        logger.warn(`[API Warning] ${req.method} ${req.url}`, {
          error: errorMessage,
          status
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: process.env.NODE_ENV === "development" ? errorMessage : (status >= 500 ? "Internal Server Error" : errorMessage)
        }, 
        { status }
      );
    }
  };
}
