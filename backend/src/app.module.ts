import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfigFactory from 'typeorm.config';
import { SmartVoteModule } from './smart-vote/smart-vote.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfigFactory,
      inject: [ConfigService],
    }),

    SmartVoteModule,
    ConfigModule,

    // ExampleModule,
    // MerchantModule,
  ],
})
export class AppModule {
  // This is the root module of the application
  // You can add global providers or configurations here if needed
}
