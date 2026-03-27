<template>
    <div :class="$style.page">
        <header :class="$style.hero">
            <div :class="$style.heroLead">
                <h1 :class="$style.heroTitle">{{ texts.heroTitle }}</h1>

                <ClientOnly>
                    <p :class="$style.heroSub">
                        <span
                            :class="[
                                $style.rolePill,
                                user?.role === 'admin' ? $style.rolePillAdmin : $style.rolePillUser
                            ]"
                        >{{ roleLabel }}</span>
                        <span :class="$style.heroEmail">{{ user?.email }}</span>
                    </p>
                    <template #fallback>
                        <p
                            :class="[$style.heroSub, $style.heroSubPlaceholder]"
                            aria-hidden="true"
                        >
                            <span :class="$style.rolePill">…</span>
                            <span :class="$style.heroEmail">…</span>
                        </p>
                    </template>
                </ClientOnly>
            </div>

            <div :class="$style.heroActions">
                <VButton
                    variant="primary"
                    @click="openCreate"
                >
                    <template #icon>
                        <VIcon
                            name="plus"
                            size="1.1em"
                        />
                    </template>
                    {{ texts.addTask }}
                </VButton>

                <VButton
                    variant="secondary"
                    @click="logout"
                >
                    {{ texts.logout }}
                </VButton>
            </div>
        </header>

        <nav
            :class="$style.tabs"
            :aria-label="texts.filterNavAria"
        >
            <button
                v-for="tab in filterTabs"
                :key="tab.value"
                type="button"
                :class="[$style.tabsBtn, filter === tab.value ? $style.tabsBtnActive : '']"
                @click="setFilter(tab.value)"
            >
                {{ tab.label }}
            </button>
        </nav>

        <div :class="[$style.toolbar, $style.cardBlock]">
            <div :class="$style.searchWrap">
                <span
                    :class="$style.searchWrapIcon"
                    aria-hidden="true"
                >
                    <VIcon
                        name="search"
                        :size="20"
                        color="#8a94a5"
                    />
                </span>

                <input
                    id="search"
                    v-model="searchInput"
                    :class="$style.searchWrapInput"
                    type="search"
                    :placeholder="texts.searchPlaceholder"
                    autocomplete="off"
                />
            </div>

            <VButton
                v-if="hasSearchQuery"
                variant="ghost"
                size="sm"
                @click="clearSearch"
            >
                {{ texts.clearSearch }}
            </VButton>

            <div :class="$style.toolbarField">
                <label
                    :class="$style.toolbarLabel"
                    for="tasks-sort"
                >
                    {{ texts.sortLabel }}
                </label>

                <VDropdown
                    id="tasks-sort"
                    v-model="sort"
                    :options="sortOptions"
                    @update:model-value="onToolbarFilterChange"
                />
            </div>

            <div :class="[$style.toolbarField, $style.toolbarFieldNarrow]">
                <label
                    :class="$style.toolbarLabel"
                    for="tasks-page-size"
                >
                    {{ texts.pageSizeLabel }}
                </label>

                <VDropdown
                    id="tasks-page-size"
                    v-model="pageSize"
                    :options="pageSizeOptions"
                    @update:model-value="onToolbarFilterChange"
                />
            </div>
        </div>

        <div :class="[$style.panel, $style.cardBlock]">
            <div
                v-if="showInitialLoading"
                :class="[$style.state, $style.stateLoading]"
            >
                <div
                    :class="$style.spinner"
                    aria-hidden="true"
                />

                <p>{{ texts.loadingTasks }}</p>
            </div>

            <div
                v-else-if="showEmptyState"
                :class="[$style.state, $style.stateEmpty]"
            >
                <p v-if="hasDebouncedSearch">{{ emptySearchMessage }}</p>
                <p v-else>{{ texts.emptyList }}</p>
            </div>

            <ul
                v-else
                :class="$style.list"
            >
                <VTask
                    v-for="t in tasks"
                    :key="t.id"
                    :task="t"
                    :can-modify="canModify(t)"
                    :toggling="togglingId === t.id"
                    @edit="openEdit"
                    @delete="remove"
                    @toggle-complete="onToggleComplete"
                />
            </ul>

            <div
                v-if="showListOverlay"
                :class="$style.overlay"
            >
                <div :class="[$style.spinner, $style.spinnerSm]" />
            </div>
        </div>

        <footer
            v-if="showPager"
            :class="$style.pager"
        >
            <VButton
                variant="ghost"
                size="sm"
                :class="$style.pagerArrow"
                :disabled="pagerPrevDisabled"
                @click="prev"
            >
                <template #icon>
                    <VIcon
                        name="chevron-left"
                        :size="20"
                    />
                </template>
            </VButton>

            <div
                :class="$style.pagerNums"
                role="navigation"
                :aria-label="texts.pagerAria"
            >
                <template v-for="(item, idx) in paginationItems">
                    <span
                        v-if="item === 'gap'"
                        :key="'gap-' + idx"
                        :class="$style.pagerGap"
                    >
                        {{ texts.paginationGap }}
                    </span>
                    <button
                        v-else
                        :key="'page-' + item"
                        type="button"
                        :class="[$style.pagerNum, item === page ? $style.pagerNumCurrent : '']"
                        :disabled="loading"
                        @click="goToPage(item)"
                    >
                        {{ item }}
                    </button>
                </template>
            </div>

            <VButton
                variant="ghost"
                size="sm"
                :class="$style.pagerArrow"
                :disabled="pagerNextDisabled"
                @click="next"
            >
                <template #icon>
                    <VIcon
                        name="chevron-right"
                        :size="20"
                    />
                </template>
            </VButton>
        </footer>

        <Teleport to="body">
            <div
                v-if="modal.open"
                :class="$style.modalBack"
                @click.self="closeModal"
            >
                <div :class="[$style.modal, $style.cardBlock]">
                    <h3 :class="$style.modalTitle">{{ modalTitle }}</h3>
                    
                    <form
                        :class="$style.form"
                        @submit.prevent="saveModal"
                    >
                        <label :class="$style.formField">
                            {{ texts.fieldTitle }}
                            <input
                                v-model.trim="modal.form.title"
                                required
                                maxlength="200"
                            />
                        </label>

                        <label :class="$style.formField">
                            {{ texts.fieldDescription }}
                            <textarea
                                v-model="modal.form.description"
                                rows="3"
                                maxlength="2000"
                            />
                        </label>

                        <label :class="$style.formField">
                            {{ texts.fieldDeadline }}
                            <input
                                v-model="modal.form.dueLocal"
                                type="datetime-local"
                                required
                            />
                        </label>

                        <label :class="[$style.formField, $style.formFieldRow]">
                            <input
                                v-model="modal.form.isCompleted"
                                type="checkbox"
                            />
                            {{ texts.fieldCompleted }}
                        </label>

                        <p
                            v-if="modal.error"
                            :class="$style.formError"
                        >
                            {{ modal.error }}
                        </p>

                        <div :class="$style.modalActions">
                            <VButton
                                type="button"
                                variant="ghost"
                                @click="closeModal"
                            >
                                {{ texts.cancel }}
                            </VButton>
                            
                            <VButton
                                type="submit"
                                variant="primary"
                                :loading="modal.saving"
                            >
                                {{ saveButtonLabel }}
                            </VButton>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { ITask } from '~/types/models';
