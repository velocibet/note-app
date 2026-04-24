import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformInterceptor } from './transform.interceptor';
import { HttpExceptionFilter } from './http-exception.filter';
import { DbModule } from './database/database.module'
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { SettingsModule } from './settings/settings.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DbModule,
    NotesModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
