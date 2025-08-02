<script setup lang="ts">
import '@/assets/style-auth.css'
import { ref, computed } from 'vue'
import navBar from '@/components/UIElements/navBar.vue'
import footerComponant from '@/components/UIElements/footerComponant.vue'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { useAuthStore } from '@/store/auth'
import * as yup from 'yup'
import LoginMethodTabs from '@/components/new/auth/LoginMethodTabs.vue'
import TextInput from '@/components/new/ui/TextInput.vue'
import Button from '@/components/new/ui/Button.vue'
import User from '@/store/User'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()

const userStore = User
const loginMethod = ref<'phone' | 'email'>('phone')
const isError = ref(false)
const errorMsg = ref<string | null>(null)

// Form validation schema for email
const emailSchema = yup.object({
  email: yup.string()
    .email(t('validations.email'))
    .required(t('validations.emailRequired'))
})

const phoneSchema = yup.object({
  phone: yup
    .string()
    .required(t('validations.phoneRequired'))
    .matches(/^05\d{8}$/, t('validations.phone'))
})

// Setup form with dynamic schema
const { handleSubmit, resetForm } = useForm({
  validationSchema: computed(() => loginMethod.value === 'email' ? emailSchema : phoneSchema)
})

// Form fields with initial values
const { value: emailValue, errorMessage: emailError } = useField<string>('email', undefined, {
  initialValue: ''
})

const { value: phoneValue, errorMessage: phoneError } = useField<string>('phone', undefined, {
  initialValue: ''
})

function changeLoginMethod(method: 'email' | 'phone') {
  loginMethod.value = method
  resetForm()
  isError.value = false
}

const isLoading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true

    authStore.setCredentials({
      emailOrPhone: loginMethod.value === 'email' ? values.email : values.phone,
      isEmail: loginMethod.value === 'email'
    })

    let identifier
    if (loginMethod.value === 'email') {
      identifier = values.email
    } else {
      identifier = '+966' + values.phone.slice(1)
      // identifier = values.phone
    }

    await userStore.dispatch('sendOtpLogin', { identifier: identifier })
  
    localStorage.setItem('otp_phone', identifier)

    // Success: go to OTP page
    router.push('/auth/otp')

  } catch (error) {
    if (error.status === 404) {
      if (loginMethod.value === 'email') {
        errorMsg.value = t('validations.noEmail')
      } else {
        errorMsg.value = t('validations.noPhone')
      }
      isError.value = true
      // Show friendly message and offer registration
    } else if (error.status === 500) {
      errorMsg.value = t('validations.serverError')
      isError.value = true
    }  else {
      // Other errors (like network issues, server errors)
      errorMsg.value = t('validations.unknownError')
      isError.value = true
    }
  } finally {
    isLoading.value = false
  }
})
</script>
<template>
  <navBar/>
  <div>
    <div style="margin-left: auto; margin-right: auto; width: 100%; max-width: 10rem; margin-top: 35px; margin-bottom: 20px;">
      <img @click="router.push({ name: 'home' })" src="@/assets/logo.svg?url" alt="logo" style="width: 160px; height: 66px; cursor: pointer;" />
    </div>
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.welcomeBack') }}</p>
      </div>
      
      <LoginMethodTabs
        :selected-method="loginMethod"
        @change="changeLoginMethod"
      />
      
      <p v-if="isError" class="error-alert">{{ errorMsg }}</p>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div v-if="loginMethod === 'email'">
          <TextInput
            v-model="emailValue"
            :label="$t('auth.email')"
            placeholder="your@email.com"
            type="email"
            :error="emailError"
            autocomplete="email"
          />
        </div>
        
        <div v-else>
          <TextInput
            v-model="phoneValue"
            :label="$t('auth.phone')"
            placeholder="05xxxxxxxx"
            type="tel"
            :error="phoneError"
            autocomplete="tel"
            maxlength="10"
          />
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          :loading="isLoading"
          full-width
        >
          {{ $t('auth.loginButton') }}
        </Button>
      </form>
      
      <div class="auth-footer">
        <p>
          {{ $t('auth.noAccount') }}
          <router-link to="/auth/register" class="auth-footer-link">{{ $t('auth.signUp') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .error-alert {
    color: #842029;
    background-color: #f8d7da;
    border-color: #f5c2c7;
    padding: 10px;
    margin: 0 0 10px 0;
    border-radius: 0.5rem;
  }
</style>