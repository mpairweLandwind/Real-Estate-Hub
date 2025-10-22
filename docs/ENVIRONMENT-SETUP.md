# Environment Variables Setup Guide

## Overview

This guide explains how to set up environment variables for local development and production deployment.

## Local Development Setup

### 1. Create `.env.local` File

Copy the example file and fill in your actual values:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

#### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (e.g., `project-id.firebaseapp.com`)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket (e.g., `project-id.appspot.com`)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

**Where to find:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app or create one
6. Copy the config values from `firebaseConfig` object

#### Google Maps API
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

**Where to find:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create one
3. Go to APIs & Services → Credentials
4. Create API key or copy existing one
5. Enable Maps JavaScript API and Places API

## GitHub Actions Secrets (CI/CD)

For the CI/CD pipeline to work, add these secrets to your GitHub repository:

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

### Required Secrets

All the environment variables listed above need to be added as GitHub Secrets with the same names.

**Example:**
- Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
- Value: `your_actual_firebase_api_key`

### Current Firebase Values

Based on your current configuration in `lib/firebase/config.ts`:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mernapp-6e488.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mernapp-6e488
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mernapp-6e488.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=536088247858
NEXT_PUBLIC_FIREBASE_APP_ID=1:536088247858:web:361e7040eb5130f75e462b
```

## Vercel Deployment (Optional)

If deploying to Vercel, add the same environment variables in Vercel dashboard:

1. Go to your Vercel project
2. Navigate to: **Settings** → **Environment Variables**
3. Add each variable for Production, Preview, and Development environments

## Security Best Practices

✅ **DO:**
- Keep `.env.local` file in `.gitignore` (already configured)
- Use environment-specific values for different environments
- Rotate API keys regularly
- Use read-only keys when possible

❌ **DON'T:**
- Commit `.env.local` or `.env` files to version control
- Share API keys in public channels
- Use production credentials in development

## Troubleshooting

### Application not connecting to Firebase/Supabase

**Issue:** Firebase or Supabase services not working locally

**Solution:**
1. Verify `.env.local` file exists in project root
2. Check all required variables are set
3. Restart the development server: `yarn dev`
4. Clear Next.js cache: `rm -rf .next`

### CI/CD Pipeline Failing

**Issue:** GitHub Actions build failing with missing environment variables

**Solution:**
1. Verify all secrets are added to GitHub repository
2. Check secret names match exactly (case-sensitive)
3. Trigger a new workflow run after adding secrets

### Environment Variables Not Loading

**Issue:** `process.env.NEXT_PUBLIC_*` returns undefined

**Solution:**
1. Ensure variable names start with `NEXT_PUBLIC_` prefix
2. Restart development server after adding new variables
3. Check `.env.local` file has no syntax errors
4. Verify the file is in the project root directory

## Validation

To verify your environment variables are loaded correctly, you can temporarily add this to a page:

```typescript
console.log({
  supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  maps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
})
```

This will log `true` for each configured variable (without exposing the actual values).

## Next Steps

After setting up environment variables:

1. ✅ Create `.env.local` file with your values
2. ✅ Add all secrets to GitHub repository
3. ✅ Test application locally: `yarn dev`
4. ✅ Trigger CI/CD pipeline to verify GitHub Actions
5. ✅ (Optional) Configure Vercel deployment variables

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)
