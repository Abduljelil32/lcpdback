import * as Joi from "joi";

const envSchema = Joi.object({
  ALLOWED_ORIGINS: Joi.string(),
  PORT: Joi.number().default(8000),
  NODE_ENV: Joi.string()
    .valid("development", "production", "test", "staging")
    .default("development"),
  SESSION_SECRET: Joi.string(),
  JWT_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.string().alphanum(),
  DATABASE_URL: Joi.string(),
});

export default envSchema;
