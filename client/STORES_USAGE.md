# Project and Comment Stores

## Project Store Usage Examples

### Basic Usage

```typescript
import { useProjectStore } from '@/stores/project.store';

function MyComponent() {
  const { 
    projects, 
    currentProject, 
    isLoading, 
    error,
    getProjects,
    createProject,
    updateProject,
    deleteProject 
  } = useProjectStore();

  // Get all projects
  useEffect(() => {
    getProjects();
  }, []);

  // Create a new project
  const handleCreateProject = async () => {
    try {
      const newProject = await createProject({
        name: "New Project",
        description: "Project description",
        owner: userId,
        team: [memberId1, memberId2],
        status: "active",
        deadline: "2025-12-31"
      });
      console.log("Project created:", newProject);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  // Update a project
  const handleUpdateProject = async (projectId: string) => {
    try {
      await updateProject(projectId, {
        name: "Updated Name",
        progress: 75
      });
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  // Delete a project
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {projects.map(project => (
        <div key={project._id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Get Projects by Manager

```typescript
const { getProjectsByManager } = useProjectStore();

useEffect(() => {
  if (managerId) {
    getProjectsByManager(managerId);
  }
}, [managerId]);
```

### Update Project Status

```typescript
const { updateProjectStatus } = useProjectStore();

const handleCompleteProject = async (projectId: string) => {
  try {
    await updateProjectStatus(projectId, 'completed');
  } catch (error) {
    console.error("Failed to update status:", error);
  }
};
```

## Comment Store Usage Examples

### Basic Usage

```typescript
import { useCommentStore } from '@/stores/comment.store';

function TaskComments({ taskId }: { taskId: string }) {
  const {
    commentsByTask,
    isLoading,
    error,
    getCommentsByTask,
    createComment,
    updateComment,
    deleteComment
  } = useCommentStore();

  const comments = commentsByTask[taskId] || [];

  // Get comments for a task
  useEffect(() => {
    getCommentsByTask(taskId);
  }, [taskId]);

  // Add a new comment
  const handleAddComment = async (content: string) => {
    try {
      await createComment({
        taskId,
        content
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Update a comment
  const handleUpdateComment = async (commentId: string, newContent: string) => {
    try {
      await updateComment(commentId, {
        content: newContent
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId, taskId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading comments...</p>}
      {error && <p>Error: {error}</p>}
      
      <div>
        {comments.map(comment => (
          <div key={comment._id}>
            <p>{comment.content}</p>
            <button onClick={() => handleDeleteComment(comment._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
      
      <button onClick={() => handleAddComment("New comment")}>
        Add Comment
      </button>
    </div>
  );
}
```

## Store Features

### Project Store
- ✅ Get all projects
- ✅ Get single project by ID
- ✅ Get projects by manager
- ✅ Create new project
- ✅ Update project details
- ✅ Update project status
- ✅ Delete project
- ✅ Set current project
- ✅ LocalStorage persistence
- ✅ Error handling
- ✅ Loading states

### Comment Store
- ✅ Get comments by task
- ✅ Create new comment
- ✅ Update comment
- ✅ Delete comment
- ✅ Organized by task ID
- ✅ Error handling
- ✅ Loading states

## API Endpoints Used

### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `GET /projects/manager/:id` - Get projects by manager
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `PATCH /projects/:id/status` - Update project status
- `DELETE /projects/:id` - Delete project

### Comments
- `GET /comments/:taskId` - Get comments by task
- `POST /comments` - Create comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
