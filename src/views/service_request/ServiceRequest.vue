<script>
    import { defineComponent } from 'vue'
    import navBar from '@/components/UIElements/navBar.vue'
    import footerComponant from '@/components/UIElements/footerComponant.vue'
    import confirmation from '@/assets/service_confirmation.jpeg'
    import evaluation from '@/assets/service_evaluation.jpeg'
    import demolition from '@/assets/service_demolition.jpeg'
    import other from '@/assets/service_other.jpeg'
    import { useRouter } from 'vue-router'

    export default defineComponent({
        components: {
            navBar,
            footerComponant
        },
        setup() {
            const router = useRouter()

            const options = [
                { id: 1, label: 'confirmation', image: confirmation },
                { id: 2, label: 'evaluation', image: evaluation },
                { id: 3, label: 'demolition', image: demolition },
                { id: 4, label: 'other', image: other }
            ]

            const selectOption = (id) => {
                if (id === 1) {
                    router.push({ name: 'ServiceRequestConfirmation', query: { tab: 'service_request' } })
                } else if (id === 2) {
                    router.push({ name: 'ServiceRequestEvaluation', query: { tab: 'service_request' } })
                } else if (id === 3) {
                    router.push({ name: 'ServiceRequestDemolition', query: { tab: 'service_request' } })
                } else {
                    router.push({ name: 'marketplace', query: { tab: 'service' } })
                }
            }

            return {
                options,
                selectOption
            }
        }
    })
</script>

<template>
  <div class="app-container">
    <navBar />
    <main class="main-container">
        <div class="content-wrapper">
            <div class="selections-grid">
                <div 
                    v-for="option in options" 
                    :key="option.id"
                    class="selection-card"
                    @click="selectOption(option.id)">
                    <div class="selection-image">
                        <img :src="option.image" :alt="$t('service_request.' + option.label)" />
                    </div>
                    <div class="selection-label">{{ $t('service_request.' + option.label) }}</div>
                </div>
            </div>
        </div>
    </main>
    <footerComponant />
  </div>
</template>

<style scoped>
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .main-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
    }

    .content-wrapper {
        max-width: 1200px;
        width: 100%;
        text-align: center;
    }

    .page-title {
        color: #2c3e50;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .selections-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .selection-card {
        background: white;
        border-radius: 20px;
        padding-bottom: 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: 3px solid transparent;
        position: relative;
        overflow: hidden;
    }

    .selection-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }

    .selection-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        border-color: #16b277;
    }

    .selection-card:hover::before {
        opacity: 0.1;
    }

    .selection-card.selected {
        color: white;
        transform: scale(1.05);
    }

    .selection-card.selected::before {
        opacity: 0;
    }

    .selection-image {
        margin-bottom: 1rem;
        text-align: center;
        text-align: -webkit-center;
    }

    .selection-image img {
        width: 70%;
        height: 8rem;
        object-fit: fill;
        transition: transform 0.3s ease;
    }

    .selection-card:hover .selection-image img {
        transform: scale(1.1);
    }

    .selection-card.selected .selection-image img {
        filter: brightness(1.2);
    }

    .selection-label {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
    }

    .selection-card.selected .selection-label {
        color: white;
    }

    @media (max-width: 1200px) {
        .selection-image img {
            width: 60%;
        }
        .main-container {
            flex-direction: column;
        }
        
        .selections-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .main-container {
            padding: 1rem;
        }
        
        .page-title {
            font-size: 2rem;
            margin-bottom: 2rem;
        }
        
        .selections-grid {
            gap: 1.5rem;
        }
        
        .selection-card {
            padding-bottom: 1.5rem;
        }
        
        .selection-label {
            font-size: 0.8rem;
        }

        .selection-image img {
            width: 50%;
        }
    }
</style>

