<template>
    <li
        :class="[$style.taskItem, { [$style.taskItemDone]: task.isCompleted }]"
    >
        <label
            :class="$style.check"
            @click.prevent="onCheckboxClick"
        >
            <input
                type="checkbox"
                :class="$style.checkInput"
                :checked="task.isCompleted"
                :disabled="!canModify || toggling"
                :aria-label="checkboxAriaLabel"
            />
            <span
                :class="$style.checkUi"
                aria-hidden="true"
            />
        </label>

        <div :class="$style.body">
            <div :class="$style.titleRow">
                <h2 :class="$style.title">{{ task.title }}</h2>

                <div :class="$style.badges">
                    <span
                        v-if="urgency === 'important'"
                        :class="[$style.tag, $style.tagImportant]"
                    >
                        {{ texts.urgencyImportant }}
                    </span>
                    
                    <span :class="[$style.tag, statusTagClass]">{{ statusLabel }}</span>
                </div>
            </div>
            <p
                v-if="task.description"
                :class="$style.desc"
            >
                {{ task.description }}
            </p>

            <div :class="$style.metaMobile">
                <span :class="$style.date">{{ dateShort }}</span>
                <span :class="$style.authorInline">
                    <span :class="[$style.avatar, $style.avatarSm]">{{ initials }}</span>
                    {{ authorName }}
                </span>
            </div>
        </div>

        <div :class="$style.dateDesktop">{{ dateShort }}</div>

        <div :class="$style.author">
            <span :class="$style.avatar">{{ initials }}</span>
            <span :class="$style.authorName">{{ authorName }}</span>
        </div>

        <div :class="$style.actions">
            <template v-if="canModify">
                <VButton
                    variant="secondary"
                    size="sm"
                    @click="emit('edit', task)"
                >
                    {{ texts.edit }}
                </VButton>

                <VButton
                    variant="danger"
                    size="sm"
                    @click="emit('delete', task)"
                >
                    {{ texts.delete }}
                </VButton>
            </template>

            <span
                v-else
                :class="$style.hint"
            >
                {{ texts.readOnly }}
            </span>
        </div>
    </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ITask } from '~/types/models';
import { getCreatorLabel, getTaskUrgency, initialsFromName } from '~/utils/taskDisplay';

defineOptions({ name: 'VTask' });

const $style = useCssModule();

const texts = {
    ariaMarkIncomplete: 'Отметить как невыполненную',
    ariaMarkComplete: 'Отметить как выполненную',
    statusDone: 'Готово',
    statusActive: 'В работе',
    urgencyImportant: 'Важно',
    datePlaceholder: '—',
    edit: 'Редактировать',
    delete: 'Удалить',
    readOnly: 'Только просмотр'
} as const;

const props = defineProps<{
    task: ITask;
    canModify: boolean;
    toggling?: boolean;
}>();

const emit = defineEmits<{
    edit: [task: ITask];
    delete: [task: ITask];
    'toggle-complete': [task: ITask];
}>();

const checkboxAriaLabel = computed(() =>
    props.task.isCompleted ? texts.ariaMarkIncomplete : texts.ariaMarkComplete
);

const statusLabel = computed(() =>
    props.task.isCompleted ? texts.statusDone : texts.statusActive
);

const urgency = computed(() => getTaskUrgency(props.task));

const statusTagClass = computed(() =>
    props.task.isCompleted ? $style.tagStatusDone : $style.tagStatusActive
);

const authorName = computed(() => getCreatorLabel(props.task.createdBy));
const initials = computed(() => initialsFromName(authorName.value));

const dateShort = computed(() => {
    const d = new Date(props.task.dueDate);
    if (Number.isNaN(d.getTime())) {
        return texts.datePlaceholder;
    }
    return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
});

function onCheckboxClick() {
    if (!props.canModify || props.toggling) {
        return;
    }
    emit('toggle-complete', props.task);
}
</script>

<style module>
.taskItem {
    --tag-important: #2d6cc0;

    display: grid;
    grid-template-columns: auto 1fr minmax(11.2rem, auto) minmax(16rem, 19.2rem) auto;
    grid-template-areas: 'check body date author actions';
    align-items: center;
    gap: 1.2rem 1.6rem;
    padding: 1.6rem 2rem;
    border-bottom: 0.1rem solid #e8eaef;
    background: #fff;
}

.taskItem:last-child {
    border-bottom: none;
}

.taskItemDone .title {
    text-decoration: line-through;
    color: #8a94a5;
}

.check {
    grid-area: check;
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkInput {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.checkUi {
    width: 2rem;
    height: 2rem;
    border: 0.2rem solid #c5cad3;
    border-radius: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        border-color 0.15s,
        background 0.15s;
}

.checkInput:checked + .checkUi {
    background: var(--color-primary, #2d6cc0);
    border-color: var(--color-primary, #2d6cc0);
}

.checkInput:checked + .checkUi::after {
    content: '';
    width: 0.5rem;
    height: 0.9rem;
    border: solid #fff;
    border-width: 0 0.2rem 0.2rem 0;
    transform: rotate(45deg) translate(0, -0.1rem);
}

.checkInput:disabled + .checkUi {
    opacity: 0.45;
    cursor: not-allowed;
}

.body {
    grid-area: body;
    min-width: 0;
}

.titleRow {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.8rem 1.2rem;
}

.title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    color: #1c2430;
    line-height: 1.35;
}

.badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.56rem;
}

.tag {
    display: inline-block;
    padding: 0.24rem 0.8rem;
    border-radius: 0.4rem;
    font-size: 1.12rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.tagImportant {
    background: rgba(45, 108, 192, 0.12);
    color: var(--color-primary, #2d6cc0);
}

.tagStatusActive {
    background: #fff8e1;
    color: #e65100;
}

.tagStatusDone {
    background: #e8f5e9;
    color: #2e7d32;
}

.desc {
    margin: 0.64rem 0 0;
    font-size: 1.4rem;
    color: #5c6575;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.metaMobile {
    display: none;
    margin-top: 0.8rem;
    font-size: 1.28rem;
    color: #7a8698;
    flex-wrap: wrap;
    gap: 0.56rem 1.2rem;
    align-items: center;
}

.date {
    white-space: nowrap;
}

.authorInline {
    display: inline-flex;
    align-items: center;
    gap: 0.56rem;
}

.dateDesktop {
    grid-area: date;
    font-size: 1.4rem;
    color: #4a5565;
    white-space: nowrap;
}

.author {
    grid-area: author;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
}

.avatar {
    flex-shrink: 0;
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #5c8fd4, #2d6cc0);
    color: #fff;
    font-size: 1.12rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatarSm {
    width: 2.4rem;
    height: 2.4rem;
    font-size: 0.96rem;
}

.authorName {
    font-size: 1.4rem;
    color: #3d4a5c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.actions {
    width: 24rem;
    grid-area: actions;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
}

.hint {
    font-size: 1.28rem;
    color: #9aa3b0;
}

@media (max-width: 90rem) {
    .taskItem {
        grid-template-columns: auto 1fr;
        grid-template-areas:
            'check body'
            '. actions';
    }

    .dateDesktop,
    .author {
        display: none;
    }

    .metaMobile {
        display: flex;
    }

    .actions {
        justify-content: flex-start;
        padding-left: 3.2rem;
    }
}
</style>
