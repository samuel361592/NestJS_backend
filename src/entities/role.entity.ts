// src/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class Role {
  @ApiProperty({ example: 1, description: '角色 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin', description: '角色名稱' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
