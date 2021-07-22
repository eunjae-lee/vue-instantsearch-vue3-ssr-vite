import InstantSearch, {
  createServerRootMixin,
} from 'vue-instantsearch/dist/vue3/es'
import algoliasearch from 'algoliasearch/lite'
import { createSSRApp, h } from 'vue'

import App from './App.vue'
import { createRouter } from './router'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const searchClient = algoliasearch(
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  )

  let resultsState

  const app = createSSRApp({
    mixins: [
      createServerRootMixin({
        searchClient,
        indexName: 'instant_search',
      }),
    ],
    async serverPrefetch() {
      resultsState = await this.instantsearch.findResultsState(this)
      return resultsState
    },
    beforeMount() {
      if (typeof window === 'object' && window.__ALGOLIA_STATE__) {
        this.instantsearch.hydrate(window.__ALGOLIA_STATE__)
        delete window.__ALGOLIA_STATE__
      }
    },
    render: () => h(App),
  })
  const router = createRouter()
  // app.use(InstantSearch)
  app.use(router)
  return { app, router, getResultsState: () => resultsState }
}
