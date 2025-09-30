import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getHello() {
    return { message: ' Store Service funcionando correctamente' };
  }
}