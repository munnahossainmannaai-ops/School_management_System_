# Deployment Guide

This guide provides detailed instructions for deploying the School Management System to various environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Production Checklist](#production-checklist)

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Steps

1. **Clone and Install**
   ```bash
   cd school-management-system
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Database Setup**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE school_management;"
   
   # Or use Docker
   docker-compose up -d postgres redis
   ```

4. **Run Migrations**
   ```bash
   npm run build
   npm run migrate
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run start:dev
   ```

7. **Access Application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/health

---

## Docker Deployment

### Using Docker Compose (Recommended for Staging)

1. **Build and Run**
   ```bash
   docker-compose up -d --build
   ```

2. **View Logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec app npm run migrate
   ```

4. **Seed Database**
   ```bash
   docker-compose exec app npm run seed
   ```

5. **Stop Services**
   ```bash
   docker-compose down
   ```

6. **Remove Volumes (Clean Slate)**
   ```bash
   docker-compose down -v
   ```

### Manual Docker Build

1. **Build Image**
   ```bash
   docker build -t school-management-system:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name sms-app \
     -p 3000:3000 \
     --env-file .env \
     --link postgres:postgres \
     --link redis:redis \
     school-management-system:latest
   ```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Helm (optional)
- Container registry access

### Base Configuration

1. **Review Base Manifests**
   ```bash
   cat k8s/base/*.yaml
   ```

2. **Customize Secrets**
   Edit `k8s/base/secrets.yaml` with your credentials or use external secrets management.

3. **Apply Base Configuration**
   ```bash
   kubectl apply -k k8s/base
   ```

### Production Deployment

1. **Customize Production Overlay**
   Edit `k8s/overlays/production/kustomization.yaml`:
   - Update Docker image tag
   - Adjust replica count
   - Configure resource limits
   - Update secrets

2. **Deploy to Production**
   ```bash
   kubectl apply -k k8s/overlays/production
   ```

3. **Verify Deployment**
   ```bash
   kubectl get pods -n school-system
   kubectl get services -n school-system
   kubectl get ingress -n school-system
   ```

4. **Check Logs**
   ```bash
   kubectl logs -f deployment/sms-app -n school-system
   ```

5. **Scale Application**
   ```bash
   kubectl scale deployment sms-app --replicas=5 -n school-system
   ```

6. **Rollback if Needed**
   ```bash
   kubectl rollout undo deployment/sms-app -n school-system
   ```

### Monitoring

```bash
# Check pod status
kubectl get pods -n school-system -o wide

# View resource usage
kubectl top pods -n school-system

# Access application logs
kubectl logs -f deployment/sms-app -n school-system --tail=100

# Execute commands in pod
kubectl exec -it deployment/sms-app -n school-system -- /bin/sh
```

---

## Cloud Platform Deployment

### AWS Deployment

#### Option 1: ECS (Elastic Container Service)

1. **Push Image to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   docker tag school-management-system:latest <account>.dkr.ecr.us-east-1.amazonaws.com/sms:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/sms:latest
   ```

2. **Create ECS Cluster and Service**
   - Use AWS Console or Terraform
   - Configure task definition
   - Set up load balancer
   - Configure auto-scaling

#### Option 2: EKS (Elastic Kubernetes Service)

1. **Configure kubectl for EKS**
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name sms-cluster
   ```

2. **Deploy Using Kustomize**
   ```bash
   kubectl apply -k k8s/overlays/production
   ```

#### Option 3: Elastic Beanstalk

1. **Prepare Application**
   ```bash
   eb init
   eb create sms-production
   ```

2. **Deploy**
   ```bash
   eb deploy
   ```

### Google Cloud Platform

#### GKE (Google Kubernetes Engine)

1. **Connect to Cluster**
   ```bash
   gcloud container clusters get-credentials sms-cluster --zone us-central1-a
   ```

2. **Deploy**
   ```bash
   kubectl apply -k k8s/overlays/production
   ```

#### Cloud Run

1. **Build and Deploy**
   ```bash
   gcloud run deploy sms \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Microsoft Azure

#### AKS (Azure Kubernetes Service)

1. **Connect to Cluster**
   ```bash
   az aks get-credentials --resource-group sms-rg --name sms-aks
   ```

2. **Deploy**
   ```bash
   kubectl apply -k k8s/overlays/production
   ```

#### App Service

1. **Deploy Container**
   ```bash
   az webapp create --resource-group sms-rg --plan sms-plan \
     --name sms-app --deployment-container-image-name \
     your-registry.azurecr.io/school-management-system:latest
   ```

---

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for specific domains only
- [ ] Implement rate limiting
- [ ] Enable firewall rules
- [ ] Set up WAF (Web Application Firewall)
- [ ] Review and rotate secrets regularly
- [ ] Enable audit logging
- [ ] Implement IP whitelisting for admin access

### Database

- [ ] Enable automated backups
- [ ] Configure point-in-time recovery
- [ ] Set up read replicas for scaling
- [ ] Optimize connection pooling
- [ ] Enable query logging (slow queries)
- [ ] Run database migrations in maintenance mode
- [ ] Test backup restoration procedure

### Monitoring & Alerting

- [ ] Set up application monitoring (New Relic, Datadog, etc.)
- [ ] Configure log aggregation (ELK, Splunk, etc.)
- [ ] Create dashboards for key metrics
- [ ] Set up alerts for:
  - High CPU/Memory usage
  - Error rate spikes
  - Response time degradation
  - Database connection issues
  - Disk space warnings
- [ ] Configure uptime monitoring

### Performance

- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Optimize database indexes
- [ ] Enable gzip compression
- [ ] Configure proper connection pooling
- [ ] Load test the application
- [ ] Optimize Docker image size

### High Availability

- [ ] Deploy multiple replicas (min 3)
- [ ] Configure pod anti-affinity rules
- [ ] Set up horizontal pod autoscaling
- [ ] Implement health checks
- [ ] Configure graceful shutdown
- [ ] Set up multi-zone deployment
- [ ] Test failover procedures

### Backup & Disaster Recovery

- [ ] Automated daily database backups
- [ ] Off-site backup storage
- [ ] Document recovery procedures
- [ ] Test backup restoration quarterly
- [ ] Configure point-in-time recovery
- [ ] Document RTO (Recovery Time Objective)
- [ ] Document RPO (Recovery Point Objective)

### Compliance

- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies
- [ ] Privacy policy updates
- [ ] User consent management
- [ ] Data export functionality
- [ ] Right to be forgotten implementation
- [ ] Audit trail maintenance

### Documentation

- [ ] Update runbooks
- [ ] Document architecture
- [ ] Create incident response plan
- [ ] Train support team
- [ ] Document API changes
- [ ] Update user manuals

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
kubectl logs deployment/sms-app -n school-system

# Check environment variables
kubectl exec deployment/sms-app -n school-system -- env

# Verify database connectivity
kubectl exec -it deployment/sms-app -n school-system -- ping postgres
```

#### Database Connection Errors

```bash
# Check database pod
kubectl get pods -n school-system | grep postgres

# Test connection
kubectl exec -it deployment/sms-app -n school-system -- \
  psql -h postgres -U postgres -d school_management
```

#### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n school-system

# Increase memory limits
kubectl edit deployment sms-app -n school-system
```

#### Slow Response Times

```bash
# Check database slow queries
# Enable query logging in PostgreSQL

# Check Redis performance
redis-cli --latency

# Review application logs for bottlenecks
kubectl logs deployment/sms-app -n school-system | grep "slow"
```

---

## Support

For deployment issues, contact:
- Email: devops@schoolms.example.com
- Slack: #sms-deployments
- On-call: Check PagerDuty rotation

**Last Updated**: April 2024
