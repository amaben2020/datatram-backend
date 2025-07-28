import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    // return 'Hello World!';
    return { username: 'ben', age: 30 };
  }
}
