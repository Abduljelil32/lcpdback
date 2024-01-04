import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import helmet from "helmet";
dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    allowedHeaders: ["content-type", "Accept", "Origin", "Authorization"],
    exposedHeaders: ["Authorization"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "DELETE", "PATCH"],
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
