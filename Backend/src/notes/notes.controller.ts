import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto, CreateShareNoteDto } from './dto/create-note.dto';
import { LoggedInGuard } from '../auth/auth.guard';
import { User } from '../common/decorators/user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('notes')
@UseGuards(LoggedInGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(
    @User('id') userId: string,
    @Body() createNoteDto: CreateNoteDto
  ) {
    return this.notesService.create(userId, createNoteDto);
  }

  @Get()
  async findAll(
    @User('id') userId: string
  ) {
    return this.notesService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @User('id') userId: string,
    @Param('id') id: string
  ) {
    return this.notesService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    return this.notesService.update(userId, id, updateNoteDto);
  }

  @Delete(':id')
  async remove(
    @User('id') userId: string,
    @Param('id') id: string
  ) {
    return this.notesService.softRemove(userId, id);
  }

  @Delete(':id/permanent')
  async permanentRemove(
    @User('id') userId: string,
    @Param('id') id: string
  ) {
    return this.notesService.permanentRemove(userId, id);
  }

  @Patch(':id/restore')
  async restore(
    @User('id') userId: string,
    @Param('id') id: string
  ) {
    return this.notesService.restore(userId, id);
  }

  @Post(':id/share')
  async shareNote(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() createShareNoteDto: CreateShareNoteDto
  ) {
    return this.notesService.shareNote(userId, id, createShareNoteDto)
  }

  @Public()
  @Get(':id/share')
  async getSharedNote (
    @Param('id') id: string,
  ) {
    return this.notesService.getSharedNote(id)
  }
}
