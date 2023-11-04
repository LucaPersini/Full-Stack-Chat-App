<script>
import { onBeforeMount, onMounted, ref } from 'vue'
import {useRouter} from  'vue-router'
import axios from 'axios'
import config from '../config'
import socket from '../socket/socket'
import Message from '../components/Message.vue'

export default {
  name: 'Home',
  components: {
    Message
  },
  setup() {
    const router = useRouter()
    let token = sessionStorage.getItem('token')
    let dataError = ref(false)
    let errorMessage = ref('')
    let username = ref('')
    let messages = ref([])
    let textMessage = ref('')
    let selectedIndex = ref('')
    let isVisible = ref(false)
    let isBannerVisible = ref(false)
    const headersConfig = ref({
      headers: {
        'Authorization': token
      }
    })

    const GetMessages = async function() {
      try {
        const result = await axios.get(`${config.API_DOMAIN}/api/messages`, headersConfig.value)
        if(result.data.status == 'error') {
          dataError.value = true
          errorMessage.value = result.data.error
          return
        }
        messages.value = result.data.messages
        username.value = result.data.user.user.username
      }
      catch (error) {
        dataError.value = true
        errorMessage.value = 'Something went wrong!'
      }
    }

    const GetDate = function() {
      const date = new Date()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      let fullDate = ''

      if(minutes < 10) {
        fullDate = `${hours}:0${minutes}, ${day}-${month}-${year}`
      }
      else {
        fullDate = `${hours}:${minutes}, ${day}-${month}-${year}`
      }

      return fullDate
    }

    const SendMessage = async function(e) {
      e.preventDefault()
      const message = {
        username: username.value,
        text: textMessage.value,
        date: GetDate(),
        token: token
      }
      
      try{
        const result = await axios.post(`${config.API_DOMAIN}/api/send-message`, message, headersConfig.value)
        if(result.data.status == 'error') {
          alert(result.data.error)
          textMessage.value = ''
        }

        textMessage.value = ''
        const newMessage = result.data.newMessage
        socket.emit('chat-message', newMessage)
      }
      catch (error) {
        console.log(error.message)
        textMessage.value = ''
      }

      ScrollToBottom()
    }

    const DeleteConfirmation = async function(index) {
      selectedIndex.value = index
    }

    const DeleteMessage = async function(id) {
      try{
        const result = await axios.delete(`${config.API_DOMAIN}/api/delete-message/${id}`, headersConfig.value)
        selectedIndex.value = ''
        if(result.data.status == 'ok') {
          socket.emit('delete-message', id)
        }
        else {
          alert(result.data.error)
        }
      }
      catch (error) {
        console.log(error.message)
      }

      ScrollToBottom()
    }

    const ShowMenu = function() {
      isVisible.value = !isVisible.value
    }

    const LogOut = function() {
      sessionStorage.removeItem('token')
      router.push('/')
      
    }

    const ShowBanner = function() {
      isBannerVisible.value = !isBannerVisible.value
    }

    const DeleteAccount = async function() {
      try {
        const result = await axios.delete(`${config.API_DOMAIN}/api/delete-account/${username.value}`, headersConfig.value)
        if (result.data.state == 'error') {
          alert(result.data.error)
        } else {
          alert('Your account has been deleted.')
          router.push('/')
          const messagesTodelete = result.data.messagesToDelete
          socket.emit('delete-messages', messagesTodelete)
        }
      }
      catch (error) {
        console.log(error.message)
      }
      
    }

    const ScrollToBottom = function() {
      const chat = document.querySelector('#chat')
      setTimeout(() => {
        chat.scrollTo(0, chat.scrollHeight)
      }, 2)
    }

    onBeforeMount(async () => {
      await GetMessages()
      ScrollToBottom()
    })

    onMounted(() => {
      socket.on('chat-message', (message) => {
        messages.value.push(message)
      })

      socket.on('delete-message', id => {
        messages.value = messages.value.filter(message => message._id !== id)
      })

      socket.on('delete-messages', messagesToDelete => {
        messages.value = messages.value.filter(message => !messagesToDelete.value.includes(message))
      })
    })

    return {
      dataError,
      errorMessage,
      username,
      messages,
      textMessage,
      SendMessage,
      DeleteConfirmation,
      selectedIndex,
      DeleteMessage,
      isVisible,
      ShowMenu,
      LogOut,
      isBannerVisible,
      ShowBanner,
      DeleteAccount
    }
  }
}
</script>

