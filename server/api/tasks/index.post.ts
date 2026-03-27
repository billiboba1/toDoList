import { createTask } from '../../utils/store';
import { requireUser } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    const user = requireUser(event);
    const body = await readBody<{
        title?: string;
        description?: string;
        dueDate?: string;
        isCompleted?: boolean;
    }>(event);

    const title = body?.title?.trim();
    const description = (body?.description ?? '').trim();
    const dueDateRaw = body?.dueDate;
    const isCompleted = Boolean(body?.isCompleted);

    if (!title) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' });
    }

    if (!dueDateRaw) {
        throw createError({ statusCode: 400, statusMessage: 'Due date is required' });
    }

    const due = new Date(dueDateRaw);
    if (Number.isNaN(due.getTime())) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid due date' });
    }

    const task = createTask({
        title,
        description,
        dueDate: due.toISOString(),
        isCompleted,
        createdBy: user.sub
    });

    return task;
});
