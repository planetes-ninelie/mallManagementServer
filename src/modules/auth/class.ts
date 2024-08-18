import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    type: String,
    description: '用户昵称',
    default: 'admin',
  })
  username: string;
  @ApiProperty({
    type: String,
    description: '用户密码',
    default: '123456',
  })
  password: string;
}