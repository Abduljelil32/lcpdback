/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  CustomRequest,
  EmptyResponse,
  PaginatedResult,
  ResponseBody,
  ResponseWithErrors,
  Role,
  User,
} from "src/shared/types";
import { PrismaService } from "src/prisma.service";
// import { GetUsersParams, UserFilterModes } from "./dto/get-users.dto";
import { UpdateUserPassDto } from "./dto/update-user-pass.dto";
import { REQUEST } from "@nestjs/core";
import { AuthService } from "src/auth/auth.service";
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import Jimp from 'jimp';

@Injectable()
export class UsersService {
  bcrypt = require("bcryptjs");
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly req: CustomRequest,
    private readonly authService: AuthService
  ) {

  }

  // async create(
  //   createUserDto: CreateUserDto,
  // ): Promise<ResponseBody<User> | ResponseWithErrors> {
  //   const defaultPass = `${
  //     createUserDto.email.split("@")[0]
  //   }${new Date().getFullYear()}+`;
  //   const res = await this.prisma.user.create({
  //     data: {
  //       ...createUserDto,
  //       password: this.bcrypt.hashSync(defaultPass, 10),
  //     },
  //   });
  //   return {
  //     success: true,
  //     message: "User created successfully",
  //     data: res,
  //   };
  // }

  async create(createUserDto: CreateUserDto) {
    // const defaultPass = `${
    //   createUserDto.email.split("@")[0]
    // }${new Date().getFullYear()}+`;
    const user = await this.prisma.user.findFirst({
      where: { email: createUserDto.email },
    });
    if (user) throw new BadRequestException("Email Alredy Registered!");
    const res = await this.prisma.user.create({
      data: {
        ...createUserDto,
        // role: "student",
        password: this.bcrypt.hashSync(createUserDto.password, 10),
      },
    });

    const token = this.authService.createToken({ id: res.id })
    // const token = this.jwtService.sign({ id: res.id }, this.jwtConfig);
    console.log("generated token for", res)
    return {
      success: true,
      message: "User created successfully",
      data: { ...res, password: null, token },
    };
  }

  // async findAll(
  //   params: GetUsersParams,
  // ): Promise<
  //   ResponseBody<PaginatedResult<User, "users">> | ResponseWithErrors
  // > {
  //   // console.log(params, undefined, 2);
  //   const count = await this.prisma.user.count();
  //   const parseFilter = <X extends keyof UserFilterModes, Y>(
  //     x: X,
  //   ): object | Y => {
  //     console.log("params",params)
  //     const param = params.filters.find(y => y.id === x);
  //     if (params.filterModes[x] === "contains") {
  //       return {
  //         contains: param?.value ? (param.value as Y) : undefined,
  //       } as object;
  //     } else {
  //       return param?.value ? (param.value as Y) : undefined;
  //     }
  //   };
  //   const res = await this.prisma.user.findMany({
  //     select: {
  //       id: true,
  //       email: true,
  //       name: true,
  //       role: true,
  //       password: false,
  //     },
  //     skip: params.skip,
  //     take: params.take,
  //     where: {
  //       id: parseFilter<"id", number>("id"),
  //       name: parseFilter<"name", string>("name"),
  //       email: parseFilter<"email", string>("email"),
  //       role: parseFilter<"role", "admin" | "lecturer" | "student">("role"),
  //     },
  //     orderBy: [
  //       {
  //         email: params.sorting.find(c => c.id === "email")?.desc
  //           ? "desc"
  //           : "asc",
  //       },
  //       {
  //         id: params.sorting.find(c => c.id === "id")?.desc ? "desc" : "asc",
  //       },
  //       {
  //         name: params.sorting.find(c => c.id === "name")?.desc
  //           ? "desc"
  //           : "asc",
  //       },
  //       {
  //         role: params.sorting.find(c => c.id === "role")?.desc
  //           ? "desc"
  //           : "asc",
  //       },
  //     ],
  //   });
  //   return {
  //     success: true,
  //     message: "Users retrieved successfully",
  //     data: {
  //       total: count,
  //       users: res,
  //     },
  //   };
  // }
  async findAll(
    role: Role,
  ) {
    const data = await this.prisma.user.findMany({
      where: { role, deleted: false },
      select: { password: false, role: false, name: true, id: true, email: true, phone: true, address: true }
    })
    return { data }
  }

  async findOne(
    id: number,
  ): Promise<ResponseBody<User | null> | ResponseWithErrors> {
    const res = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (res) {
      return {
        success: true,
        message: `User with id ${id} retrieved successfully`,
        data: res,
      };
    } else {
      return {
        success: false,
        message: `User with id ${id} not found`,
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseBody<User> | ResponseWithErrors> {
    try {
      const res = await this.prisma.user.update({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: false,
        },
        where: {
          id: id,
        },
        data: updateUserDto,
      });

      return {
        success: true,
        message: `User with id ${id} updated successfully`,
        data: res,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error updating User with id ${id}`,
        errors: [error.message],
      };
    }
  }

  async updatePass(
    email: string,
    updateUserPassDto: UpdateUserPassDto,
  ): Promise<ResponseBody<User> | ResponseWithErrors> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (user) {
        const isPassValid = await this.bcrypt.compare(
          updateUserPassDto.currentPassword,
          user.password,
        );
        if (isPassValid) {
          const res = await this.prisma.user.update({
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              password: false,
            },
            where: {
              id: user.id,
            },
            data: {
              password: this.bcrypt.hashSync(updateUserPassDto.newPassword, 10),
            },
          });

          return {
            success: true,
            message: `Password of User with id ${user.id} updated successfully`,
            data: res,
          };
        } else {
          return {
            success: false,
            message: "Invalid Credentials!",
            data: null,
          };
        }
      } else {
        return {
          success: false,
          message: "Error changing user pass",
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error updating user pass`,
        errors: [error.message],
      };
    }
  }

  async remove(id: number): Promise<EmptyResponse | ResponseWithErrors> {
    try {
      await this.prisma.user.delete({
        where: {
          id,
        },
      });
      return {
        success: true,
        message: `User with id ${id} deleted successfully`,
      };
    } catch (error) {
      console.log(error)
      return {
        success: true,
        message: `Error deleting User with id ${id}`,
        errors: [error.message],
      };
    }
  }

  // getProfile() {
  //   console.log("current user", this.req.user)
  //   const data = this.req.user;
  //   return { data };
  // }

  async updateProfile(body: UpdateUserDto, user: User) {
    try {
      const data = await this.prisma.user.update({
        where: { id: user.id },
        data: { ...body },
      });
      return { data, message: "Updated Profile" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Couldn't Update Profile!");
    }
  }

  async updatePassword(body) {
    const { currentPassword, newPassword } = body;
    // try {
    const user = await this.prisma.user.findFirst({
      where: { id: this.req.user.id },
    });
    if (!this.bcrypt.compareSync(currentPassword, user.password)) {
      throw new BadRequestException("Current Password Is Incorrect!");
    }
    const data = await this.prisma.user.update({
      where: { id: this.req.user.id },
      data: { password: this.bcrypt.hashSync(newPassword, 10) },
    });

    return { data, message: "Password Updated Successfully!" };
    // }catch (error) {
    //   throw new InternalServerErrorException("Couldn't update password!")
    // }
  }


  async deleteUser(userId: number) {
    // try {
    //   const data = await this.prisma.user.delete({where:{id:+userId}})
    //   return {data,message:"Deleted User!"}
    // } catch (error) {
    //   console.log(error)
    //  throw new InternalServerErrorException("Couldn't delete user!") 
    // }

    try {
      const data = await this.prisma.user.update({ where: { id: +userId }, data: { deleted: true } })
      return { data, message: "Deleted User!" }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException("Couldn't delete user!")
    }
  }

  async requestExam(purchaseHistoryId: number) {
    const purchaseHistory = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId },
      data: {
        requestExam: true,
        tookExam: false,
        requestCert: false, certRequestAccepted: false
      }
    })

    if (!purchaseHistory) {
      throw new NotFoundException('Record not found!')
    }

    return {
      message: "Your exam has been requested!"
    }
  }

  async tookExam(purchaseHistoryId: number) {
    const purchaseHistory = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId },
      data: { tookExam: true }
    })

    if (!purchaseHistory) {
      throw new NotFoundException('Record not found!')
    }

    return {
      message: "Successfull!"
    }
  }

  async generateCert(purchaseHistoryId: number) {
    const purchaseHistory = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId },
      data: { requestCert: true }
    })

    if (!purchaseHistory) {
      throw new NotFoundException('Record not found!')
    }

    return {
      message: "Your certificate has been requested!"
    }
  }

  async downloadCert(purchaseHistoryId: number) {
    try {

      const purchaseHistory = await this.prisma.studentEnrolled.findFirst({
        where: { id: purchaseHistoryId },
        select: { course: { select: { name: true } } }
      })

      if (!purchaseHistory) {
        throw new NotFoundException('Record not found')
      }

      const { name } = this.req.user

      const image = await Jimp.read('assets/certificate.jpg');
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      // Print the name on the image
      image.print(font, (image.getWidth() / 2) - 100, 500, name);
      const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
      return imageBuffer;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Something went wrong!')
    }
  }

}