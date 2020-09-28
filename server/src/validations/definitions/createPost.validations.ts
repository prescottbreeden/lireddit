import { Validation } from '../Validate';
import { PostInput } from '../../types';

export const createPostValidations = () =>
  new Validation<PostInput>({
    title: [
      {
        errorMessage: 'Title is required.',
        validation: (title: string, _) => {
          return title.trim().length > 0;
        },
      },
      {
        errorMessage: 'Title must be no more than 50 characters.',
        validation: (title: string, _) => {
          return title.trim().length <= 50;
        },
      },
    ],
    text: [
      {
        errorMessage: 'Post must be between 10 and 4000 characters.',
        validation: (text: string, _) => {
          const val = text.trim().length;
          return val >= 10 && val < 4000;
        },
      },
    ],
  });
