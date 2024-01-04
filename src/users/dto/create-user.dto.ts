import { OmitType } from "@nestjs/mapped-types";
import { User } from "src/shared/types";

export class CreateUserDto extends OmitType(User, ["id"]) {}