<template>
  <div class="flex justify-center w-full h-full">
    <div v-if="dataError" class="m-auto bg-white p-5 rounded-lg shadow-md">
      <p class="text-red-600 text-sm md:text-lg">{{ errorMessage }}</p>
    </div>
    <div v-else class="bg-white m-auto w-11/12 h-5/6 rounded-lg shadow-md flex flex-col align-center justify-center">
      <div class="relative bg-slate-900 rounded-t-lg text-white flex justify-between px-5 md:px-16 py-2 text-xl">
        <div>
          <p>{{ username }}</p>
        </div>
        <div>
          <button @click="ShowMenu" class="border-2 border-white px-3 rounded-full hover:cursor-pointer active:bg-slate-600">
            <i class="fa-solid fa-ellipsis-vertical rotate-90"></i>
          </button>
        </div>
        <div :class="{hidden: !isVisible}" class="flex flex-col bg-white text-slate-900 absolute top-11 right-6 md:right-16 shadow-md rounded-md">
          <button @click="LogOut" class="text-xs md:text-base py-1 px-2 hover:bg-slate-100 hover:rounded-t-md">
            Log Out
          </button>
          <div class="h-px bg-slate-600 w-5/6 m-auto"></div>
          <button @click="ShowBanner" class="text-xs md:text-base text-red-700 py-1 px-2 hover:bg-slate-100 hover:rounded-b-md">
            Delete account
          </bUtton>
        </div>
      </div>
      <div id="chat" class="overflow-y-scroll scrollbar-thin flex flex-col px-3 md:px-0 py-2 md:py-3 m-auto mt-4 h-5/6 w-11/12 bg-slate-200 rounded-lg">
        <div v-for="(message, index) in messages" class="mx-auto" :key="index">
          <div v-if="message.username == username" class="relative flex flex-col my-2">
            <div :id="message._id">
              <div v-if="selectedIndex == index" class="bg-slate-400 w-fit px-4 py-2 rounded-xl">
                <p class="my-2">Do you want to delete this message?</p>
                <div class="flex flex-row justify-center">
                  <button @click="DeleteMessage(message._id)" class="bg-red-700 rounded-md text-white px-2 py-1 m-1 active:bg-red-600" >Yes</button>
                  <button @click="selectedIndex = ''" class="bg-slate-800 rounded-md text-white px-2 py-1 m-1 active:bg-slate-600">No</button>
                </div>
              </div>
              <div v-else>
                <Message class="bg-slate-400 w-fit px-4 py-2 rounded-xl" user="You" :text="message.text" :date="message.date"/>
                <div class="bg-slate-200 w-fit rounded-full flex absolute -top-1 -right-1 border-2 border-slate-200">
                  <i @click="DeleteConfirmation(index)" class="fa-solid fa-circle-xmark text-red-700 hover:cursor-pointer active:text-red-600"></i>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="my-2">
            <Message class="bg-slate-800 text-white w-fit px-4 py-2 rounded-xl" :user="message.username" :text="message.text" :date="message.date"/>
          </div>
        </div>
      </div>
      <div class="m-auto my-4 w-11/12 bg-slate-900 flex flex-row justify-between rounded-md">
        <div class="w-full">
          <form>
            <input v-model="textMessage" @keydown.enter="SendMessage" type="text" class="bg-slate-900 w-full text-white px-3 py-1 rounded-s-md focus:outline-none text-sm">
          </form>
        </div>
        <div @click="SendMessage" class="w-fit flex px-4 border-l-2 border-white hover:cursor-pointer active:bg-slate-700 active:rounded-e-md">
          <i class="fa-solid fa-paper-plane text-white m-auto"></i>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isBannerVisible">
    <div class="h-screen w-screen fixed z-10 top-0 left-0 bg-black opacity-50"></div>
    <div class="bg-white w-fit h-fit z-20 fixed inset-0 m-auto px-3 py-2 rounded-md">
      <p class="text-sm md:text-base my-2">Do you want to delete this account?</p>
      <div class="flex flex-row justify-center">
        <button @click="DeleteAccount" class="text-sm md:text-base text-white bg-red-700 active:bg-red-600 rounded-sm px-2 py-1 m-2">Yes</button>
        <button @click="ShowBanner" class="text-sm md:text-base text-slate-900 px-2 py-1 m-2 hover:bg-slate-100 rounded-sm">No</button>
      </div>
    </div>
  </div>
</template>