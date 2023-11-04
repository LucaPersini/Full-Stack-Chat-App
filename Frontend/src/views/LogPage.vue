<script>
import { ref } from 'vue';
import axios from 'axios'
import { useRouter } from 'vue-router';
import config from '../config'

export default {
  name: 'LogPage',
  setup() {
    const router = useRouter()
    let isRegistrationNeeded = ref(false)
    let errorMessage = ref('')
    let accountCreated = ref(false)
    let username = ref('')
    let password = ref('')

    const ChangeAction = function() {
      errorMessage.value = ''
      isRegistrationNeeded.value = !isRegistrationNeeded.value
      username.value = ''
      password.value = ''
    }

    const Login = async function(e) {
      e.preventDefault()
      const user = {
        username: username.value,
        password: password.value
      }
      try {
        const result = await axios.post(`${config.API_DOMAIN}/api/login`, user)
        if(result.data.status == 'ok') 
        {
          sessionStorage.setItem('token', result.data.token)
          router.push('/home')
        } else {
          errorMessage.value = result.data.error
        }
      }
      catch (error) {
        console.log(error)
        errorMessage.value = 'Something went wrong!'
      }
    }

    const Register = async function(e) {
      e.preventDefault()
      const user = {
        username: username.value,
        password: password.value
      }
      try {
        const result = await axios.post(`${config.API_DOMAIN}/api/register`, user)
        if(result.data.status == 'ok') {
          accountCreated.value = true
          username.value = ''
          password.value = ''
        } else if( result.data.status == 'error') {
          errorMessage.value = result.data.error
        }
      }
      catch (error) {
        errorMessage.value = 'Something went wrong!'
      }
    }

    return {
      isRegistrationNeeded,
      ChangeAction,
      Login,
      Register,
      errorMessage,
      accountCreated,
      username,
      password
    }
  }
}
</script>

<template>
  <div class="container bg-white m-auto flex flex-col justify-center rounded-lg shadow-md w-11/12 p-6 lg:w-2/6 md:py-10 md:px-20">
    <div v-if="accountCreated == false">
      <form class="flex flex-col">
        <input v-model="username" id="username" type="text" placeholder="Username" class="w-full m-auto my-2 md:my-3 p-2 bg-slate-100 border-2 border-slate-300 focus:outline-none rounded-sm">
        <input v-model="password"  id="password" type="password" placeholder="Password" class="w-full m-auto my-2 md:my-3 p-2 bg-slate-100 border-2 border-slate-300 focus:outline-none rounded-sm">
        <div v-if="!isRegistrationNeeded">
          <button @click="Login" class="w-full m-auto my-2 md:my-3 py-2 bg-slate-900 text-white active:bg-slate-600 rounded-sm">
            Login
          </button>
        </div>
        <div v-else>
          <button @click="Register" class="w-full m-auto my-2 md:my-3 py-2 bg-slate-900 text-white active:bg-slate-600 rounded-sm">
            Register
          </button>
        </div>
        <p class="text-red-600 text-sm mx-auto mt-2">{{ errorMessage }}</p>
        <div v-if="!isRegistrationNeeded" class="m-auto">
          <p @click="ChangeAction" class="text-sm md:text-md m-auto mt-2 md:mt-5 text-slate-500 hover:text-slate-900 hover:underline hover:cursor-pointer">Don't have an account? Create one.</p>
        </div>
        <div v-else class="m-auto">
          <p @click="ChangeAction" class="text-sm md:text-md m-auto mt-2 md:mt-5 text-slate-500 hover:text-slate-900 hover:underline hover:cursor-pointer">Already have an account? Log in.</p>
        </div>
      </form>
    </div>
    <div v-else="accountCreated == true" class="flex justify-center">
      <p class="text-center">Account created successfully! <br> Now you can <span class="underline hover:cursor-pointer" @click="accountCreated = false; isRegistrationNeeded = false">Log In.</span></p>
    </div>
  </div>
  
</template>