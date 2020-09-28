import { Post } from '../../entities/Post';
import { Validation } from '../Validate';

export const createPostValidations = () =>
  new Validation<Post>({
    creatorId: [
      {
        errorMessage: 'Not authorized.',
        validation: (id: number | undefined, _) => {
          return id ? id > 0 : false;
        },
      },
    ],
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
