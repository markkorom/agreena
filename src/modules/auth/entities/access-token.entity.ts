import { User } from "modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class AccessToken {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public token: string;

  @Column()
  public expiresAt: Date;

  @ManyToOne(() => User)
  public user: User;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
