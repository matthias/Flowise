import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProfile1695042861469 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE profiles (
                id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                username TEXT UNIQUE CHECK (char_length(username) >= 3),
                full_name TEXT,
                avatar_url TEXT,
                website TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE profiles`)
    }
}
