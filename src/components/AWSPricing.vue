<template>
  <div>
    <b-row class="m-3">
      <b-col>
        <b-input-group prepend="AWS Access Key">
          <b-form-input
            type="text"
            name="aws-accesskey"
            v-model="aws.accessKey"
            placeholder="Enter AWS access key id"
          ></b-form-input>
        </b-input-group>
      </b-col>
      <b-col>
        <b-input-group prepend="AWS Secret">
          <b-form-input
            type="password"
            name="aws-secret"
            v-model="aws.secret"
            placeholder="Enter AWS secret access key"
          ></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row class="m-3">
      <b-col>
        <b-input-group class="mb-3">
          <b-dropdown text="Region" variant="primary" slot="prepend">
            <b-dropdown-item @click="region = 'us-east-1'"
              >us-east-1</b-dropdown-item
            >
            <b-dropdown-item @click="region = 'ap-south-1'"
              >ap-south-1</b-dropdown-item
            >
          </b-dropdown>
          <b-form-input
            readonly
            :value="this.pricing.endpoint.href"
          ></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row class="text-center m-3">
      <b-col>
        <b-button variant="outline-primary" @click="describeServices"
          >Describe services</b-button
        >
        <b-alert :show="this.alert != ''" variant="danger" class="my-3">{{
          alert
        }}</b-alert>
      </b-col>
    </b-row>
    <b-row class="m-3">
      <b-col>
        <h5 v-if="services.length > 0">
          ServiceCode
          <b-badge variant="primary" pill>{{
            services.length === 100 ? services.length + "+" : services.length
          }}</b-badge>
        </h5>
        <b-list-group class="my-2">
          <b-list-group-item
            href="#"
            v-for="(service, id) in services"
            :key="id"
            :active="id === activeService"
            @click="activeService = id"
          >
            {{ service.ServiceCode }}
            <b-badge variant="primary" pill>{{
              service.AttributeNames.length
            }}</b-badge>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <h5 v-if="services.length > 0">
          AttributeName
          <b-badge variant="primary" pill>{{
            (services[activeService] || {}).AttributeNames.length
          }}</b-badge>
        </h5>
        <b-list-group class="my-2">
          <b-list-group-item
            href="#"
            v-for="(attribute, id) in (services[activeService] || {})
              .AttributeNames"
            :key="id"
            :active="id === activeAttribute"
            @click="
              activeAttribute = id
              getAttributeValues(service, attribute)
            "
          >
            {{ attribute }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <h5 v-if="activeAttributeValues.length > 0">
          AttributeValue
          <b-badge variant="primary" pill>{{
            activeAttributeValues.length === 100
              ? activeAttributeValues.length + "+"
              : activeAttributeValues.length
          }}</b-badge>
        </h5>
        <b-list-group class="my-2">
          <b-list-group-item
            href="#"
            v-for="(value, id) in activeAttributeValues"
            :key="id"
            :active="id === activeValue"
            @click="
              activeValue = id
              getProducts(service, attributeName, value.Value)
            "
          >
            {{ value.Value }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
    <b-row class="m-3">
      <b-col>
        <h5 v-if="products.length > 0">
          Products
          <b-badge variant="primary" pill>{{
            products.length === 100 ? products.length + "+" : products.length
          }}</b-badge>
        </h5>
        <b-list-group class="my-2 small">
          <b-list-group-item
            href="#"
            v-for="(product, id) in products"
            :key="id"
            :active="id === activeProduct"
            @click="activeProduct = id"
          >
            <span style="white-space: pre;">{{ product.product }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <h5 v-if="products.length > 0">Terms</h5>
        <b-list-group
          v-for="(term, id) in product.terms"
          :key="id"
          class="my-2 small"
        >
          <b-list-group-item variant="secondary"
            >{{ id }}
            <b-badge variant="primary" pill>{{
              Object.keys(term).length
            }}</b-badge>
          </b-list-group-item>
          <b-list-group-item>
            <span style="white-space: pre;">{{ term }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
/* eslint-disable no-console */
import AWS from "aws-sdk/global"
import "aws-sdk/clients/pricing"

export default {
  name: "AWSPricing",
  data() {
    return {
      alert: "",
      aws: {
        accessKey: "",
        secret: ""
      },
      region: "us-east-1",
      services: [],
      activeAttribute: null,
      activeAttributeValues: [],
      activeProduct: null,
      activeService: 0,
      activeValue: null,
      products: []
    }
  },
  computed: {
    pricing() {
      return new AWS.Pricing({
        accessKeyId: this.aws.accessKey,
        secretAccessKey: this.aws.secret,
        region: this.region
      })
    },
    product() {
      return this.products[this.activeProduct] || {}
    },
    service() {
      return (this.services[this.activeService] || {}).ServiceCode
    },
    attributeName() {
      return (this.services[this.activeService] || {}).AttributeNames[
        this.activeAttribute
      ]
    }
  },
  methods: {
    describeServices() {
      this.alert = ""
      this.activeService = 0
      this.activeAttribute = null
      this.activeAttributeValues = []
      const params = {
        FormatVersion: "aws_v1"
        // ServiceCode: "AmazonRDS"
      }
      this.pricing.describeServices(params, (err, data) => {
        if (err) {
          this.alert = err.message
        } else {
          this.services = data.Services
        }
      })
    },
    getAttributeValues(serviceCode, attributeName) {
      const params = {
        AttributeName: attributeName,
        ServiceCode: serviceCode
      }
      this.pricing.getAttributeValues(params, (err, data) => {
        if (err) {
          console.error(err, err.stack)
        } else {
          this.activeAttributeValues = data.AttributeValues
        }
      })
    },
    getProducts(serviceCode, attributeName, attributeValue) {
      const params = {
        FormatVersion: "aws_v1",
        ServiceCode: serviceCode,
        Filters: [
          {
            Type: "TERM_MATCH",
            Field: attributeName,
            Value: attributeValue
          }
        ]
      }
      this.pricing.getProducts(params, (err, data) => {
        if (err) {
          console.error(err, err.stack)
        } else {
          console.debug(data)
          this.products = data.PriceList
        }
      })
    }
  }
}
</script>

<style>
.list-group {
  max-height: 500px;
  margin-bottom: 10px;
  overflow: scroll;
}
</style>
