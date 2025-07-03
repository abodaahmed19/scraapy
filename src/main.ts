import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import axios from '@/axios'
import i18n from '@/plugins/i18n'
import User from '@/store/User'
import store from '@/store/index'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import Markdown from 'vue3-markdown-it'
import 'highlight.js/styles/monokai.css'
import 'vue3-easy-data-table/dist/style.css'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core';

import { PushNotifications } from '@capacitor/push-notifications'

if (Capacitor.getPlatform() !== 'web') {
  PushNotifications.addListener('registration', token => {
    console.log('Push registration success: ', token)
  })

  // يمكن أيضًا طلب الأذونات هنا
  PushNotifications.requestPermissions().then(result => {
    if (result.receive === 'granted') {
      PushNotifications.register()
    }
  })

  // استقبال الإشعارات:
  PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Notification received:', notification)
  })
}

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }) // أو Style.Light
  StatusBar.setBackgroundColor({ color: '#ffffff' })
  StatusBar.show() // أو StatusBar.hide()
}

const pinia = createPinia()
const app = createApp(App)

app.config.globalProperties.$axios = axios
app.config.globalProperties.$userStore = User

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(store)
app.use(autoAnimatePlugin)
app.component('Markdown', Markdown)
app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'colored',
  rtl: true
} as ToastContainerOptions)
app.component('EasyDataTable', Vue3EasyDataTable)
app.mount('#app')
