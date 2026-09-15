import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @Length(2, 150)
  name!: string;

  @IsInt()
  @IsPositive()
  capacity!: number;
}
