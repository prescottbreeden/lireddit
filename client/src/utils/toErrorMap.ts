import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  return errors.reduce((acc: any, { field, message }: any) => {
    acc[field] = message;
    return acc;
  }, {});
};
