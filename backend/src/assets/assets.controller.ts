import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClaimsGuard } from 'src/auth/guards/claims.guard';
import { RequirePermissions } from 'src/auth/claims.decorator';

@UseGuards(JwtAuthGuard, ClaimsGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @RequirePermissions('ASSET_CREATE')
  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @RequirePermissions('ASSET_READ')
  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('tag') tag?: string,
    @Query('mac') mac?: string,
    @Query('serial') serial?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.assetsService.findAll(
      name,
      tag,
      mac,
      serial,
      category,
      type,
      status,
    );
  }

  @RequirePermissions('ASSET_READ')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @RequirePermissions('ASSET_UPDATE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(+id, updateAssetDto);
  }

  @RequirePermissions('ASSET_DELETE')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}
