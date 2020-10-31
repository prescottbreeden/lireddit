import { Validation } from 'de-formed-validations';
import { User } from '../../entities/User';

export const loginValidations = () =>
  new Validation<User>({
    usernameOrEmail: [
      {
        errorMessage: 'Could not find username or email.',
        validation: (user: User | undefined, _) => {
          return user !== undefined;
        },
      },
    ],
    password: [
      {
        errorMessage: 'Incorrect Password',
        validation: (passwordCheck: boolean, _) => passwordCheck,
      },
    ],
  });
