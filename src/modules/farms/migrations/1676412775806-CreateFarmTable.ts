import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFarmTable1676412775806 implements MigrationInterface {
  public readonly name = "CreateFarmTable1676412775806";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "name" character varying NOT NULL, "size" numeric(7,2) NOT NULL, "yield" numeric(7,2) NOT NULL, "coordinates" numeric array NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3bf246b27a3b6678dfc0b7a3f64" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm" ADD CONSTRAINT "FK_fe2fe67c9ca2dc03fff76cd04a9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_fe2fe67c9ca2dc03fff76cd04a9"`);
    await queryRunner.query(`DROP TABLE "farm"`);
  }
}
