import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { OracleService } from 'src/app/core/services/oracle.service';
import { PostgreService } from 'src/app/core/services/postgre.service';

@Controller('test')
export class TestController {
  constructor() { }

  @Post()
  async create(@Body() createTestDto: CreateTestDto) {
    throw new NotFoundException("Aún no se ha creado este endpoint");

  }

  @Get("oracle")
  async findAllOracle() {
    return await OracleService.query()
  }

  @Get("pg")
  async findAllPg() {
    return await PostgreService.query()
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new NotFoundException("Aún no se ha creado este endpoint");

  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    throw new NotFoundException("Aún no se ha creado este endpoint");

  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    throw new NotFoundException("Aún no se ha creado este endpoint");
  }


}
