// apps/api/src/app/debug.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { OrganizationEntity } from './entities/organization.entity';

/** Debug endpoints for inspecting current users and organizations. */
@Controller('debug')
export class DebugController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>,
  ) {}

  /** Return all users with their organizations. */
  @Get('users')
  async getUsers() {
    return this.usersRepo.find({
      relations: ['organization'],
    });
  }

  /** Return all organizations with parent/child relations. */
  @Get('orgs')
  async getOrgs() {
    return this.orgRepo.find({
      relations: ['parent', 'children'],
    });
  }
}
