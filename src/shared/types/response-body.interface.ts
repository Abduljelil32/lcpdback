export class Response<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown[];
}

export type ResponseWithErrors = Omit<Response<never>, "data">;
export type ResponseWithoutErrors<T> = Omit<Response<T>, "errors">;
export type EmptyResponse = Omit<ResponseWithoutErrors<never>, "data">;
export type ResponseBody<T> = ResponseWithoutErrors<T>;
