/* eslint-disable prettier/prettier */

import { PartialType } from "@nestjs/mapped-types";
import { CourseOutline, Course } from "src/shared/types";

// export class CreateCourseDTO extends OmitType(Course, ["id"]){}
export class CreateCourseDTO extends Course {}
export class UpdateCourseDTO extends PartialType(CreateCourseDTO) {
  [x: string]: any;
}

export class CreateCourseOutlineDTO extends CourseOutline {}
export class UpdateCourseOutlineDTO extends PartialType(
  CreateCourseOutlineDTO,
) {}
