import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtPayload } from '../auth/jwt.strategy';
import { Request } from 'express';

type MockAuthRequest = Request & {
  user: JwtPayload & { iat?: number; exp?: number };
};

describe('PostController', () => {
  let controller: PostController;

  const mockPostService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: JwtPayload = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    age: 25,
    roles: ['user'],
  };

  const mockRequest: MockAuthRequest = {
    user: { ...mockUser, iat: 0, exp: 0 },
  } as MockAuthRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: mockPostService }],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('should return all posts', async () => {
    const posts = [{ id: 1, title: 'Post1' }];
    mockPostService.findAll.mockResolvedValue(posts);

    const result = await controller.getAllPosts();
    expect(result).toEqual(posts);
  });

  it('should return a single post', async () => {
    const post = { id: 1, title: 'Test Post' };
    mockPostService.findOne.mockResolvedValue(post);

    const result = await controller.getPostById(1);
    expect(result).toEqual(post);
  });

  it('should create a post', async () => {
    const dto: CreatePostDto = { title: 'New', content: 'Content' };
    const createdPost = { id: 1, ...dto };
    mockPostService.create.mockResolvedValue(createdPost);

    const result = await controller.createPost(mockRequest, dto);
    expect(result).toEqual(createdPost);
  });

  it('should update a post', async () => {
    const dto: UpdatePostDto = { title: 'Updated Title' };
    const updatedPost = { id: 1, ...dto };
    mockPostService.update.mockResolvedValue(updatedPost);

    const result = await controller.updatePost(1, dto, mockRequest);
    expect(result).toEqual(updatedPost);
  });

  it('should delete a post', async () => {
    const deletedResult = { message: '貼文刪除成功' };
    mockPostService.remove.mockResolvedValue(deletedResult);

    const result = await controller.deletePost(1, mockRequest);
    expect(result).toEqual(deletedResult);
  });
});
