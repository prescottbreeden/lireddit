import { Validation } from 'de-formed-validations';
import { User } from '../../entities/User';
import { validEmail } from '../../util/utilities';

export const registerValidations = () =>
  new Validation<User>({
    username: [
      {
        errorMessage: 'Username must be longer than 2 characters.',
        validation: (username: string, _) => {
          return username.trim().length > 2;
        },
      },
      {
        errorMessage: 'Username is already taken',
        validation: (_, dbData: User | undefined) => {
          return dbData === undefined;
        },
      },
    ],
    email: [
      {
        errorMessage: 'Must be a valid email',
        validation: (email: string, _) => {
          return validEmail(email.trim());
        },
      },
      {
        errorMessage: 'Email is already registered',
        validation: (_, dbData: User | undefined) => {
          return dbData === undefined;
        },
      },
    ],
    password: [
      {
        errorMessage: 'Cannot be password',
        validation: (password: string, _) => {
          return password.trim() !== 'password';
        },
      },
    ],
    token: [
      {
        errorMessage: 'Invalid User Credentials',
        validation: (redisId: number, user: User | undefined) => {
          return user ? user.id === redisId : false;
        },
      },
    ],
  });
