import { User } from '../../entities/User';
import { Validation } from '../Validate';

export const loginValidations = () =>
  new Validation<User>({
    usernameOrEmail: [
      {
        errorMessage: 'Could not find username or email.',
        validation: (_, dbData: User | null) => {
          return dbData !== null;
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
