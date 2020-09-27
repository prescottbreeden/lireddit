import { User } from '../../entities/User';
import { Validation } from '../Validate';

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
