<script lang="ts">
import { defineComponent } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import UpdatePassword from '@/components/modals/UpdatePassword.vue'
import DeleteAccount from '@/components/modals/DeleteAccount.vue'
import UploadFile from '@/components/UIElements/UploadFile.vue'
import SuccessMessage from '@/components/modals/SuccessMessage.vue'
import inputField from '@/components/UIElements/inputField.vue'
import MainBtn from '@/components/UIElements/MainBtn.vue'
import { Camera, CameraResultType } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

export default defineComponent({
  components: {
    UpdatePassword,
    DeleteAccount,
    UploadFile,
    SuccessMessage,
    inputField,
    MainBtn
  },
  setup() {
    return { v$: useVuelidate() }
  },

  data() {
    return {
      name: this.$userStore.state.user?.name,
      contactNumber: this.$userStore.state.user?.contact_number,
      email: this.$userStore.state.user?.email,
      showUpdatePassword: false,
      showDeleteAccount: false,
      showSuccessMessage: false,
      validateContact: {},
      emailError: null,
      contactError: null
    }
  },
  computed: {
    changed() {
      return (
        this.name !== this.$userStore.state.user?.name ||
        this.contactNumber !== this.$userStore.state.user?.contact_number ||
        this.email !== this.$userStore.state.user?.email
      )
    },
    isMobile() {
      return Capacitor.getPlatform() !== 'web';
    }
  },

  validations() {
    return {
      name: {
        required: helpers.withMessage(() => this.$t('validations.requiredField'), required),
        minLength: helpers.withMessage(
          () => this.$t('validations.minLength', { min: 3 }),
          minLength(3)
        )
      },
      email: {
        required: helpers.withMessage(() => this.$t('validations.requiredField'), required),
        email: helpers.withMessage(() => this.$t('validations.email'), email)
      },
      contactNumber: {
        required: helpers.withMessage(() => this.$t('validations.requiredField'), required)
      }
    }
  },
  methods: {
    handleUpdate(field, value) {
      this[field] = value
    },
    validateContactUpdate() {
      if (this.validateContact == {} || this.validateContact === null) {
        this.contactError = null
        return
      }
      this.contactError =
        this.validateContact.valid && this.validateContact.possible
          ? null
          : this.$t('validations.invalidPhoneNumber')
    },
    handlePatchUser() {
      if (!this.changed) {
        console.log('No changes')
        return
      }
      this.v$.name.$touch()
      this.v$.email.$touch()
      this.v$.contactNumber.$touch()
      if (
        this.contactNumber !== null ||
        this.contactNumber !== undefined ||
        this.contactNumber !== ''
      ) {
        this.validateContactUpdate()
      }
      if (
        this.v$.name.$invalid ||
        this.v$.email.$invalid ||
        this.v$.contactNumber.$invalid ||
        this.contactError ||
        this.emailError
      ) {
        return
      }
      const contactNumber = this.validateContact.number
      const user = {}
      if (this.name !== this.$userStore.state.user?.name) {
        user.name = this.name
      }
      if (contactNumber !== this.$userStore.state.user?.contact_number) {
        user.contact_number = contactNumber
      }
      if (this.email !== this.$userStore.state.user?.email) {
        user.email = this.email
      }
      this.$userStore
        .dispatch('patchUser', { user })
        .then(() => {
          this.showSuccessMessage = true
          console.log('User updated')
        })
        .catch(() => {
          console.error('Failed to update user')
        })
    },
    async uploadImage(file: File) {
      console.log('Uploading', file)

      // Create a FormData object
      const formData = new FormData()
      formData.append('image', file)

      try {
        // Send the FormData object in the request body
        const response = await this.$axios.patch('/api/users/me/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.$userStore.commit('setUser', response.data || {})
        console.log('Upload successful:', response.data)
      } catch (error) {
        console.error('Error in uploadImage:', error)
      }
    },
    async takePhoto() {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.Uri,
          source: 'CAMERA'
        });
        console.log('Photo taken:', photo.webPath);
        // يمكنك هنا إرسال الصورة مباشرة إلى الخادم إن أردت
        await this.uploadBase64Image(photo.webPath); // مثال
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    },
    async selectFromGallery() {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.Uri,
          source: 'PHOTOS', // ← هذا يفتح معرض الصور بدل الكاميرا
          correctOrientation: true
        });

        console.log('Selected from gallery:', photo.webPath);

        // تحويل الصورة إلى ملف وإرسالها للخادم
        await this.uploadBase64Image(photo);
      } catch (error) {
        console.error('Error selecting image from gallery:', error);
      }
    },
    async uploadBase64Image(webPath: string) {
      // تحويل الرابط base64 إلى ملف وإرساله
      const response = await fetch(webPath);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await this.$axios.patch('/api/users/me/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.$userStore.commit('setUser', res.data || {});
        console.log('Mobile upload successful:', res.data);
      } catch (err) {
        console.error('Error uploading mobile image:', err);
      }
    }
  }
})
</script>

