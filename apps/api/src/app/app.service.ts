import { Injectable } from '@nestjs/common';

/** Basic application service exposing default API data. */
@Injectable()
export class AppService {
  /** Return default application message. */
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
