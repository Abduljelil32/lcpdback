import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { FilterModes, Filters, Sorters, User } from "src/shared/types";

export class UserFilterModes implements FilterModes<User> {
  id: "contains" | "equals";
  name: "contains" | "equals";
  email: "contains" | "equals";
  role: "contains" | "equals";
}

export class GetUsersParams {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number | null = null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number | null = null;

  @IsOptional()
  // @IsArray({ each: true })
  // @IsInstance(Filters<User>)
  @Type(() => Array<Filters<User>>)
  @Transform(({ value }) =>
    value ? (JSON.parse(value) as Filters<User>[]) : [],
  )
  filters?: Filters<User>[] | null = null;

  @IsOptional()
  // @IsInstance(UserFilterModes)
  @Type(() => UserFilterModes)
  @Transform(({ value }) =>
    value ? (JSON.parse(value) as UserFilterModes) : {},
  )
  filterModes?: UserFilterModes | null = null;

  @IsOptional()
  @IsString()
  @Type(() => String)
  search: string | null = null;

  @IsOptional()
  // @IsArray({ each: true })
  // @IsInstance(Sorters<User>)
  @Type(() => Array<Sorters<User>>)
  @Transform(({ value }) =>
    value ? (JSON.parse(value) as Sorters<User>[]) : [],
  )
  sorting?: Sorters<User>[] | null = null;
}
