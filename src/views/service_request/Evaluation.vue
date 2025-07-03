<template>
  <div class="app-container">
    <navBar />
    <main class="main-container">
      <router-link class="btn-back" :to="{ name: 'ServiceRequest', query: { tab: 'service_request' } }" :style="$t('auth.lang') == 'en' ? 'float:left;' : 'float:right;'">
        <img v-if="$t('auth.lang') == 'en'" src="@/assets/svg-icons/chevron-left.svg?url" alt="image" style="display: inline; padding: 5px; float:left;"/>
        <img v-if="$t('auth.lang') == 'ar'" src="@/assets/svg-icons/chevron-right.svg?url" alt="image" style="display: inline; padding: 5px; float:right;"/>
        {{ $t('listings.back') }}
      </router-link>
      <h2 class="text-h1">{{ $t('service_request.evaluation') }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-row">
            <!-- اسم الشخص -->
            <div class="form-group half-width">
            <label for="personName">{{  $t('service_request.name') }} *</label>
            <input 
                type="text" 
                id="personName" 
                v-model="formData.personName"
                :class="{ 'error-input': errors.personName }"
                :placeholder="$t('service_request.placeholderName')"
                required
            />
            <div v-if="errors.personName" class="error">{{ errors.personName }}</div>
            </div>

            <!-- رقم الجوال -->
            <div class="form-group half-width">
            <label for="phoneNumber">{{  $t('service_request.phone') }} *</label>
            <input 
                type="tel" 
                id="phoneNumber" 
                v-model="formData.phoneNumber"
                :class="{ 'error-input': errors.phoneNumber }"
                :placeholder="$t('service_request.placeholderPhone')"
                required
            />
            <div v-if="errors.phoneNumber" class="error">{{ errors.phoneNumber }}</div>
            </div>
        </div>

        <!-- خريطة Google مع بحث -->
        <div class="form-group">
          <label>{{  $t('service_request.searchMap') }}</label>
          <div class="search-box">
            <img src="@/assets/svg-icons/gSearch.svg?url" :alt="$t('service_request.search')" class="icon" />
            <input id="searchInput" type="search" :placeholder="$t('service_request.placeholderSearchMap')" />
          </div>
          <div id="map" class="map-container"></div>
          <!-- <div class="coordinates-display">
            <strong>الإحداثيات:</strong>
            <span>خط العرض: {{ formData.coordinates.lat || 'غير محدد' }}</span>
            <span>خط الطول: {{ formData.coordinates.lng || 'غير محدد' }}</span>
          </div> -->
        </div>

        <!-- تفاصيل العنوان -->
        <div class="form-row">
          <div class="form-group half-width">
            <label for="street">{{  $t('service_request.street') }} *</label>
            <input 
              type="text" 
              id="street" 
              v-model="formData.address.street"
              :class="{ 'error-input': errors.street }"
              :placeholder="$t('service_request.placeholderStreet')"
              required
            />
            <div v-if="errors.street" class="error">{{ errors.street }}</div>
          </div>

          <div class="form-group half-width">
            <label for="city">{{  $t('service_request.city') }} *</label>
            <input 
              type="text" 
              id="city" 
              v-model="formData.address.city"
              :class="{ 'error-input': errors.city }"
              :placeholder="$t('service_request.placeholderCity')"
              required
            />
            <div v-if="errors.city" class="error">{{ errors.city }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group half-width">
            <label for="region">{{  $t('service_request.region') }} *</label>
            <input 
              type="text" 
              id="region" 
              v-model="formData.address.region"
              :class="{ 'error-input': errors.region }"
              :placeholder="$t('service_request.placeholderRegion')"
              required
            />
            <div v-if="errors.region" class="error">{{ errors.region }}</div>
          </div>

          <div class="form-group half-width">
            <label for="country">{{  $t('service_request.country') }} *</label>
            <input 
              type="text" 
              id="country" 
              v-model="formData.address.country"
              :class="{ 'error-input': errors.country }"
              :placeholder="$t('service_request.placeholderCountry')"
              required
            />
            <div v-if="errors.country" class="error">{{ errors.country }}</div>
          </div>
        </div>

        <!-- ملاحظات إضافية -->
        <div class="form-group">
          <label for="notes">{{  $t('service_request.notes') }}</label>
          <textarea 
            id="notes" 
            v-model="formData.notes"
            rows="3"
            :placeholder="$t('service_request.placeholderNotes')"
          ></textarea>
        </div>

        <!-- زر الإرسال -->
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? $t('service_request.sending') : $t('service_request.send') }}
        </button>

        <!-- رسالة النجاح -->
        <div v-if="showSuccess" class="success-message">
          <i class="fas fa-check-circle"></i> {{ $t('service_request.doneSend') }}
        </div>

      </form>
    </main>
  </div>
  <footerComponant />
