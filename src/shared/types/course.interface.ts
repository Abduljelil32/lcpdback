/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

export class Course {
  id?: number;
  name: string;
  lecturerId: number;
  amount: number;
}

export class CourseOutline {
  id?: number;
  name: string;
  courseId: number;
  video?:any
  note?: any;
  videoLink?:string
  customNote?:string
}
