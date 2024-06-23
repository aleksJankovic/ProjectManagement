using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Mozilla;
using Server.Models;
using File = Server.Models.File;
using TaskStatus = Server.Models.TaskStatus;

namespace Server.Data
{
    public class LogicTenacityDbContext : DbContext
    {
        public LogicTenacityDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<ProjectStatus> ProjectStatuses { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<ProjectTaskStatus> ProjectTaskStatuses { get; set; }
        public DbSet<TaskStatus> TaskStatuses { get; set; }
        public DbSet<TaskPriority> TaskPriority { get; set; }
        public DbSet<MemberTask> MemberTasks { get; set; }
        public DbSet<TaskDependency> TaskDependencies { get; set; }
        public DbSet<TaskCategory> TaskCategories { get; set; }
        public DbSet<File> Files { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<TaskActivity> TaskActivities { get; set; }
        public DbSet<TaskActivityType> TaskActivityTypes { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<MemberProject> MemberProjects { get; set; }
        public DbSet<ProjectRole> ProjectRoles { get; set; }
        public DbSet<ProjectPermission> ProjectPermissions { get; set; }
        public DbSet<ProjectRolePermission> ProjectRolePermissions { get; set; }
        public DbSet<ProjectProjectRole> ProjectProjectRoles { get; set; }
        public DbSet<ProjectPriority> ProjectPriorities { get; set; }
        public DbSet<ProjectTaskCategories> ProjectTaskCategories { get; set; }
        public DbSet<ProjectFile> ProjectFile { get; set; }
        public DbSet<TaskFile> TaskFile { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            modelBuilder.Entity<Member>()
                .HasOne(m => m.Avatar)
                .WithMany()
                .HasForeignKey(m => m.AvatarId);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.ProjectStatus)
                .WithMany(ps => ps.Projects)
                .HasForeignKey(p => p.ProjectStatusId)
                .IsRequired();

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Project)
                .WithMany(p => p.ProjectTasks)
                .HasForeignKey(t => t.ProjectId)
                .IsRequired();

            modelBuilder.Entity<ProjectTask>()
               .HasOne(pt => pt.TaskStatus)
               .WithMany(pts => pts.ProjectTasks)
               .HasForeignKey(pt => pt.TaskStatusId);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.TeamLeader)
                .WithMany(ms => ms.ProjectsLead)
                .HasForeignKey(p => p.TeamLeaderId);

            modelBuilder.Entity<ProjectTask>()
                .HasOne(pt => pt.TaskLeader)
                .WithMany(tl => tl.TasksLead)
                .HasForeignKey(pt => pt.TaskLeaderId);

            modelBuilder.Entity<ProjectTask>()
               .HasOne(pt => pt.TaskPriority)
               .WithMany(ts => ts.ProjectTasks)
               .HasForeignKey(pt => pt.TaskPriorityId);

            modelBuilder.Entity<TaskComment>()
                .HasOne(tc => tc.Task)
                .WithMany(pt => pt.TaskComment)
                .HasForeignKey(tc => tc.TaskId);
            
            modelBuilder.Entity<TaskComment>()
                .HasOne(tc => tc.Member)
                .WithMany(pt => pt.TaskComments)
                .HasForeignKey(tc => tc.MemberId);

            modelBuilder.Entity<MemberTask>()
                .HasKey(mt => new { mt.MemberId, mt.TaskId });

            modelBuilder.Entity<MemberTask>()
                .HasOne(mt => mt.Member)
                .WithMany(m => m.Tasks)
                .HasForeignKey(mt => mt.MemberId);

            modelBuilder.Entity<MemberTask>()
                .HasOne(mt => mt.Task)
                .WithMany(t => t.Members)
                .HasForeignKey(mt => mt.TaskId);

            modelBuilder.Entity<TaskDependency>()
                .HasKey(td => new { td.TaskId, td.DependentTaskId });

            modelBuilder.Entity<TaskDependency>()
                .HasOne(td => td.Task)
                .WithMany(t => t.Dependencies)
                .HasForeignKey(td => td.TaskId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskDependency>()
                .HasOne(td => td.DependentTask)
                .WithMany(t => t.DependentTasks)
                .HasForeignKey(td => td.DependentTaskId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectTask>()
                .HasOne(pt => pt.TaskCategory)
                .WithMany(tc => tc.ProjectTasks)
                .HasForeignKey(pt => pt.TaskCategoryId);

            modelBuilder.Entity<File>()
                .HasOne(uf => uf.Uploader)
                .WithMany(m => m.UploadedFiles)
                .HasForeignKey(uf => uf.UploaderId);

            modelBuilder.Entity<Member>()
               .HasOne(m => m.Role)
               .WithMany(r => r.Members)
               .HasForeignKey(m => m.RoleId);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.Priority)
                .WithMany(pr => pr.Projects)
                .HasForeignKey(p => p.ProjectPriorityId);

            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<Role>()
                .HasMany(r => r.RolePermissions)
                .WithOne(rp => rp.Role)
                .HasForeignKey(rp => rp.RoleId);

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.RoleName)
                .IsUnique();

            modelBuilder.Entity<Permission>()
                .HasMany(p => p.RolePermissions)
                .WithOne(rp => rp.Permission)
                .HasForeignKey(rp => rp.PermissionId);

            modelBuilder.Entity<ProjectTaskStatus>()
                .HasKey(ppts => new { ppts.ProjectId, ppts.TaskStatusId });

            modelBuilder.Entity<Project>()
                .HasMany(p => p.ProjectTaskStatuses)
                .WithOne(pts => pts.Project)
                .HasForeignKey(pts => pts.ProjectId);

            modelBuilder.Entity<TaskStatus>()
                .HasMany(ts => ts.ProjectTaskStatuses)
                .WithOne(pts => pts.TaskStatus)
                .HasForeignKey(pts => pts.TaskStatusId);

            modelBuilder.Entity<TaskActivity>()
                .HasOne(a => a.ProjectTask)
                .WithMany(pt => pt.TaskActivities)
                .HasForeignKey(a => a.ProjectTaskId);

            modelBuilder.Entity<TaskActivity>()
                .HasOne(ta => ta.Member)
                .WithMany(m => m.TaskActivities)
                .HasForeignKey(ta => ta.MemberId);

            modelBuilder.Entity<TaskActivity>()
                .HasOne(a => a.TaskActivityType)
                .WithMany(t => t.TaskActivities)
                .HasForeignKey(a => a.TaskActivityTypeId);

            modelBuilder.Entity<MemberProject>()
                 .HasKey(mp => new { mp.MemberId, mp.ProjectId });

            modelBuilder.Entity<MemberProject>()
                .HasOne(mp => mp.Member)
                .WithMany(m => m.MemberProjects)
                .HasForeignKey(mp => mp.MemberId);

            modelBuilder.Entity<MemberProject>()
                .HasOne(mp => mp.Project)
                .WithMany(p => p.MemberProjects)
                .HasForeignKey(mp => mp.ProjectId);

            modelBuilder.Entity<MemberProject>()
                .HasOne(mp => mp.ProjectRole)
                .WithMany()
                .HasForeignKey(mp => mp.ProjectRoleId);

            modelBuilder.Entity<ProjectRole>()
                .HasMany(pr => pr.ProjectRolePermissions)
                .WithOne(prm => prm.ProjectRole)
                .HasForeignKey(prm => prm.ProjectRoleId);

            modelBuilder.Entity<ProjectPermission>()
                .HasIndex(pp => pp.Name)
                .IsUnique();

            modelBuilder.Entity<ProjectPermission>()
                .HasMany(pp => pp.ProjectRolePermissions)
                .WithOne(prm => prm.ProjectPermission)
                .HasForeignKey(prm => prm.ProjectPermissionId);

            modelBuilder.Entity<ProjectRolePermission>()
                .HasKey(prm => new { prm.ProjectRoleId, prm.ProjectPermissionId });

            modelBuilder.Entity<ProjectProjectRole>()
                .HasKey(pra => new { pra.ProjectId, pra.ProjectRoleId });

            modelBuilder.Entity<Project>()
                .HasMany(p => p.ProjectProjectRoles)
                .WithOne(pra => pra.Project)
                .HasForeignKey(pra => pra.ProjectId);

            modelBuilder.Entity<ProjectRole>()
                .HasMany(pr => pr.ProjectProjectRoles)
                .WithOne(pra => pra.ProjectRole)
                .HasForeignKey(pra => pra.ProjectRoleId);

            modelBuilder.Entity<ProjectTaskCategories>()
             .HasKey(ptc => new { ptc.ProjectId, ptc.TaskCategoryId });

            modelBuilder.Entity<Project>()
                .HasMany(p => p.ProjectTaskCategories)
                .WithOne(pts => pts.Project)
                .HasForeignKey(pts => pts.ProjectId);

            modelBuilder.Entity<TaskCategory>()
                .HasMany(tc => tc.ProjectTaskCategories)
                .WithOne(ptc => ptc.TaskCategory)
                .HasForeignKey(pts => pts.TaskCategoryId);

            modelBuilder.Entity<ProjectFile>()
                 .HasKey(pf => new { pf.ProjectId, pf.FileId });

            modelBuilder.Entity<ProjectFile>()
                .HasOne(pf => pf.Project)
                .WithMany(p => p.ProjectFiles)
                .HasForeignKey(pf => pf.ProjectId);

            modelBuilder.Entity<ProjectFile>()
                .HasOne(pf => pf.File)
                .WithMany()
                .HasForeignKey(pf => pf.FileId);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Member)
                .WithMany(m => m.Notifications)
                .HasForeignKey(n => n.MemberId);

