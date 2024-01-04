import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction): void {
    this.logger.log(`${req.method} ${req.url}`);
    next();
  }
}
