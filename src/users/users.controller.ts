/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  UseGuards,
  Delete,
  Param,
  Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ResponseBody,
  ResponseWithErrors,
  Role,
  User,
} from "src/shared/types";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { RBACGuard } from "src/auth/rbac.guard";
import { CurrentUser, Roles } from "src/shared/decorators";
import { user_role } from "@prisma/client";
import { Response } from "express";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create({ ...createUserDto,
       role: user_role.student 
      });
  }

  // @Post()
  // @UseGuards(JwtAuthGuard, RBACGuard)
  // @Roles(Role.ADMIN)
  // async adminCreate(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Get("/")
  // @UseGuards(JwtAuthGuard, RBACGuard)
  // @Roles(Role.ADMIN)
  // async findAll(
  //   @Query(new ValidationPipe({ transform: true })) params: GetUsersParams,
  // ): Promise<
  //   ResponseBody<PaginatedResult<User, "users">> | ResponseWithErrors
  // > {
  //   return this.usersService.findAll(params);
  // }
  @Get("/")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('role') role: Role) {
    return this.usersService.findAll(role);
  }

  @Get("/profile")
  @UseGuards(JwtAuthGuard)
  getProfile(
    @CurrentUser() user: User,
  ) {
    // console.log(JSON.stringify(user));
    // return this.usersService.getProfile();
    return { data: { ...user, password: null } }
  }

  @Patch("/update-profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Body() body: UpdateUserDto,
    @CurrentUser() user: User) {
    return this.usersService.updateProfile(body, user);
  }

  @Patch("/update-password")
  @UseGuards(JwtAuthGuard)
  updatePassword(@Body() body) {
    return this.usersService.updatePassword(body);
  }

  @Post("/create-lecturer")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(user_role.admin)
  createLecturer(@Body() body) {
    return this.usersService.create({ ...body, role: user_role.lecturer })
  }


  @Get(":id")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  async findOne(
    @Param("id") id: string,
  ): Promise<ResponseBody<User | null> | ResponseWithErrors> {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseBody<User> | ResponseWithErrors> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  remove(
    @Param("id") id: string,
  ) {
    return this.usersService.deleteUser(+id);
  }

  @Get("/request-exam/:purchaseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  requestExam(@Param("purchaseHistoryId") purcahseHistoryId: string) {
    return this.usersService.requestExam(+purcahseHistoryId)
  }

  @Get("/took-exam/:purchaseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  tookExam(@Param("purchaseHistoryId") purcahseHistoryId: string) {
    return this.usersService.tookExam(+purcahseHistoryId)
  }

  @Get("/generate-cert/:purchaseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  generateCert(@Param("purchaseHistoryId") purcahseHistoryId: string) {
    return this.usersService.generateCert(+purcahseHistoryId)
  }

  @Get("/download-cert/:purchaseHistoryId")
  @UseGuards(JwtAuthGuard,RBACGuard)
  async downloadCert(
    @Res({passthrough: true}) res: Response,
    @Param("purchaseHistoryId") purcahseHistoryId: string
  ) {
    const file = await this.usersService.downloadCert(+purcahseHistoryId);
    // return file
    res.send(file)
  }

}
