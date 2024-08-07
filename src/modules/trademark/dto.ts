import { IsNumber, IsString } from 'class-validator';

export class TrademarkDto {
  @IsNumber()
  id?: number;

  @IsString()
  logoUrl: string;

  @IsString()
  tmName: string;
}
