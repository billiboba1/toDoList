export type Role = 'admin' | 'user';

export interface IUser {
    id: string;
    email: string;
    password: string;
    role: Role;
}

export interface ITask {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: string;
}

export interface IJwtPayload {
    sub: string;
    email: string;
    role: Role;
}

export interface ITaskListResponse {
    items: ITask[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IAuthUser {
    id: string;
    email: string;
    role: Role;
}
