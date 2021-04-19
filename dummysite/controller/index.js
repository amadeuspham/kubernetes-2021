const k8s = require('@kubernetes/client-node')
const mustache = require('mustache')
const request = require('request')
const JSONStream = require('json-stream')
const fs = require('fs').promises

// Use Kubernetes client to interact with Kubernetes

const kc = new k8s.KubeConfig();

process.env.NODE_ENV === 'development' ? kc.loadFromDefault() : kc.loadFromCluster()

const opts = {}
kc.applyToRequest(opts)

const client = kc.makeApiClient(k8s.CoreV1Api);

const sendRequestToApi = async (api, method = 'get', options = {}) => new Promise((resolve, reject) => request[method](`${kc.getCurrentCluster().server}${api}`, {...opts, ...options, headers: { ...options.headers, ...opts.headers }}, (err, res) => err ? reject(err) : resolve(JSON.parse(res.body))))

const fieldsFromDummySite = (object) => ({
  dummysite_name: object.metadata.name,
  container_name: object.metadata.name,
  deployment_name: `${object.metadata.name}-dep`,
  service_name: `${object.metadata.name}-service`,
  ingress_name: `${object.metadata.name}-ing`,
  service_port: 7777,
  namespace: object.metadata.namespace,
  image: object.spec.image,
  website_url: object.spec.website_url
})

const getDeploymentYAML = async (fields) => {
  const deploymentTemplate = await fs.readFile("deployment.mustache", "utf-8")
  return mustache.render(deploymentTemplate, fields)
}

const getServiceYAML = async (fields) => {
  const serviceTemplate = await fs.readFile("service.mustache", "utf-8")
  return mustache.render(serviceTemplate, fields)
}

const getIngressYAML = async (fields) => {
  const ingressTemplate = await fs.readFile("ingress.mustache", "utf-8")
  return mustache.render(ingressTemplate, fields)
}

const deploymentForDummysiteAlreadyExists = async (fields) => {
  const { dummysite_name, namespace } = fields
  const { items } = await sendRequestToApi(`/apis/apps/v1/namespaces/${namespace}/deployments`)

  return items.find(item => {
    if (item.metadata.labels) {
      item.metadata.labels.dummysite === dummysite_name
    }
    return false
  })
}

const createDeployment = async (fields) => {
  console.log('New deployment for dummysite', fields.dummysite_name, 'to namespace', fields.namespace)

  const yaml = await getDeploymentYAML(fields)

  return sendRequestToApi(`/apis/apps/v1/namespaces/${fields.namespace}/deployments`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  })
}

const createService = async (fields) => {
  console.log('New service for dummysite', fields.dummysite_name, 'to namespace', fields.namespace)

  const yaml = await getServiceYAML(fields)

  return sendRequestToApi(`/api/v1/namespaces/${fields.namespace}/services`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  })
}

const createIngress = async (fields) => {
  console.log('New ingress for dummysite', fields.dummysite_name, 'to namespace', fields.namespace)

  const yaml = await getIngressYAML(fields)

  return sendRequestToApi(`/apis/extensions/v1beta1/namespaces/${fields.namespace}/ingresses`, 'post', {
    headers: {
      'Content-Type': 'application/yaml'
    },
    body: yaml
  })
}

const removeDeployment = async ({ namespace, deployment_name }) => {
  const pods = await sendRequestToApi(`/api/v1/namespaces/${namespace}/pods/`)
  pods.items.filter(pod => pod.metadata.labels['deployment-name'] === deployment_name).forEach(pod => removePod({ namespace, pod_name: pod.metadata.name }))

  return sendRequestToApi(`/apis/apps/v1/namespaces/${namespace}/deployments/${deployment_name}`, 'delete')
}

const removeService = async ({ namespace, service_name }) => {
  return sendRequestToApi(`/api/v1/namespaces/${namespace}/services/${service_name}`, 'delete')
}

const removeIngress = async ({ namespace, ingress_name }) => {
  return sendRequestToApi(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses/${ingress_name}`, 'delete')
}

const removePod = ({ namespace, pod_name }) => sendRequestToApi(`/api/v1/namespaces/${namespace}/pods/${pod_name}`, 'delete')

const cleanupForDummySite = async ({ namespace, dummysite_name }) => {
  console.log('Doing cleanup')

  const deployments = await sendRequestToApi(`/apis/apps/v1/namespaces/${namespace}/deployments`)
  deployments.items.forEach(deployment => {
    if (deployment.metadata.labels) {
      if (!deployment.metadata.labels.dummysite === dummysite_name) return
      removeDeployment({ namespace, deployment_name: deployment.metadata.name })
    } else {
      return
    }
  })

  const services = await sendRequestToApi(`/api/v1/namespaces/${namespace}/services`)
  services.items.forEach(service => {
    if (service.metadata.labels) {
      if (!service.metadata.labels.dummysite === dummysite_name) return
      removeService({ namespace, service_name: service.metadata.name })
    } else {
      return
    }
  })

  const ingresses = await sendRequestToApi(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`)
  ingresses.items.forEach(ingress => {
    if (ingress.metadata.labels) {
      if (!ingress.metadata.labels.dummysite === dummysite_name) return
      removeIngress({ namespace, ingress_name: ingress.metadata.name })
    } else {
      return
    }
  })
}

const startDummify = async () => {
  (await client.listPodForAllNamespaces()).body // A bug in the client(?) was fixed by sending a request and not caring about response

  /**
   * Watch DummySites
   */

  const dummysite_stream = new JSONStream()

  dummysite_stream.on('data', async ({ type, object }) => {
    const fields = fieldsFromDummySite(object)

    if (type === 'ADDED') {
      if (await deploymentForDummysiteAlreadyExists(fields)) return // Restarting application would create new 0th deployments without this check
      createDeployment(fields)
      createService(fields)
      createIngress(fields)
    }
    if (type === 'DELETED') cleanupForDummySite(fields)
  })

  request.get(`${kc.getCurrentCluster().server}/apis/stable.dwk/v1/dummysites?watch=true`, opts).pipe(dummysite_stream)
}

startDummify()