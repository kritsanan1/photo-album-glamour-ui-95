
# GitHub Technical Guide: Core Features & Modern Development

A comprehensive reference and practical tutorial for developers, DevOps engineers, and technical team leads.

## Table of Contents

1. [GitHub Actions & CI/CD](#github-actions--cicd)
2. [GitHub Pages & Static Site Deployment](#github-pages--static-site-deployment)  
3. [GitHub Codespaces](#github-codespaces)
4. [Essential Platform Features](#essential-platform-features)
5. [Troubleshooting & Best Practices](#troubleshooting--best-practices)

---

## GitHub Actions & CI/CD

### Fundamentals

GitHub Actions is GitHub's native CI/CD platform that automates software workflows directly in your repository.

#### Workflow Architecture

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

#### Key Components

- **Workflows**: Automated processes defined in YAML files
- **Jobs**: Sets of steps that execute on the same runner
- **Steps**: Individual tasks that run commands or actions
- **Actions**: Reusable units of code
- **Runners**: Servers that execute workflows

#### Event Triggers

```yaml
on:
  # Push to specific branches
  push:
    branches: [ main ]
    paths: [ 'src/**' ]
  
  # Pull request events
  pull_request:
    types: [ opened, synchronize, reopened ]
  
  # Scheduled runs
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
  
  # Manual trigger
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
```

#### Matrix Builds

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 18
            coverage: true
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
      - name: Upload coverage
        if: matrix.coverage
        uses: codecov/codecov-action@v3
```

### Practical CI/CD Examples

#### Full Stack Application Pipeline

```yaml
name: Full Stack CI/CD
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: coverage/

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
      
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Output image
        id: image
        run: echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ needs.build.outputs.image }} to production"
          # Add your deployment logic here
```

#### Custom GitHub Action

```yaml
# .github/actions/setup-app/action.yml
name: 'Setup Application'
description: 'Setup Node.js application with caching'
inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '18'
  install-dependencies:
    description: 'Install dependencies'
    required: false
    default: 'true'
outputs:
  cache-hit:
    description: 'Whether dependencies were cached'
    value: ${{ steps.cache.outputs.cache-hit }}
runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        
    - name: Get package-lock.json hash
      id: package-hash
      shell: bash
      run: echo "hash=${{ hashFiles('package-lock.json') }}" >> $GITHUB_OUTPUT
      
    - name: Cache dependencies
      id: cache
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ inputs.node-version }}-${{ steps.package-hash.outputs.hash }}
        restore-keys: |
          ${{ runner.os }}-node-${{ inputs.node-version }}-
          
    - name: Install dependencies
      if: inputs.install-dependencies == 'true'
      shell: bash
      run: npm ci
```

### Security Best Practices

#### Secrets Management

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy with secrets
        env:
          # Repository secrets
          API_KEY: ${{ secrets.API_KEY }}
          # Environment secrets (more secure)
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          # Organization secrets (shared across repos)
          DOCKER_REGISTRY_TOKEN: ${{ secrets.DOCKER_REGISTRY_TOKEN }}
        run: |
          # Never echo secrets
          echo "Deploying to production..."
          deploy.sh
```

#### Security Hardening

```yaml
permissions:
  contents: read
  packages: write
  # Only grant necessary permissions

jobs:
  secure-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          # Pin to specific commit for security
          ref: ${{ github.sha }}
          
      - name: Verify checksums
        run: |
          # Verify downloaded artifacts
          sha256sum -c checksums.txt
          
      - name: Use OIDC for cloud authentication
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
          aws-region: us-east-1
```

---

## GitHub Pages & Static Site Deployment

### Setup Process

#### Basic Configuration

1. **Repository Settings**
   - Navigate to Settings → Pages
   - Select source: Deploy from a branch or GitHub Actions
   - Choose branch (usually `main` or `gh-pages`)

2. **Custom Domain Setup**

```txt
# CNAME file in repository root
mydomain.com
```

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Framework-Specific Deployments

**React/Vite Application**

```yaml
name: Deploy React App
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Build
        run: npm run build
        env:
          # Set base path for GitHub Pages
          PUBLIC_URL: /${{ github.event.repository.name }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Jekyll Site**

```yaml
name: Build and deploy Jekyll site
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
      
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4
      
      - name: Build with Jekyll
        run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Performance Optimization

#### Build Optimization

```yaml
- name: Build with optimization
  run: |
    npm run build
    # Compress assets
    find dist -name "*.js" -exec gzip -k {} \;
    find dist -name "*.css" -exec gzip -k {} \;
    
- name: Optimize images
  run: |
    npm install -g imagemin-cli imagemin-webp
    imagemin dist/images/* --out-dir=dist/images --plugin=webp
```

#### Caching Strategy

```yaml
- name: Cache build artifacts
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

---

## GitHub Codespaces

### Environment Setup

#### devcontainer.json Configuration

```json
{
  "name": "Full Stack Development",
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "18"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-json",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },
  
  "forwardPorts": [3000, 5432, 8080],
  "portsAttributes": {
    "3000": {
      "label": "Frontend",
      "onAutoForward": "notify"
    },
    "5432": {
      "label": "PostgreSQL",
      "onAutoForward": "silent"
    }
  },
  
  "postCreateCommand": "npm install && npm run setup",
  "postStartCommand": "npm run dev",
  
  "remoteUser": "codespace",
  "containerUser": "codespace"
}
```

#### Multi-Service Development

```json
{
  "name": "Microservices Development",
  "dockerComposeFile": "docker-compose.dev.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-docker",
        "ms-kubernetes-tools.vscode-kubernetes-tools"
      ]
    }
  },
  
  "forwardPorts": [3000, 8000, 5432, 6379],
  "postCreateCommand": "make setup-dev"
}
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: 
      context: .
      dockerfile: .devcontainer/Dockerfile
    volumes:
      - ..:/workspace:cached
    command: sleep infinity
    depends_on:
      - database
      - redis
  
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: devdb
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    
volumes:
  postgres-data:
