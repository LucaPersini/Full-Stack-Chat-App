import { createRouter, createWebHistory } from 'vue-router'
import LogPage from '../views/LogPage.vue'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LogPage',
      component: LogPage
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    }
  ]
})

export default router
