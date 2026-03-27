import type { ITask } from '~/types/models';

export type UrgencyKind = 'important' | 'normal';

export function getTaskUrgency(task: ITask): UrgencyKind {
    if (task.isCompleted) {
        return 'normal';
    }

    const due = new Date(task.dueDate);
    if (Number.isNaN(due.getTime())) {
        return 'normal';
    }

    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    if (diff > 0 && diff <= twoDays) {
        return 'important';
    }

    return 'normal';
}

const CREATOR_LABEL: Record<string, string> = {
    '1': 'Администратор',
    '2': 'Пользователь'
};

export function getCreatorLabel(createdBy: string) {
    return CREATOR_LABEL[createdBy] ?? `Участник ${createdBy}`;
}

export function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return '?';
    }
    if (parts.length === 1) {
        return parts[0]!.slice(0, 2).toUpperCase();
    }
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}
