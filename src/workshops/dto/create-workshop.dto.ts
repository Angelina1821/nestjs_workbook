import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive, IsString, Length } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @Length(2, 200)
  title!: string;

  @IsString()
  @Length(5, 5000)
  description!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsInt()
  @IsPositive()
  maxParticipants!: number;

  @IsInt()
  @IsPositive()
  classroomId!: number;
}
