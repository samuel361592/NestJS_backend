import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepo.findOneBy({ id });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { name } });
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepo.findOneBy({ name: dto.name });
    if (exists) throw new ConflictException('角色已存在');
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async remove(id: number): Promise<Role> {
    const role = await this.findOne(id);
    await this.roleRepo.remove(role);
    return role;
  }

  async findById(id: number): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { id } });
  }
}
