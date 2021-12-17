import { Module } from '@nestjs/common';
import { environment } from './core/environment';
import { TestController } from './modules/test/test.controller';
import { TestModule } from './modules/test/test.module';

@Module({
  imports: [TestModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {
  constructor() {
    console.debug(`THE SERVER IS ON '${environment.name.toUpperCase()}' ENVIRONMENT`.trim())
  }
}
