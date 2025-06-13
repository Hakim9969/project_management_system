import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignProjectDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  projectId: number;
}