<template>
  <UpdatePassword :show="showUpdatePassword" @close="showUpdatePassword = false" />
  <DeleteAccount :show="showDeleteAccount" @close="showDeleteAccount = false" />
  <SuccessMessage :show="showSuccessMessage" @close="showSuccessMessage = false" class="succees" />

  <div class="settings-page">
    <!-- Header -->
    <div class="item-group header">
      <div class="item-title-group">
        <div class="header">{{ $t('settings.header') }}</div>
        <div class="sub-header">{{ $t('settings.subHeader') }}</div>
      </div>
    </div>

    <!-- Business Logo -->
    <div class="item-group row logo">
      <div class="item-title-group">
        <div class="title">{{ $t('settings.businessLogo') }}</div>
        <div class="sub-title">{{ $t('settings.businessLogoSubTitle') }}</div>
      </div>

      <div class="profile-image-wrapper">
        <div class="profile-image">
          <img
            :src="$userStore.state.user?.image"
            :alt="$t('settings.businessLogoAlt')"
            v-if="$userStore.state.user?.image"
          />
          <div class="no_logo" v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
                stroke="#6D6D6D"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <!-- <img src="https://via.placeholder.com/150" :alt="$t('settings.businessLogoAlt')"  /> -->
        </div>
        <template v-if="isMobile">
          <button class="upload-image-logo" @click="takePhoto">
            <img src="@/assets/svg-icons/camera-plus.svg?url" />
          </button>
          <button class="upload-image-logo" @click="selectFromGallery">
            <img src="@/assets/svg-icons/cloud.svg?url" />
          </button>
        </template>

        <template v-else>
          <UploadFile :type="['.svg', '.png', '.jpg', '.gif']" @file="uploadImage">
            <div class="upload-image-logo">
              <img src="@/assets/svg-icons/cloud.svg?url" />
            </div>
          </UploadFile>
        </template>
      </div>
    </div>

    <div class="info-container">
      <div class="inputs-wrapper">
        <inputField
          type="text"
          :label="$t('settings.businessDisplayName')"
          :error="v$.name.$errors[0]?.$message"
          :placeholder="$t('settings.emailAddressPlaceholder')"
          :value="name"
          @update="handleUpdate('name', $event)"
        />

        <inputField
          :label="$t('auth.email')"
          :error="v$.email.$errors[0]?.$message || emailError"
          :value="email"
          @update="handleUpdate('email', $event)"
          type="email"
          :placeholder="$t('auth.email')"
          required
        />

        <inputField
          type="phone"
          :label="$t('settings.contactNumber')"
          :placeholder="$t('settings.contactNumberPlaceholder')"
          :value="contactNumber"
          :error="v$.contactNumber.$errors[0]?.$message || contactError"
          @update="handleUpdate('contactNumber', $event)"
          @validate="validateContact = $event"
        />
      </div>

      <mainBtn :disabled="!changed" type="green" @click="handlePatchUser">
        {{ $t('settings.saveChanges') }}
      </mainBtn>
    </div>

    <div class="divider"></div>

    <!-- Business Password -->
    <div class="item-group btn-group">
      <MainBtn type="white" @click="showUpdatePassword = true">{{
        $t('settings.changePassword')
      }}</MainBtn>
    </div>

    <div class="item-group row delete">
      <div class="item-title-group">
        <div class="title">{{ $t('settings.deleteAccount') }}</div>
        <div class="sub-title">{{ $t('settings.deleteAccountSubTitle') }}</div>
      </div>

      <div class="btn-group">
        <MainBtn type="delete" @click="showDeleteAccount = true">
          <img src="@/assets/svg-icons/trash.svg?url" />
          {{ $t('settings.deleteAccount') }}
        </MainBtn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 480px;
  margin-bottom: 24.5px;
}

.inputs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-image-wrapper {
  display: flex;
  align-items: center;
  gap: 40px;
}

.upload-container {
  width: 100%;
  max-width: 421px;
}

.settings-page {
  display: flex;
  flex-direction: column;
}

.item-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: space-between;
}

.item-group.header {
  padding-bottom: 18px;
  margin-bottom: 24.5px;
  border-bottom: 0.8px solid var(--Dark-100, #e7e7e7);
}

.item-group.row {
  flex-direction: row;
  align-items: center;
}

.item-group.row.logo {
  max-width: 994px;
}

.item-group.row.delete {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0px 0px 24px -8px rgba(0, 0, 0, 0.25);
  padding: 16px;
  margin-top: 90px;
}

.item-group.btn-group {
  display: flex;
  padding-top: 24.5px;
  width: 100%;
  max-width: 480px;
}

.item-title-group {
  display: flex;
  flex-direction: column;
}

.header {
  color: var(--Dark-950, #121212);
  font-size: 20px;
  font-weight: 600;
  line-height: 30px;
}

.sub-header {
  color: var(--Dark-700, #4f4f4f);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.title {
  color: var(--Dark-950, #121212);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.sub-title {
  color: var(--Dark-700, #4f4f4f);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.divider {
  height: 1px;
  background-color: var(--Gray-200, #eaecf0);
}

.item-content-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.item-content-group-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.btn-group {
  display: flex;
  width: fit-content;
}

.profile-image {
  display: flex;
  flex-shrink: 0;
  width: 127px;
  height: 127px;
  border-radius: 50%;
  border: 0.75px solid var(--Dark-950, #e7e7e7);
  padding: 4px;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.upload-image-logo {
  padding: 0.625rem;
  border: 1px solid #d9d9d9;
  display: flex;
  border-radius: 8px;
  margin-bottom: 12px;
}

.delete-account {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  color: var(--error, #f04438);
}

@media (max-width: 1116px) {
  .item-group.row.logo {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
}
.no_logo {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.no_logo svg {
  width: 50px;
  height: 50px;
}
</style>

<style>
.succees .modal {
  max-width: 50%;
  min-height: 25%;
}
</style>
