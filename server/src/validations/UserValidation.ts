import argon2 from 'argon2';
import { UsernameInput } from '../types';
import { Validation } from './ValidationState';

export const UserRegisterValidation = () =>
  new Validation<UsernameInput>({
    username: [
      {
        errorMessage: 'Username must be greater than 2 characters.',
        validation: (val: string) => val.length > 2,
      },
      {
        errorMessage: 'Username already exists.',
        validation: (_, exists: UsernameInput | any) => {
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
  new Validation<UsernameInput>({
    username: [
      {
        errorMessage: 'Could not find username.',
        validation: (_, exists: UsernameInput | any) => {
          return exists.createdAt !== undefined;
        },
      },
    ],
    password: [
      {
        errorMessage: 'Incorrect Password.',
        asyncValidation: async (
          password: string,
          exists: UsernameInput | any
        ) => {
          return await argon2
            .verify(exists.password, password)
            .catch(() => Promise.resolve(false));
        },
      },
    ],
  });
