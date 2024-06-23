using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PermissionName = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionId);
                });

            migrationBuilder.CreateTable(
                name: "ProjectPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectPermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectPriorities",
                columns: table => new
                {
                    ProjectPriorityId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    PriorityColorHex = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectPriorities", x => x.ProjectPriorityId);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsFallback = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleName = table.Column<string>(type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsFallback = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "TaskActivityTypes",
                columns: table => new
                {
                    TaskActivityTypeId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TaskActivityName = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskActivityTypes", x => x.TaskActivityTypeId);
                });

            migrationBuilder.CreateTable(
                name: "TaskCategories",
                columns: table => new
                {
                    TaskCategoryID = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CategoryName = table.Column<string>(type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskCategories", x => x.TaskCategoryID);
                });

            migrationBuilder.CreateTable(
                name: "TaskPriority",
                columns: table => new
                {
                    TaskPriorityId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    PriorityColorHex = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskPriority", x => x.TaskPriorityId);
                });

            migrationBuilder.CreateTable(
                name: "TaskStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRolePermissions",
                columns: table => new
                {
                    ProjectRoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProjectPermissionId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRolePermissions", x => new { x.ProjectRoleId, x.ProjectPermissionId });
                    table.ForeignKey(
                        name: "FK_ProjectRolePermissions_ProjectPermissions_ProjectPermissionId",
                        column: x => x.ProjectPermissionId,
                        principalTable: "ProjectPermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectRolePermissions_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    PermissionId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.RoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    FileId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FilePath = table.Column<string>(type: "TEXT", nullable: false),
                    OriginalName = table.Column<string>(type: "TEXT", nullable: false),
                    UploaderId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.FileId);
                });

            migrationBuilder.CreateTable(
                name: "Members",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Password = table.Column<string>(type: "TEXT", nullable: false),
                    IsDisabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    RoleId = table.Column<int>(type: "INTEGER", nullable: false),
                    RefreshToken = table.Column<string>(type: "TEXT", nullable: true),
                    RefreshTokenExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Linkedin = table.Column<string>(type: "TEXT", nullable: false),
                    Github = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Country = table.Column<string>(type: "TEXT", nullable: false),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    DateAdded = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AvatarId = table.Column<int>(type: "INTEGER", nullable: true),
                    PasswordToken = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordTokenExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Members", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Members_Files_AvatarId",
                        column: x => x.AvatarId,
                        principalTable: "Files",
                        principalColumn: "FileId");
                    table.ForeignKey(
                        name: "FK_Members_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsRead = table.Column<bool>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectName = table.Column<string>(type: "TEXT", nullable: false),
                    ProjectDescription = table.Column<string>(type: "TEXT", nullable: false),
                    Deadline = table.Column<DateTime>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DateFinished = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeadlineModified = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ProjectStatusId = table.Column<int>(type: "INTEGER", nullable: false),
                    TeamLeaderId = table.Column<int>(type: "INTEGER", nullable: true),
                    ProjectPriorityId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.ProjectId);
                    table.ForeignKey(
                        name: "FK_Projects_Members_TeamLeaderId",
                        column: x => x.TeamLeaderId,
                        principalTable: "Members",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_ProjectPriorities_ProjectPriorityId",
                        column: x => x.ProjectPriorityId,
                        principalTable: "ProjectPriorities",
                        principalColumn: "ProjectPriorityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Projects_ProjectStatuses_ProjectStatusId",
                        column: x => x.ProjectStatusId,
                        principalTable: "ProjectStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MemberProjects",
                columns: table => new
                {
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProjectRoleId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberProjects", x => new { x.MemberId, x.ProjectId });
                    table.ForeignKey(
                        name: "FK_MemberProjects_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MemberProjects_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MemberProjects_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectFile",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    FileId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectFile", x => new { x.ProjectId, x.FileId });
                    table.ForeignKey(
                        name: "FK_ProjectFile_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectFile_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectProjectRoles",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProjectRoleId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectProjectRoles", x => new { x.ProjectId, x.ProjectRoleId });
                    table.ForeignKey(
                        name: "FK_ProjectProjectRoles_ProjectRoles_ProjectRoleId",
                        column: x => x.ProjectRoleId,
                        principalTable: "ProjectRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectProjectRoles_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTaskCategories",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskCategoryId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTaskCategories", x => new { x.ProjectId, x.TaskCategoryId });
                    table.ForeignKey(
                        name: "FK_ProjectTaskCategories_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTaskCategories_TaskCategories_TaskCategoryId",
                        column: x => x.TaskCategoryId,
                        principalTable: "TaskCategories",
                        principalColumn: "TaskCategoryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTasks",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TaskName = table.Column<string>(type: "TEXT", nullable: false),
                    TaskDescription = table.Column<string>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Deadline = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DateFinished = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeadlineModified = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskStatusId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskPriorityId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskLeaderId = table.Column<int>(type: "INTEGER", nullable: false),
                    PercentageComplete = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTasks", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_Members_TaskLeaderId",
                        column: x => x.TaskLeaderId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_TaskCategories_TaskCategoryId",
                        column: x => x.TaskCategoryId,
                        principalTable: "TaskCategories",
                        principalColumn: "TaskCategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_TaskPriority_TaskPriorityId",
                        column: x => x.TaskPriorityId,
                        principalTable: "TaskPriority",
                        principalColumn: "TaskPriorityId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_TaskStatuses_TaskStatusId",
                        column: x => x.TaskStatusId,
                        principalTable: "TaskStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTaskStatuses",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskStatusId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTaskStatuses", x => new { x.ProjectId, x.TaskStatusId });
                    table.ForeignKey(
                        name: "FK_ProjectTaskStatuses_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTaskStatuses_TaskStatuses_TaskStatusId",
                        column: x => x.TaskStatusId,
                        principalTable: "TaskStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MemberTasks",
                columns: table => new
                {
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberTasks", x => new { x.MemberId, x.TaskId });
                    table.ForeignKey(
                        name: "FK_MemberTasks_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MemberTasks_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskActivities",
                columns: table => new
                {
                    TaskActivityId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ProjectTaskId = table.Column<int>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ActivityDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TaskActivityTypeId = table.Column<int>(type: "INTEGER", nullable: false),
                    PercentageComplete = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskActivities", x => x.TaskActivityId);
                    table.ForeignKey(
                        name: "FK_TaskActivities_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskActivities_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskActivities_TaskActivityTypes_TaskActivityTypeId",
                        column: x => x.TaskActivityTypeId,
                        principalTable: "TaskActivityTypes",
                        principalColumn: "TaskActivityTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskComments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Text = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MemberTaskId = table.Column<int>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskComments_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskComments_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskDependencies",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false),
                    DependentTaskId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskDependencies", x => new { x.TaskId, x.DependentTaskId });
                    table.ForeignKey(
                        name: "FK_TaskDependencies_ProjectTasks_DependentTaskId",
                        column: x => x.DependentTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskDependencies_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TaskFile",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "INTEGER", nullable: false),
                    FileId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskFile", x => new { x.TaskId, x.FileId });
                    table.ForeignKey(
                        name: "FK_TaskFile_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskFile_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "PermissionId", "PermissionName" },
                values: new object[,]
                {
                    { 1, "Change global role" },
                    { 2, "Add member" },
                    { 3, "Edit member" },
                    { 4, "Deactivate member" },
                    { 5, "Create project" }
                });

            migrationBuilder.InsertData(
                table: "ProjectPermissions",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { -1, "Change project role" },
                    { 1, "Delete project" },
                    { 2, "Add member to project" },
                    { 3, "Remove member from project" },
                    { 4, "Create task" },
                    { 5, "Delete task" },
                    { 6, "Add member to task" },
                    { 7, "Remove member from task" },
                    { 8, "Change project" },
                    { 9, "Change project status" },
                    { 10, "Change task status" },
                    { 11, "Change task priority" },
                    { 12, "Add task dependency" },
                    { 13, "Remove task dependency" },
                    { 14, "Add task category" },
                    { 16, "Change task" },
                    { 17, "Add task activity" },
                    { 18, "Remove task activity" },
                    { 19, "Comment task" },
                    { 20, "Change project priority" },
                    { 21, "Change task category" },
                    { 22, "Add task status" },
                    { 23, "Remove task status" },
                    { 24, "Change deadline" },
                    { 25, "Add file" },
                    { 26, "Remove file" },
                    { 27, "Assign task leader" },
                    { 28, "Remove task leader" },
                    { 29, "Delete task comment" },
                    { 30, "Remove task category" }
                });

            migrationBuilder.InsertData(
                table: "ProjectPriorities",
                columns: new[] { "ProjectPriorityId", "Name", "PriorityColorHex" },
                values: new object[,]
                {
                    { 1, "Low", "#00FF00" },
                    { 2, "Medium", "#FFFF00" },
                    { 3, "High", "#FF0000" }
                });

            migrationBuilder.InsertData(
                table: "ProjectRoles",
                columns: new[] { "Id", "IsDefault", "IsFallback", "Name" },
                values: new object[,]
                {
                    { 1, true, false, "Project Leader" },
                    { 2, true, false, "Project Assignee" },
                    { 3, true, true, "Project Guest" }
                });

            migrationBuilder.InsertData(
                table: "ProjectStatuses",
                columns: new[] { "Id", "Status" },
                values: new object[,]
                {
                    { 1, "In Preparation" },
                    { 2, "In Progress" },
                    { 3, "Closed" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleId", "IsDefault", "IsFallback", "RoleName" },
                values: new object[,]
                {
                    { 1, true, false, "Administrator" },
                    { 2, true, false, "Project Manager" },
                    { 3, true, true, "Worker" }
                });

            migrationBuilder.InsertData(
                table: "TaskActivityTypes",
                columns: new[] { "TaskActivityTypeId", "TaskActivityName" },
                values: new object[,]
                {
                    { 1, "Review" },
                    { 2, "Update" },
                    { 3, "Bug fix" }
                });

            migrationBuilder.InsertData(
                table: "TaskCategories",
                columns: new[] { "TaskCategoryID", "CategoryName", "IsDefault" },
                values: new object[] { 1, "Uncategorized", true });

            migrationBuilder.InsertData(
                table: "TaskPriority",
                columns: new[] { "TaskPriorityId", "Name", "PriorityColorHex" },
                values: new object[,]
                {
                    { 1, "Low", "#00FF00" },
                    { 2, "Medium", "#FFFF00" },
                    { 3, "High", "#FF0000" }
                });

            migrationBuilder.InsertData(
                table: "TaskStatuses",
                columns: new[] { "Id", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 1, true, "New" },
                    { 2, true, "In Progress" },
                    { 3, true, "Completed" }
                });

            migrationBuilder.InsertData(
                table: "Members",
                columns: new[] { "Id", "AvatarId", "City", "Country", "DateAdded", "DateOfBirth", "Email", "FirstName", "Github", "IsDisabled", "LastName", "Linkedin", "Password", "PasswordToken", "PasswordTokenExpiresAt", "PhoneNumber", "RefreshToken", "RefreshTokenExpiresAt", "RoleId", "Status" },
                values: new object[,]
                {
                    { 1, null, "", "", new DateTime(2024, 6, 8, 23, 52, 37, 309, DateTimeKind.Local).AddTicks(2315), new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@logictenacity.com", "Logic", "", false, "Tenacity", "", "$2a$10$4/57iG5AQimf5upERbaOY.Xe2bDv7Aa7NxhS8cFCsPB6gDDuaQot6", null, null, "", null, null, 1, "" },
                    { 2, null, "", "", new DateTime(2024, 6, 8, 23, 52, 37, 405, DateTimeKind.Local).AddTicks(3488), new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "pera@gmail.com", "Pera", "", false, "Peric", "", "$2a$10$TO/LNB/J1GFBHUABswAfgeyIGKjZEmaJTphvySbLuUQ/vASXx4TUS", null, null, "", null, null, 2, "" },
                    { 3, null, "", "", new DateTime(2024, 6, 8, 23, 52, 37, 505, DateTimeKind.Local).AddTicks(434), new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "toma@gmail.com", "Toma", "", false, "Tomic", "", "$2a$10$ndPJsy9sW/p4VJaDF2Ecw.EdW8ebTP7Kl4Cw6DCTgEPLuUGx7OFJi", null, null, "", null, null, 3, "" }
                });

            migrationBuilder.InsertData(
                table: "ProjectRolePermissions",
                columns: new[] { "ProjectPermissionId", "ProjectRoleId" },
                values: new object[,]
                {
                    { -1, 1 },
                    { 1, 1 },
                    { 2, 1 },
                    { 3, 1 },
                    { 4, 1 },
                    { 5, 1 },
                    { 6, 1 },
                    { 7, 1 },
                    { 8, 1 },
                    { 9, 1 },
                    { 10, 1 },
                    { 11, 1 },
                    { 12, 1 },
                    { 13, 1 },
                    { 14, 1 },
                    { 16, 1 },
                    { 17, 1 },
                    { 18, 1 },
                    { 19, 1 },
                    { 20, 1 },
                    { 21, 1 },
                    { 22, 1 },
                    { 23, 1 },
                    { 24, 1 },
                    { 25, 1 },
                    { 26, 1 },
                    { 27, 1 },
                    { 28, 1 },
                    { 29, 1 },
                    { 30, 1 },
                    { 10, 2 },
                    { 17, 2 },
                    { 19, 2 },
                    { 25, 2 },
                    { 26, 2 },
                    { 29, 2 }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 2, 1 },
                    { 3, 1 },
                    { 4, 1 },
                    { 5, 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Files_UploaderId",
                table: "Files",
                column: "UploaderId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberProjects_ProjectId",
                table: "MemberProjects",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberProjects_ProjectRoleId",
                table: "MemberProjects",
                column: "ProjectRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Members_AvatarId",
                table: "Members",
                column: "AvatarId");

            migrationBuilder.CreateIndex(
                name: "IX_Members_Email",
                table: "Members",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_RoleId",
                table: "Members",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_MemberTasks_TaskId",
                table: "MemberTasks",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_MemberId",
                table: "Notifications",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectFile_FileId",
                table: "ProjectFile",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPermissions_Name",
                table: "ProjectPermissions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectProjectRoles_ProjectRoleId",
                table: "ProjectProjectRoles",
                column: "ProjectRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRolePermissions_ProjectPermissionId",
                table: "ProjectRolePermissions",
                column: "ProjectPermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProjectPriorityId",
                table: "Projects",
                column: "ProjectPriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProjectStatusId",
                table: "Projects",
                column: "ProjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_TeamLeaderId",
                table: "Projects",
                column: "TeamLeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTaskCategories_TaskCategoryId",
                table: "ProjectTaskCategories",
                column: "TaskCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_ProjectId",
                table: "ProjectTasks",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_TaskCategoryId",
                table: "ProjectTasks",
                column: "TaskCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_TaskLeaderId",
                table: "ProjectTasks",
                column: "TaskLeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_TaskPriorityId",
                table: "ProjectTasks",
                column: "TaskPriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_TaskStatusId",
                table: "ProjectTasks",
                column: "TaskStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTaskStatuses_TaskStatusId",
                table: "ProjectTaskStatuses",
                column: "TaskStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleName",
                table: "Roles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivities_MemberId",
                table: "TaskActivities",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivities_ProjectTaskId",
                table: "TaskActivities",
                column: "ProjectTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivities_TaskActivityTypeId",
                table: "TaskActivities",
                column: "TaskActivityTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskComments_MemberId",
                table: "TaskComments",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskComments_TaskId",
                table: "TaskComments",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskDependencies_DependentTaskId",
                table: "TaskDependencies",
                column: "DependentTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskFile_FileId",
                table: "TaskFile",
                column: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Members_UploaderId",
                table: "Files",
                column: "UploaderId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_Members_UploaderId",
                table: "Files");

            migrationBuilder.DropTable(
                name: "MemberProjects");

            migrationBuilder.DropTable(
                name: "MemberTasks");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProjectFile");

            migrationBuilder.DropTable(
                name: "ProjectProjectRoles");

            migrationBuilder.DropTable(
                name: "ProjectRolePermissions");

            migrationBuilder.DropTable(
                name: "ProjectTaskCategories");

            migrationBuilder.DropTable(
                name: "ProjectTaskStatuses");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "TaskActivities");

            migrationBuilder.DropTable(
                name: "TaskComments");

            migrationBuilder.DropTable(
                name: "TaskDependencies");

            migrationBuilder.DropTable(
                name: "TaskFile");

            migrationBuilder.DropTable(
                name: "ProjectPermissions");

            migrationBuilder.DropTable(
                name: "ProjectRoles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "TaskActivityTypes");

            migrationBuilder.DropTable(
                name: "ProjectTasks");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "TaskCategories");

            migrationBuilder.DropTable(
                name: "TaskPriority");

            migrationBuilder.DropTable(
                name: "TaskStatuses");

            migrationBuilder.DropTable(
                name: "ProjectPriorities");

            migrationBuilder.DropTable(
                name: "ProjectStatuses");

            migrationBuilder.DropTable(
                name: "Members");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
