# CI/CD Pipeline Configuration Guide

## Week 2 Objectives: CI/CD Pipeline Setup

This document outlines the Continuous Integration/Continuous Deployment (CI/CD) pipeline for the Real Estate Management System, aligned with Week 2 capstone objectives.

## Overview

The CI/CD pipeline automates the following processes:

1. **Code Quality Checks** - Linting and formatting
2. **Type Safety** - TypeScript type checking
3. **Build Verification** - Next.js application build
4. **Testing** - Automated test execution (to be implemented)
5. **Security Audits** - Dependency vulnerability scanning
6. **Deployment** - Automated deployment to Vercel

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Push/PR Event                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │                                      │
        │  Parallel Execution (Jobs 1-2)      │
        │                                      │
        ├──────────────┬───────────────────────┤
        │              │                       │
        ▼              ▼                       ▼
   ┌────────┐    ┌──────────┐           ┌──────────┐
   │  Lint  │    │TypeCheck │           │ Security │
   └───┬────┘    └────┬─────┘           └──────────┘
       │              │
       └──────┬───────┘
              │
              ▼
      ┌───────────────┐
      │  Build & Test │
      └───────┬───────┘
              │
              ▼
     ┌─────────────────┐
     │ Deploy (main)   │
     └─────────────────┘
```

## Pipeline Jobs

### 1. Lint & Code Quality

**Purpose**: Ensure code follows style guidelines and best practices

**Steps**:

- Checkout code
- Setup Node.js environment
- Install dependencies with caching
- Run ESLint
- Check code formatting with Prettier

**When it runs**: On every push and pull request

**Success criteria**: No linting errors (warnings allowed)

### 2. TypeScript Type Check

**Purpose**: Verify type safety across the codebase

**Steps**:

- Checkout code
- Setup Node.js environment
- Install dependencies
- Run TypeScript compiler in check mode

**When it runs**: On every push and pull request

**Success criteria**: No type errors

### 3. Build Application

**Purpose**: Verify the application can be built successfully

**Steps**:

- Checkout code
- Setup Node.js environment
- Install dependencies
- Create environment variables from secrets
- Build Next.js application
- Upload build artifacts

**When it runs**: After lint and typecheck pass

**Success criteria**: Successful build with no errors

### 4. Run Tests

**Purpose**: Execute automated tests (placeholder for future implementation)

**Steps**:

- Checkout code
- Setup Node.js environment
- Install dependencies
- Run test suite

**When it runs**: After lint and typecheck pass

**Success criteria**: All tests pass (currently skipped)

### 5. Security Audit

**Purpose**: Identify security vulnerabilities in dependencies

**Steps**:

- Checkout code
- Setup Node.js environment
- Run yarn audit

**When it runs**: On every push and pull request

**Success criteria**: No critical vulnerabilities

### 6. Deploy to Vercel

**Purpose**: Automatically deploy to production

**Steps**:

- Checkout code
- Deploy to Vercel using Vercel Action

**When it runs**: Only on main/trunk branch after successful build

**Success criteria**: Successful deployment

## GitHub Secrets Configuration

Before the pipeline can run, configure the following secrets in your GitHub repository:

### Navigation:

`Repository → Settings → Secrets and variables → Actions → New repository secret`

### Required Secrets:

#### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Firebase Configuration

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

#### Google Maps Configuration

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

#### Vercel Configuration (for deployment)

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Setting Up Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login and Link Project

```bash
vercel login
vercel link
```

### Step 3: Get Vercel Credentials

```bash
# Get Vercel Token
vercel token

# Get Project Info
vercel project ls

# Get Org ID (from project settings)
```

### Step 4: Add Secrets to GitHub

Add the values obtained above to GitHub Secrets

## Local Development

### Running Pipeline Checks Locally

Before pushing code, you can run pipeline checks locally:

```bash
# Lint check
yarn lint

# Type check
yarn tsc --noEmit

# Format check
yarn prettier --check "**/*.{ts,tsx,js,jsx,json,md}"

# Build
yarn build

