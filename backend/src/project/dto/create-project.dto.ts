import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string; // ISO format e.g., "2025-07-01"
}
