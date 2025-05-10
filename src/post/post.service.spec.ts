import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all posts with user', async () => {
      const result = [{ id: 1, title: 'Test', user: {} }];
      mockPostRepo.find.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
      expect(mockPostRepo.find).toHaveBeenCalledWith({ relations: ['user'] });
    });
  });

  describe('findOne', () => {
    it('should return one post by id', async () => {
      const post = { id: 1, title: 'Test', user: {} };
      mockPostRepo.findOne.mockResolvedValue(post);

      expect(await service.findOne(1)).toEqual(post);
      expect(mockPostRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
    });
  });

  describe('create', () => {
    it('should throw if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'A', content: 'B' }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and return a post', async () => {
      const dto = { title: 'A', content: 'B' };
      const user = { id: 1, name: 'Test' };
      const post = { id: 1, ...dto, user };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockPostRepo.create.mockReturnValue(post);
      mockPostRepo.save.mockResolvedValue(post);

      expect(await service.create(dto, 1)).toEqual(post);
    });

    it('should throw InternalServerError on failure', async () => {
      mockUserRepo.findOne.mockRejectedValue(new Error('db error'));

      await expect(
        service.create({ title: 'x', content: 'y' }, 1),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    const user = { id: 1, roles: ['user'] };

    it('should throw if post not found', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { title: 'U' }, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if user is not owner or admin', async () => {
      const post = { id: 1, title: 'X', user: { id: 2 } };
      mockPostRepo.findOne.mockResolvedValue(post);

      await expect(service.update(1, { title: 'U' }, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update if user is owner', async () => {
      const post = { id: 1, title: 'X', user: { id: 1 } };
      const updated = { ...post, title: 'Updated' };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(updated);

      expect(await service.update(1, { title: 'Updated' }, user)).toEqual(
        updated,
      );
    });

    it('should update if user is admin', async () => {
      const post = { id: 1, title: 'X', user: { id: 2 } };
      const updated = { ...post, title: 'Updated' };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(updated);

      expect(
        await service.update(
          1,
          { title: 'Updated' },
          { id: 99, roles: ['admin'] },
        ),
      ).toEqual(updated);
    });
  });

  describe('remove', () => {
    const user = { id: 1, roles: ['user'] };

    it('should throw if post not found', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not owner or admin', async () => {
      const post = { id: 1, title: 'X', user: { id: 2 } };
      mockPostRepo.findOne.mockResolvedValue(post);

      await expect(service.remove(1, user)).rejects.toThrow(ForbiddenException);
    });

    it('should delete if user is owner', async () => {
      const post = { id: 1, title: 'X', user: { id: 1 } };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.remove.mockResolvedValue(post);

      expect(await service.remove(1, user)).toEqual(post);
    });

    it('should delete if user is admin', async () => {
      const post = { id: 1, title: 'X', user: { id: 2 } };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.remove.mockResolvedValue(post);

      expect(await service.remove(1, { id: 99, roles: ['admin'] })).toEqual(
        post,
      );
    });
  });
});
