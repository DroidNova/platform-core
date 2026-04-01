import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AssignUserRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roleNames!: string[];
}