            modelBuilder.Entity<TaskFile>()
                 .HasKey(pf => new { pf.TaskId, pf.FileId });

            modelBuilder.Entity<TaskFile>()
                .HasOne(pf => pf.ProjectTask)
                .WithMany(p => p.TaskFiles)
                .HasForeignKey(pf => pf.TaskId);

            modelBuilder.Entity<TaskFile>()
                .HasOne(pf => pf.File)
                .WithMany()
                .HasForeignKey(pf => pf.FileId);

            modelBuilder.Entity<Permission>().HasData(
                new Permission { PermissionId = 1, PermissionName = "Change global role" },
                new Permission { PermissionId = 2, PermissionName = "Add member" },
                new Permission { PermissionId = 3, PermissionName = "Edit member" },
                new Permission { PermissionId = 4, PermissionName = "Deactivate member" },
                new Permission { PermissionId = 5, PermissionName = "Create project" }
            );

            modelBuilder.Entity<Member>().HasData(
                new Member { Id = 1, FirstName = "Logic", LastName = "Tenacity", RoleId = 1, Password = BCrypt.Net.BCrypt.HashPassword("admin"), Email = "admin@logictenacity.com" },
                new Member { Id = 2, FirstName = "Pera", LastName = "Peric", RoleId = 2, Password = BCrypt.Net.BCrypt.HashPassword("pera"), Email = "pera@gmail.com" },
                new Member { Id = 3, FirstName = "Toma", LastName = "Tomic", RoleId = 3, Password = BCrypt.Net.BCrypt.HashPassword("toma"), Email = "toma@gmail.com" }
            );

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, RoleName = "Administrator", IsDefault = true },
                new Role { RoleId = 2, RoleName = "Project Manager", IsDefault = true },
                new Role { RoleId = 3, RoleName = "Worker", IsDefault = true, IsFallback = true }
            );

            modelBuilder.Entity<RolePermission>().HasData(
                new RolePermission { RoleId = 1, PermissionId = 1 },
                new RolePermission { RoleId = 1, PermissionId = 2 },
                new RolePermission { RoleId = 1, PermissionId = 3 },
                new RolePermission { RoleId = 1, PermissionId = 4 },
                new RolePermission { RoleId = 2, PermissionId = 5 }
            );

            modelBuilder.Entity<ProjectStatus>().HasData(
                new ProjectStatus { Id = 1, Status = "In Preparation" },
                new ProjectStatus { Id = 2, Status = "In Progress" },
                new ProjectStatus { Id = 3, Status = "Closed" }
            );

            modelBuilder.Entity<TaskStatus>().HasData(
                new TaskStatus { Id = 1, Name = "New", IsDefault = true },
                new TaskStatus { Id = 2, Name = "In Progress", IsDefault = true },
                new TaskStatus { Id = 3, Name = "Completed", IsDefault = true }
            );

            modelBuilder.Entity<TaskPriority>().HasData(
                new TaskPriority { TaskPriorityId = 1, Name = "Low", PriorityColorHex = "#00FF00" },
                new TaskPriority { TaskPriorityId = 2, Name = "Medium", PriorityColorHex = "#FFFF00" },
                new TaskPriority { TaskPriorityId = 3, Name = "High", PriorityColorHex = "#FF0000" }
            );

            modelBuilder.Entity<ProjectPriority>().HasData(
                new ProjectPriority { ProjectPriorityId = 1, Name = "Low", PriorityColorHex = "#00FF00" },
                new ProjectPriority { ProjectPriorityId = 2, Name = "Medium", PriorityColorHex = "#FFFF00" },
                new ProjectPriority { ProjectPriorityId = 3, Name = "High", PriorityColorHex = "#FF0000" }
            );

            modelBuilder.Entity<TaskCategory>().HasData(
                new TaskCategory { TaskCategoryID = 1, CategoryName = "Uncategorized", IsDefault = true }
            );

            modelBuilder.Entity<TaskActivityType>().HasData(
                new TaskActivityType { TaskActivityTypeId = 1, TaskActivityName = "Review" },
                new TaskActivityType { TaskActivityTypeId = 2, TaskActivityName = "Update" },
                new TaskActivityType { TaskActivityTypeId = 3, TaskActivityName = "Bug fix" }
            );

            modelBuilder.Entity<ProjectRole>().HasData(
                new ProjectRole { Id = 1, Name = "Project Leader", IsDefault = true },
                new ProjectRole { Id = 2, Name = "Project Assignee", IsDefault = true },
                new ProjectRole { Id = 3, Name = "Project Guest", IsDefault = true, IsFallback = true }
            );

            modelBuilder.Entity<ProjectPermission>().HasData(
                new ProjectPermission { Id = -1, Name = "Change project role" },
                new ProjectPermission { Id = 1, Name = "Delete project" },
                new ProjectPermission { Id = 2, Name = "Add member to project" },
                new ProjectPermission { Id = 3, Name = "Remove member from project" },
                new ProjectPermission { Id = 4, Name = "Create task" },
                new ProjectPermission { Id = 5, Name = "Delete task" },
                new ProjectPermission { Id = 6, Name = "Add member to task" },
                new ProjectPermission { Id = 7, Name = "Remove member from task" },
                new ProjectPermission { Id = 8, Name = "Change project" },
                new ProjectPermission { Id = 9, Name = "Change project status" },
                new ProjectPermission { Id = 10, Name = "Change task status" },
                new ProjectPermission { Id = 11, Name = "Change task priority" },
                new ProjectPermission { Id = 12, Name = "Add task dependency" },
                new ProjectPermission { Id = 13, Name = "Remove task dependency" },
                new ProjectPermission { Id = 14, Name = "Add task category" },
                new ProjectPermission { Id = 16, Name = "Change task" },
                new ProjectPermission { Id = 17, Name = "Add task activity" },
                new ProjectPermission { Id = 18, Name = "Remove task activity" },
                new ProjectPermission { Id = 19, Name = "Comment task" },
                new ProjectPermission { Id = 20, Name = "Change project priority" },
                new ProjectPermission { Id = 21, Name = "Change task category" },
                new ProjectPermission { Id = 22, Name = "Add task status" },
                new ProjectPermission { Id = 23, Name = "Remove task status" },
                new ProjectPermission { Id = 24, Name = "Change deadline" },
                new ProjectPermission { Id = 25, Name = "Add file" },
                new ProjectPermission { Id = 26, Name = "Remove file" },
                new ProjectPermission { Id = 27, Name = "Assign task leader" },
                new ProjectPermission { Id = 28, Name = "Remove task leader" },
                new ProjectPermission { Id = 29, Name = "Delete task comment" },
                new ProjectPermission { Id = 30, Name = "Remove task category" }
            );

            modelBuilder.Entity<ProjectRolePermission>().HasData(
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = -1 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 1 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 2 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 3 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 4 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 5 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 6 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 7 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 8 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 9 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 10 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 11 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 12 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 13 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 14 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 16 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 17 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 18 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 19 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 20 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 21 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 22 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 23 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 24 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 25 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 26 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 10 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 17 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 19 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 25 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 26 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 27 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 28 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 29 },
                new ProjectRolePermission { ProjectRoleId = 2, ProjectPermissionId = 29 },
                new ProjectRolePermission { ProjectRoleId = 1, ProjectPermissionId = 30 }

            );
        }
    }
}
