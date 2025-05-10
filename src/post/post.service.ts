import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../entities/user.entity';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.postRepo.find({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(dto: CreatePostDto, userId: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('找不到使用者');

      const post = this.postRepo.create({ ...dto, user });
      return await this.postRepo.save(post);
    } catch (err) {
      console.error('新增貼文失敗:', err);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('新增貼文時發生錯誤');
    }
  }

  async update(
    id: number,
    dto: UpdatePostDto,
    user: { id: number; roles: string[] },
  ) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new NotFoundException('Post not found');
    if (!user.roles.includes('admin') && post.user.id !== user.id) {
      throw new ForbiddenException('You can only edit your own post');
    }

    return this.postRepo.save({ ...post, ...dto });
  }

  async remove(id: number, user: { id: number; roles: string[] }) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new NotFoundException('Post not found');
    if (!user.roles.includes('admin') && post.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own post');
    }

    return this.postRepo.remove(post);
  }
}
