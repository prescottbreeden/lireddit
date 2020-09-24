import { User } from '../entities/User';
import { DbContext, UserInput, UserResponse } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createAPIErrors, validEmail } from '../util/utilities';
import { COOKIE_NAME } from '../constants';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { db, req }: DbContext
  ) {
    const id = req.session?.id ? Number(req.session.id) : 0;
    const user = await db.findOne(User, { id });
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { db, req }: DbContext): Promise<User | null> {
    const id = Number(req.session!.userId);
    return isNaN(id) ? null : await db.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
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
      email: {
        isValid: false,
        error: '',
      },
    };

    const usernameExists = await db.findOne(User, {
      username: options.username,
    });
    const emailExists = await db.findOne(User, { email: options.email });

    // username validations
    if (usernameExists) {
      valid = false;
      validationState.username.error = 'Username already exists.';
    }
    if (options.username.trim().length < 2) {
      valid = false;
      validationState.username.error = 'Username must be longer than 2.';
    }

    // password validations
    if (options.password.trim() === 'password') {
      valid = false;
      validationState.password.error = 'Password cannot be password.';
    }

    // email validations
    if (emailExists) {
      valid = false;
      validationState.email.error = 'Email already exists.';
    }
    if (!validEmail(options.email.trim())) {
      valid = false;
      validationState.email.error = 'Email is not valid.';
    }

    if (!valid) {
      return { errors: createAPIErrors(validationState) };
    }

    const hash = await argon2.hash(options.password);
    const user = db.create(User, {
      ...options,
      password: hash,
    });

    await db.persistAndFlush(user).catch(console.error);
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const exists = usernameOrEmail.includes('@')
      ? await db.findOne(User, { email: usernameOrEmail })
      : await db.findOne(User, { username: usernameOrEmail });

    let valid = true;
    const validationState = {
      usernameOrEmail: {
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
      validationState.usernameOrEmail.error = 'Could not find username.';
    } else {
      const validPassword = await argon2
        .verify(exists.password, password)
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: DbContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        err && console.log('something went boom', err);
        return err ? resolve(false) : resolve(true);
      })
    );
  }
}
