# Releasing OpenClaw Launcher

## How releases work

1. You push a git tag (`v*`)
2. GitHub Actions builds macOS (.dmg), Windows (.exe), and Linux (.AppImage)
3. A GitHub Release is created automatically with all 3 assets
4. The website (lizmacliz.com) always points to the latest release via `/api/download`

No manual site updates needed. Ever.

## Step by step

```bash
# 1. Make sure you're on main with everything committed
git status

# 2. Bump version in package.json
# Example: 0.3.3 -> 0.4.0
npm version patch   # or minor / major

# 3. Push the commit and tag
git push && git push --tags
```

That's it. GitHub Actions takes over from here.

## What happens automatically

- **GitHub Actions** (`.github/workflows/release.yml`) triggers on any `v*` tag push
- Builds on 3 runners: macOS (arm64), Windows, Linux
- macOS build is **code signed** (Developer ID) and **notarized** (Apple)
- All assets are uploaded to a GitHub Release with the tag name
- **lizmacliz.com/api/download** always redirects to the latest release assets

## Website download links

The site uses a Vercel serverless function at `/api/download` that:

1. Calls `https://api.github.com/repos/lizmacbot-alt/openclaw-launcher/releases/latest`
2. Finds the right asset by file extension (.dmg, .exe, .AppImage)
3. Returns a 302 redirect to the download URL
4. Caches for 5 minutes on Vercel edge

Links on the site:
- `/api/download?platform=mac` (macOS .dmg)
- `/api/download?platform=windows` (Windows .exe)
- `/api/download?platform=linux` (Linux .AppImage)

Source: `api/download.js` in the lizmacliz.com repo.

## GitHub Actions secrets (already configured)

| Secret | What it is |
|--------|-----------|
| `CSC_LINK` | Base64 encoded .p12 certificate for macOS code signing |
| `CSC_KEY_PASSWORD` | Password for the .p12 file |
| `APPLE_ID` | Apple Developer account email |
| `APPLE_ID_PASSWORD` | App-specific password for notarization |
| `APPLE_TEAM_ID` | Apple Developer Team ID (N45547YJ4V) |

## Repos involved

| Repo | What | Visibility |
|------|------|-----------|
| `lizmacbot-alt/openclaw-launcher` | Launcher source + CI | Public |
| `lizmacbot-alt/lizmacliz.com` | Website + download API | Private |
| `lizmacbot-alt/openclaw-templates` | Premium template files | Private |

## Troubleshooting

- **Build failed?** Check Actions tab on GitHub. Most common issue: code signing certs expired or secrets missing.
- **Downloads 404?** The release might still be building. Check Actions. Assets take ~2 min (Linux) to ~3 min (macOS).
- **Old version downloading?** Vercel caches for 5 min. Wait or redeploy the site to bust cache.
- **Notarization failed?** Check if the app-specific password is still valid at appleid.apple.com.
