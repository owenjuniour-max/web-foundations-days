# SnapShare: System Architecture & Scaling Plan

This scaling document outlines the capacity planning, traffic estimations, architectural design, component responsibilities, data flow, and engineering trade-offs for **SnapShare**, a photo-sharing platform serving 10 million registered users.

---

## 1. Assumptions & Baseline Numbers

- **Registered Users**: 10,000,000 total accounts.
- **Daily Active Users (DAU)**: 10% of registered accounts = **1,000,000 active users/day**.
- **User Activity per Day**:
  - Each active user uploads **1 photo per day**.
  - Each active user views **50 feed pages per day**.
- **Payload & Media Sizes**:
  - Average original photo: **2 MB**.
  - Generated thumbnail: **50 KB** (0.05 MB).
  - Total storage per upload: **2.05 MB**.
- **Timing & Peaks**:
  - Seconds per day: $24 \times 60 \times 60 = 86,400\text{ seconds}$.
  - Peak traffic multiplier: **$5\times$** average traffic.

---

## 2. Capacity Planning & Traffic Estimations

### 2.1 Uploads per Second (Writes)
- **Daily Uploads**: $1,000,000\text{ photos / day}$.
- **Average Uploads / Second**:
  $$\frac{1,000,000\text{ uploads}}{86,400\text{ seconds}} \approx \mathbf{11.57\text{ uploads/sec}}\text{ (~12 uploads/sec)}$$
- **Peak Uploads / Second ($5\times$)**:
  $$11.57 \times 5 \approx \mathbf{57.87\text{ uploads/sec}}\text{ (~58 uploads/sec)}$$

### 2.2 Feed Views per Second (Reads)
- **Daily Feed Views**: $1,000,000 \times 50 = 50,000,000\text{ feed views / day}$.
- **Average Feed Views / Second**:
  $$\frac{50,000,000\text{ views}}{86,400\text{ seconds}} \approx \mathbf{578.70\text{ views/sec}}\text{ (~579 views/sec)}$$
- **Peak Feed Views / Second ($5\times$)**:
  $$578.70 \times 5 \approx \mathbf{2,893.52\text{ views/sec}}\text{ (~2,894 views/sec)}$$

### 2.3 Storage per Year
- **Daily Data Ingestion**:
  $$1,000,000 \times 2.05\text{ MB} = 2,050,000\text{ MB} = \mathbf{2.05\text{ TB / day}}$$
- **Yearly Media Storage**:
  $$2.05\text{ TB/day} \times 365\text{ days} = \mathbf{748.25\text{ TB / year}}\text{ (~750 TB / year)}$$
- *Breakdown*: 730 TB of original full-resolution photos + 18.25 TB of compressed thumbnails per year.

---

## 3. Read vs. Write Characteristics & Design Implications

- **Read-to-Write Ratio**: 50 feed views to 1 upload (**50:1 read-to-write ratio**).
- **Classification**: SnapShare is overwhelmingly **read-heavy** (98% reads, 2% writes).
- **Design Implications**:
  1. **Multi-Tier Caching**: In-memory caching (Redis) must be implemented for hot user timelines, follower graphs, and metadata to satisfy ~2,900 peak read queries/sec without saturating databases.
  2. **Read/Write Database Segregation**: Database architecture must employ read replicas to distribute query volume away from the primary write master.
  3. **Aggressive CDN Edge Offloading**: Over 95% of photo and thumbnail asset requests should be terminated at geographically distributed edge servers (Cloudflare/CloudFront), completely bypassing our application servers.
  4. **Asynchronous Write Pipeline**: Uploads can be handled via asynchronous message queues, ensuring slow write tasks (image resizing) never degrade read latency.

---

## 4. Why Photos Must NOT Be Stored in the Database

Storing binary photo blobs (2 MB) directly inside relational database tables (e.g., `BLOB` columns) causes catastrophic system degradation:
1. **Buffer Pool Exhaustion**: Databases rely on memory caches (RAM buffer pools) for fast index traversals; massive 2 MB BLOB rows displace query indexes from RAM to disk, tanking database throughput.
2. **Database Bloat & Maintenance Nightmare**: A database growing by 2 TB every day makes backups, replications, migrations, and point-in-time recovery virtually impossible or prohibitively expensive.
3. **Connection Starvation**: Serving large files over HTTP from database connections holds sockets open for seconds, quickly exhausting database connection pools.

