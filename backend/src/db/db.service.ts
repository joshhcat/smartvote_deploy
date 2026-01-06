import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async callStoredProcedure(
    procedureName: string,
    params: any[] = [],
    queryRunner?: QueryRunner,
  ): Promise<any> {
    if (!procedureName || typeof procedureName !== 'string') {
      throw new Error('Invalid procedure name');
    }

    const query = `CALL ${procedureName}(${params.map(() => '?').join(', ')})`;

    try {
      const runner = queryRunner ?? this.dataSource;
      const result = await runner.query(query, params);

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        Array.isArray(result[result.length - 1]) &&
        result[result.length - 1].length === 0
      ) {
        result.pop();
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error executing stored procedure ${procedureName}`,
        error.stack,
      );
      throw new Error(
        `Error executing stored procedure ${procedureName}: ${error.message}`,
      );
    }
  }

  // Direct query method for simple SQL queries
  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      const result = await this.dataSource.query(sql, params);
      return [result];
    } catch (error) {
      this.logger.error(`Error executing query: ${sql}`, error.stack);
      throw new Error(`Error executing query: ${error.message}`);
    }
  }

  // async callStoredProcedureInTransaction(
  //   procedureName: string,
  //   params: any[] = [],
  // ): Promise<any> {
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const result = await this.callStoredProcedure(
  //       procedureName,
  //       params,
  //       // queryRunner,
  //     );
  //     await queryRunner.commitTransaction();
  //     return result;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