```

### Advanced Configuration

#### Custom Dockerfile

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install additional tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Install specific Node.js version
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install global npm packages
RUN npm install -g \
    typescript \
    @nestjs/cli \
    prisma

# Setup user
USER vscode
WORKDIR /workspace
```

#### Performance Optimization

```json
{
  "name": "High-Performance Dev Environment",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  
  "runArgs": [
    "--cpus=4",
    "--memory=8g"
  ],
  
  "mounts": [
    "source=codespace-node_modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
  
  "customizations": {
    "vscode": {
      "settings": {
        "typescript.preferences.includePackageJsonAutoImports": "off",
        "search.exclude": {
          "**/node_modules": true,
          "**/dist": true
        }
      }
    }
  }
}
```

### Team Standardization

#### Shared Configuration

```json
{
  "name": "Team Standard Environment",
  "image": "ghcr.io/myorg/devcontainer:latest",
  
  "features": {
    "ghcr.io/devcontainers-contrib/features/act:1": {},
    "ghcr.io/devcontainers/features/common-utils:2": {
      "configureZshAsDefaultShell": true
    }
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-team-extension-pack"
      ]
    }
  },
  
  "secrets": {
    "API_KEY": {
      "description": "API key for external service"
    }
  }
}
```

---

## Essential Platform Features

### Branch Protection & Code Review

#### Branch Protection Rules

```yaml
# Configure via repository settings or API
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/tests", "ci/lint"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": {
    "users": ["admin-user"],
    "teams": ["core-team"]
  }
}
```

#### CODEOWNERS File

