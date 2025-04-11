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
  
  
  @Controller('posts')
  export class PostController {
    constructor(private readonly postService: PostService) {}
  
    // 所有人皆可查看所有貼文
    @Get()
    getAllPosts() {
      return this.postService.findAll();
    }
  
    // 所有人皆可查詢單篇貼文
    @Get(':id')
    getPostById(@Param('id') id: number) {
      return this.postService.findOne(id);
    }
  
    // 新增貼文（需登入）
    @UseGuards(JwtAuthGuard)
    @HttpPost()
    createPost(@Request() req, @Body() dto: CreatePostDto) {
      return this.postService.create(dto, req.user.id);
    }
  
    // 編輯貼文（需登入、只能改自己的）
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    updatePost(@Param('id') id: number, @Body() dto: UpdatePostDto, @Request() req) {
      return this.postService.update(id, dto, req.user.id);
    }
  
    // 刪除貼文（需登入、只能刪自己的）
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deletePost(@Param('id') id: number, @Request() req) {
      return this.postService.remove(id, req.user.id);
    }
  }
  