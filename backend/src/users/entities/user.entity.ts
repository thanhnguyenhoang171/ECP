import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ nullable: true })
  username: string;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  email: string;
  @Column()
  role: string;
  @Column()
  provider: number;
  @Column()
  isActive: number;
  @Column({ nullable: true })
  refreshToken: string;
}
