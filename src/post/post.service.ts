import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  // 所有人皆可查看全部貼文
  findAll() {
    return this.postRepo.find({ relations: ['user'] });
  }

  // 所有人皆可查詢單篇貼文
  findOne(id: number) {
    return this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  // 新增貼文（需登入）
  async create(dto: CreatePostDto, userId: number) {
    const post = this.postRepo.create({
      ...dto,
      user: { id: userId } as User,
    });
    return this.postRepo.save(post);
  }

  // 編輯貼文（只能改自己的）
  async update(id: number, dto: UpdatePostDto, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.id !== userId) throw new ForbiddenException('You can only edit your own post');

    return this.postRepo.save({ ...post, ...dto });
  }

  // 刪除貼文（只能刪自己的）
  async remove(id: number, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.id !== userId) throw new ForbiddenException('You can only delete your own post');

    return this.postRepo.remove(post);
  }
}
