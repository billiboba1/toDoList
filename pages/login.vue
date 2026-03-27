<template>
    <div :class="$style.page">
        <div :class="$style.card">
            <h1 :class="$style.title">{{ texts.title }}</h1>

            <p :class="$style.hint">
                {{ texts.hintAdminPrefix }}<code>{{ texts.adminEmail }}</code> /
                <code>{{ texts.adminPassword }}</code><br />
                {{ texts.hintUserPrefix }}<code>{{ texts.userEmail }}</code> /
                <code>{{ texts.userPassword }}</code>
            </p>

            <form
                :class="$style.form"
                @submit.prevent="submit"
            >
                <label :class="$style.label">
                    {{ texts.emailLabel }}
                    <input
                        v-model.trim="email"
                        type="email"
                        autocomplete="username"
                        required
                    />
                </label>

                <label :class="$style.label">
                    {{ texts.passwordLabel }}
                    <input
                        v-model="password"
                        type="password"
                        autocomplete="current-password"
                        required
                    />
                </label>

                <p
                    v-if="error"
                    :class="$style.error"
                >{{ error }}</p>

                <VButton
                    type="submit"
                    variant="primary"
                    block
                    :loading="loading"
                >
                    {{ texts.submit }}
                </VButton>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IAuthUser } from '~/types/models';

definePageMeta({ layout: false });

const texts = {
    title: 'Вход',
    hintAdminPrefix: 'Админ: ',
    hintUserPrefix: 'Пользователь: ',
    adminEmail: 'admin@test.ru',
    adminPassword: 'admin123',
    userEmail: 'user@test.ru',
    userPassword: 'user123',
    emailLabel: 'Email',
    passwordLabel: 'Пароль',
    submit: 'Войти',
    loginError: 'Не удалось войти'
} as const;

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const auth = useAuth();
const api = useApi();

async function submit() {
    error.value = '';
    loading.value = true;
    try {
        const res = await api<{
            token: string;
            user: IAuthUser;
        }>('/api/auth/login', {
            method: 'POST',
            body: { email: email.value, password: password.value }
        });
        auth.persist(res.token, {
            id: res.user.id,
            email: res.user.email,
            role: res.user.role
        });
        await navigateTo('/tasks');
    } catch (e: unknown) {
        const msg =
            e && typeof e === 'object' && 'data' in e
                ? (e as { data?: { message?: string } }).data?.message
                : undefined;
        error.value = msg || texts.loginError;
    } finally {
        loading.value = false;
    }
}
</script>

<style module>
.page {
    --color-primary: #2d6cc0;

    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.4rem;
    background: linear-gradient(155deg, #1e4a8a 0%, #2d6cc0 45%, #5a9bd8 100%);
}

.card {
    width: 100%;
    max-width: 40rem;
    background: #fff;
    border-radius: 1.2rem;
    padding: 2.8rem;
    box-shadow: 0 1.2rem 4rem rgba(0, 0, 0, 0.2);
}

.title {
    margin: 0 0 1.2rem;
    font-size: 2.4rem;
}

.hint {
    font-size: 1.36rem;
    color: #5c6575;
    margin: 0 0 2rem;
    line-height: 1.5;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
}

.label {
    display: flex;
    flex-direction: column;
    gap: 0.56rem;
    font-size: 1.44rem;
    font-weight: 600;
    color: #333;
}

.label :global(input) {
    padding: 0.88rem 1.04rem;
    border: 0.1rem solid #cfd4dc;
    border-radius: 0.8rem;
    font-size: 1.6rem;
}

.error {
    color: #c62828;
    margin: 0;
    font-size: 1.44rem;
}
</style>
