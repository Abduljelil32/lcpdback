import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { User, EmptyResponse, ResponseBody } from "src/shared/types";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body(new ValidationPipe({ transform: true })) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseBody<User> | EmptyResponse> {
    const result = await this.authService.login(body);
    if (result.success) {
      // const claim = { sub: result.data.id, email: result.data.email };
      const claim = { id: result.data.id };
      res.setHeader(
        "Authorization",
        `Bearer ${this.authService.createToken(claim)}`,
      );
      return result;
    } else {
      res.status(HttpStatus.UNAUTHORIZED);
      return result;
    }
  }
}
