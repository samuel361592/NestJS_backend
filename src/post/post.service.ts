import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('找不到使用者');
  
      const post = this.postRepo.create({
        ...dto,
        user,
      });
      return await this.postRepo.save(post);
    } catch (err) {
      console.error('新增貼文失敗:', err);
      throw new InternalServerErrorException('新增貼文時發生錯誤');
    }
  }

  // 編輯貼文（admin可以編輯不是自己貼文）
  async update(id: number, dto: UpdatePostDto, user: { id: number; role: string }) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  
    console.log('post.user.id =', post?.user?.id);
    console.log('req.user.id =', user.id);
  
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own post');
    }
  
    return this.postRepo.save({ ...post, ...dto });
  }

  // 刪除貼文（admin可以刪除不是自己貼文）
  async remove(id: number, user: { id: number; role: string }) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  
    console.log('post.user.id =', post?.user?.id);
    console.log('req.user.id =', user.id);
  
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own post');
    }
  
    return this.postRepo.remove(post);
  }
  
}
