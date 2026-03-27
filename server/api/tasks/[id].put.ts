import { getTaskById, updateTask } from '../../utils/store';
import { canModifyTask, requireUser } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    const user = requireUser(event);
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Id is required' });
    }

    const existing = getTaskById(id);
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Task not found' });
    }

    if (!canModifyTask(user, existing.createdBy)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    const body = await readBody<{
        title?: string;
        description?: string;
        dueDate?: string;
        isCompleted?: boolean;
    }>(event);

    const patch: Partial<{
        title: string;
        description: string;
        dueDate: string;
        isCompleted: boolean;
    }> = {};

    if (body.title !== undefined) {
        const t = body.title.trim();
        if (!t) {
            throw createError({ statusCode: 400, statusMessage: 'Title cannot be empty' });
        }
        patch.title = t;
    }
    if (body.description !== undefined) {
        patch.description = body.description.trim();
    }
    if (body.dueDate !== undefined) {
        const due = new Date(body.dueDate);
        if (Number.isNaN(due.getTime())) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid due date' });
        }
        patch.dueDate = due.toISOString();
    }
    if (body.isCompleted !== undefined) {
        patch.isCompleted = Boolean(body.isCompleted);
    }

    const updated = updateTask(id, patch);
    return updated;
});
