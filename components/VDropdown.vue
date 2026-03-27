<template>
    <div
        ref="rootRef"
        :class="$style.dropdown"
    >
        <button
            :id="id"
            type="button"
            :class="[
                $style['dropdown__trigger'],
                { [$style['dropdown__trigger--open']]: open }
            ]"
            :disabled="disabled"
            :aria-expanded="open"
            aria-haspopup="listbox"
            @click.stop="toggle"
        >
            <span :class="$style['dropdown__trigger-label']">{{ displayLabel }}</span>
            <span
                :class="$style['dropdown__trigger-chevron']"
                aria-hidden="true"
            >
                <VIcon
                    name="chevron-down"
                    :size="18"
                    :color="chevronColor"
                />
            </span>
        </button>

        <ul
            v-show="open"
            :class="$style['dropdown__panel']"
            role="listbox"
            :aria-labelledby="id"
        >
            <li
                v-for="opt in options"
                :key="optionKey(opt)"
                role="none"
            >
                <button
                    type="button"
                    role="option"
                    :class="[
                        $style['dropdown__item'],
                        { [$style['dropdown__item--selected']]: isSelected(opt) }
                    ]"
                    :aria-selected="isSelected(opt)"
                    @click="select(opt)"
                >
                    <span
                        :class="$style['dropdown__check']"
                        aria-hidden="true"
                    >
                        <VIcon
                            v-if="isSelected(opt)"
                            name="check"
                            :size="14"
                        />
                    </span>
                    <span :class="$style['dropdown__item-label']">{{ opt.label }}</span>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export type DropdownOption<T extends string | number = string | number> = {
    value: T;
    label: string;
};

defineOptions({ name: 'VDropdown' });

const props = withDefaults(
    defineProps<{
        options: DropdownOption[];
        disabled?: boolean;
        id?: string;
    }>(),
    {
        disabled: false,
        id: undefined
    }
);

const model = defineModel<string | number>({ required: true });

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const displayLabel = computed(() => {
    const opt = props.options.find((o) => o.value === model.value);
    return opt?.label ?? String(model.value);
});

const chevronColor = computed(() => (open.value ? '#2d6cc0' : '#6b7684'));

function optionKey(opt: DropdownOption) {
    return typeof opt.value === 'number' ? `n-${opt.value}` : `s-${opt.value}`;
}

function isSelected(opt: DropdownOption) {
    return opt.value === model.value;
}

function toggle() {
    if (props.disabled) {
        return;
    }
    open.value = !open.value;
}

function select(opt: DropdownOption) {
    model.value = opt.value;
    open.value = false;
}

function onDocClick(e: MouseEvent) {
    if (!rootRef.value?.contains(e.target as Node)) {
        open.value = false;
    }
}

function onDocKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        open.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onDocKeydown);
});
</script>

<style module>
.dropdown {
    position: relative;
    width: 100%;
    min-width: 13.6rem;
}

.dropdown__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 0.8rem;
    padding: 0.72rem 0.96rem;
    border: 0.1rem solid #d0d5dd;
    border-radius: 0.8rem;
    font: inherit;
    font-size: 1.44rem;
    color: #1a2332;
    background: #fff;
    cursor: pointer;
    text-align: left;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}

.dropdown__trigger:hover:not(:disabled) {
    border-color: #b8c0cc;
}

.dropdown__trigger:focus-visible {
    outline: none;
    border-color: var(--color-primary, #2d6cc0);
    box-shadow: 0 0 0 0.3rem rgba(45, 108, 192, 0.15);
}

.dropdown__trigger:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.dropdown__trigger--open {
    border-color: var(--color-primary, #2d6cc0);
}

.dropdown__trigger-label {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dropdown__trigger-chevron {
    display: inline-flex;
    flex-shrink: 0;
    line-height: 0;
    transition: transform 0.2s ease;
}

.dropdown__trigger--open .dropdown__trigger-chevron {
    transform: rotate(180deg);
}

.dropdown__panel {
    position: absolute;
    top: calc(100% + 0.4rem);
    left: 0;
    right: 0;
    z-index: 40;
    margin: 0;
    padding: 0.56rem 0;
    list-style: none;
    background: #2c3136;
    border-radius: 1rem;
    box-shadow: 0 1.2rem 3.2rem rgba(0, 0, 0, 0.28);
}

.dropdown__item {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.72rem;
    padding: 0.8rem 1.04rem;
    border: none;
    font: inherit;
    font-size: 1.44rem;
    color: #fff;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s ease;
}

.dropdown__item:hover,
.dropdown__item:focus-visible {
    background: rgba(255, 255, 255, 0.08);
    outline: none;
}

.dropdown__item--selected {
    font-weight: 600;
}

.dropdown__check {
    display: inline-flex;
    flex-shrink: 0;
    width: 1.76rem;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: #fff;
}

.dropdown__item-label {
    flex: 1;
    min-width: 0;
}
</style>
