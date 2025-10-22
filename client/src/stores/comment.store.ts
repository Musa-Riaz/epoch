import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { commentApi } from '@/lib/api';
import { IComment, CreateCommentRequest, UpdateCommentRequest } from '@/interfaces/api';
import { getErrorMessage } from '@/utils/helpers.utils';

interface CommentState {
  comments: IComment[];
  commentsByTask: Record<string, IComment[]>;
  isLoading: boolean;
  error: string | null;
}

interface CommentActions {
  getCommentsByTask: (taskId: string) => Promise<void>;
  createComment: (commentData: CreateCommentRequest) => Promise<IComment | null>;
  updateComment: (id: string, commentData: UpdateCommentRequest) => Promise<IComment | null>;
  deleteComment: (id: string, taskId: string) => Promise<void>;
  clearError: () => void;
}

type CommentStore = CommentState & CommentActions;

export const useCommentStore = create<CommentStore>()(
  devtools(
    (set) => ({
      // Initial state
      comments: [],
      commentsByTask: {},
      isLoading: false,
      error: null,

      // Actions
      getCommentsByTask: async (taskId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await commentApi.getCommentsByTask(taskId);
          const comments = response.data.data;
          set((state) => ({
            commentsByTask: {
              ...state.commentsByTask,
              [taskId]: comments,
            },
            comments: comments,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
        }
      },

      createComment: async (commentData: CreateCommentRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await commentApi.createComment(commentData);
          const newComment = response.data.data;
          
          set((state) => ({
            comments: [...state.comments, newComment],
            commentsByTask: {
              ...state.commentsByTask,
              [commentData.taskId]: [
                ...(state.commentsByTask[commentData.taskId] || []),
                newComment,
              ],
            },
            isLoading: false,
          }));
          
          return newComment;
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      updateComment: async (id: string, commentData: UpdateCommentRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await commentApi.updateComment(id, commentData);
          const updatedComment = response.data.data;
          
          set((state) => {
            const updatedComments = state.comments.map((c) =>
              c._id === id ? updatedComment : c
            );
            
            // Update in commentsByTask as well
            const updatedCommentsByTask = { ...state.commentsByTask };
            Object.keys(updatedCommentsByTask).forEach((taskId) => {
              updatedCommentsByTask[taskId] = updatedCommentsByTask[taskId].map((c) =>
                c._id === id ? updatedComment : c
              );
            });
            
            return {
              comments: updatedComments,
              commentsByTask: updatedCommentsByTask,
              isLoading: false,
            };
          });
          
          return updatedComment;
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      deleteComment: async (id: string, taskId: string) => {
        set({ isLoading: true, error: null });
        try {
          await commentApi.deleteComment(id);
          
          set((state) => ({
            comments: state.comments.filter((c) => c._id !== id),
            commentsByTask: {
              ...state.commentsByTask,
              [taskId]: state.commentsByTask[taskId]?.filter((c) => c._id !== id) || [],
            },
            isLoading: false,
          }));
        } catch (err) {
          set({ error: getErrorMessage(err), isLoading: false });
          throw err;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    })
  )
);
