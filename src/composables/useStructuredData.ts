import { ref, watch } from 'vue'

interface OrganizationData {
  name: string
  url: string
  logo: string
  description: string
  contactPoint: {
    type: string
    telephone?: string
    email: string
    contactType: string
  }
  sameAs?: string[]
}

interface WebSiteData {
  name: string
  url: string
  description: string
  potentialAction?: {
    type: string
    target: string
    queryInput: {
      type: string
      name: string
    }
  }
}

interface WebPageData {
  name: string
  url: string
  description: string
  datePublished?: string
  dateModified?: string
  author?: {
    type: string
    name: string
  }
  publisher?: {
    type: string
    name: string
    logo: {
      type: string
      url: string
      width: number
      height: number
    }
  }
  breadcrumb?: {
    type: string
    itemListElement: {
      type: string
      position: number
      name: string
      item: string
    }[]
  }
}

interface StructuredData {
  organization?: OrganizationData
  website?: WebSiteData
  webpage?: WebPageData
}

const defaultOrganization: OrganizationData = {
  name: 'Wocon',
  url: 'https://www.woconapp.com/',
  logo: 'https://www.woconapp.com/woconlogo.png',
  description: 'Wocon is an interactive travel planning and discovery platform that helps you explore the world, plan trips, and connect with fellow travelers.',
  contactPoint: {
    type: 'ContactPoint',
    email: 'zhaoceaser@gmail.com',
    contactType: 'Customer Support'
  },
  sameAs: [
    'https://github.com/Wocon-org',
    'https://discord.gg/K8WApyWa'
  ]
}

const defaultWebsite: WebSiteData = {
  name: 'Wocon',
  url: 'https://www.woconapp.com/',
  description: 'Wocon is an interactive travel planning and discovery platform that helps you explore the world, plan trips, and connect with fellow travelers.',
  potentialAction: {
    type: 'SearchAction',
    target: 'https://www.woconapp.com/api/search/cities?q={search_term_string}',
    queryInput: {
      type: 'EntryPoint',
      name: 'search_term_string'
    }
  }
}

const defaultWebpage: WebPageData = {
  name: 'Wocon - Interactive Travel Planning and Discovery Platform',
  url: 'https://www.woconapp.com/',
  description: 'Wocon is an interactive travel planning and discovery platform that helps you explore the world, plan trips, and connect with fellow travelers.'
}

const currentData = ref<StructuredData>({
  organization: defaultOrganization,
  website: defaultWebsite,
  webpage: defaultWebpage
})

export function useStructuredData(data: StructuredData = {}) {
  // Update current data
  currentData.value = {
    organization: data.organization || defaultOrganization,
    website: data.website || defaultWebsite,
    webpage: data.webpage || defaultWebpage
  }

  // Generate structured data script
  const generateStructuredData = (structuredData: StructuredData) => {
    const items = []

    if (structuredData.organization) {
      items.push({
        '@type': 'Organization',
        ...structuredData.organization
      })
    }

    if (structuredData.website) {
      items.push({
        '@type': 'WebSite',
        ...structuredData.website
      })
    }

    if (structuredData.webpage) {
      items.push({
        '@type': 'WebPage',
        ...structuredData.webpage
      })
    }

    return {
      '@context': 'https://schema.org',
      '@graph': items
    }
  }

  // Update structured data in document
  const updateStructuredData = (structuredData: StructuredData) => {
    // Remove existing script if it exists
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Create new script
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(generateStructuredData(structuredData))
    document.head.appendChild(script)
  }

  // Initial update
  updateStructuredData(currentData.value)

  // Watch for changes
  watch(
    currentData,
    (newData) => {
      updateStructuredData(newData)
    },
    { deep: true }
  )

  // Update function to allow dynamic changes
  const updateStructuredDataValue = (newData: StructuredData) => {
    currentData.value = {
      organization: newData.organization || currentData.value.organization,
      website: newData.website || currentData.value.website,
      webpage: newData.webpage || currentData.value.webpage
    }
  }

  return {
    updateStructuredData: updateStructuredDataValue,
    currentData
  }
}
