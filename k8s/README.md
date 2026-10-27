# Kubernetes deployment (frontend)

These manifests deploy the Vite frontend as a single-replica nginx container on port `80`.

## Files

- `deployment.yaml` - `Deployment` with rolling updates, health probes, and resource requests/limits.
- `service.yaml` - `ClusterIP` `Service` exposing the frontend internally.
- `kustomization.yaml` - sets namespace and image override defaults.
- `optional/ingress.yaml` - optional `Ingress` (not applied by default).

## 1) Build and push image

From the repository root:

```bash
docker build -t your-registry/findit-frontend:TAG .
docker push your-registry/findit-frontend:TAG
```

## 2) Set namespace and image

Edit `k8s/kustomization.yaml`:

- `namespace: findit` -> your namespace.
- `images[].newName` and `images[].newTag` -> your pushed image.

## 3) Apply manifests

```bash
kubectl apply -k k8s/
```

## 4) Check rollout

```bash
kubectl -n <your-namespace> rollout status deployment/findit-frontend
kubectl -n <your-namespace> get pods,svc
```

## 5) Access the service

The service is `ClusterIP`, so use one of these:

```bash
kubectl -n <your-namespace> port-forward service/findit-frontend 8080:80
# then open http://localhost:8080
```

If you change the service type to `LoadBalancer` in your environment:

```bash
kubectl -n <your-namespace> get svc findit-frontend
```

## 6) Private registry images

If your image is private, create an image pull secret and attach it to the deployment:

```bash
kubectl -n <your-namespace> create secret generic regcred \
  --type=kubernetes.io/dockerconfigjson \
  --from-file=.dockerconfigjson=<path-to-docker-config-json>
```

Then add to `k8s/deployment.yaml` under `spec.template.spec`:

```yaml
imagePullSecrets:
  - name: regcred
```

## Optional Ingress

`k8s/optional/ingress.yaml` is intentionally not included in `kustomization.yaml`.
Use it only after:

1. An ingress controller is installed in your cluster.
2. You replace `findit.example.com` with a real hostname.

Apply it explicitly:

```bash
kubectl -n <your-namespace> apply -f k8s/optional/ingress.yaml
```
