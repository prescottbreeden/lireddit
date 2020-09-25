import { User } from '../entities/User';
import { DbContext, UserInput, UserResponse } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createAPIErrors } from '../util/utilities';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { registerValidations } from '../validations/definitions/registerValidations';
import { loginValidations } from '../validations/definitions/loginValidations';
import { trimData } from '../util/normalizeData';
import { sendEmail } from '../util/sendEmail';
import { v4 } from 'uuid';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { db, redis, req }: DbContext
  ) {
    const id = req.session?.id ? Number(req.session.id) : 0;
    const user = await db.findOne(User, { id });
    if (!user) {
      // email is not in the db
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );

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
    const data = trimData(options);
    const { username, email, password } = data;

    const usernameExists = await db.findOne(User, { username });
    const emailExists = await db.findOne(User, { email });

    const v = registerValidations();
    const valid = v.validateCustom([
      { key: 'username', value: username, state: usernameExists },
      { key: 'email', value: email, state: emailExists },
      { key: 'password', value: password, state: null },
    ]);

    if (!valid) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const hash = await argon2.hash(password.trim());
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

    const validPassword = exists
      ? await argon2
          .verify(exists.password, password)
          .catch(() => Promise.resolve(false))
      : true;

    const v = loginValidations();
    const valid = v.validateCustom([
      { key: 'usernameOrEmail', value: null, state: exists },
      { key: 'password', value: validPassword, state: null },
    ]);

    return !valid
      ? { errors: createAPIErrors(v.validationState) }
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
