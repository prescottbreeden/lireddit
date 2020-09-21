import {UsernamePasswordInput} from '../resolvers/user';
import { Validation } from './ValidationState';

export const UserValidation = () => new Validation<UsernamePasswordInput>({
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
