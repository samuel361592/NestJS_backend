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
  NotFoundException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '../auth/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ErrorCode } from 'src/common/errors/error-codes.enum';
import { Post as PostEntity } from '../entities/post.entity';
import { ParseIntPipe } from '@nestjs/common';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '取得所有貼文' })
  @ApiResponse({
    status: 200,
    description: '成功取得貼文列表',
    schema: {
      example: {
        posts: [
          {
            id: 1,
            title: '我的第一篇文章',
            content: '這是文章的內容',
            author: {
              id: 1,
              name: 'Alice',
            },
            createdAt: '2024-06-01T12:00:00.000Z',
          },
          {
            id: 2,
            title: '第二篇文章',
            content: '這是第二篇的內容',
            author: {
              id: 2,
              name: 'Bob',
            },
            createdAt: '2024-06-02T15:30:00.000Z',
          },
        ],
      },
    },
  })
  getAllPosts(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根據 ID 取得單篇貼文' })
  @ApiResponse({
    status: 200,
    description: '成功取得貼文',
    schema: {
      example: {
        id: 1,
        title: '我的第一篇文章',
        content: '這是文章的內容',
        author: {
          id: 1,
          name: 'Alice',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '找不到貼文',
    schema: {
      example: {
        statusCode: 404,
        errorCode: '404-01-01-001',
        message: '找不到貼文',
      },
    },
  })
  async getPostById(@Param('id') id: number): Promise<PostEntity> {
    const post = await this.postService.findOne(id);
    if (!post) {
      throw new NotFoundException({
        errorCode: ErrorCode.PostNotFound,
        message: '找不到指定 ID 的貼文',
      });
    }
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '建立新貼文（需登入）' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: '貼文建立成功',
    schema: {
      example: {
        id: 1,
        title: '我的第一篇文章',
        content: '這是文章的內容',
        author: {
          id: 1,
          name: 'Alice',
        },
      },
    },
  })
  createPost(
    @Request() req: AuthRequest,
    @Body() dto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '更新貼文（需登入）' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: '貼文更新成功',
    schema: {
      example: {
        id: 1,
        title: '更新後的標題',
        content: '這是更新後的內容',
        author: {
          id: 1,
          name: 'Alice',
        },
      },
    },
  })
  updatePost(
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
    @Request() req: AuthRequest,
  ): Promise<PostEntity> {
    return this.postService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: '刪除貼文（需登入，僅限作者或 admin））' })
  @ApiResponse({
    status: 200,
    description: '貼文刪除成功，回傳刪除的貼文',
    schema: {
      example: {
        id: 1,
        title: '刪除的標題',
        content: '刪除的內容',
        user: {
          id: 5,
          name: 'Alice',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '只能刪除自己的貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 403,
        errorCode: '403-01-01-001',
        message: '只能刪除自己的貼文',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '找不到貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 404,
        errorCode: '404-01-01-001',
        message: '找不到貼文',
      },
    },
  })
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ): Promise<PostEntity> {
    const user = req.user as JwtPayload;
    const formattedUser = {
      id: user.id,
      roles: user.roles,
    };
    return this.postService.remove(id, formattedUser);
  }
}
