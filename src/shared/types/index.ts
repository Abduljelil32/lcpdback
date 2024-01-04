/* eslint-disable prettier/prettier */
export * from "./response-body.interface";
export * from "./user.interface";
export * from "./pagination.interface";
export * from "./roles.interface";
export * from "./user-claim.interface";
export * from "./course.interface";


export type Quiz = {
    id?: number;
    question: string;
    answer: string
    option_a: string;
    option_b: string
    option_c: string
    option_d: string
}