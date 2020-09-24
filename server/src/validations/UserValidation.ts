import argon2 from 'argon2';
import { UserInput } from '../types';
import { Validation } from './ValidationState';

export const UserRegisterValidation = () =>
  new Validation<UserInput>({
    username: [
      {
        errorMessage: 'Username must be greater than 2 characters.',
        validation: (val: string) => val.length > 2,
      },
      {
        errorMessage: 'Username already exists.',
        validation: (_, exists: UserInput | any) => {
          return exists.createdAt === undefined;
        },
      },
    ],
    password: [
      {
        errorMessage: 'Password cannot be password.',
        validation: (val: string) => val !== 'password',
      },
    ],
  });

export const UserLoginValidation = () =>
  new Validation<UserInput>({
    username: [
      {
        errorMessage: 'Could not find username.',
        validation: (_, exists: UserInput | any) => {
          return exists.createdAt !== undefined;
        },
      },
    ],
    password: [
      {
        errorMessage: 'Incorrect Password.',
        asyncValidation: async (password: string, exists: UserInput | any) => {
          return await argon2
            .verify(exists.password, password)
            .catch(() => Promise.resolve(false));
        },
      },
    ],
  });