import { buildPagination } from '~/utils/pagination';

const texts = {
    heroTitle: 'To-Do List',
    addTask: 'Добавить задачу',
    logout: 'Выйти',
    filterNavAria: 'Фильтр задач',
    searchPlaceholder: 'Поиск задач…',
    clearSearch: 'Очистить',
    sortLabel: 'Сортировка',
    sortByDate: 'По дате',
    sortByStatus: 'По статусу',
    pageSizeLabel: 'На странице',
    loadingTasks: 'Загружаем задачи…',
    emptyList: 'Пока нет задач. Нажмите «Добавить задачу», чтобы создать первую.',
    pagerAria: 'Страницы',
    paginationGap: '…',
    modalCreate: 'Новая задача',
    modalEdit: 'Редактирование',
    fieldTitle: 'Заголовок',
    fieldDescription: 'Описание',
    fieldDeadline: 'Дедлайн',
    fieldCompleted: 'Выполнена',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение…',
    roleAdmin: 'Администратор',
    roleUser: 'Пользователь',
    tabAll: 'Все задачи',
    tabActive: 'Активные',
    tabCompleted: 'Выполненные',
    modalTitleRequired: 'Укажите заголовок',
    invalidDate: 'Некорректная дата',
    saveError: 'Ошибка сохранения',
    emptySearch: (query: string) => `Ничего не найдено по запросу «${query}».`,
    deleteConfirm: (title: string) => `Удалить «${title}»?`
};

