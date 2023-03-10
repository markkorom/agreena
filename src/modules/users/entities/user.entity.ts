import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @Column("decimal", { array: true })
  public coordinates: number[];

  @Column()
  public address: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
