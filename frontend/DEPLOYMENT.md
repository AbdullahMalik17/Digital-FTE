# Deployment Guide - Abdullah Junior Frontend

## ⚠️ Important: File System Dependencies

This Next.js application uses **direct file system access** in several API routes to read/write files in the `../Vault/` directory. This approach has **significant deployment limitations**.

### Affected API Routes

The following routes depend on file system access:

- `/api/drafts` - Reads draft files from `Vault/Drafts/`
- `/api/drafts/count` - Counts draft files
- `/api/tasks/[id]/approve` - Moves files between Vault folders
- `/api/tasks/[id]/reject` - Moves files to Dead Letter Queue

### Deployment Options

#### ✅ Option 1: Self-Hosted (Docker/VPS) - Recommended

Deploy to a server where you have persistent file system access:

**Platforms:**
- Docker container with mounted volume
- VPS (DigitalOcean, Linode, Hetzner)
- Fly.io with persistent volumes
- Railway with persistent volumes

**Pros:**
- File system works as expected
- Vault directory persists between deployments
- No code changes needed

**Cons:**
- More complex setup
- Need to manage server/container

#### ⚠️ Option 2: Vercel/Netlify (Limited Support)

Serverless platforms have ephemeral file systems that reset on each deployment.

**Limitations:**
- File system is **read-only** in production
- Files written during runtime are **lost** between requests
- `/tmp` directory available but cleared frequently

**Required Changes:**
1. Migrate Vault data to external storage:
   - Amazon S3
   - Cloudflare R2
   - Supabase Storage
   - Upstash for metadata

2. Update API routes to use storage SDK instead of `fs`

3. Consider using Edge runtime with database for metadata

#### ❌ Option 3: Static Export

Not supported - this app requires server-side API routes.

---

## Environment Variables Required

### Local Development (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKWtCK-jzR-cNHcCR4Af03C3TPdMTrLvuPipUaVR5HHYu21_3Fak4gKbH0jYVFcAlVZCjUJoioUlMB_0j2MQJP0
API_SECRET_KEY=your-secret-key-here
```

### Production (.env.production or Platform Config)

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
API_SECRET_KEY=your-production-secret-key
VAULT_PATH=/app/Vault  # Adjust based on deployment
```

---

## Deployment Instructions

### Docker Deployment (Recommended)

1. **Build Docker image:**

```bash
cd frontend
docker build -t abdullah-junior-frontend .
```

2. **Run with volume mount:**

```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/vault:/app/Vault \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e API_SECRET_KEY=your-secret \
  --name abdullah-frontend \
  abdullah-junior-frontend
```

### Fly.io Deployment

1. **Install Fly CLI:**

```bash
curl -L https://fly.io/install.sh | sh
```

2. **Create app:**

```bash
fly launch --no-deploy
```

3. **Add persistent volume:**

```bash
fly volumes create vault_data --size 10 # 10GB
```

4. **Configure fly.toml:**

```toml
[env]
  NEXT_PUBLIC_API_URL = "https://your-api.fly.dev"

[mounts]
  source = "vault_data"
  destination = "/app/Vault"
```

5. **Deploy:**

```bash
fly deploy
```

### Railway Deployment

1. **Create project in Railway dashboard**
2. **Add Volume:**
   - Go to Settings → Volumes
   - Create volume at `/app/Vault`
3. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `API_SECRET_KEY`
4. **Deploy from GitHub**

---

## Post-Deployment Checklist

- [ ] Verify Vault directory is writable
- [ ] Test draft approval flow
- [ ] Test draft rejection flow
- [ ] Verify PWA service worker registration
- [ ] Test push notifications
- [ ] Check API route performance
- [ ] Set up monitoring/logging
- [ ] Configure backups for Vault data

---

## Performance Considerations

### File System Performance

- Vault operations are **synchronous** and block the Node.js event loop
- Large Vault directories (1000+ files) will slow down API responses
- Consider pagination or background processing for large operations

### Optimization Recommendations

1. **Implement caching:**
   - Cache draft counts in Redis
   - Cache file listings for 60 seconds

2. **Use background jobs:**
   - Process file moves asynchronously
   - Use message queue for heavy operations

3. **Add database layer:**
   - Store file metadata in database
   - Only access file system when reading content

---

## Monitoring & Debugging

### Check Vault Path

```bash
# In production, verify path exists
ls -la /app/Vault
```

### API Route Logs

API routes log to stdout. Check your platform's logs:

- **Fly.io**: `fly logs`
- **Railway**: View logs in dashboard
- **Docker**: `docker logs abdullah-frontend`

### Common Issues

**Problem**: "ENOENT: no such file or directory"
- **Cause**: Vault path not mounted or incorrect
- **Fix**: Verify `VAULT_PATH` env var and volume mount

**Problem**: "EACCES: permission denied"
- **Cause**: Container user lacks write permissions
- **Fix**: `chown -R node:node /app/Vault` in Dockerfile

**Problem**: Files disappear after deployment
- **Cause**: Using serverless platform without volumes
- **Fix**: Switch to persistent hosting or external storage

---

## Future Improvements

To make this app serverless-compatible:

1. **Replace file system with database:**
   - Store drafts/tasks in PostgreSQL or MongoDB
   - Use Prisma ORM for type-safe queries

2. **Use external storage for file content:**
   - Store `.md` files in S3/R2
   - Keep metadata in database

3. **Implement Redis for state:**
   - Cache counts and listings
   - Distributed locks for concurrent operations

4. **Use Edge runtime where possible:**
   - Convert read-only routes to Edge functions
   - Keep write operations in Node runtime

---

## Support

If you encounter deployment issues:
1. Check this guide first
2. Review platform documentation
3. Open an issue in the project repository

**Last Updated**: January 30, 2026
