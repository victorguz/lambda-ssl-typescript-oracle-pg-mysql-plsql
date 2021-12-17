
import { IsBoolean, IsNotEmpty, IsNotEmptyObject, IsObject, IsString } from "class-validator";

export class CreateQueryDto {

    @IsString()
    @IsNotEmpty()

    table: string

    @IsObject()
    @IsNotEmptyObject()

    values: any

    @IsBoolean()

    sql: boolean = false
}
