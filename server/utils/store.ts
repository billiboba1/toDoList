import type { ITask, IUser } from '~/types/models';

const users: IUser[] = [
    { id: '1', email: 'admin@test.ru', password: 'admin123', role: 'admin' },
    { id: '2', email: 'user@test.ru', password: 'user123', role: 'user' }
];

const tasks: ITask[] = [
    {
        id: 't1',
        title: 'Пример задачи админа',
        description: 'Создал администратор',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        isCompleted: false,
        createdBy: '1'
    },
    {
        id: 't2',
        title: 'Пример задачи пользователя',
        description: 'Обычный пользователь',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        isCompleted: true,
        createdBy: '2'
    }
];

let idCounter = 3;

export function findUserByEmail(email: string) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getTaskById(id: string) {
    return tasks.find((t) => t.id === id);
}

export function createTask(data: Omit<ITask, 'id'>) {
    const id = `t${idCounter++}`;
    const task: ITask = { id, ...data };
    tasks.push(task);
    return task;
}

export function updateTask(id: string, patch: Partial<Omit<ITask, 'id' | 'createdBy'>>) {
    const task = getTaskById(id);
    if (!task) {
        return null;
    }
    Object.assign(task, patch);
    return task;
}

export function deleteTask(id: string) {
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) {
        return false;
    }
    tasks.splice(i, 1);
    return true;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'dueDate' | 'status';

export function listTasks(options: {
    search?: string;
    page: number;
    pageSize: number;
    filter: TaskFilter;
    sort: TaskSort;
}) {
    const { search, page, pageSize, filter, sort } = options;
    let rows = [...tasks];

    if (search?.trim()) {
        const q = search.trim().toLowerCase();
        rows = rows.filter(
            (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        );
    }

    if (filter === 'active') {
        rows = rows.filter((t) => !t.isCompleted);
    }
    if (filter === 'completed') {
        rows = rows.filter((t) => t.isCompleted);
    }

    if (sort === 'dueDate') {
        rows.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else {
        rows.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
    }

    const total = rows.length;
    const start = Math.max(0, (page - 1) * pageSize);
    const items = rows.slice(start, start + pageSize);

    return { items, total, page, pageSize };
}