const auth = useAuth();
const api = useApi();
const user = computed(() => auth.user.value);

const roleLabel = computed(() =>
    user.value?.role === 'admin' ? texts.roleAdmin : texts.roleUser
);

const filterTabs = [
    { value: 'all' as const, label: texts.tabAll },
    { value: 'active' as const, label: texts.tabActive },
    { value: 'completed' as const, label: texts.tabCompleted }
];

const sortOptions = [
    { value: 'dueDate' as const, label: texts.sortByDate },
    { value: 'status' as const, label: texts.sortByStatus }
];

const pageSizeOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' }
];

function onToolbarFilterChange() {
    page.value = 1;
    fetchTasks();
}

function canModify(t: ITask) {
    return auth.canModifyTask(t.createdBy);
}

const searchInput = ref('');
const searchDebounced = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const emptySearchMessage = computed(() => texts.emptySearch(searchDebounced.value.trim()));

watch(searchInput, (v) => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        searchDebounced.value = v;
        page.value = 1;
        fetchTasks();
    }, 350);
});

function clearSearch() {
    searchInput.value = '';
    searchDebounced.value = '';
    page.value = 1;
    fetchTasks();
}

const filter = ref<'all' | 'active' | 'completed'>('all');
const sort = ref<'dueDate' | 'status'>('dueDate');
const page = ref(1);
const pageSize = ref(10);
const loading = ref(true);
const tasks = ref<ITask[]>([]);
const total = ref(0);
const togglingId = ref<string | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const paginationItems = computed(() => buildPagination(totalPages.value, page.value));

const hasSearchQuery = computed(() => Boolean(searchInput.value.trim()));
const hasDebouncedSearch = computed(() => Boolean(searchDebounced.value.trim()));

const showInitialLoading = computed(() => loading.value && !tasks.value.length);
const showEmptyState = computed(() => !loading.value && !tasks.value.length);
const showListOverlay = computed(() => loading.value && tasks.value.length > 0);

const showPager = computed(() => total.value > 0);
const pagerPrevDisabled = computed(() => page.value <= 1 || loading.value);
const pagerNextDisabled = computed(() => page.value >= totalPages.value || loading.value);

function setFilter(v: typeof filter.value) {
    filter.value = v;
    page.value = 1;
    fetchTasks();
}

async function fetchTasks() {
    loading.value = true;
    try {
        const res = await api<{ items: ITask[]; total: number; page: number; pageSize: number }>(
            '/api/tasks',
            {
                query: {
                    search: searchDebounced.value || undefined,
                    page: page.value,
                    pageSize: pageSize.value,
                    filter: filter.value,
                    sort: sort.value
                }
            }
        );
        tasks.value = res.items;
        total.value = res.total;
    } catch {
        tasks.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchTasks();
});

function goToPage(n: number) {
    if (n === page.value || n < 1 || n > totalPages.value) {
        return;
    }
    page.value = n;
    fetchTasks();
}

function prev() {
    if (page.value > 1) {
        page.value -= 1;
        fetchTasks();
    }
}

function next() {
    if (page.value < totalPages.value) {
        page.value += 1;
        fetchTasks();
    }
}

