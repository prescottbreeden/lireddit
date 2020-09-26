import { FieldError } from '../types';

export const createAPIErrors = (v: any) => {
  return Object.keys(v).reduce((acc: any, curr: any) => {
    return v[curr].isValid
      ? acc
      : [...acc, { field: curr, message: v[curr].error }];
  }, []) as FieldError[];
};
