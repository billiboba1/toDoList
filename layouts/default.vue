<template>
    <div :class="$style.layout">
        <slot />
    </div>
</template>

<style module>
.layout {
    min-height: 100vh;
    background: #f0f2f5;
}
</style>
