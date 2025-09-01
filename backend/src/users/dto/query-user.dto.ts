import { IsOptional, IsString, IsUUID, IsNumberString } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsUUID()
  cursor?: string;
}