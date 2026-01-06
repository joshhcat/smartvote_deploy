import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  onApplicationBootstrap() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Successfully connected to the database.');
    } else {
      console.error('❌ Failed to connect to the database.');
    }
  }
}
