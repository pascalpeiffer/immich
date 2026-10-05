import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthDto } from 'src/dtos/auth.dto.js';
import { Endpoint, HistoryBuilder } from 'src/decorators.js';
import { ViewerCreateDto, ViewerResponseDto, ViewerUpdateDto } from 'src/dtos/viewer.dto.js';
import { ApiTag, Permission } from 'src/enum.js';
import { Auth, Authenticated } from 'src/middleware/auth.guard.js';
import { ViewerService } from 'src/services/viewer.service.js';
import { UUIDParamDto } from 'src/validation.js';

@ApiTags(ApiTag.Viewer)
@Controller('viewer')
export class ViewerController {
  constructor(private service: ViewerService) {}

  @Get()
  @Authenticated({ permission: Permission.ViewerRead, admin: true })
  @Endpoint({
    summary: 'Get all viewers',
    description: 'Returns a list of all viewers.',
    history: new HistoryBuilder().added('v3'),
  })
  getViewers(@Auth() auth: AuthDto): Promise<ViewerResponseDto[]> {
    return this.service.getAll(auth);
  }

  @Get(':id')
  @Authenticated({ permission: Permission.ViewerRead, admin: true })
  @Endpoint({
    summary: 'Get all viewers of a given library id',
    description: 'Get all viewers of a given library id.',
    history: new HistoryBuilder().added('v3'),
  })
  getViewersByLibraryID(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto): Promise<ViewerResponseDto[]> {
    return this.service.getByLibraryID(auth, id);
  }

  @Post()
  @Authenticated({ permission: Permission.ViewerCreate, admin: true })
  @Endpoint({
    summary: 'Create an viewer',
    description: 'Create an viewer for a given library.',
    history: new HistoryBuilder().added('v3'),
  })
  async createViewer(
    @Auth() auth: AuthDto,
    @Body() dto: ViewerCreateDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ViewerResponseDto> {
    const { duplicate, value } = await this.service.create(auth, dto);
    if (duplicate) {
      res.status(HttpStatus.OK);
    }
    return value;
  }

  @Put(':id')
  @Authenticated({ permission: Permission.ViewerUpdate, admin: true })
  @Endpoint({
    summary: 'Update a viewer',
    description: 'Update an viewer user.',
    history: new HistoryBuilder().added('v3'),
  })
  updateViewer(
    @Auth() auth: AuthDto,
    @Param() { id }: UUIDParamDto,
    @Body() dto: ViewerUpdateDto,
  ): Promise<ViewerResponseDto> {
    return this.service.update(auth, id, dto);
  }

  @Delete(':id')
  @Authenticated({ permission: Permission.ViewerDelete })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Endpoint({
    summary: 'Delete an viewer',
    description: 'Removes a viewer from a given library.',
    history: new HistoryBuilder().added('v3'),
  })
  deleteViewer(@Auth() auth: AuthDto, @Param() { id }: UUIDParamDto): Promise<void> {
    return this.service.delete(auth, id);
  }
}
