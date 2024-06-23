using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Evaluation;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Plugins;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request;
using Server.Models;
using Server.Services.Permission;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using Server.Services.File;
using Server.DataTransferObjects.Request.File;
using Server.Services.PermissionNotifier;
using TaskStatus = Server.Models.TaskStatus;
using Server.Services.Notification;
using Server.DataTransferObjects.Request.Notification;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class ProjectController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;
        private readonly IEmailService _emailService;
        private readonly IFileService _fileService;
        private readonly IPermissionNotifier _permissionNotifier;
        private readonly INotificationService _notificationService;

        
        public ProjectController(LogicTenacityDbContext dbContext, IPermissionService permissionService, 
                                    IEmailService emailService, IFileService fileService,
                                        IPermissionNotifier permissionNotifier, INotificationService notificationService)
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
            _emailService = emailService;
            _fileService = fileService;
            _permissionNotifier = permissionNotifier;
            _notificationService = notificationService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskPriority)
                .Include(p => p.ProjectTasks).ThenInclude(pts => pts.TaskCategory)
                .Include(p => p.TeamLeader)
                .ThenInclude(ptl => ptl.Role)
                .Include(p => p.MemberProjects)
                .Include(p => p.Priority)
                .ToListAsync();
            var projectDTOs = new List<ProjectDTO>();

            foreach (var p in projects)
            {
                var taskDTOs = p.ProjectTasks.Select(t => new ProjectTaskDTO
                {
                    TaskId = t.TaskId,
                    TaskName = t.TaskName,
                    TaskDescription = t.TaskDescription,
                    Deadline = t.Deadline,
                    ProjectId = p.ProjectId,
                    TaskStatus = t.TaskStatus.Name,
                    TaskStatusId = t.TaskStatusId,
                    TaskPriorityId = t.TaskPriorityId,
                    TaskPriorityName = t.TaskPriority.Name,
                    DeadlineModified = t.DeadlineModified,
                    TaskCategoryId = t.TaskCategoryId,
                    TaskCategoryName = t.TaskCategory.CategoryName
                }).ToList();

                MemberDTO teamLeaderDTO = null;

                if (p.TeamLeader != null)
                {

                    teamLeaderDTO = new MemberDTO
                    {
                        Id = p.TeamLeader.Id,
                        FirstName = p.TeamLeader.FirstName,
                        LastName = p.TeamLeader.LastName,
                        Email = p.TeamLeader.Email,
                        RoleId = p.TeamLeader.RoleId,
                        RoleName = p.TeamLeader.Role.RoleName
                    };
                }

                int numberOfMembers = dbContext.MemberProjects.Count(mp => mp.ProjectId == p.ProjectId && !mp.Member.IsDisabled);
                int numberOfTasks = dbContext.ProjectTasks.Count(mt => mt.ProjectId == p.ProjectId);
                projectDTOs.Add(new ProjectDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectName = p.ProjectName,
                    ProjectDescription = p.ProjectDescription,
                    Deadline = p.Deadline,
                    ProjectStatusId = p.ProjectStatusId,
                    Status = p.ProjectStatus.Status,
                    ProjectTasks = taskDTOs,
                    TeamLider = teamLeaderDTO,
                    StartDate = p.StartDate,
                    NumberOfPeople = numberOfMembers,
                    NumberOfTasks = numberOfTasks,
                    ProjectPriority = p.Priority.Name,
                    ProjectPriorityId = p.ProjectPriorityId,
                    DeadlineModifed = p.DeadlineModified,
                    DateFinished = p.DateFinished
                });
            }

            return Ok(projectDTOs);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddProjects(AddProjectRequest addProjectRequest)
        {
            var projectStatus = dbContext.ProjectStatuses.FirstOrDefault(ps => ps.Id == 1);
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Create project");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var teamLeader = await dbContext.Members
                                    .Include(m => m.Role)
                                    .FirstOrDefaultAsync(m => m.Id == userId);

            var priority = await dbContext.ProjectPriorities.FindAsync(addProjectRequest.PriorityId);

            if (teamLeader == null)
            {
                return BadRequest(new { message = "Member not found" });
            }

            var project = new Models.Project()
            {
                ProjectName = addProjectRequest.ProjectName,
                ProjectDescription = addProjectRequest.ProjectDescription,
                Deadline = addProjectRequest.Deadline,
                StartDate = DateTime.Now,
                ProjectStatus = projectStatus,
                TeamLeaderId = teamLeader.Id,
                ProjectPriorityId = priority.ProjectPriorityId
            };

            var firstThreeTaskStatuses = await dbContext.TaskStatuses.Where(ts => ts.IsDefault).ToListAsync();

            project.ProjectTaskStatuses = firstThreeTaskStatuses
                .Select(status => new ProjectTaskStatus { TaskStatus = status }).ToList();

            var defaultProjectRoles = await dbContext.ProjectRoles.Where(pr => pr.IsDefault).ToListAsync();

            project.ProjectProjectRoles = defaultProjectRoles
                .Select(projectRole => new ProjectProjectRole { ProjectRole = projectRole }).ToList();

            dbContext.Projects.Add(project);

            await dbContext.SaveChangesAsync();

            var projectTaskCategories = new ProjectTaskCategories
            {
                ProjectId = project.ProjectId,
                TaskCategoryId = 1
            };

            dbContext.ProjectTaskCategories.Add(projectTaskCategories);
            await dbContext.SaveChangesAsync();

            dbContext.MemberProjects.Add(new MemberProject { MemberId = userId, ProjectId = project.ProjectId, ProjectRoleId = 1 });

            await dbContext.SaveChangesAsync();
            
            var teamLeaderDTO = new MemberDTO
            {
                Id = teamLeader.Id,
                FirstName = teamLeader.FirstName,
                LastName = teamLeader.LastName,
                Email = teamLeader.Email,
                RoleId = teamLeader.RoleId,
                DateAdded = teamLeader.DateAdded,
                Country = teamLeader.Country,
                City = teamLeader.City,
                Status = teamLeader.Status,
                Github = teamLeader.Github,
                Linkedin = teamLeader.Linkedin,
                PhoneNumber = teamLeader.PhoneNumber,
                DateOfBirth = teamLeader.DateOfBirth,
                RoleName = teamLeader.Role.RoleName,
                IsDisabled = teamLeader.IsDisabled
            };

            int numberOfMembers = dbContext.MemberProjects.Count(mp => mp.ProjectId == project.ProjectId && !mp.Member.IsDisabled);
            int numberOfTasks = dbContext.ProjectTasks.Count(mt => mt.ProjectId == project.ProjectId);

            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectDescription = project.ProjectDescription,
                Deadline = project.Deadline,
                ProjectStatusId = project.ProjectStatus.Id,
                Status = projectStatus.Status,
                StartDate = project.StartDate,
                TeamLider = teamLeaderDTO,
                NumberOfPeople = numberOfMembers,
                NumberOfTasks = numberOfTasks,
                ProjectPriorityId = priority.ProjectPriorityId,
                ProjectPriority = priority.Name
            };

            await _permissionNotifier.AssignedToProject(userId, project.ProjectId);
            await _permissionNotifier.UpdatedProjectPermissions(projectDTO.ProjectId, projectDTO.TeamLider.Id);
            
            return Ok(projectDTO);
        }

        [Authorize]
        [HttpGet("Member/{memberId}")]
        public async Task<IActionResult> GetProjectsWhereMember(int memberId)
        {
            var projects = await dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskStatus)
                .Include(p=>p.ProjectTasks).ThenInclude(pts => pts.TaskCategory)
                .Include(p => p.TeamLeader)
                .ThenInclude(ptl => ptl.Role)
                .Include(p => p.MemberProjects)
                .Include(p => p.Priority)
                .Where(p => p.MemberProjects.Any(mp => mp.MemberId == memberId))
                .ToListAsync();
            var projectDTOs = new List<ProjectDTO>();

            foreach (var p in projects)
            {
                var taskDTOs = p.ProjectTasks.Select(t => new ProjectTaskDTO
                {
                    TaskId = t.TaskId,
                    TaskName = t.TaskName,
                    TaskDescription = t.TaskDescription,
                    Deadline = t.Deadline,
                    ProjectId = p.ProjectId,
                    TaskStatus = t.TaskStatus.Name,
                    TaskStatusId = t.TaskStatusId,
                    DateFinished = t.DateFinished,
                    DeadlineModified = t.DeadlineModified,
                    TaskCategoryName = t.TaskCategory.CategoryName,
                    TaskCategoryId = t.TaskCategoryId
                }).ToList();

                MemberDTO teamLeaderDTO = null;

                if (p.TeamLeader != null)
                {

                    teamLeaderDTO = new MemberDTO
                    {
                        Id = p.TeamLeader.Id,
                        FirstName = p.TeamLeader.FirstName,
                        LastName = p.TeamLeader.LastName,
                        Email = p.TeamLeader.Email,
                        RoleId = p.TeamLeader.RoleId,
                        RoleName = p.TeamLeader.Role.RoleName
                    };
                }

                int numberOfMembers = dbContext.MemberProjects.Count(mp => mp.ProjectId == p.ProjectId && !mp.Member.IsDisabled);
                int numberOfTasks = dbContext.ProjectTasks.Count(mt => mt.ProjectId == p.ProjectId);
                projectDTOs.Add(new ProjectDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectName = p.ProjectName,
                    ProjectDescription = p.ProjectDescription,
                    Deadline = p.Deadline,
                    ProjectStatusId = p.ProjectStatusId,
                    Status = p.ProjectStatus.Status,
                    ProjectTasks = taskDTOs,
                    TeamLider = teamLeaderDTO,
                    StartDate = p.StartDate,
                    NumberOfPeople = numberOfMembers,
                    NumberOfTasks = numberOfTasks,
                    ProjectPriority = p.Priority.Name,
                    ProjectPriorityId = p.ProjectPriorityId,
                    DateFinished = p.DateFinished,
                    DeadlineModifed = p.DeadlineModified
                });
            }

            return Ok(projectDTOs);
        }

        [Authorize]
        [HttpGet("{projectId}")]
        public IActionResult GetProject(int projectId)
        {
            var project = dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskStatus)
                .Include(p => p.ProjectTasks).ThenInclude(pts => pts.TaskCategory)
                .Include(p => p.TeamLeader)
                .ThenInclude(ptl => ptl.Role)
                .Include(p => p.MemberProjects)
                .Include(p => p.Priority)
                .SingleOrDefault(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var taskDTOs = project.ProjectTasks.Select(t => new ProjectTaskDTO
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                Deadline = t.Deadline,
                ProjectId = t.ProjectId,
                TaskStatus = t.TaskStatus.Name,
                TaskStatusId = t.TaskStatusId,
                DeadlineModified = t.DeadlineModified,
                DateFinished = t.DateFinished,
                TaskCategoryId = t.TaskCategoryId,
                TaskCategoryName = t.TaskCategory.CategoryName
            }).ToList();

            int numberOfTasks = dbContext.ProjectTasks.Count(mt => mt.ProjectId == project.ProjectId);

            MemberDTO teamLeaderDTO = null;

            if (project.TeamLeader != null)
            {

                teamLeaderDTO = new MemberDTO
                {
                    Id = project.TeamLeader.Id,
                    FirstName = project.TeamLeader.FirstName,
                    LastName = project.TeamLeader.LastName,
                    Email = project.TeamLeader.Email,
                    RoleId = project.TeamLeader.RoleId,
                    RoleName = project.TeamLeader.Role.RoleName,
                    IsDisabled = project.TeamLeader.IsDisabled
                };
            }

            int numberOfMembers = dbContext.MemberProjects.Count(mp => mp.ProjectId == project.ProjectId && !mp.Member.IsDisabled);

            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectDescription = project.ProjectDescription,
                Deadline = project.Deadline,
                ProjectStatusId = project.ProjectStatusId,
                Status = project.ProjectStatus.Status,
                ProjectTasks = taskDTOs,
                TeamLider = teamLeaderDTO,
                StartDate = project.StartDate,
                NumberOfPeople = numberOfMembers,
                NumberOfTasks = numberOfTasks,
                ProjectPriority = project.Priority.Name,
                ProjectPriorityId = project.ProjectPriorityId,
                DateFinished = project.DateFinished,
                DeadlineModifed = project.DeadlineModified
            };

            return Ok(projectDTO);
        }

        [Authorize]
        [HttpPut("{projectId}")]
        public async Task<IActionResult> UpdateProject(int projectId, UpdateProjectRequest updateProjectRequest)
        {
            if (!await _permissionService.HasProjectPermissionAsync(projectId, "Change project"))
            {
                return Forbid();
            }

            var project = await dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskStatus)
                .Include(p => p.TeamLeader)
                .ThenInclude(ptl => ptl.Role)
                .Include(p => p.Priority)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            project.ProjectName = updateProjectRequest.ProjectName;
            project.ProjectDescription = updateProjectRequest.ProjectDescription;
            project.Deadline = updateProjectRequest.Deadline;
            var projectPriority = dbContext.ProjectPriorities.First(pp => pp.ProjectPriorityId == updateProjectRequest.ProjectPriorityId);
            project.Priority = projectPriority;
            var projectStatus = dbContext.ProjectStatuses.First(pp => pp.Id == updateProjectRequest.ProjectStatusId);
            project.ProjectStatus = projectStatus;

            await dbContext.SaveChangesAsync();

            var taskDTOs = project.ProjectTasks.Select(t => new ProjectTaskDTO
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                Deadline = t.Deadline,
                ProjectId = t.ProjectId,
                TaskStatus = t.TaskStatus.Name,
                TaskStatusId = t.TaskStatusId
            }).ToList();

            MemberDTO teamLeaderDTO = null;

            if (project.TeamLeader != null)
            {

                teamLeaderDTO = new MemberDTO
                {
                    Id = project.TeamLeader.Id,
                    FirstName = project.TeamLeader.FirstName,
                    LastName = project.TeamLeader.LastName,
                    Email = project.TeamLeader.Email,
                    RoleId = project.TeamLeader.RoleId,
                    RoleName = project.TeamLeader.Role.RoleName,
                    IsDisabled = project.TeamLeader.IsDisabled
                };
            }

            int numberOfMembers = dbContext.MemberProjects.Count(mp => mp.ProjectId == project.ProjectId && !mp.Member.IsDisabled);
            int numberOfTasks = dbContext.ProjectTasks.Count(mt => mt.ProjectId == project.ProjectId);

            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectDescription = project.ProjectDescription,
                Deadline = project.Deadline,
                ProjectStatusId = project.ProjectStatusId,
                Status = project.ProjectStatus.Status,
                ProjectTasks = taskDTOs,
                TeamLider = teamLeaderDTO,
                StartDate = project.StartDate,
                NumberOfPeople = numberOfMembers,
                NumberOfTasks = numberOfTasks,
                ProjectPriority = project.Priority.Name,
                ProjectPriorityId = project.ProjectPriorityId,
                DateFinished = project.DateFinished,
                DeadlineModifed = project.DeadlineModified
            };

            return Ok(projectDTO);
        }

        [Authorize]
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Delete project");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var project = await dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                   .ThenInclude(pts => pts.TaskStatus)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }

            dbContext.Projects.Remove(project);

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Project deleted successfully." });

        }


        [Authorize]
        [HttpPut("{projectId}/status/{statusId}")]
        public async Task<IActionResult> UpdateProjectStatus(int projectId, int statusId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }


            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project status");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var project = await dbContext.Projects
                .Include(p => p.ProjectStatus)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pts => pts.TaskStatus)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
                return NotFound(new { message = "Project not found" });

            var status = await dbContext.ProjectStatuses.FindAsync(statusId);
            if (status == null)
                return NotFound(new { message = "Status not found" });

            if (statusId == 2 && project.StartDate == DateTime.MinValue)
            {
                project.StartDate = DateTime.Now;
            }

            if (statusId == 3)
            {
                project.DateFinished = DateTime.Now;
            }

            project.ProjectStatus = status;
            await dbContext.SaveChangesAsync();



            var members = await dbContext.Members
                              .Where(m => dbContext.MemberProjects
                                                 .Any(mp => mp.ProjectId == projectId && mp.MemberId == m.Id) && !m.IsDisabled)
                              .Include(m => m.Role)
                              .ToListAsync();

            foreach (var member in members)
            {
                SendNotificationRequest sendNotificationRequest = new SendNotificationRequest
                {
                    Title = "Project Status Updated!",
                    Description = $"The status for project '{project.ProjectName}' has been updated to '{status.Status}'.",
                    MemberId = member.Id
                };

                await _notificationService.SendNotification(sendNotificationRequest);
            }


            return Ok(new { message = "Project status updated successfully." });

        }

        [Authorize]
        [HttpGet("{projectId}/Tasks")]
        public async Task<IActionResult> GetProjectTasks(int projectId)
        {
            var project = await dbContext.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var tasks = await dbContext.ProjectTasks
                                        .Where(t => t.ProjectId == projectId)
                                        .Include(pt => pt.TaskStatus)
                                        .Include(pt => pt.TaskCategory)
                                        .ToListAsync();

            var tasksDTOs = tasks.Select(t => new ProjectTaskDTO
            {
                Deadline = t.Deadline,
                ProjectId = t.ProjectId,
                TaskDescription = t.TaskDescription,
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskStatus = t.TaskStatus.Name,
                TaskStatusId = t.TaskStatusId,
                TaskCategoryId = t.TaskCategoryId,
                TaskCategoryName = t.TaskCategory.CategoryName
            }).ToList();

            return Ok(tasksDTOs);
        }

        [Authorize]
        [HttpPost("{projectId}/teamleader/{memberId}")]
        public async Task<IActionResult> AddTeamLeaderToProject(int projectId, int memberId)
        {
            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Add member to project");

            if (!hasPermission)
            {
                return Forbid();
            }

            var project = await dbContext.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var person = await dbContext.Members.FindAsync(memberId);
            if (person == null)
            {
                return NotFound(new { message = "Member not found" });
            }

            project.TeamLeaderId = memberId;
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Team leader added successfully." });

        }

        [Authorize]
        [HttpPost("{projectId}/members")]
        public async Task<IActionResult> AddMembersToProject(int projectId, List<int> memberIds)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Add member to project");


            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var project = await dbContext.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var members = await dbContext.Members.Where(m => memberIds.Contains(m.Id) && !m.IsDisabled).ToListAsync();

            if (members == null || members.Count != memberIds.Count)
            {
                return NotFound(new { message = "One or more members not found" });
            }

            foreach (var memberId in memberIds)
            {
                if (project.TeamLeaderId == memberId)
                {
                    return BadRequest(new { message = "Member is already a team leader of the project" });
                }

                var existingMemberProject = await dbContext.MemberProjects.FirstOrDefaultAsync(mp => mp.ProjectId == projectId && mp.MemberId == memberId);
                if (existingMemberProject != null)
                {
                    return BadRequest(new { message = "Member already exists in the project" });
                }

                var defaultRole = await dbContext.ProjectRoles.FirstOrDefaultAsync(pr => pr.IsFallback);

                dbContext.MemberProjects.Add(new MemberProject { MemberId = memberId, ProjectId = projectId, ProjectRoleId = defaultRole.Id });

                var member = await dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

                var request = new EmailDTO
                {
                    To = member.Email,
                    Subject = "New Task Assignment",
                    Body = $@"
                        <p>Hello {member.FirstName} {member.LastName},</p>
                        
                        <p>You have been assigned to a new project.</p>
                        
                        <p>Below are your project details:</p>
                        
                        <ul>
                            <li><strong>Name:</strong> {project.ProjectName}</li>
                            <li><strong>Deadline:</strong> {project.Deadline}</li>
                            <li><strong>Status:</strong> {project.ProjectStatus}</li>
                            <li><strong>Description:</strong> {project.ProjectDescription}</li>
                        </ul>"
                };

                var result = await _emailService.SendEmail(request);

                await _permissionNotifier.AssignedToProject(memberId, projectId);
                await _permissionNotifier.UpdatedProjectPermissions(projectId, memberId);
                await _permissionNotifier.UpdatedProjectTasks(projectId, memberId);
                
                SendNotificationRequest sendNotificationRequest = new SendNotificationRequest
                {
                    Title = "You are added to new project!",
                    Description = "Your new project is " + project.ProjectName,
                    MemberId = member.Id
                };

                await _notificationService.SendNotification(sendNotificationRequest);
            }

            await dbContext.SaveChangesAsync();


            return Ok(new { Message = "Members added to project successfully" });
        }

        [Authorize]
        [HttpDelete("{projectId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMemberFromProject(int projectId, int memberId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Remove member from project");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var project = await dbContext.Projects
                .Include(p => p.MemberProjects)
                .Include(p => p.ProjectTasks)
                .ThenInclude(pt => pt.Members)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var memberProject = project.MemberProjects.FirstOrDefault(mp => mp.MemberId == memberId);
            if (memberProject == null)
            {
                return NotFound(new { message = "Member not found on project" });
            }


            var tasksWhereMemberIsLeader = project.ProjectTasks.Where(t => t.TaskLeaderId == memberId).ToList();
            if (tasksWhereMemberIsLeader.Any())
            {
              
                foreach (var task in tasksWhereMemberIsLeader)
                {
                    task.TaskLeaderId = (int)project.TeamLeaderId;
                    var exists = await dbContext.MemberTasks.Where(mt => mt.TaskId == task.TaskId && mt.MemberId == task.TaskLeaderId).AnyAsync();

                    if (!exists)
                    {
                        task.Members.Add(new MemberTask { MemberId = task.TaskLeaderId, TaskId = task.TaskId });
                    }

                }
            }

            foreach (var task in project.ProjectTasks)
            {
                var assignedMember = task.Members.FirstOrDefault(am => am.MemberId == memberId);
                if (assignedMember != null)
                {
                    task.Members.Remove(assignedMember);
                }
            }


            dbContext.MemberProjects.Remove(memberProject);
            await dbContext.SaveChangesAsync();
            
            await _permissionNotifier.RemovedFromProject(memberId, projectId);
            await _permissionNotifier.UpdatedProjectPermissions(projectId, memberId);
            await _permissionNotifier.UpdatedProjectTasks(projectId, memberId);

            return Ok(new { message = "Member removed from project successfully." });

        }

        [Authorize]
        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetAllMembersOnProject(int projectId)
        {
            var project = dbContext.Projects.FindAsync(projectId);

            if (project == null)
            {
                return BadRequest(new { message = "Project not found." });
            }

            var members = await dbContext.Members
                .Where(m => dbContext.MemberProjects
                    .Any(mp => mp.ProjectId == projectId && mp.MemberId == m.Id) && !m.IsDisabled)
                .Include(m => m.Role)
                .ToListAsync();

            var membersDTO = members.Select(member => new MemberDTO
            {
                Id = member.Id,
                FirstName = member.FirstName,
                LastName = member.LastName,
                RoleId = member.RoleId,
                RoleName = member.Role.RoleName,
                Email = member.Email,
                Status = member.Status,
                ProjectRoleName = dbContext.MemberProjects
                    .Where(mp => mp.ProjectId == projectId && mp.MemberId == member.Id)
                    .Select(mp => mp.ProjectRole.Name)
                    .FirstOrDefault(),
                ProjectRoleId = dbContext.MemberProjects
                    .Where(mp => mp.ProjectId == projectId && mp.MemberId == member.Id)
                    .Select(mp => mp.ProjectRole.Id)
                    .FirstOrDefault(),
            });

            return Ok(membersDTO);

        }

        [HttpGet("project/{projectId}/categories")]
        public async Task<IActionResult> GetCategoriesForProject(int projectId)
        {
            var project = await dbContext.Projects
                .Include(p => p.ProjectTasks)
                    .ThenInclude(ptc => ptc.TaskCategory)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var categories = project.ProjectTasks
                .Select(ptc => new TaskAndCategoryDTO
                {
                    ProjectTaskId = ptc.TaskId,
                    TaskCategoryId = ptc.TaskCategoryId,
                    TaskCategoryName = ptc.TaskCategory.CategoryName
                })
                .ToList();

            return Ok(categories);
        }

        [Authorize]
        [HttpPost("projects/{projectId}/priority/{priorityId}")]
        public async Task<IActionResult> UpdateProjectPriority(int projectId, int priorityId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Remove member from project");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }


            var project = await dbContext.Projects.FindAsync(projectId);
            if (projectId == null)
            {
                return BadRequest(new { message = "Project with this id does not exists." });
            }

            var priority = await dbContext.ProjectPriorities.FindAsync(priorityId);

            if (priority == null)
            {
                return BadRequest(new { message = "Project priority with this id does not exists." });
            }

            project.Priority = priority;
            await dbContext.SaveChangesAsync();


            var members = await dbContext.Members
                              .Where(m => dbContext.MemberProjects
                                                 .Any(mp => mp.ProjectId == projectId && mp.MemberId == m.Id) && !m.IsDisabled)
                              .Include(m => m.Role)
                              .ToListAsync();

            foreach (var member in members)
            {
                SendNotificationRequest sendNotificationRequest = new SendNotificationRequest
                {
                    Title = "Project Priority Updated!",
                    Description = $"The priority for project '{project.ProjectName}' has been updated to '{priority.Name}'.",
                    MemberId = member.Id
                };

                await _notificationService.SendNotification(sendNotificationRequest);
            }

            return Ok(new { message = "Project priority changed successfully." });
        }

        [Authorize]
        [HttpGet("projects/priority/{priorityId}")]
        public async Task<IActionResult> GetAllProjectsByProjectPriority(int priorityId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var priority = await dbContext.ProjectPriorities.FindAsync(priorityId);
            if (priority == null)
            {
                return BadRequest(new { message = "Project priority not found" });
            }

            var projects = await dbContext.Projects.Where(p => p.ProjectPriorityId == priorityId).Include(p => p.ProjectStatus).ToListAsync();

            var projectsDTOs = projects.Select(p => new ProjectDTO
            {
                ProjectId = p.ProjectId,
                ProjectName = p.ProjectName,
                ProjectDescription = p.ProjectDescription,
                Deadline = p.Deadline,
                ProjectStatusId = p.ProjectStatusId,
                Status = p.ProjectStatus.Status,
                StartDate = p.StartDate,
                ProjectPriority = priority.Name,
                ProjectPriorityId = p.ProjectPriorityId
            });

            return Ok(projectsDTOs);
        }

        [HttpGet("{projectId}/Latest")]
        public async Task<IActionResult> GetLatestTaskActivitiesForProject(int projectId)
        {
            var taskActivities = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Include(ta => ta.Member)
                    .ThenInclude(ta => ta.Role)
                .Include(ta => ta.TaskActivityType)
                .Where(ta => ta.ProjectTask.ProjectId == projectId)
                .OrderByDescending(ta => ta.ActivityDate)
                .Take(5)
                .ToListAsync();

            // if (taskActivities == null || !taskActivities.Any())
            // {
            //     return NotFound(new { message = "No task activities found for the project" });
            // }

            var taskActivityDTOs = taskActivities.Select(ta => new TaskActivityDTO
            {
                TaskActivityId = ta.TaskActivityId,
                WorkerId = ta.MemberId,
                TaskId = ta.ProjectTaskId,
                ProjectId = ta.ProjectTask.ProjectId,
                DateModify = ta.ActivityDate,
                Comment = ta.Description,
                TaskActivityTypeId = ta.TaskActivityTypeId,
                Name = ta.Member.FirstName,
                Lastname = ta.Member.LastName,
                Email = ta.Member.Email,
                Country = ta.Member.Country,
                DateOfBirth = ta.Member.DateOfBirth,
                RoleName = ta.Member.Role.RoleName,
                TaskName = ta.ProjectTask.TaskName
            }).ToList();

            return Ok(taskActivityDTOs);
        }

        [Authorize]
        [HttpGet("{id}/Files")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProjectFiles(int id)
        {
            var project = await dbContext.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }

            var projectFiles = await dbContext.ProjectFile
                .Where(pf => pf.ProjectId == id)
                .Join(dbContext.Files.Include(f => f.Uploader), 
                    pf => pf.FileId, 
                    f => f.FileId, 
                    (pf, f) => new 
                    {
                        f.FileId,
                        f.OriginalName,
                        Uploader = new 
                        {
                            f.Uploader.Id,
                            FullName = f.Uploader.FirstName + ' ' + f.Uploader.LastName
                        }
                    })
                .ToListAsync();


            return Ok(projectFiles);
        }

        [Authorize]
        [HttpPost("{id}/files")]
        public async Task<IActionResult> PostFiles(int id, [FromForm] AddFilesRequest files)
        {

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(id, "Add file");

            if (!hasPermission)
            {
                return BadRequest(new { message = "Insufficient permissions" });
            }


            var project = await dbContext.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }


            var uploadedFiles = await _fileService.PostMultiFileAsync(userId, files);

            foreach (var uploadedFile in uploadedFiles)
            {
                var projectFile = new ProjectFile
                {
                    ProjectId = id,
                    FileId = uploadedFile.FileId
                };
                project.ProjectFiles.Add(projectFile);

            }

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Files posted successfully." });
        }

        [Authorize]
        [HttpDelete("{id}/files/{fileId}")]
        public async Task<IActionResult> DeleteFile(int id, int fileId)
        {

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var file = dbContext.Files.FirstOrDefault(f => f.FileId == fileId);

            if (file == null)
            {
                return BadRequest(new { message = "File doesn't exist" });
            }
            
            var hasPermission = await _permissionService.HasProjectPermissionAsync(id, "Remove file");
            if (!hasPermission && file.UploaderId != userId)
            {
                return BadRequest(new { message = "Insufficient permissions" });
            }

            var project = await dbContext.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }
            
            var projectFile = await dbContext.ProjectFile
                .FirstOrDefaultAsync(pf => pf.ProjectId == id && pf.FileId == fileId);

            if (projectFile == null)
            {
                return NotFound(new { message = "File not found in project." });
            }

            dbContext.ProjectFile.Remove(projectFile);

            project.ProjectFiles.Remove(projectFile);

            await _fileService.DeleteFile(fileId);

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "File deleted successfully." });

        }

        [HttpGet("Status")]
        public async Task<IActionResult> GetProjectStatuses()
        {
            var projectStatus = await dbContext.ProjectStatuses.ToListAsync();

            var projectStatusDto = projectStatus.Select(ps => new ProjectStatusDTO
            {
                ProjectStatusId = ps.Id,
                ProjectStatus = ps.Status
            }).ToList();

            return Ok(projectStatusDto);
        }

        [Authorize]
        [HttpPut("{projectId}/updateDeadline/{newDeadline}")]
        public async Task<IActionResult> UpdateDeadlineModified(int projectId, DateTime newDeadline)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change deadline");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            var project = await dbContext.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            project.DeadlineModified = newDeadline;

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Project deadline changed successfully." });
        }

        [Authorize]
        [HttpGet]
        [Route("{projectId}/taskActivities/dailyCountLastWeek")]
        public async Task<IActionResult> GetDailyTaskActivityCount(int projectId)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            var sevenDaysAgo = today.AddDays(-6);

            var dailyTaskActivityCount = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Where(ta => ta.ProjectTask.ProjectId == projectId && ta.ActivityDate >= sevenDaysAgo && ta.ActivityDate < tomorrow)
                .GroupBy(ta => ta.ActivityDate.Date)
                .Select(group => new
                {
                    Date = group.Key,
                    Count = group.Count()
                })
                .ToListAsync();

            var dateRange = Enumerable.Range(0, 7)
                .Select(offset => today.AddDays(-offset))
                .ToList();

            var dailyActivityCounts = dateRange
                .Select(date => new
                {
                    Date = date,
                    Count = dailyTaskActivityCount.FirstOrDefault(d => d.Date == date)?.Count ?? 0
                })
                .ToList();

            return Ok(dailyActivityCounts);
        }

        [Authorize]
        [HttpGet]
        [Route("{projectId}/taskActivities")]
        public async Task<IActionResult> GetTaskActivitiesByProjectId(int projectId)
        {
            var taskActivities = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Include(ta => ta.Member)
                    .ThenInclude(ta => ta.Role)
                .Include(ta => ta.TaskActivityType)
                .Where(ta => ta.ProjectTask.ProjectId == projectId)
                .ToListAsync();

            var taskActivityDTOs = taskActivities.Select(ta => new TaskActivityDTO
            {
                TaskActivityId = ta.TaskActivityId,
                WorkerId = ta.MemberId,
                TaskId = ta.ProjectTaskId,
                ProjectId = ta.ProjectTask.ProjectId,
                DateModify = ta.ActivityDate,
                Comment = ta.Description,
                TaskActivityTypeId = ta.TaskActivityTypeId,
                Name = ta.Member.FirstName,
                Lastname = ta.Member.LastName,
                Email = ta.Member.Email,
                Country = ta.Member.Country,
                DateOfBirth = ta.Member.DateOfBirth,
                RoleName = ta.Member.Role.RoleName,
                TaskName = ta.ProjectTask.TaskName
            }).ToList();

            return Ok(taskActivityDTOs);
        }

        [Authorize]
        [HttpGet]
        [Route("{projectId}/taskActivities/activitiesCountByDateLastTwoWeeks")]
        public async Task<IActionResult> GetTaskActivitiesCountByDate(int projectId)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            var twoWeeksAgo = today.AddDays(-14);

            var taskActivitiesCountByDate = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Where(ta => ta.ProjectTask.ProjectId == projectId && ta.ActivityDate >= twoWeeksAgo && ta.ActivityDate < tomorrow)
                .GroupBy(ta => ta.ActivityDate.Date)
                .Select(group => new
                {
                    Date = group.Key,
                    Count = group.Count()
                })
                .ToListAsync();

            var dateRange = Enumerable.Range(0, 14)
                .Select(offset => today.AddDays(-offset))
                .ToList();

            var activityCountsByDate = dateRange
                .Select(date => new
                {
                    Date = date,
                    Count = taskActivitiesCountByDate.FirstOrDefault(d => d.Date == date)?.Count ?? 0
                })
                .OrderBy(item => item.Date)
                .ToList();

            return Ok(activityCountsByDate);
        }

        [Authorize]
        [HttpGet("Member/{memberId}/AssignedProjectIds")]
        public async Task<IActionResult> GetAssignedProjectsIds(int memberId)
        {
            var member = await dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest(new { message = "No member detected" });
            }

            var projectIds = await dbContext.MemberProjects
                .Where(mp => mp.MemberId == member.Id)
                .ToListAsync();

            var assignedIds = projectIds
                .Select(mp => mp.ProjectId)
                .ToList();

            return Ok(assignedIds);
        }
        
        [Authorize]
        [HttpGet("{projectId}/Member/{memberId}/HasAccess")]
        public async Task<ActionResult<bool>> IsValidProjectIdAsync(int memberId, int projectId)
        {
            bool isValid = await dbContext.MemberProjects
                .AnyAsync(mp => mp.MemberId == memberId && mp.ProjectId == projectId);
         
            return Ok(isValid);
        }

        [Authorize] 
        [HttpGet("{projectId}/File/{fileId}/Preview")] 
        [AllowAnonymous]
        public async Task<IActionResult> PreviewFile(int projectId, int fileId)
        {
            var file = await dbContext.ProjectFile
                .Include(f => f.File)
                .FirstOrDefaultAsync(pf => pf.ProjectId == projectId && pf.FileId == fileId);

            if (file == null)
            {
                return NotFound(new { message = "Something went wrong." });
            }
            
            var (bytes, mime) = await _fileService.GetFileData(file.FileId);

            var contentDisposition = new ContentDispositionHeaderValue("inline")
            {
                FileName = file.File.OriginalName
            };

            Response.Headers.Append(HeaderNames.ContentDisposition, contentDisposition.ToString());
            
            return File(bytes, mime);
        }
        
        [Authorize]
        [HttpGet("{projectId}/File/{fileId}/Download")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadFile(int projectId, int fileId)
        {
            var file = await dbContext.ProjectFile
                .Include(f => f.File)
                .FirstOrDefaultAsync(pf => pf.ProjectId == projectId && pf.FileId == fileId);

            if (file == null)
            {
                return NotFound(new { message = "Something went wrong." });
            }
            
            var (bytes, mime) = await _fileService.GetFileData(file.FileId);
            
            return File(bytes, mime, file.File.OriginalName);
        }
    }
}
