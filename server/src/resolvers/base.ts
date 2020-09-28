import { Request } from 'express';
import { User } from '../entities/User';

export class BaseResolver {
  /**
   *  Returns the ID of the currently logged in user or 0.
   *  @param req express request object
   *  @return number
   */
  getLoggedInUserID = (req: Request) => {
    return req.session?.userId ? Number(req.session.userId) : 0;
  };

  /**
   *  Returns the currently logged in user or null.
   *  @param User.orm entity manager
   *  @param req express request object
   *  @return User or null
   */
  getLoggedInUser = async (req: Request) => {
    const id = this.getLoggedInUserID(req);
    return await User.findOne(id);
  };
}
