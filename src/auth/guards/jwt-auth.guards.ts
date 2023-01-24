import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   handleRequest(err: any, user: User): User {
  //     if (err || !user) throw err || new UnauthorizedException();
  //     return user;
  //   }
}

@Injectable()
export class AnonymousGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
