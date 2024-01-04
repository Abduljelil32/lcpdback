/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { LoginInput } from "./dto/login.input";
import { User, ResponseBody, ResponseWithoutErrors } from "src/shared/types";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  bcrypt = require("bcryptjs");
  private readonly jwtConfig: object;
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtConfig = {
      secret: this.configService.get<string>("JWT_SECRET"),
      mutatePayload: false,
      expiresIn: 36000,
    };
  }

  async findUserById(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        },
      });

      if(user&&user.deleted){
        throw new UnauthorizedException('Your account has been deleted!')
      }
      return {...user, password:null}
    } catch (error) {
      return null
    }

  }

  async login(
    input: LoginInput,
  ): Promise<ResponseBody<User> | ResponseWithoutErrors<never>> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (user) {
      if (user.deleted) {
        throw new UnauthorizedException('Your account has been deleted!')
      }
      const isPassValid = await this.bcrypt.compare(
        input.password,
        user.password,
      );
      if (isPassValid) {
        return {
          success: true,
          message: "Welcome Back!",
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      } else {
        return { success: false, message: "Invalid Credentials!", data: null };
      }
    } else {
      return { success: false, message: "Invalid Credentials!", data: null };
    }
  }

  createToken(claim: object): string {
    const token = this.jwtService.sign(claim, this.jwtConfig);

    return token;
  }

  validateToken(token: string): boolean {
    try {
      this.jwtService.verify(token, this.jwtConfig);
      return true;
    } catch (error) {
      return false;
    }
  }

  decodeToken(token: string): object | string | null {
    try {
      return this.jwtService.decode(token, this.jwtConfig);
    } catch (error) {
      return null;
    }
  }
}
