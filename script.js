const sections = [
  {
    title: "🚀 AWS DevOps Learning Journey",
    content:
      "Deploying a Node.js application on AWS EC2 and gradually building a CI/CD pipeline using Free Tier services."
  },
  {
    title: "🏗 Architecture Evolution",
    content: `
1. EC2 Only
2. EC2 + PM2
3. EC2 + PM2 + Nginx
4. GitHub + Manual Deployment
5. GitHub Actions + EC2
6. CodeBuild
7. CodePipeline + CodeBuild
8. Full AWS DevOps Pipeline
`
  },
  {
    title: "💻 Final Architecture",
    content: `
Internet
  ↓
Nginx
  ↓
PM2
  ↓
Node.js App
  ↓
AWS EC2
`
  },
  {
    title: "📦 Deployment Commands",
    content: `
cd ~/DevSecOpc-Hello-Word
git pull origin main
npm install
pm2 restart index
`
  },
  {
    title: "❌ Common Errors Solved",
    content: `
• SSH Permission Error
• Connection Refused
• PM2 Already Running
• Missing package.json
• S3 Region Mismatch
• npm test Failed
• IAM AssumeRole Issues
• GitHub Connection Errors
`
  },
  {
    title: "🎯 Future Roadmap",
    content: `
✔ EC2
✔ Node.js
✔ PM2
✔ Nginx
⬜ GitHub Actions
⬜ SSL HTTPS
⬜ Docker
⬜ Terraform
⬜ Kubernetes
`
  }
];

const app = document.getElementById("app");

sections.forEach(section => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2>${section.title}</h2>
    <pre>${section.content}</pre>
  `;

  app.appendChild(card);
});