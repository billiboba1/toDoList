import { listTasks, type TaskFilter, type TaskSort } from '../../utils/store';
import { requireUser } from '../../utils/jwt';

export default defineEventHandler((event) => {
    requireUser(event);

    const q = getQuery(event);
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(q.pageSize) || 10));
    const search = typeof q.search === 'string' ? q.search : '';
    const filter = (q.filter as TaskFilter) || 'all';
    const sort = (q.sort as TaskSort) || 'dueDate';
    const validFilter: TaskFilter =
        filter === 'active' || filter === 'completed' ? filter : 'all';
    const validSort: TaskSort = sort === 'status' ? 'status' : 'dueDate';

    return listTasks({
        search,
        page,
        pageSize,
        filter: validFilter,
        sort: validSort
    });
});
