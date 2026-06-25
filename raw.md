# From Zero to Production: Deploying a Node.js Application on AWS EC2 with Nginx, PM2, Domain, SSL and CI/CD

## Introduction

As a cybersecurity student learning cloud and DevOps, I wanted to understand how real-world applications are deployed in production.

Instead of only watching tutorials, I decided to build and deploy my own Node.js application on AWS.

The goal was simple:

* Host a Node.js application on AWS EC2
* Configure Nginx as a reverse proxy
* Use PM2 for process management
* Connect a custom domain
* Enable HTTPS using SSL
* Explore AWS CI/CD services
* Troubleshoot real-world deployment issues

This article documents my complete journey, mistakes, errors, solutions, and lessons learned.

---

# Initial Architecture

At the beginning, the architecture was very simple.

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
AWS EC2
    │
    ▼
Node.js Application
```

The problem with this architecture:

* No process management
* No reverse proxy
* No SSL
* No custom domain
* No CI/CD

This setup works for testing but is not suitable for production.

---

# Step 1: Launching an AWS EC2 Instance

I created an Amazon Linux 2023 EC2 instance.

Security Group Rules:

```text
SSH    22
HTTP   80
HTTPS  443
Custom 3000
```

Initially, I accessed the application using:

```text
http://EC2-PUBLIC-IP:3000
```

Example:

```text
http://4.7.45.100:3000
```

The application worked successfully.

---

# Step 2: Installing Node.js

After connecting to EC2 via SSH:

```bash
ssh -i key.pem ec2-user@PUBLIC-IP
```

I installed Node.js and Git.

```bash
sudo dnf update -y

sudo dnf install git -y

sudo dnf install nodejs -y
```

Verification:

```bash
node -v
npm -v
```

---

# Step 3: Cloning GitHub Repository

```bash
git clone https://github.com/username/project.git

cd project
```

Install dependencies:

```bash
npm install
```

Run application:

```bash
node index.js
```

Application became accessible on:

```text
http://PUBLIC-IP:3000
```

---

# Step 4: Using PM2

Problem:

When the SSH session closed, the application stopped.

Solution:

Install PM2.

```bash
npm install -g pm2
```

Start application:

```bash
pm2 start index.js --name index
```

Useful commands:

```bash
pm2 list

pm2 logs

pm2 restart index

pm2 stop index
```

Benefits:

* Auto restart
* Process monitoring
* Background execution

---

# Step 5: Configuring Nginx

Problem:

Users should not access:

```text
http://IP:3000
```

Instead:

```text
http://IP
```

Install Nginx:

```bash
sudo dnf install nginx -y
```

Start Nginx:

```bash
sudo systemctl enable nginx

sudo systemctl start nginx
```

Create reverse proxy:

```nginx
server {

    listen 80;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
    }
}
```

Verify:

```bash
sudo nginx -t
```

Reload:

```bash
sudo systemctl reload nginx
```

Now traffic flow became:

```text
User
   │
   ▼
Nginx :80
   │
   ▼
Node.js :3000
```

---

# Step 6: Learning AWS CodeBuild

Goal:

Automatically build application from GitHub.

Created:

* CodeBuild Project
* GitHub Source Connection

First Error:

```text
npm ERR! Could not read package.json
```

Reason:

CodeBuild was looking in the wrong directory.

Lesson:

Always verify:

```text
CODEBUILD_SRC_DIR
```

and repository structure.

---

# Step 7: S3 Artifact Error

Error:

```text
BucketRegionError:
bucket is in us-east-1
but build project is in ap-south-1
```

Solution:

Created S3 bucket in same region.

```text
ap-south-1
```

Lesson:

Keep AWS resources in the same region whenever possible.

---

# Step 8: AWS Inspector Error

Error:

```text
SubscriptionRequiredException
```

Reason:

Pipeline template included Amazon Inspector scan.

Solution:

Removed Inspector stage.

Lesson:

Not all AWS services are enabled by default.

---

# Step 9: CodePipeline Build Failure

Error:

```text
npm test
Error: no test specified
```

Reason:

Default Node.js template runs:

```bash
npm test
```

But project had no tests.

Solution:

Either:

```json
"test": "echo test"
```

or remove test stage.

Lesson:

Generated templates should always be reviewed.

---

# Step 10: IAM Permission Error

Error:

```text
codebuild:StartBuild
AccessDeniedException
```

Reason:

CodePipeline role lacked permissions.

Solution:

Added required IAM permissions.

Lesson:

Most AWS deployment failures are IAM related.

---

# Step 11: Understanding CodeDeploy

Initially planned to use:

```text
CodePipeline
     │
     ▼