# Fix linting issues
yarn lint --fix

# Fix formatting
yarn prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

## Performance Optimizations

### Caching Strategy

1. **Yarn Dependencies**: Cached using yarn cache folder
2. **Next.js Build**: Cached using .next/cache directory
3. **Cache Key**: Based on yarn.lock and source file hashes

### Parallel Execution

- Lint and TypeCheck run in parallel
- Security audit runs independently
- Reduces total pipeline time by ~40%

## Monitoring & Notifications

### GitHub Actions Dashboard

- View pipeline status: `Repository → Actions`
- Click on individual workflows for detailed logs
- Download build artifacts from successful runs

### Status Badges

Add to README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/real-estate-app/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom**: Build job fails
**Solution**:

- Check if all environment variables are set
- Verify no TypeScript errors locally
- Check for missing dependencies

#### 2. Deployment Failures

**Symptom**: Deploy job fails
**Solution**:

- Verify Vercel token is valid
- Check Vercel project ID is correct
- Ensure org ID matches your Vercel organization

#### 3. Dependency Errors

**Symptom**: Install step fails
**Solution**:

- Clear yarn cache
- Update yarn.lock file
- Check for package conflicts

#### 4. Type Check Errors

**Symptom**: TypeCheck job fails
**Solution**:

- Run `yarn tsc --noEmit` locally
- Fix type errors in your code
- Ensure all @types packages are installed

## Branch Protection Rules

### Recommended Settings

Navigate to: `Repository → Settings → Branches → Add rule`

**Branch name pattern**: `main` or `trunk`

**Require status checks**:

- ✓ Require status checks to pass before merging
- ✓ Require branches to be up to date before merging

**Status checks that must pass**:

- ✓ Lint & Code Quality
- ✓ TypeScript Type Check
- ✓ Build Next.js Application

**Additional rules**:

- ✓ Require pull request reviews before merging (1 approval)
- ✓ Dismiss stale pull request approvals when new commits are pushed
- ✓ Require linear history (optional)

## Future Enhancements

### Phase 2 (Testing)

- [ ] Add Jest configuration
- [ ] Implement unit tests
- [ ] Add integration tests
- [ ] Setup test coverage reporting
- [ ] Add Cypress for E2E testing

### Phase 3 (Advanced CI/CD)

- [ ] Add staging environment
- [ ] Implement blue-green deployments
- [ ] Add performance testing
- [ ] Setup automated database migrations
- [ ] Implement canary deployments
- [ ] Add smoke tests after deployment

### Phase 4 (DevOps)

- [ ] Add Docker containerization
- [ ] Implement Kubernetes deployment
- [ ] Setup monitoring and alerts
- [ ] Add automated rollback on failures
- [ ] Implement feature flags

## Best Practices

### Commit Messages

Follow conventional commits:

```
feat: add user authentication
fix: resolve map loading issue
docs: update CI/CD documentation
chore: update dependencies
test: add property service tests
```

### Pull Request Workflow

1. Create feature branch from `main`/`trunk`
2. Make changes and commit
3. Push branch and create PR
4. Wait for CI checks to pass
5. Request code review
6. Merge after approval

### Environment Variables

- Never commit `.env` files
- Use GitHub Secrets for sensitive data
- Document all required environment variables
- Use different values for staging/production

## Metrics & KPIs

### Pipeline Performance

- **Build Time**: Target < 5 minutes
- **Deploy Time**: Target < 2 minutes
- **Success Rate**: Target > 95%

### Code Quality

- **Linting Pass Rate**: Target 100%
- **Type Coverage**: Target 95%
- **Test Coverage**: Target 80% (when implemented)

## Support & Resources

### Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

### Internal Resources

- Pipeline Configuration: `.github/workflows/ci-cd.yml`
- Package Scripts: `package.json`
- TypeScript Config: `tsconfig.json`

### Getting Help

- Check GitHub Actions logs for detailed errors
- Review this documentation for common issues
- Contact DevOps team for deployment issues

---

**Pipeline Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: DevOps Team
