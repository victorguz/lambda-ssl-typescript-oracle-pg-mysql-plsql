
import { IsArray, IsIn, IsInt, IsOptional, IsPositive, } from "class-validator";
import { QueryOrderByDto } from "./query-orderby.dto";

export class FindDto {

    @IsInt()
    @IsPositive()
    @IsOptional()

    readonly limit?: number

    @IsInt()
    @IsOptional()

    readonly offset?: number = 0

    @IsArray()
    @IsOptional()

    readonly orderby?: QueryOrderByDto[];
}
