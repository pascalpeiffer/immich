import { Injectable, NotFoundException } from '@nestjs/common';
import { MaybeDuplicate } from 'src/dtos/activity.dto.js';
import { AuthDto } from 'src/dtos/auth.dto.js';
import { ViewerCreateDto, ViewerResponseDto, ViewerUpdateDto, mapViewer } from 'src/dtos/viewer.dto.js';
import { Permission } from 'src/enum.js';
import { BaseService } from 'src/services/base.service.js';
import { findOrFail } from 'src/utils/misc.js';

@Injectable()
export class ViewerService extends BaseService {
  async getAll(auth: AuthDto): Promise<ViewerResponseDto[]> {
    let viewerResponseDtos: ViewerResponseDto[] = await this.viewerRepository.getAll();

    const viewerIds = viewerResponseDtos.map((viewer) => viewer.id);
    const allowedLibraryIds = await this.checkAccess({ auth, permission: Permission.ViewerRead, ids: viewerIds });

    viewerResponseDtos = viewerResponseDtos.filter((viewer) => allowedLibraryIds.has(viewer.id));

    return viewerResponseDtos;
  }

  async getByLibraryID(auth: AuthDto, libraryId: string): Promise<ViewerResponseDto[]> {
    let viewerResponseDtos: ViewerResponseDto[] = await this.viewerRepository.getByLibraryId(libraryId);

    const viewerIds = viewerResponseDtos.map((viewer) => viewer.id);
    const allowedLibraryIds = await this.checkAccess({ auth, permission: Permission.ViewerRead, ids: viewerIds });

    viewerResponseDtos = viewerResponseDtos.filter((viewer) => allowedLibraryIds.has(viewer.id));

    return viewerResponseDtos;
  }

  async getByLibraryAndUserID(auth: AuthDto, libraryId: string, userId: string): Promise<ViewerResponseDto> {
    const viewerResponseDto = await this.viewerRepository.getByLibraryAndUserId(libraryId, userId);

    if (!viewerResponseDto) throw new NotFoundException(`Not found or no ${Permission.ViewerRead} access`);

    await this.requireAccess({ auth, permission: Permission.ViewerRead, ids: [viewerResponseDto.id] });

    return viewerResponseDto;
  }

  async create(auth: AuthDto, dto: ViewerCreateDto): Promise<MaybeDuplicate<ViewerResponseDto>> {
    await this.requireAccess({ auth, permission: Permission.ViewerCreate, ids: [dto.libraryId] });

    //check for duplicate
    let viewer = await this.viewerRepository.getByLibraryAndUserId(dto.libraryId, dto.userId);

    if (viewer) {
      return {
        duplicate: true,
        value: mapViewer(viewer),
      };
    }

    viewer = await this.viewerRepository.create({
      libraryId: dto.libraryId,
      userId: dto.userId,
    });

    return {
      duplicate: false,
      value: mapViewer(viewer),
    };
  }

  async update(auth: AuthDto, id: string, dto: ViewerUpdateDto): Promise<ViewerResponseDto> {
    await this.requireAccess({ auth, permission: Permission.ViewerUpdate, ids: [id] });
    await this.findOrFail(id);

    const viewer = await this.viewerRepository.update(id, dto);
    return mapViewer(viewer);
  }

  async delete(auth: AuthDto, id: string) {
    await this.requireAccess({ auth, permission: Permission.ViewerDelete, ids: [id] });
    await this.findOrFail(id);

    await this.viewerRepository.delete(id);
  }

  private findOrFail(id: string) {
    return findOrFail(() => this.viewerRepository.getById(id), 'Viewer');
  }
}
