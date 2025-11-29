import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPostRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
};

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useValue: mockPostRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    jest.clearAllMocks();
  });

  it('should return all posts', async () => {
    const posts = [{ id: 1, title: 'Test', user: {} }];
    mockPostRepo.find.mockResolvedValue(posts);

    const result = await service.findAll();
    expect(result).toEqual(posts);
  });

  it('should return one post by ID', async () => {
    const post = { id: 1, title: 'One', user: {} };
    mockPostRepo.findOne.mockResolvedValue(post);
    const result = await service.findOne(1);
    expect(result).toEqual(post);
  });

  describe('create()', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'X', content: 'Y' }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and return post', async () => {
      const user = { id: 1 };
      const post = { id: 1, title: 'Test', content: 'Y', user };

      mockUserRepo.findOne.mockResolvedValue(user); // ✅ mock 使用者存在
      mockPostRepo.create.mockReturnValue(post);
      mockPostRepo.save.mockResolvedValue(post);

      const result = await service.create({ title: 'Test', content: 'Y' }, 1);
      expect(result).toEqual(post);
    });

    it('should handle internal error', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 1 });
      mockPostRepo.create.mockReturnValue({});
      mockPostRepo.save.mockRejectedValue(new Error('db error'));

      await expect(
        service.create({ title: 'A', content: 'B' }, 1),
      ).rejects.toThrow('新增貼文時發生錯誤');
    });
  });

  describe('update()', () => {
    const user = { id: 1, roles: ['user'] };

    it('should throw if post not found', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, {}, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if user is not owner or admin', async () => {
      mockPostRepo.findOne.mockResolvedValue({ id: 1, user: { id: 2 } });
      await expect(service.update(1, {}, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update and return post if owner', async () => {
      const post = { id: 1, title: 'X', content: 'Y', user: { id: 1 } };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue({ ...post, title: 'Z' });

      const result = await service.update(1, { title: 'Z' }, user);
      expect(result.title).toEqual('Z');
    });

    it('should update and return post if admin', async () => {
      const post = { id: 1, title: 'X', content: 'Y', user: { id: 2 } };
      const admin = { id: 99, roles: ['admin'] };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue({ ...post, title: 'New' });

      const result = await service.update(1, { title: 'New' }, admin);
      expect(result.title).toBe('New');
    });
  });

  describe('remove()', () => {
    const user = { id: 1, roles: ['user'] };
    const post = { id: 1, title: 'X', user: { id: 1 } };

    it('should throw if post not found', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, user)).rejects.toThrow(NotFoundException);
    });

    it('should delete if user is owner', async () => {
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.remove.mockResolvedValue(post);

      const result = await service.remove(1, user);
      expect(result).toEqual(post);
    });

    it('should delete if user is admin', async () => {
      const admin = { id: 99, roles: ['admin'] };
      const postByOther = { id: 1, title: 'X', user: { id: 2 } };
      mockPostRepo.findOne.mockResolvedValue(postByOther);
      mockPostRepo.remove.mockResolvedValue(postByOther);

      const result = await service.remove(1, admin);
      expect(result).toEqual(postByOther);
    });

    it('should throw if not owner or admin', async () => {
      mockPostRepo.findOne.mockResolvedValue({ ...post, user: { id: 9 } });
      await expect(service.remove(1, user)).rejects.toThrow(ForbiddenException);
    });
  });
});