### Where Photos Go Instead
Photos are stored in dedicated **Cloud Object Storage** (such as AWS S3, Google Cloud Storage, or MinIO), which is horizontally scalable, cost-effective, and engineered specifically for large unstructured binaries. The relational database stores only a lightweight metadata row:
```json
{
  "photo_id": "p_884920",
  "user_id": 1024,
  "photo_url": "https://media.snapshare.com/photos/2026/10/p_884920.jpg",
  "thumbnail_url": "https://media.snapshare.com/thumbs/2026/10/p_884920_thumb.jpg",
  "created_at": "2026-10-17T10:00:00Z"
}
5. System Architecture Diagram
code
Code
[ User Clients (Mobile & Web) ]
                                      |            |
                         Feed Views / |            | Photo Asset Requests
                         API Requests |            | (Cached Images & Thumbs)
                                      v            v
                           [ Load Balancer ]    [ CDN (Edge Cache) ]
                                  |                    |
                                  v                    | Cache Misses
                         [ App Servers (Stateless) ]<--+
                            /     |         \
         +-----------------+      |          +--------------------+
         |                        |                               |
         v                        v                               v
[ In-Memory Cache ]    [ Primary DB (Write) ]           [ Object Storage (S3) ]
 (Redis - Feeds)                  |                       (Full Photos & Thumbs)
                                  v (Replication)                 ^
                        [ Read Replica DB ]                       | Saves Thumbs
                                                                  |
         +--------------------------------------------------------+
         |
         v
 [ Message Queue ] ---> [ Worker Servers ]
 (RabbitMQ / SQS)      (Creates 50 KB Thumbnails)
6. Component Explanations (One Sentence per Component)
CDN (Content Delivery Network): Caches static images and thumbnails on edge servers close to users worldwide to deliver low-latency photo downloads and offload 95%+ of traffic from origin servers.
Load Balancer: Distributes incoming HTTP feed views and upload requests evenly across multiple application servers to prevent any single server from becoming a bottleneck.
App Servers: Execute stateless business logic, validate user input, generate feed responses, and issue pre-signed upload URLs.
Cache (Redis): Stores pre-computed user feeds, active session tokens, and follower lists in memory to return feed requests sub-millisecond without querying disk storage.
Primary Database (Write): Handles all write transactions, updates, user registrations, and canonical photo metadata entries with strict ACID consistency.
Read Replica Database: Synchronizes asynchronously with the primary database to serve heavy read queries and feed assembly workloads across multiple instances.
Object Storage: Provides virtually limitless, highly durable, low-cost distributed storage for large photo files and thumbnail binaries.
Message Queue: Decouples photo uploads from compute-intensive image processing by queuing thumbnail generation tasks reliably in the background.
Thumbnail Worker: Consumes image processing jobs from the queue, pulls full-size photos, resizes them into compressed 50 KB thumbnails, and writes them back to Object Storage.
7. Step-by-Step Photo Upload Flow
Upload Request: The client application sends an authenticated POST /api/v1/photos/upload-intent request to the Load Balancer with photo file metadata (file size, mime type).
Pre-Signed URL Generation: An App Server authenticates the user, generates a secure, time-limited pre-signed direct-upload URL pointing directly to Object Storage (S3), and returns it to the client.
Direct Binary Upload: The client uploads the 2 MB photo file directly to Object Storage using the pre-signed URL, keeping heavy binary data off the application server memory.
Upload Confirmation: Upon successful binary transfer to Object Storage, the client notifies the App Server via POST /api/v1/photos/confirm.
Metadata Persistence: The App Server inserts a new photo record into the Primary Database containing the photo's S3 storage key, user ID, and timestamp.
Enqueue Background Job: The App Server publishes a GenerateThumbnail task containing the photo ID and S3 key to the Message Queue.
Background Thumbnail Processing: A dedicated Thumbnail Worker picks up the job from the queue, fetches the 2 MB original image, generates an optimized 50 KB thumbnail, and uploads the thumbnail to Object Storage.
Metadata Update & Cache Invalidation: The worker updates the database record with the new thumbnail_url and updates the user's followers' cached feeds in Redis, making the photo visible across the platform.
8. Architectural Trade-offs
Trade-off 1: Asynchronous Thumbnail Processing (Eventual Consistency vs. Upload Latency)
Decision: Process 50 KB thumbnails asynchronously via a background worker queue rather than synchronously blocking the upload HTTP request.
Advantage: The user experiences a lightning-fast upload confirmation (under 300 ms) because the server does not wait for image resizing.
Drawback: Introduces eventual consistency; for a brief 1–2 second window, followers viewing the new post might see a placeholder skeleton or the raw image before the thumbnail is generated and cached.
Trade-off 2: Direct-to-Storage Uploads via Pre-Signed URLs vs. Proxying Through App Servers
Decision: Clients upload photos directly to Object Storage (S3) using pre-signed URLs instead of streaming binary files through our application servers.
Advantage: Massively reduces memory consumption, CPU load, and network bandwidth on our application servers, allowing a small cluster of servers to handle peak traffic without exhaustion.
Drawback: Reduced immediate server-side validation; malicious users could potentially upload invalid files or fail to complete the metadata confirmation step, requiring a background cleanup cron job to purge orphaned S3 objects.
Trade-off 3: Read Replicas vs. Replication Lag
Decision: Route all feed reads to Read Replicas while directing writes exclusively to the Primary Database.
Advantage: Allows SnapShare to scale horizontally to handle 2,900 peak feed queries/sec across multiple read nodes without impacting write throughput.
Drawback: Asynchronous database replication introduces a small replication lag (typically 50–200 ms); a user who immediately refreshes their profile right after uploading might occasionally experience a stale read until the replica catches up.
