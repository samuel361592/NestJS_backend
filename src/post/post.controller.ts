import {
  Controller,
  Get,
  Param,
  Post as HttpPost,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/jwt.strategy';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getAllPosts() {
    return this.postService.findAll();
  }

  @Get(':id')
  getPostById(@Param('id') id: number) {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  createPost(@Request() req: AuthRequest, @Body() dto: CreatePostDto) {
    return this.postService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
    @Request() req: AuthRequest,
  ) {
    return this.postService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req: AuthRequest) {
    return this.postService.remove(id, req.user);
  }
}
