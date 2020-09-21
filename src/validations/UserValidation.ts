import argon2 from 'argon2';
import {User} from 'src/entities/User';
import {UsernameInput } from '../resolvers/user';
import { Validation } from './ValidationState';

export const UserRegisterValidation = () => new Validation<UsernameInput>({
  username: [
    {
      errorMessage: "name must be greater than 2 characters",
      validation: (val: string) => val.length > 2,
    },
  ],
  password: [
    {
      errorMessage: "password cannot be password",
      validation: (val: string) => val !== 'password',
    }
  ]
});

export const UserLoginValidation = () => new Validation<any>({
  username: [
    {
      errorMessage: "Could not find username",
      validation: (_, state: UsernameInput) => state !== null,
    },
  ],
  password: [
    {
      errorMessage: "Incorrect Password",
      asyncValidation: (password: string, user: User) => { 
        return argon2.verify(user.password, password);
      }
    },
  ],
});
