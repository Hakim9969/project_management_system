import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const { name, description, endDate } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        name,
        description,
        endDate: new Date(endDate),
      },
    });

    return project;
  }

  async assignProjectToUser(userId: number, projectId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    if (await this.prisma.user.findFirst({ where: { projectId } })) {
      throw new Error('This project is already assigned to another user');
    }

    if (user.projectId) {
      throw new Error('User already has a project assigned');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { projectId },
    });

    await this.mailService.sendProjectAssignedEmail(
      user.email,
      project.name,
      project.endDate.toISOString()
    );

    return updatedUser;
  }

  // ✅ NEW: user marks their own assigned project as completed
  async markProjectAsCompletedByUser(userId: number): Promise<any> {
    if (!userId) {
    throw new Error('Invalid or missing userId');
  }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { project: true },
    });

    if (!user || !user.project) {
      throw new NotFoundException('No assigned project found for this user.');
    }

    if (user.project.isCompleted) {
      throw new Error('Project is already completed');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: user.project.id },
      data: { isCompleted: true },
    });

    // ✅ Notify admin when a user completes their project
    try {
      await this.mailService.sendEmail({
        to: 'hakgotchills@gmail.com', // ✅ replace with real admin email or fetch dynamically
        subject: `Project Completed by ${user.name}`,
        text: `User ${user.name} (${user.email}) has completed the project "${user.project.name}".`,
      });
    } catch (err) {
      this.logger.warn(`Could not send email to admin: ${err.message}`);
    }

    return updatedProject;
  }

  async getAllProjects() {
    return this.prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: `Project ${id} deleted successfully` };
  }

  async getMyProject(userId: number) {
     if (!userId) {
    throw new Error('Invalid or missing userId');
  }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { project: true },
    });

    if (!user?.project) {
      throw new NotFoundException('No project assigned yet.');
    }

    return user.project;
  }

  async unassignProjectFromUser(userId: number): Promise<any> {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.projectId) {
    throw new NotFoundException('User has no assigned project.');
  }

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: { projectId: null },
  });

  return { message: `Project unassigned from ${user.name}` };
}

}
