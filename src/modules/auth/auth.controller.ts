import { Body, Controller, Get, Headers, Param, Post, Req, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { extractToken } from 'src/utils';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { loginDto , ILoginDto } from './auth.dto';

@ApiBearerAuth()
@ApiTags('鉴权')
@Controller('index')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({summary:'登录'})
  @ApiBody({ type: loginDto })
  // 验证码要用 @UploadedFiles() files: Array<Express.Multer.File>
  async login(@Body() body: ILoginDto) {
    return await this.authService.login(body.username, body.password);
  }

  @Public()
  @Post('logout')
  @ApiOperation({summary:'退出'})
  @ApiHeaders([
    { name: 'Authorization', required: true, description: 'Bearer token for authentication' },
    { name: 'Token', required: false, description: 'The API Key used for authentication' },
  ])
  async logout(@Headers('Token') auth: string) {
    const token = extractToken(auth);
    return await this.authService.logout(token);
  }

  @Get('info')
  @ApiOperation({summary:'查看用户信息'})
  info(@Req() request) {
    return this.authService.info(request);
  }

}
