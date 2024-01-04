/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  CreateCourseDTO,
  CreateCourseOutlineDTO,
  UpdateCourseDTO,
  UpdateCourseOutlineDTO,
} from "./course.dto";
import { REQUEST } from "@nestjs/core";
import { CustomRequest, Quiz, Role } from "src/shared/types";
import { uploadFile } from "src/shared/helpers";

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly req: CustomRequest,
  ) { }

  async createCourse(body: CreateCourseDTO) {
    // console.log(this.req.user)
    try {
      body["amount"] = +body.amount;
      const newBody = { ...body };
      if (body["image"]) {
        const result: { secure_url: string; public_id: string } | any =
          await uploadFile(body["image"], "image");
        newBody["image_id"] = result?.public_id;
        newBody["image"] = result?.secure_url;
      }
      const { lecturerId } = body;
      const data = await this.prisma.course.create({
        data: { ...newBody, lecturerId: +lecturerId ?? this.req.user.id },
      });
      return {
        data,
        message: "Successfully Created Course!",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Couldn't Create Course!");
    }
  }

  async addCourseOutline(body: CreateCourseOutlineDTO) {
    try {
      const newBody = { ...body };
      let quizes = [];
      if (body["video"]) {
        const result1: { secure_url: string; public_id: string } | any =
          await uploadFile(body["video"], "video");
        newBody["video_id"] = result1?.public_id;
        newBody["video"] = result1?.secure_url;
      }
      if (body["note"]) {
        const result2: { secure_url: string; public_id: string } | any =
          await uploadFile(body["note"], "auto");
        newBody["note_id"] = result2?.public_id;
        newBody["note"] = result2?.secure_url;
      }

      if (body["quizes"]) {
        quizes = JSON.parse(body["quizes"])
        delete newBody["quizes"];
      }

      const result = await this.prisma.courseOutline.create({
        data: {
          ...newBody,
          name: newBody.name,
          courseId: newBody.courseId,
          note: newBody.note,
        },
      });

      if (quizes.length > 0) {
        // const quizes = JSON.parse(body["quizes"]);
        const createPromises = quizes?.map(async (item) => {
          await this.prisma.quiz.create({
            data: { ...item, courseOutlineId: result.id },
          });
        });

        await Promise.all(createPromises);
      }



      const data = await this.prisma.courseOutline.findMany({
        where: { courseId: body.courseId, deleted: false },
      });

      return {
        data,
        message: "Successfully Added!",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Couldn't Create Chapter!");
    }
  }

  async deleteCourseOutline(courseOutlineId: number) {
    const data = await this.prisma.courseOutline.update({
      where: { id: courseOutlineId },
      data: { deleted: true }
    });
    return {
      data,
      message: "Successfully Deleted!",
    };
  }

  async updateCourse(body: UpdateCourseDTO) {
    try {
      body["amount"] = +body.amount;
      const newBody = { ...body };

      if (body["image"]) {
        const result: { secure_url: string; public_id: string } | any =
          await uploadFile(body["image"], "image");
        newBody["image_id"] = result?.public_id;
        newBody["image"] = result?.secure_url;
      }

      // newBody["coursedId"] = +body?.courseId
      const { lecturerId } = body;
      const data = await this.prisma.course.update({
        where: { id: body.id },
        data: { ...newBody, lecturerId: +lecturerId ?? this.req.user.id },
      });
      return { data, message: "Updated Course!" };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't Update Course!");
    }
  }

  async updateCourseOutline(body: UpdateCourseOutlineDTO) {
    try {
      const newBody = { ...body };
      if (body["video"]) {
        const result1: { secure_url: string; public_id: string } | any =
          await uploadFile(body["video"], "video");
        console.log("video upload result", result1);
        newBody["video_id"] = result1?.public_id;
        newBody["video"] = result1?.secure_url;
      }
      if (body["note"]) {
        const result2: { secure_url: string; public_id: string } | any =
          await uploadFile(body["note"], "auto");
        console.log("video upload result", result2);
        newBody["note_id"] = result2?.public_id;
        newBody["note"] = result2?.secure_url;
      }

      if (body["quizes"]) {
        await this.prisma.quiz.updateMany({
          where: { courseOutlineId: body.id },
          data: { deleted: true }
        })
        const quizes = JSON.parse(body["quizes"]);
        const createPromises = quizes?.map(async (item) => {
          await this.prisma.quiz.create({
            data: { ...item, courseOutlineId: body.id },
          });
        });

        delete newBody["quizes"];
        await Promise.all(createPromises);
      }

      const data = await this.prisma.courseOutline.update({
        where: { id: body.id },
        data: { ...newBody },
      });



      return { data, message: "Updated Course!" };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException("Couldn't Update Course Outline!");
    }
  }

  async getCourse(courseId: number) {
    const isStudent = this.req.user.role === Role.STUDENT;
    const selectFields = {
      amount: true,
      id: true,
      description: true,
      image: true,
      image_id: true,
      name: true,
      outlines: {
        where: { deleted: false },
        select: {
          name: true,
          id: true,
          courseId: true,
          videoLink: !isStudent,
          note_id: !isStudent,
          video_id: !isStudent,
          customNote: !isStudent,
          note: !isStudent,
          video: !isStudent,
          quizes: !isStudent,
        },
      },
    }
    if (this.req.user.role === Role.LECTURER) {
      const lecturerCourse = await this.prisma.course.findFirst({ where: { id: courseId, lecturerId: this.req.user.id }, select: { ...selectFields } })
      if (!lecturerCourse) throw new NotFoundException({ message: "Course not found or It isn't yours!" })
      else return { data: lecturerCourse };
    } else {
      const data = await this.prisma.course.findFirst({
        where: { id: courseId },
        select: { ...selectFields, lecturerId: true },
      });
      if (!data) throw new NotFoundException({ message: "Course Not found" })
      else return { data };
    }

  }

  async getLecturerCourses() {
    const data = await this.prisma.course.findMany({
      where: { lecturerId: this.req.user.id },
      select: {
        id: true,
        name: true,
        amount: true,
        description: true,
        image: true,
        image_id: true,
        lecturer: { select: { name: true } },
        outlines: {
          where: { deleted: false },
          select: { id: true, name: true, note: true, courseId: true },
        },
      },
    });
    return { data };
  }

  async getCourses() {
    const isStudent = this.req.user.role === Role.STUDENT;
    const data = await this.prisma.course.findMany({
      select: {
        id: true,
        name: true,
        amount: true,
        description: true,
        image: true,
        image_id: true,
        lecturer: { select: { name: true } },
        outlines: {
          where: { deleted: false },
          select: {
            name: true,
            id: true,
            note: !isStudent,
            courseId: true,
            video: !isStudent,
          },
        },
      },
    });
    return { data };
  }

  async studentEnrolledCourse(courseId: number) {
    const enrolledCourse = await this.prisma.studentEnrolled.findFirst({
      where: { courseId, studentId: this.req.user.id },
      select: {
        id: true,
        examKey: true,
        examDate: true,
        examScore: true,
        tookExam: true,
        requestExam: true,
        examRequestAccepted: true,
        requestCert: true,
        certRequestAccepted: true,
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            amount: true,
            lecturer: { select: { name: true } },
            outlines: {
              where: { deleted: false },
              select: {
                id: true,
                name: true,
                note: true, video: true,
                videoLink: true, customNote: true,
                quizes: { select: { id: true, question: true, option_a: true, option_b: true, option_c: true, option_d: true } }
              },
            },
          },
        },
      },
    });

    if (enrolledCourse) return { data: { ...enrolledCourse, enrolled: true } };

    const course = await this.prisma.course.findFirst({
      where: { id: courseId },
      select: {
        amount: true,
        description: true,
        id: true,
        name: true,
        lecturer: { select: { name: true } },
        outlines: {
          where: { deleted: false },
          select: { id: true, name: true, note: false, video: false, customNote: false },
        },
      },
    });

    if (!course) return { message: "Course not found!" };
    return { data: { ...course, enrolled: false } };
  }

  async enrollForCourse(body) {
    try {
      const { courseId, transactionId, trxref } = body;
      await this.prisma.studentEnrolled.create({
        data: {
          studentId: this.req.user.id,
          courseId: +courseId,
          transactionId,
          trxref,
          // score: 0
        },
      });

      const course = await this.prisma.course.findFirst({
        where: { id: +courseId },
        select: {
          amount: true,
          description: true,
          id: true,
          name: true,
          lecturer: { select: { name: true } },
          outlines: {
            where: { deleted: false },
            select: {
              id: true, name: true, note: true, video: true, videoLink: true, customNote: true,
              quizes: { select: { id: true, question: true, option_a: true, option_b: true, option_c: true, option_d: true } }
            },
          },
        },
      });

      return { data: course, message: "Successfully Enrolled For Course" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "We couldn't enroll you for this course!",
      );
    }
  }

  async enrolledCourses() {
    const enrolledCourse = await this.prisma.studentEnrolled.findMany({
      where: { studentId: this.req.user.id },
      select: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            amount: true,
            lecturer: { select: { name: true } },
            outlines: {
              where: { deleted: false },
              select: { id: true, name: true, note: true, video: true },
            },
          },
        },
      },
    });

    if (enrolledCourse) return { data: enrolledCourse };
    else return { data: [] }
  }

  async purchaseHistory() {
    const { role, id } = this.req.user;

    const getLecturerCoursesHistory = async () => {
      const history = await this.prisma.studentEnrolled.findMany({
        where: { course: { lecturerId: id } },
        select: {
          course: { select: { name: true, amount: true } },
          trxref: true,
          transactionId: true,
          date: true,
          student: {
            select: {
              name: true
            }
          }
        }
      })
      return history
    }

    switch (role) {
      case Role.STUDENT:
        const studentHistory = await this.prisma.studentEnrolled.findMany({
          where: { studentId: this.req.user.id },
          select:
          {
            course: { select: { amount: true, name: true, id: true } }, date: true
          }
        })
        return { data: studentHistory }
      case Role.LECTURER:
        const lecturerData = await getLecturerCoursesHistory()
        return { data: lecturerData };
      case Role.ADMIN:
        const data = await this.prisma.studentEnrolled.findMany({
          select:
          {
            id: true,
            examKey: true,
            examDate: true,
            examScore: true,
            tookExam: true,
            requestExam: true,
            examRequestAccepted: true,
            requestCert: true,
            certRequestAccepted: true,
            course: {
              select: { amount: true, name: true, id: true }
            },
            date: true,
            student: { select: { name: true, id: true } },
          }
        })
        return { data };
    }
  }

  async submitQuiz(
    courseOutlineId: number,
    answers: { id: number, value: string }[]
  ) {

    const courseOutline = await this.prisma.courseOutline.findUnique({
      where: { id: courseOutlineId, deleted: false },
      select: { id: true, quizes: true },
    });


    if (!courseOutline) {
      throw new NotFoundException('Course Chapter not found!')
    }

    if (!courseOutline.quizes || courseOutline?.quizes.length === 0) {
      throw new NotFoundException('No quizzes found for the given courseOutlineId.');
    }

    if (courseOutline.quizes.length > 0) {
      await Promise.all(
        courseOutline.quizes.map(async quiz => {
          const answer = await this.prisma.studentAnswers.findFirst({ where: { quizId: quiz.id, studentId: this.req.user.id } })
          if (answer) {
            await this.prisma.studentAnswers.delete({ where: { id: answer.id } })
          }
        })
      )
    }

    await Promise.all(
      answers.map(async answer => {
        await this.prisma.studentAnswers.create({ data: { quizId: answer.id, answer: answer.value, studentId: this.req.user.id } })
      }))

    const courseOutlineWithQuizes = await this.prisma.courseOutline.findUnique({
      where: { id: courseOutlineId, deleted: false },
      include: {
        quizes: {
          include: {
            studentAnswers: { where: { studentId: this.req.user.id } },
          },
        },
      },
    });

    const totalScore = courseOutlineWithQuizes.quizes.reduce((score, quiz) => {
      return score + quiz.studentAnswers.filter(sa => sa.answer === quiz.answer).length;
    }, 0);

    return { data: { score: totalScore } }
  }

  async userAnsweredQuiz(courseOutlineId: number) {
    const courseOutlineWithQuizes = await this.prisma.courseOutline.findUnique({
      where: { id: courseOutlineId, deleted: false },
      include: {
        quizes: {
          include: {
            studentAnswers: { where: { studentId: this.req.user.id } },
          },
        },
      },
    });

    const totalScore = courseOutlineWithQuizes.quizes.reduce((score, quiz) => {
      return score + quiz.studentAnswers.filter(sa => sa.answer === quiz.answer).length;
    }, 0);

    const result = courseOutlineWithQuizes.quizes.filter(item => item.studentAnswers.find(item => item.studentId === this.req.user.id))
    // console.log("result", result)
    return { data: { score: totalScore, tookQuiz: result.length > 0 ? true : false } }
  }

  async sendExamKey(
    purchaseHistoryId: number,
    body) {
    const data = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId }, data: {
        ...body,
        examRequestAccepted: true,
      },
      select: {
        id: true,
        examKey: true,
        examDate: true,
        examScore: true,
        tookExam: true,
        requestExam: true,
        examRequestAccepted: true,
        requestCert: true,
        certRequestAccepted: true,
        course: {
          select: { amount: true, name: true, id: true }
        },
        date: true,
        student: { select: { name: true, id: true } },
      }
    })

    if (!data) {
      throw new NotFoundException('Record not found!')
    }

    return { data }
  }

  async studentScore(
    purchaseHistoryId: number,
    score: string) {
    const data = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId },
      data: {
        examScore: score,
      },
      select: {
        id: true,
        examKey: true,
        examDate: true,
        examScore: true,
        tookExam: true,
        requestExam: true,
        examRequestAccepted: true,
        requestCert: true,
        certRequestAccepted: true,
        course: {
          select: { amount: true, name: true, id: true }
        },
        date: true,
        student: { select: { name: true, id: true } },
      }
    })

    if (!data) {
      throw new NotFoundException('Record not found!')
    }
  }

  async generateCert(
    purchaseHistoryId: number,
  ) {
    const data = await this.prisma.studentEnrolled.update({
      where: { id: purchaseHistoryId },
       data: {
        certRequestAccepted: true,
        requestExam: false,
        examRequestAccepted:false, 
        examDate:null,
        examKey:""
      },
      select: {
        id: true,
        examKey: true,
        examDate: true,
        examScore: true,
        tookExam: true,
        requestExam: true,
        examRequestAccepted: true,
        requestCert: true,
        certRequestAccepted: true,
        course: {
          select: { amount: true, name: true, id: true }
        },
        date: true,
        student: { select: { name: true, id: true } },
      }
    })

    if (!data) {
      throw new NotFoundException('Record not found!')
    }
    return { data }
  }
}