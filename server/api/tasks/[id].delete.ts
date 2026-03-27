import { deleteTask, getTaskById } from '../../utils/store';
import { canModifyTask, requireUser } from '../../utils/jwt';

export default defineEventHandler((event) => {
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

    deleteTask(id);
    return { ok: true };
});