function toLocal(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocal(local: string) {
    return new Date(local).toISOString();
}

function logout() {
    auth.logout();
    navigateTo('/login');
}

const modal = reactive({
    open: false,
    mode: 'create' as 'create' | 'edit',
    saving: false,
    error: '',
    taskId: '' as string,
    form: {
        title: '',
        description: '',
        dueLocal: '',
        isCompleted: false
    }
});

const modalTitle = computed(() =>
    modal.mode === 'create' ? texts.modalCreate : texts.modalEdit
);

const saveButtonLabel = computed(() => (modal.saving ? texts.saving : texts.save));

function openCreate() {
    modal.mode = 'create';
    modal.taskId = '';
    modal.error = '';
    const d = new Date();
    d.setHours(d.getHours() + 1);
    modal.form = {
        title: '',
        description: '',
        dueLocal: toLocal(d.toISOString()),
        isCompleted: false
    };
    modal.open = true;
}

function openEdit(t: ITask) {
    modal.mode = 'edit';
    modal.taskId = t.id;
    modal.error = '';
    modal.form = {
        title: t.title,
        description: t.description,
        dueLocal: toLocal(t.dueDate),
        isCompleted: t.isCompleted
    };
    modal.open = true;
}

function closeModal() {
    modal.open = false;
}

async function saveModal() {
    modal.error = '';
    if (!modal.form.title.trim()) {
        modal.error = texts.modalTitleRequired;
        return;
    }
    const due = new Date(modal.form.dueLocal);
    if (Number.isNaN(due.getTime())) {
        modal.error = texts.invalidDate;
        return;
    }

    modal.saving = true;
    try {
        if (modal.mode === 'create') {
            await api('/api/tasks', {
                method: 'POST',
                body: {
                    title: modal.form.title,
                    description: modal.form.description,
                    dueDate: fromLocal(modal.form.dueLocal),
                    isCompleted: modal.form.isCompleted
                }
            });
        } else {
            await api(`/api/tasks/${modal.taskId}`, {
                method: 'PUT',
                body: {
                    title: modal.form.title,
                    description: modal.form.description,
                    dueDate: fromLocal(modal.form.dueLocal),
                    isCompleted: modal.form.isCompleted
                }
            });
        }
        modal.open = false;
        await fetchTasks();
    } catch (e: unknown) {
        modal.error = getErrorMessage(e) || texts.saveError;
    } finally {
        modal.saving = false;
    }
}

function getErrorMessage(e: unknown) {
    if (e && typeof e === 'object' && 'data' in e) {
        const d = (e as { data?: { statusMessage?: string; message?: string } }).data;
        return d?.statusMessage || d?.message;
    }
    return '';
}

async function onToggleComplete(t: ITask) {
    if (!canModify(t)) {
        return;
    }
    togglingId.value = t.id;
    try {
        await api(`/api/tasks/${t.id}`, {
            method: 'PUT',
            body: { isCompleted: !t.isCompleted }
        });
        await fetchTasks();
    } finally {
        togglingId.value = null;
    }
}

async function remove(t: ITask) {
    if (!confirm(texts.deleteConfirm(t.title))) {
        return;
    }
    loading.value = true;
    try {
        await api(`/api/tasks/${t.id}`, { method: 'DELETE' });
        await fetchTasks();
    } finally {
        loading.value = false;
    }
}
</script>

<style module>
.page {
    --color-primary: #2d6cc0;
    --color-bg-page: #f0f2f5;

    max-width: 110rem;
    margin: 0 auto;
    padding: 2.8rem 2rem 4.8rem;
}

.hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.6rem;
    margin-bottom: 2rem;
}

.heroLead {
    min-width: 0;
}

.heroTitle {
    margin: 0;
    font-size: 2.8rem;
    font-weight: 800;
    color: #1a2332;
    letter-spacing: -0.02em;
}

.heroSub {
    margin: 0.64rem 0 0;
    display: flex;
    align-items: center;
    gap: 0.96rem;
    flex-wrap: wrap;
    font-size: 1.44rem;
    color: #6b7684;
}

.heroEmail {
    color: #4a5565;
}

.heroSubPlaceholder {
    opacity: 0.45;
}

.rolePill {
    display: inline-block;
    padding: 0.32rem 0.88rem;
    border-radius: 100rem;
    font-size: 1.12rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.rolePillAdmin {
    background: #ede7f6;
    color: #5e35b1;
}

.rolePillUser {
    background: #e3f2fd;
    color: #1565c0;
}

.heroActions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    align-items: center;
}

.cardBlock {
    background: #fff;
    border: 0.1rem solid #e4e8ef;
    border-radius: 1rem;
    box-shadow: 0 0.1rem 0.2rem rgba(26, 35, 50, 0.04);
}

.tabs {
    display: flex;
    gap: 0;
    margin-bottom: 1.6rem;
    border-bottom: 0.1rem solid #e4e8ef;
}

