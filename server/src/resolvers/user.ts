import { User } from '../entities/User';
import { DbContext, UsernameInput, UserResponse } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import {
  UserLoginValidation,
  UserRegisterValidation,
} from '../validations/UserValidation';
import { createAPIErrors } from '../util/utilities';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { db, req }: DbContext): Promise<User | null> {
    const id = Number(req.session!.userId);
    return isNaN(id) ? null : await db.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const exists = await db.findOne(User, { username: options.username });

    // validate user registration
    const v = UserRegisterValidation();
    const valid = v.validateAll(exists ? exists : options);

    if (!valid) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const hash = await argon2.hash(options.password);
    const user = db.create(User, {
      username: options.username,
      password: hash,
    });

    await db.persistAndFlush(user);
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernameInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const exists = await db.findOne(User, { username: options.username });

    let valid = true;
    const validationState = {
      username: {
        isValid: false,
        error: '',
      },
      password: {
        isValid: false,
        error: '',
      },
    };

    if (!exists) {
      valid = false;
      validationState.username.error = 'Could not find username.';
    } else {
      const validPassword = await argon2
        .verify(exists.password, options.password)
        .catch(() => Promise.resolve(false));

      if (!validPassword) {
        valid = false;
        validationState.password.error = 'Incorrect Password.';
      }
    }

    return !valid
      ? { errors: createAPIErrors(validationState) }
      : (() => {
          req.session!.userId = exists!.id;
          return { user: exists ? exists : undefined };
        })();
  }
}