```txt
# .github/CODEOWNERS
# Global owners
* @team-leads

# Frontend code
/frontend/ @frontend-team
/src/components/ @ui-team

# Backend code
/backend/ @backend-team
/api/ @api-team

# Infrastructure
/infrastructure/ @devops-team
/.github/workflows/ @devops-team

# Documentation
/docs/ @tech-writers
*.md @tech-writers

# Database migrations
/migrations/ @backend-team @dba-team
```

### Security Features

#### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    assignees:
      - "lead-developer"
    commit-message:
      prefix: "chore"
      include: "scope"
    
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "monthly"
    
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

#### Code Scanning Setup

```yaml
# .github/workflows/codeql.yml
name: "CodeQL"
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '45 6 * * 3'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'python' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}
        queries: security-extended,security-and-quality

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:${{matrix.language}}"
```

### Issue & Project Management

#### Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: ["bug", "triage"]
assignees:
  - maintainer-username
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true
  - type: dropdown
    id: version
    attributes:
      label: Version
      description: What version of our software are you running?
      options:
        - 1.0.2 (Default)
        - 1.0.1
        - 1.0.0
    validations:
      required: true
```

#### Pull Request Template

```markdown
<!-- .github/pull_request_template.md -->
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass locally
- [ ] Integration tests pass locally
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

## Additional Notes
```

---

## Troubleshooting & Best Practices

### Common Issues

#### GitHub Actions Debugging

```yaml
- name: Debug workflow
  run: |
    echo "Event name: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    env

- name: Enable debug logging
  run: echo "::debug::This is a debug message"
  env:
    ACTIONS_STEP_DEBUG: true
```

#### Permission Issues

```yaml
permissions:
  contents: write      # To push to repository
  packages: write      # To publish packages
  pull-requests: write # To comment on PRs
  issues: write        # To create/update issues
  security-events: write # For security scanning
```

### Performance Best Practices

#### Workflow Optimization

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Use specific versions for reliability
      - uses: actions/checkout@v4
      
      # Cache dependencies
      - uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      
      # Use matrix for parallel execution
      - name: Run tests
        run: npm test -- --maxWorkers=2
      
      # Fail fast for quick feedback
      - name: Early exit on failure
        if: failure()
        run: exit 1
```

#### Resource Management

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Prevent hanging jobs
    steps:
      - name: Free disk space
        run: |
          df -h
          sudo rm -rf /usr/share/dotnet
          sudo rm -rf /opt/ghc
          df -h
```

### Security Best Practices

#### Secrets and Environment Variables

```yaml
# Good practices
env:
  NODE_ENV: production
  # Use secrets for sensitive data
  API_KEY: ${{ secrets.API_KEY }}
  
jobs:
  deploy:
    environment: production  # Use environments for additional protection
    steps:
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          # Never log secrets
          echo "Deploying..."
          # Use -- to separate flags from values
          deploy.sh --key="***"
```

#### Action Security

```yaml
steps:
  # Pin actions to specific SHA for security
  - uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab
  
  # Or use tags with verification
  - uses: actions/setup-node@v4
    with:
      # Always specify exact versions
      node-version: '18.17.0'
```

### Monitoring and Alerting

#### Workflow Notifications

```yaml
jobs:
  notify:
    if: always()
    needs: [test, build, deploy]
    runs-on: ubuntu-latest
    steps:
      - name: Notify on failure
        if: contains(needs.*.result, 'failure')
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Deployment failed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Additional Resources

### Official Documentation Links
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [GitHub Security Documentation](https://docs.github.com/en/code-security)

### Community Resources
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome GitHub Actions](https://github.com/sdras/awesome-actions)
- [GitHub Community Forum](https://github.community/)

### Development Tools
- [Act - Run GitHub Actions locally](https://github.com/nektos/act)
- [GitHub CLI](https://cli.github.com/)
- [VS Code GitHub Extension Pack](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-pack)

---

**Last Updated**: June 2024
**Version**: 2.0

> This guide covers current GitHub features as of June 2024. Always refer to official documentation for the latest updates and feature changes.
