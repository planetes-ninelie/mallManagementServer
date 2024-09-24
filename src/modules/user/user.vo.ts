// import { PagesVo } from '../../common/vo/pagesVo';
import { User } from './user.entity';
// import { Role } from '../role/role.entity';

export class UserVo extends User{
  roleName: string;
  // roles?: Role[];
}
// export class UserListPagesVo extends PagesVo<UserVo>{}