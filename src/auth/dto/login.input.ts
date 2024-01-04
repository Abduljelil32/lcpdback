import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginInput {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  password: string;
}