CodeDeploy
     │
     ▼
EC2
```

However:

* More complex
* Additional configuration
* Learning project didn't require it

Alternative:

Manual deployment.

```bash
git pull

npm install

pm2 restart index
```

Lesson:

Sometimes simpler solutions are better.

---

# Step 12: Domain Configuration

Purchased domain.

Created subdomain:

```text
mayur.cybershieldd.online
```

Added DNS A Record:

```text
A
mayur
3.6.58.203
```

Problem:

Domain behaved inconsistently.

---

# Step 13: DNS Troubleshooting

Discovered DNS returned:

```text
15.197.142.173
3.33.152.147
3.6.58.203
```

Problem:

Multiple A records existed.

Result:

* SSL failures
* Redirect loops
* Random behavior

Verification:

```bash
dig mayur.cybershieldd.online
```

Lesson:

Always verify DNS using:

```bash
dig

nslookup
```

instead of relying on UI only.

---

# Step 14: HTTPS Not Working

HTTP worked:

```text
http://mayur.cybershieldd.online
```

HTTPS failed.

Verification:

```bash
sudo certbot certificates
```

Result:

```text
No certificates found
```

Lesson:

Working HTTP does not imply working HTTPS.

---

# Step 15: Installing SSL

Installed Certbot:

```bash
sudo dnf install certbot python3-certbot-nginx -y
```

Generated SSL:

```bash
sudo certbot --nginx -d mayur.cybershieldd.online
```

After DNS cleanup, certificate generation succeeded.

Verification:

```bash
curl -I https://mayur.cybershieldd.online
```

Success.

---

# Final Architecture

```text
Internet
    │
    ▼
Custom Domain
(mayur.cybershieldd.online)
    │
    ▼
DNS
    │
    ▼
EC2
    │
    ▼
Nginx Reverse Proxy
    │
    ▼
Node.js Application
    │
    ▼
PM2
```

---

# Current Deployment Process

Whenever code changes:

```bash
ssh ec2-user@SERVER

cd ~/DevSecOpc-Hello-Word

git pull origin main

npm install

pm2 restart index

pm2 logs
```

---

# Skills Learned

AWS:

* EC2
* IAM
* S3
* CodeBuild
* CodePipeline
* Security Groups

Linux:

* SSH
* Package Management
* Services
* Process Monitoring

DevOps:

* CI/CD Concepts
* Nginx
* PM2
* Reverse Proxy
* SSL/TLS
* DNS

Networking:

* HTTP
* HTTPS
* DNS
* Domains
* Reverse Proxy

Troubleshooting:

* Build Errors
* IAM Errors
* DNS Issues
* SSL Failures
* Deployment Failures

---

# Key Lessons

1. Most cloud problems are configuration issues.
2. DNS troubleshooting is critical.
3. IAM permissions break many AWS deployments.
4. Start simple before adding complex automation.
5. Learn by building and breaking systems.
6. Production deployment involves much more than writing code.
7. Debugging teaches more than tutorials.

---

# Future Improvements

* GitHub Actions
* Automatic Deployment
* Docker
* ECS
* Kubernetes
* Terraform
* Monitoring
* WAF
* CloudFront
* Multi-Environment Deployments

---

# Conclusion

This project started as a simple Node.js application and evolved into a complete production-style deployment.

The journey included:

* AWS
* Linux
* Nginx
* PM2
* SSL
* DNS
* CI/CD
* Troubleshooting

The biggest lesson was that cloud engineering is not about memorizing services. It is about understanding how systems connect together and learning how to troubleshoot when things fail.

Every error became a learning opportunity, and each issue solved increased my understanding of real-world cloud infrastructure.
