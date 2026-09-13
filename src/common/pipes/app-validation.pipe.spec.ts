import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UpdatePostDto } from '../../post/dto/update-post.dto';
import { IdDto } from '../../user/dto/id.dto';
import { ErrorCode } from '../errors/error-codes.enum';
import { createAppValidationPipe } from './app-validation.pipe';

const bodyMetadata: ArgumentMetadata = {
  type: 'body',
  metatype: RegisterDto,
};

describe('createAppValidationPipe', () => {
  it('驗證並正規化合法的註冊資料', async () => {
    const pipe = createAppValidationPipe();

    const result: unknown = await pipe.transform(
      {
        email: '  User@Example.com ',
        password: 'password123',
        name: '  Samuel ',
        age: 25,
      },
      bodyMetadata,
    );

    expect(result).toMatchObject({
      email: 'user@example.com',
      password: 'password123',
      name: 'Samuel',
      age: 25,
    });
  });

  it('拒絕 DTO 未定義的額外欄位', async () => {
    const pipe = createAppValidationPipe();

    await expect(
      pipe.transform(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'Samuel',
          age: 25,
          isAdmin: true,
        },
        bodyMetadata,
      ),
    ).rejects.toMatchObject({
      response: {
        errorCode: ErrorCode.InvalidRequestFormat,
      },
    });
  });

  it('不將 body 中的數字字串寬鬆轉成 number', async () => {
    const pipe = createAppValidationPipe();

    await expect(
      pipe.transform(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'Samuel',
          age: '25',
        },
        bodyMetadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('依 DTO 明確設定將路由 ID 轉換為正整數', async () => {
    const pipe = createAppValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: IdDto,
    };

    const result: unknown = await pipe.transform({ id: '2' }, metadata);

    expect(result).toMatchObject({ id: 2 });
  });

  it('拒絕小於 1 的路由 ID', async () => {
    const pipe = createAppValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: IdDto,
    };

    await expect(pipe.transform({ id: '0' }, metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('拒絕沒有任何更新欄位的貼文資料', async () => {
    const pipe = createAppValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UpdatePostDto,
    };

    await expect(pipe.transform({}, metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
