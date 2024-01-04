import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/shared/types";
import { AuthService } from "../auth.service";
import { UserClaim } from "src/shared/types";

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  logger = new Logger(JwtAuthStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
      ignoreExpiration:
        configService.get<string>("JWT_IGNORE_EXPIRATION") == "true",
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }
  async validate(payload): Promise<User | null> {
    return this.authService
      .findUserById(payload?.id)
      .then(user => {
        return user;
      })
      .catch(err => {
        this.logger.error(`JwtAuthStrategy::validate ${err.message}`);
        return null;
      });
  }
}
