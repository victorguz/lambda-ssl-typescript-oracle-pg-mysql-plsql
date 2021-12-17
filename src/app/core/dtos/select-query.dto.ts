import { ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { QueryOrderByDto } from './query-orderby.dto';

export class SelectQueryDto {

    @IsString()
    @IsNotEmpty()
    table: string

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    select: string[] = ["*"]

    @IsOptional()
    @IsObject()
    @IsNotEmptyObject()
    where: object

    @IsOptional()
    @Min(1)
    @IsInt()
    limit: number

    @IsOptional()
    @IsInt()
    offset: number = 0

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    orderby: QueryOrderByDto[]

    @IsBoolean()
    sql: boolean = false
}

