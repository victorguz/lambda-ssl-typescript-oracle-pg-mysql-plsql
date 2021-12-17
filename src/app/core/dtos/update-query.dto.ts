
import { IsBoolean, IsInt, IsNotEmptyObject, IsObject, Min } from 'class-validator';
import { CreateQueryDto } from './create-query.dto';

export class UpdateQueryDto extends (CreateQueryDto) {

    @IsObject()
    @IsNotEmptyObject()
    where: object

    @Min(1)
    @IsInt()

    limit: number

    @IsBoolean()

    sql: boolean = false
}
