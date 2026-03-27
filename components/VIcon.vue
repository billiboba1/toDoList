<template>
    <span
        :class="$style.icon"
        :style="rootStyle"
        aria-hidden="true"
        v-html="svgHtml"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import rawPlus from '~/assets/icons/plus.svg?raw';
import rawSearch from '~/assets/icons/search.svg?raw';
import rawChevronLeft from '~/assets/icons/chevron-left.svg?raw';
import rawChevronRight from '~/assets/icons/chevron-right.svg?raw';
import rawChevronDown from '~/assets/icons/chevron-down.svg?raw';
import rawCheck from '~/assets/icons/check.svg?raw';

defineOptions({ name: 'VIcon' });

const ICONS = {
    plus: rawPlus,
    search: rawSearch,
    'chevron-left': rawChevronLeft,
    'chevron-right': rawChevronRight,
    'chevron-down': rawChevronDown,
    check: rawCheck
} as const;

export type IconName = keyof typeof ICONS;

const props = withDefaults(
    defineProps<{
        name: IconName;
        size?: number | string;
        color?: string;
    }>(),
    {
        size: 24,
        color: 'currentColor'
    }
);

const rootStyle = computed(() => {
    const s = props.size;
    const dim = typeof s === 'number' ? `${s / 10}rem` : s;
    return {
        width: dim,
        height: dim,
        color: props.color
    };
});

const svgHtml = computed(() => ICONS[props.name].trim());
</script>

<style module>
.icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
    vertical-align: middle;
}

.icon :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
