import { Controller, Post, Body, UseGuards, ParseIntPipe, Param, Get, Delete, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // Admin: Create a project
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
  @Roles('admin') // Only admin can access
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }
  
  // Admin: Assign a project
  @Post('assign')
   @UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
   @Roles('admin')
   assignProject(@Body() dto: AssignProjectDto) {
  return this.projectService.assignProjectToUser(dto.userId, dto.projectId);
}

// Admin: Mark project as completed
@Post('complete')
  @UseGuards(JwtAuthGuard)
  completeProject(@Req() req: any) {
    const userId = req.user.userId;
    return this.projectService.markProjectAsCompletedByUser(userId);
  }

 // Admin: View all projects
@Get()
 @UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
 @Roles('admin')
 getAllProjects() {
  return this.projectService.getAllProjects();
}

// Admin: Delete a project
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles('admin')
deleteProject(@Param('id', ParseIntPipe) id: number) {
  return this.projectService.deleteProject(id);
}

// User: View their assigned project
@Get('me')
@UseGuards(JwtAuthGuard)
getMyProject(@Req() req: any) {
  console.log('Decoded user in JWT:', req.user); 
  const userId = req.user.userId;
  return this.projectService.getMyProject(userId);
}
}