.tabsBtn {
    position: relative;
    padding: 1.04rem 1.76rem;
    margin-bottom: -0.1rem;
    font: inherit;
    font-weight: 600;
    font-size: 1.52rem;
    color: #6b7684;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
}

.tabsBtn:hover {
    color: var(--color-primary);
}

.tabsBtnActive {
    color: var(--color-primary);
}

.tabsBtnActive::after {
    content: '';
    position: absolute;
    left: 1.2rem;
    right: 1.2rem;
    bottom: 0;
    height: 0.3rem;
    background: var(--color-primary);
    border-radius: 0.3rem 0.3rem 0 0;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1.2rem 1.6rem;
    padding: 1.6rem 1.84rem;
    margin-bottom: 1.6rem;
}

.searchWrap {
    position: relative;
    flex: 1 1 22rem;
    min-width: 0;
}

.searchWrapIcon {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    pointer-events: none;
}

.searchWrapInput {
    width: 100%;
    padding: 0.88rem 1.2rem 0.88rem 4rem;
    border: 0.1rem solid #d0d5dd;
    border-radius: 0.8rem;
    font-size: 1.52rem;
    background: #fafbfc;
}

.searchWrapInput:focus {
    outline: none;
    border-color: var(--color-primary);
    background: #fff;
    box-shadow: 0 0 0 0.3rem rgba(45, 108, 192, 0.15);
}

.toolbarField {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
}

.toolbarFieldNarrow {
    flex: 0 0 auto;
}

.toolbarLabel {
    font-size: 1.12rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8a94a5;
}

.panel {
    position: relative;
    overflow: hidden;
    padding: 0;
}

.list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.state {
    padding: 4.8rem 2.4rem;
    text-align: center;
    color: #6b7684;
}

.stateLoading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
}

.stateEmpty :global(p) {
    margin: 0;
    max-width: 44.8rem;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
}

.spinner {
    width: 4rem;
    height: 4rem;
    border: 0.3rem solid #e8eaef;
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: tasks-spin 0.8s linear infinite;
}

.spinnerSm {
    width: 2.8rem;
    height: 2.8rem;
    border-width: 0.2rem;
}

@keyframes tasks-spin {
    to {
        transform: rotate(360deg);
    }
}

.overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.56rem;
    margin-top: 2rem;
    flex-wrap: wrap;
}

.pagerArrow {
    flex-shrink: 0;
}

.pagerNums {
    display: flex;
    align-items: center;
    gap: 0.24rem;
}

.pagerNum {
    min-width: 3.6rem;
    padding: 0.56rem 0.72rem;
    font: inherit;
    font-weight: 600;
    font-size: 1.44rem;
    color: #4a5565;
    background: none;
    border: none;
    border-radius: 0.6rem;
    cursor: pointer;
}

.pagerNum:hover:not(:disabled) {
    color: var(--color-primary);
    background: rgba(45, 108, 192, 0.08);
}

.pagerNum:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagerNumCurrent {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 0.4rem;
    text-decoration-thickness: 0.2rem;
}

.pagerGap {
    padding: 0 0.4rem;
    color: #9aa3b0;
    user-select: none;
}

.modalBack {
    position: fixed;
    inset: 0;
    background: rgba(26, 35, 50, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.6rem;
    z-index: 50;
}

.modal {
    width: 100%;
    max-width: 44rem;
    padding: 2.4rem;
    box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.18);
}

.modalTitle {
    margin: 0 0 1.76rem;
    font-size: 1.92rem;
    font-weight: 800;
    color: #1a2332;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.44rem;
}

.formField {
    display: flex;
    flex-direction: column;
    gap: 0.56rem;
    font-size: 1.36rem;
    font-weight: 600;
    color: #374151;
}

.formFieldRow {
    flex-direction: row;
    align-items: center;
    gap: 0.8rem;
}

.form :global(input),
.form :global(textarea) {
    padding: 0.8rem 1.04rem;
    border: 0.1rem solid #d0d5dd;
    border-radius: 0.8rem;
    font-size: 1.52rem;
}

.formError {
    color: #c62828;
    margin: 0;
    font-size: 1.44rem;
}

.modalActions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 0.56rem;
}
</style>
