import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const request: Request = context.switchToHttp().getRequest();
    console.log(request.url);

    const userAgent = request.headers['user-agent']; // Extract user agent information from headers
    console.log(userAgent);

    const formattedUserAgent = userAgent?.replace(/[^a-zA-Z\s]/g, ''); // Remove non-alphanumeric characters except spaces

    console.log(`Browser Interceptor - User Agent: ${formattedUserAgent}`);

    //@ts-ignore
    request.headers.browser = formattedUserAgent as string;

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
      map((data) => {
        console.log('DATA ===>', data);
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
