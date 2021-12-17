
import { IsBoolean, IsInt, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, Min } from 'class-validator';

export class DeleteQueryDto {

    @IsString()
    @IsNotEmpty()

    table: string

    @IsObject()
    @IsNotEmptyObject()

    where: object

    @Min(1)
    @IsInt()

    limit: number

    @IsBoolean()

    sql: boolean = false
}
