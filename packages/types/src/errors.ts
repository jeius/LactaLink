export type CustomError =
  | Error
  | {
      message: string;
      code?: number;
    };
