import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { loadConfig } from "./common/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = loadConfig();
  await app.listen(config.port);

  Logger.log(
    `kpopschool-portfolio server listening on :${config.port} (INTEGRATION_MODE=${config.integrationMode})`,
    "Bootstrap",
  );
}

bootstrap();
