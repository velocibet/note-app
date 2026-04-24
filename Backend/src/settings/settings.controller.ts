import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { LoggedInGuard } from '../auth/auth.guard';
import { UpdateSettingDto } from './dto/create-setting.dto';
import { User } from '../common/decorators/user.decorator';

@Controller('settings')
@UseGuards(LoggedInGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(
    @User('id') userId: string
  ) {
    return this.settingsService.findOne(userId);
  }

  @Patch()
  async updateSettings(
    @User('id') userId: string,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.update(userId, updateSettingDto);
  }
}