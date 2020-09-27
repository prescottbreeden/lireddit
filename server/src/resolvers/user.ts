import { User } from '../entities/User';
import { MyContext, UserInput, UserResponse } from '../types';
import { Arg, Mutation, Query, Resolver, Ctx } from 'type-graphql';
import { createAPIErrors } from '../util/createApiErrors';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { registerValidations } from '../validations/definitions/registerValidations';
import { loginValidations } from '../validations/definitions/loginValidations';
import { trimData } from '../util/normalizeData';
import { sendEmail } from '../util/sendEmail';
import { v4 } from 'uuid';
import { Request } from 'express';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  /**
   *  Returns the ID of the currently logged in user or 0.
   *  @param req express request object
   *  @return number
   */
  private getLoggedInUserID = (req: Request) => {
    return req.session?.userId ? Number(req.session.userId) : 0;
  };

  /**
   *  Returns the currently logged in user or null.
   *  @param User.orm entity manager
   *  @param req express request object
   *  @return User or null
   */
  private getLoggedInUser = async (req: Request) => {
    const id = this.getLoggedInUserID(req);
    return await User.findOne(id);
  };

  // ----------------------------------------------------------------------- //
  // Q . me: () -> User | null
  // ----------------------------------------------------------------------- //
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    return this.getLoggedInUser(req);
  }

  // ----------------------------------------------------------------------- //
  // M . register: ( UserInput ) -> UserResponse
  // ----------------------------------------------------------------------- //
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse | undefined> {
    const data = trimData(options);
    const { username, email, password } = data;

    const usernameExists = await User.findOne({ username });
    const emailExists = await User.findOne({ email });
    console.log('uname: ', usernameExists);
    console.log('email: ', emailExists);

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
    const user = await User.create({
      ...options,
      password: hash,
    }).save();

    req.session!.userId = user.id;

    return {
      user,
    };
  }

  // ----------------------------------------------------------------------- //
  // M . login: ( string, string ) -> UserResponse
  // ----------------------------------------------------------------------- //
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse | undefined> {
    const user = usernameOrEmail.includes('@')
      ? await User.findOne({ where: { email: usernameOrEmail } })
      : await User.findOne({ where: { username: usernameOrEmail } });

    const validPassword = user
      ? await argon2
          .verify(user.password, password)
          .catch(() => Promise.resolve(false))
      : true;

    const v = loginValidations();
    const valid = v.validateCustom([
      { key: 'usernameOrEmail', value: user, state: null },
      { key: 'password', value: validPassword, state: null },
    ]);

    if (!valid || !user) {
      return { errors: createAPIErrors(v.validationState) };
    }

    req.session!.userId = user.id;
    return { user: user };
  }

  // ----------------------------------------------------------------------- //
  // M . logout: () -> Boolean
  // ----------------------------------------------------------------------- //
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME);
        err && console.log('something went boom', err);
        return err ? resolve(false) : resolve(true);
      })
    );
  }

  // ----------------------------------------------------------------------- //
  // M . forgotPassword: ( string ) -> Boolean
  // ----------------------------------------------------------------------- //
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 // 1 hour TTL
    );
    const url = 'http://localhost:3000/change-password';
    await sendEmail(email, `<a href="${url}/${token}">Reset Password</a>`);
    return true;
  }

  // ----------------------------------------------------------------------- //
  // M . updatePassword: ( string, string ) -> UserResponse
  // ----------------------------------------------------------------------- //
  @Mutation(() => UserResponse)
  async updatePassword(
    @Arg('token') token: string,
    @Arg('password') password: string,
    @Ctx() { redis, req }: MyContext
  ) {
    const redisUserId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    const id = redisUserId ? Number(redisUserId) : -1;
    const user = await User.findOne({ id });

    const v = registerValidations();
    const valid = v.validateCustom([
      { key: 'password', value: password, state: null },
      { key: 'token', value: id, state: user },
    ]);

    if (!valid || !user) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const hash = await argon2.hash(password.trim());
    const updatedUser = await User.update({ id: user.id }, { password: hash });

    req.session!.userId = user.id;
    redis.del(FORGET_PASSWORD_PREFIX + token);

    return {
      updatedUser,
    };
  }
}
