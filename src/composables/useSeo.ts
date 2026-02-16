import { ref, watch } from 'vue'

interface SeoOptions {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  canonical?: string
}

const defaultOptions: SeoOptions = {
  title: 'Wocon - Interactive Travel Planning and Discovery Platform',
  description: 'Wocon is an interactive travel planning and discovery platform that helps you explore the world, plan trips, and connect with fellow travelers.',
  keywords: ['travel', 'trip planning', 'travel discovery', 'world map', 'travel connections', 'travel platform'],
  image: '/woconlogo.png',
  canonical: 'https://www.woconapp.com/'
}

const currentOptions = ref<SeoOptions>({ ...defaultOptions })

export function useSeo(options: SeoOptions = defaultOptions) {
  // Update current options
  currentOptions.value = { ...defaultOptions, ...options }

  // Update document title
  const updateTitle = (title: string) => {
    document.title = title
  }

  // Update meta tags
  const updateMetaTags = (seoOptions: SeoOptions) => {
    // Update description
    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', seoOptions.description || defaultOptions.description!)
    }

    // Update keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
      const keywords = seoOptions.keywords || defaultOptions.keywords
      keywordsMeta.setAttribute('content', keywords.join(', '))
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', seoOptions.canonical || defaultOptions.canonical!)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', seoOptions.title)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', seoOptions.description || defaultOptions.description!)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', seoOptions.canonical || defaultOptions.canonical!)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', seoOptions.image || defaultOptions.image!)
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seoOptions.title)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seoOptions.description || defaultOptions.description!)
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', seoOptions.image || defaultOptions.image!)
    }
  }

  // Initial update
  updateTitle(currentOptions.value.title)
  updateMetaTags(currentOptions.value)

  // Watch for changes
  watch(
    currentOptions,
    (newOptions) => {
      updateTitle(newOptions.title)
      updateMetaTags(newOptions)
    },
    { deep: true }
  )

  // Update function to allow dynamic changes
  const updateSeo = (newOptions: Partial<SeoOptions>) => {
    currentOptions.value = { ...currentOptions.value, ...newOptions }
  }

  return {
    updateSeo,
    currentOptions
  }
}
