<template>
    <button
        :type="type"
        :class="[
            $style.btn,
            variantClass,
            sizeClass,
            {
                [$style['btn--block']]: block,
                [$style['btn--icon-only']]: iconOnly
            }
        ]"
        :disabled="disabled || loading"
    >
        <span
            v-if="loading"
            :class="$style['btn__spinner']"
            aria-hidden="true"
        />
        <span
            v-else-if="$slots.icon"
            :class="$style['btn__icon']"
            aria-hidden="true"
        >
            <slot name="icon" />
        </span>
        <span
            v-if="$slots.default"
            :class="$style['btn__text']"
        >
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed, useCssModule, useSlots } from 'vue';

const $style = useCssModule();

const props = withDefaults(
    defineProps<{
        variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
        size?: 'md' | 'sm';
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
        loading?: boolean;
        block?: boolean;
    }>(),
    {
        variant: 'primary',
        size: 'md',
        type: 'button',
        disabled: false,
        loading: false,
        block: false
    }
);

const slots = useSlots();
const iconOnly = computed(() => Boolean(slots.icon) && !slots.default);

const variantClass = computed(
    () =>
        ({
            primary: $style['btn--primary'],
            secondary: $style['btn--secondary'],
            ghost: $style['btn--ghost'],
            danger: $style['btn--danger']
        })[props.variant ?? 'primary']
);

const sizeClass = computed(() =>
    props.size === 'sm' ? $style['btn--small'] : $style['btn--medium']
);
</script>

<style module>
.btn {
    --v-btn-bg: var(--color-primary, #2d6cc0);
    --v-btn-color: #fff;
    --v-btn-border: transparent;
    --v-btn-hover: color-mix(in srgb, var(--v-btn-bg) 88%, #000);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.72rem;
    font-family: inherit;
    font-weight: 600;
    line-height: 1.2;
    border-radius: 0.8rem;
    border: 0.1rem solid var(--v-btn-border);
    background: var(--v-btn-bg);
    color: var(--v-btn-color);
    cursor: pointer;
    transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease;
}

.btn--medium {
    padding: 0.88rem 1.6rem;
    font-size: 1.5rem;
}

.btn--small {
    padding: 0.56rem 1.04rem;
    font-size: 1.3rem;
    border-radius: 0.6rem;
    gap: 0.56rem;
}

.btn--primary {
    --v-btn-bg: var(--color-primary, #2d6cc0);
    --v-btn-color: #fff;
    --v-btn-border: transparent;
}

.btn--primary:hover:not(:disabled) {
    filter: brightness(0.95);
}

.btn--secondary {
    --v-btn-bg: #fff;
    --v-btn-color: #3d4a5c;
    --v-btn-border: #d0d5dd;
}

.btn--secondary:hover:not(:disabled) {
    background: #f8f9fb;
}

.btn--ghost {
    --v-btn-bg: transparent;
    --v-btn-color: var(--color-primary, #2d6cc0);
    --v-btn-border: transparent;
}

.btn--ghost:hover:not(:disabled) {
    background: rgba(45, 108, 192, 0.08);
}

.btn--danger {
    --v-btn-bg: #fff;
    --v-btn-color: #c62828;
    --v-btn-border: #e8b4b4;
}

.btn--danger:hover:not(:disabled) {
    background: #fff5f5;
}

.btn--block {
    width: 100%;
}

.btn--icon-only.btn--medium {
    padding: 0.88rem;
    min-width: 4rem;
}

.btn--icon-only.btn--small {
    padding: 0.56rem;
    min-width: 3.2rem;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
}

.btn__icon :deep(svg) {
    width: 1.1em;
    height: 1.1em;
    color: inherit;
}

.btn__text {
    min-width: 0;
}

.btn__spinner {
    width: 1em;
    height: 1em;
    border: 0.2rem solid rgba(255, 255, 255, 0.35);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: v-btn-spin 0.7s linear infinite;
}

.btn--secondary .btn__spinner,
.btn--danger .btn__spinner {
    border-color: rgba(61, 74, 92, 0.2);
    border-top-color: var(--color-primary, #2d6cc0);
}

@keyframes v-btn-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
