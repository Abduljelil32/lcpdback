/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { RBACGuard } from "src/auth/rbac.guard";
import { Quiz, Role } from "src/shared/types";
import { Roles } from "src/shared/decorators";
import {
  CreateCourseDTO,
  CreateCourseOutlineDTO,
  UpdateCourseDTO,
  UpdateCourseOutlineDTO,
} from "./course.dto";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { th } from "date-fns/locale";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Get("/")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getCourses() {
    return this.coursesService.getCourses();
  }

  @Get("/lecturer-courses")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.LECTURER, Role.ADMIN)
  getLecturerCourses() {
    return this.coursesService.getLecturerCourses();
  }

  @Get("/enrolled-courses")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  enrolledCourses() {
    return this.coursesService.enrolledCourses();
  }

  @Get("/purchase-history")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT, Role.ADMIN, Role.LECTURER)
  purchaseHistory() {
    return this.coursesService.purchaseHistory()
  }


  @Post("/")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("image"))
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  createCourse(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2097152 }),
          new FileTypeValidator({ fileType: "image/*" }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Body() body: CreateCourseDTO,
  ) {
    if (image) {
      body["image"] = image.buffer;
    }

    return this.coursesService.createCourse(body);
  }

  @Put("/:courseId")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("image"))
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  updateCourse(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2097152 }),
          new FileTypeValidator({ fileType: "image/*" }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Param("courseId") courseId: number,
    @Body() body: UpdateCourseDTO,
  ) {
    if (image) {
      body["image"] = image.buffer;
    }
    return this.coursesService.updateCourse({ ...body, id: +courseId });
  }

  @Post("/outline/:courseId")
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "video", maxCount: 1 },
    { name: "note", maxCount: 1 }
  ]))
  addCourseOutline(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        // validators: [new MaxFileSizeValidator({ maxSize: 10 * 1000000 })]
      })
    )
    files: { video?: Express.Multer.File[], note?: Express.Multer.File[] },
    @Param("courseId") courseId: number,
    @Body() body: CreateCourseOutlineDTO,
  ) {
    console.log("uploaded files", files)
    if (files?.video) {
      body["video"] = files.video[0].buffer;
    }

    if (files?.note) {
      body["note"] = files.note[0].buffer;
    }
    return this.coursesService.addCourseOutline({
      ...body,
      courseId: +courseId,
    });
  }

  @Get("/:courseId")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  getCourse(@Param("courseId") courseId: number) {
    return this.coursesService.getCourse(+courseId);
  }

  @Put("/outline/:courseOutlineId")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "video", maxCount: 1 },
    { name: "note", maxCount: 1 }
  ]))
  updateCourseOutline(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        // validators: [new MaxFileSizeValidator({ maxSize: 10 * 1000000 })]
      })
    )
    files: { video?: Express.Multer.File[], note?: Express.Multer.File[] },
    @Body() body: UpdateCourseOutlineDTO,
    @Param("courseOutlineId") courseOutlineId: number,
  ) {
    console.log(files)
    if (files?.video) {
      body["video"] = files.video[0].buffer;
    }

    if (files?.note) {
      body["note"] = files.note[0].buffer;
    }
    return this.coursesService.updateCourseOutline({
      ...body,
      id: +courseOutlineId,
    });
  }

  @Delete("/outline/:courseOutlineId")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN, Role.LECTURER)
  deleteCourseOutline(@Param("courseOutlineId") id: number) {
    return this.coursesService.deleteCourseOutline(+id);
  }

  @Get("/student-enrolled-course/:courseId")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  studentEnrolledCourse(@Param("courseId") courseId: number) {
    return this.coursesService.studentEnrolledCourse(+courseId);
  }

  @Post("/enroll")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  enrollForCourse(@Body() body) {
    return this.coursesService.enrollForCourse(body);
  }

  @Post("/submit-quiz/:courseOutlineId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  submitQuiz(
    @Param("courseOutlineId") courseOutlineId: string,
    @Body() body) {
    return this.coursesService.submitQuiz(
      +courseOutlineId, body.answers)
  }

  @Get("/student-answer-quiz/:courseOutlineId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.STUDENT)
  userAnsweredQuiz(@Param("courseOutlineId") courseOutlineId: string) {
    return this.coursesService.userAnsweredQuiz(+courseOutlineId);
  }

  @Post("/send-key/:purcahseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  sendExamKey(
    @Param("purcahseHistoryId") purcahseHistoryId: string,
    @Body() body
  ) {
    return this.coursesService.sendExamKey(+purcahseHistoryId, body)
  }

  @Post("/student-score/:purcahseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  studentScore(
    @Param("purcahseHistoryId") purcahseHistoryId: string,
    @Body("score") score: string
  ) {
    return this.coursesService.studentScore(+purcahseHistoryId, score)
  }

  @Get("/generate-cert/:purcahseHistoryId")
  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(Role.ADMIN)
  generateCert( 
    @Param("purcahseHistoryId") purcahseHistoryId: string) {
    return this.coursesService.generateCert(+purcahseHistoryId)
  }

}
