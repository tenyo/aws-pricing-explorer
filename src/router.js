import Vue from "vue"
import Router from "vue-router"
import AWSPricing from "@/components/AWSPricing.vue"

Vue.use(Router)

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: AWSPricing
    }
  ]
})
