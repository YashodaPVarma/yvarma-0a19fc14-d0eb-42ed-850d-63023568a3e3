import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/** Root application controller. */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Default endpoint returning application metadata. */
  @Get()
  getData() {
    return this.appService.getData();
  }
}
