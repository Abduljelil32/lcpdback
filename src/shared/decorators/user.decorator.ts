import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../types";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user as User;
  },
);