</template>

<script>
    import navBar from '@/components/UIElements/navBar.vue'
    import footerComponant from '@/components/UIElements/footerComponant.vue'
    export default {
        components: {
            navBar,
            footerComponant
        },
        data() {
            return {
            map: null,
            marker: null,
            autocomplete: null,
            geocoder: null,
            isSubmitting: false,
            showSuccess: false,
            formData: {
                personName: '',
                phoneNumber: '',
                address: {
                street: '',
                city: '',
                region: '',
                country: ''
                },
                coordinates: {
                lat: null,
                lng: null
                },
                notes: ''
            },
            errors: {}
            }
        },
        methods: {
            initMap() {
                const defaultCenter = { lat: 26.420683, lng: 50.088794 }; // الدمام كموقع افتراضي
                
                this.map = new google.maps.Map(document.getElementById("map"), {
                    center: defaultCenter,
                    zoom: 12,
                    mapTypeId: 'roadmap',
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: false,
                    styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                    ]
                });

                this.marker = new google.maps.Marker({
                    map: this.map,
                    position: defaultCenter,
                    draggable: true,
                    title: 'الموقع المحدد'
                });

                this.geocoder = new google.maps.Geocoder();

                this.map.addListener("click", (event) => {
                    this.placeMarker(event.latLng);
                });

                this.marker.addListener("dragend", (event) => {
                    this.updateFormCoordinates(event.latLng);
                    this.reverseGeocode(event.latLng.lat(), event.latLng.lng());
                });

                this.initAutocomplete();
            },

            initAutocomplete() {
                const input = document.getElementById("searchInput");
                this.autocomplete = new google.maps.places.Autocomplete(input, {
                    types: ['geocode'],
                    componentRestrictions: { country: 'sa' } // يمكن تغيير كود الدولة حسب الحاجة
                });

                this.autocomplete.addListener("place_changed", () => {
                    const place = this.autocomplete.getPlace();
                    
                    if (!place.geometry) {
                    alert("لا توجد تفاصيل متاحة للمكان المحدد");
                    return;
                    }

                    if (place.geometry.viewport) {
                    this.map.fitBounds(place.geometry.viewport);
                    } else {
                    this.map.setCenter(place.geometry.location);
                    this.map.setZoom(17);
                    }

                    this.placeMarker(place.geometry.location);
                    this.fillAddressFields(place);
                });
            },

            placeMarker(location) {
                this.marker.setPosition(location);
                this.map.setCenter(location);
                this.updateFormCoordinates(location);
                this.reverseGeocode(location.lat(), location.lng());
            },

            updateFormCoordinates(latLng) {
                this.formData.coordinates = {
                    lat: latLng.lat().toFixed(6),
                    lng: latLng.lng().toFixed(6)
                };
            },

            reverseGeocode(lat, lng) {
                this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === "OK" && results[0]) {
                    this.fillAddressFields(results[0]);
                    }
                });
            },

            fillAddressFields(place) {
                const address = {
                    street: '',
                    city: '',
                    region: '',
                    country: ''
                };

                place.address_components.forEach(component => {
                    if (component.types.includes('route')) {
                    address.street = component.long_name;
                    }
                    if (component.types.includes('locality')) {
                    address.city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                    address.region = component.long_name;
                    }
                    if (component.types.includes('country')) {
                    address.country = component.long_name;
                    }
                });

                this.formData.address = address;
            },

            validateForm() {
                this.errors = {};
                let isValid = true;

                if (!this.formData.personName.trim()) {
                    this.errors.personName = 'حقل مطلوب';
                    isValid = false;
                }

                if (!this.formData.phoneNumber.trim()) {
                    this.errors.phoneNumber = 'حقل مطلوب';
                    isValid = false;
                } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(this.formData.phoneNumber)) {
                    this.errors.phoneNumber = 'رقم غير صحيح';
                    isValid = false;
                }

                // التحقق من حقول العنوان
                ['street', 'city', 'region', 'country'].forEach(field => {
                    if (!this.formData.address[field].trim()) {
                    this.errors[field] = 'حقل مطلوب';
                    isValid = false;
                    }
                });

                return isValid;
            },

            async submitForm() {
                if (!this.validateForm()) return;

                this.isSubmitting = true;

                try {
                    // هنا يمكنك إضافة كود الإرسال إلى الخادم
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    this.showSuccess = true;
                    setTimeout(() => {
                    this.showSuccess = false;
                    // يمكنك إعادة تعيين النموذج هنا إذا لزم الأمر
                    // this.resetForm();
                    }, 3000);
                    
                    console.log('تم إرسال البيانات:', this.formData);
                } catch (error) {
                    console.error('حدث خطأ أثناء الإرسال:', error);
                } finally {
                    this.isSubmitting = false;
                }
            },

            resetForm() {
                this.formData = {
                    personName: '',
                    phoneNumber: '',
                    address: {
                    street: '',
                    city: '',
                    region: '',
                    country: ''
                    },
                    coordinates: {
                    lat: null,
                    lng: null
                    },
                    notes: ''
                };
                this.marker.setPosition({ lat: 24.7136, lng: 46.6753 });
                this.map.setCenter({ lat: 24.7136, lng: 46.6753 });
            }
        },
        mounted() {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD5WgoUQIKHcqKyVlXGsJdYp_umHzYoayg&libraries=places&language=ar&region=SA`;
            script.async = true;
            script.defer = true;
            script.onload = this.initMap;
            document.head.appendChild(script);

            // إضافة Font Awesome إذا لم يكن مضافًا مسبقًا
            if (!document.querySelector('#font-awesome')) {
            const fa = document.createElement('link');
            fa.id = 'font-awesome';
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fa);
            }
        }
    }
</script>

<style scoped>
    .main-container {
    background-color: #fff;
    max-width: 800px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    margin: 20px auto;
    padding: 25px;
    }

    form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    }

    .form-row {
    display: flex;
    gap: 15px;
    }

    .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    }

    .half-width {
    flex: 1;
    min-width: 48%;
    }

    label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
    }

    input[type="text"],
    input[type="tel"],
    input[type="search"],
    textarea {
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background-color: #f9f9f9;
        background: #fff;
    }

    input:focus,
    textarea:focus {
        /* border-color: #4a90e2; */
        outline: none;
        /* box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2); */
        background-color: #fff;
    }

    .map-container {
        height: 350px;
        width: 100%;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 10px;
    }

    .coordinates-display {
        margin-top: 10px;
        font-size: 0.9rem;
        color: #555;
        background-color: #f5f5f5;
        padding: 10px 12px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .search-box {
        display: flex;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 0 15px;
        background: #f9f9f9;
        width: 100%;
        transition: all 0.3s ease;
        background: #fff;
    }

    .search-box:focus-within {
        /* border-color: #4a90e2; */
        /* box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2); */
        background: #fff;
    }

    .search-box input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 1rem;
    padding: 12px 10px;
    background: transparent;
    }

    .icon {
    width: 18px;
    height: 18px;
    opacity: 0.6;
    margin-left: 10px;
    }

    .submit-btn,
    .location-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    }

    .location-btn {
        background-color: #34a853;
        color: white;
        align-self: flex-start;
    }

    .location-btn:hover {
    background-color: #2d9248;
    transform: translateY(-1px);
    }

    .submit-btn {
    background-color: #16b277;
    color: white;
    margin-top: 10px;
    }

    .submit-btn:hover:not(:disabled) {
    background-color: #16b277;
    transform: translateY(-1px);
    }

    .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    }

    .error {
    color: #d32f2f;
    font-size: 0.85rem;
    margin-top: -5px;
    }

    .error-input {
    border-color: #d32f2f !important;
    }

    .error-input:focus {
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.2) !important;
    }

    .success-message {
    color: #34a853;
    background-color: #f0f8f1;
    padding: 12px 15px;
    border-radius: 8px;
    font-weight: 600;
    margin-top: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 20px;
    }
    
    .half-width {
        width: 100%;
    }
    
    .main-container {
        padding: 15px;
        margin: 10px;
    }
    }
    .text-h1{
        text-align: center;
        font-weight: bold;
    }
    .btn-back {
        color: black;
    }
</style>