import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_CONNECTION',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        });
      },
    },
  ],
  exports: ['PG_CONNECTION'],
})
export class DbModule {}