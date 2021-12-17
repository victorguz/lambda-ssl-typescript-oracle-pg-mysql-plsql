
import { IsIn, IsNotEmpty, IsString, } from "class-validator";

export class QueryOrderByDto {

    @IsString()
    @IsNotEmpty()

    column: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["desc", "asc", "DESC", "ASC"])

    order: string;

    public static asString(body: QueryOrderByDto) {
        return `${body.column} ${body.order}`
    }

}