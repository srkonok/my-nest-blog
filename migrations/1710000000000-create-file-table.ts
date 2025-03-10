import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFileTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'size',
            type: 'bigint',
          },
          {
            name: 'storage_type',
            type: 'enum',
            enum: ['LOCAL', 'S3', 'GCS'],
            default: "'LOCAL'",
          },
          {
            name: 'path',
            type: 'varchar',
            length: '1024',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        name: 'FK_files_user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_files_user_id" ON "files" ("user_id");
      CREATE INDEX "IDX_files_mime_type" ON "files" ("mime_type");
      CREATE INDEX "IDX_files_storage_type" ON "files" ("storage_type");
      CREATE INDEX "IDX_files_created_at" ON "files" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_files_created_at";
      DROP INDEX IF EXISTS "IDX_files_storage_type";
      DROP INDEX IF EXISTS "IDX_files_mime_type";
      DROP INDEX IF EXISTS "IDX_files_user_id";
    `);

    // Drop foreign key
    await queryRunner.dropForeignKey('files', 'FK_files_user');

    // Drop table
    await queryRunner.dropTable('files');
  }
} 