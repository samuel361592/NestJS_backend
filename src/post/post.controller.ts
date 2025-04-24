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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ErrorCode } from 'src/common/errors/error-codes.enum';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '取得所有貼文' })
  @ApiResponse({ status: 200, description: '成功取得貼文列表' })
  getAllPosts() {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根據 ID 取得單篇貼文' })
  @ApiResponse({ status: 200, description: '成功取得貼文' })
  @ApiResponse({
    status: 404,
    description: '找不到貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.PostNotFound,
        message: '找不到指定 ID 的貼文',
      },
    },
  })
  getPostById(@Param('id') id: number) {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @ApiBearerAuth()
  @ApiOperation({ summary: '建立新貼文（需登入）' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: '貼文建立成功' })
  @ApiResponse({
    status: 400,
    description: '請求格式錯誤',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: '400-03-01-001',
        message: '貼文標題或內容格式錯誤',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授權',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.Unauthorized,
        message: '請先登入以執行此操作',
      },
    },
  })
  createPost(@Request() req: AuthRequest, @Body() dto: CreatePostDto) {
    return this.postService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新貼文（需登入）' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: '貼文更新成功' })
  @ApiResponse({
    status: 400,
    description: '請求格式錯誤',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: '400-03-01-002',
        message: '貼文更新內容格式錯誤',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授權',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.Unauthorized,
        message: '請先登入以執行此操作',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '無權限修改此貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.ForbiddenPostEdit,
        message: '您沒有權限修改這篇貼文',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '找不到貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.PostNotFound,
        message: '找不到指定 ID 的貼文',
      },
    },
  })
  updatePost(
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
    @Request() req: AuthRequest,
  ) {
    return this.postService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除貼文（需登入）' })
  @ApiResponse({ status: 200, description: '貼文刪除成功' })
  @ApiResponse({
    status: 401,
    description: '未授權',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.Unauthorized,
        message: '請先登入以執行此操作',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '無權限刪除此貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.ForbiddenPostDelete,
        message: '您沒有權限刪除此貼文',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '找不到貼文',
    type: ErrorResponseDto,
    schema: {
      example: {
        errorCode: ErrorCode.PostNotFound,
        message: '找不到指定 ID 的貼文',
      },
    },
  })
  deletePost(@Param('id') id: number, @Request() req: AuthRequest) {
    return this.postService.remove(id, req.user);
  }
}
