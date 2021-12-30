import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { OracleService } from 'src/app/core/services/oracle.service';
import { PostgreService } from 'src/app/core/services/postgre.service';

@Controller('test')
export class TestController {
  constructor() { }

  @Get("oracle")
  async findAllOracle() {
    /**
     * Example:
     * 
     * functionDeclaration = "fvcbuscarparamsicf(:pe_vcemp, :pe_vcmodulo, :pe_vccodparamred, :ps_vcerrorm)"
     * bindParameters = {
     *     pe_vcemp:  'JA', //Primera forma de especificarlo
     *     pe_vcmodulo: { val: '0002', dir: oracledb.BIND_IN }, ---//segunda forma de especificarlo
     *     pe_vccodparamred: 'GC_DIAS_HIST',
     *     ps_vcerrorm:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
     * }
     */
    return await OracleService.function("JA", `fvcbuscarparamsicf(:pe_vcemp, :pe_vcmodulo, :pe_vccodparamred, :ps_vcerrorm)`,
      { pe_vcemp: "JA", pe_vcmodulo: "0002", pe_vccodparamred: "GC_DIAS_HIST", ps_vcerrorm: { dir: OracleService.BIND_OUT }, })
  }

  @Get("pg")
  async findAllPg() {
    return await PostgreService.query()
  }

  @Get()
  async findAll() {
    throw new NotFoundException("Aún no se ha creado este endpoint");

  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    throw new NotFoundException("Aún no se ha creado este endpoint");

  }

  @Post()
  async create(@Body() createTestDto: CreateTestDto) {
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
