# Quick Start Guide - Testing Twitter Spaces Downloader

## Step 1: Check You Have Everything

Copy-paste these commands one by one:

```bash
node --version
```
Should show: `v14` or higher ✅

```bash
npm --version
```
Should show: `6.0` or higher ✅

```bash
ffmpeg -version
```
Should show ffmpeg info ✅

If any don't work, install them first!

---

## Step 2: Get Your Twitter Login Tokens

1. Open Twitter in your browser and **log in**
2. Press **F12** on your keyboard (opens Developer Tools)
3. Click **Application** tab (at the top)
4. Click **Cookies** on the left
5. Click **https://twitter.com** or **https://x.com**
6. Find these two cookies and **copy their values**:
   - `auth_token` → copy the long text
   - `ct0` → copy the long text

**Keep these safe!** You'll need them in the next step.

---

## Step 3: Install the Fixed Version

Copy-paste these commands:

```bash
# Go to the project folder
cd /home/user/twspace-crawler

# Make sure you have the latest code
git pull

# Install everything
npm install

# Build the project
npm run build
```

Wait for it to finish... ✅

---

## Step 4: Set Up Your Tokens

Copy-paste this (replace YOUR_AUTH_TOKEN and YOUR_CT0_TOKEN with what you copied):

```bash
export TWITTER_AUTH_TOKEN="YOUR_AUTH_TOKEN"
export TWITTER_CSRF_TOKEN="YOUR_CT0_TOKEN"
```

Example:
```bash
export TWITTER_AUTH_TOKEN="a1b2c3d4e5f6..."
export TWITTER_CSRF_TOKEN="x9y8z7w6v5u4..."
```

---

## Step 5: Test Downloading a Space

### Option A: Download from a Space ID

Find any Twitter Space URL like: `https://twitter.com/i/spaces/1mnGeRRRwkrJX`

The Space ID is the part after `/spaces/` → `1mnGeRRRwkrJX`

Copy-paste this (replace SPACE_ID):

```bash
npx twspace-crawler --id SPACE_ID
```

Example:
```bash
npx twspace-crawler --id 1mnGeRRRwkrJX
```

### Option B: Monitor Someone's Account

Copy-paste this (replace USERNAME with someone who does Spaces):

```bash
npx twspace-crawler --user USERNAME
```

Example:
```bash
npx twspace-crawler --user elonmusk
```

It will wait until they start a Space, then download it automatically!

---

## Step 6: Check If It Worked

Look in the `download` folder:

```bash
ls download/
```

You should see folders with usernames!

```bash
ls download/USERNAME/
```

You should see `.m4a` audio files! 🎉

---

## Testing Video Spaces Specifically

Video spaces have `master_master_playlist` in their URL. To test the fix:

### Quick Test (No Real Space Needed)

```bash
npm test -- test/MasterMasterPlaylist.test.ts
```

Should show: `9 tests complete` ✅

### Full Test (With a Real Video Space)

If you have a video space URL, copy-paste this:

```bash
TEST_MASTER_MASTER_URL="PASTE_URL_HERE" npm test -- test/MasterMasterPlaylist.test.ts
```

Example:
```bash
TEST_MASTER_MASTER_URL="https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8" npm test
```

---

## Common Problems & Fixes

### "Cannot find module"
```bash
npm install
```

### "Permission denied"
```bash
sudo npm install -g twspace-crawler
```

### "401 Unauthorized" or "403 Forbidden"
Your tokens expired! Go back to Step 2 and get fresh tokens.

### "404 Not Found"
The Space ended and is no longer available. Try a different Space.

### Nothing downloads
Make sure:
- The Space has ended (tool doesn't download live spaces by default)
- Or use `--force` flag:
  ```bash
  npx twspace-crawler --id SPACE_ID --force
  ```

---

## That's It!

You now have a working Twitter Spaces downloader that works with:
- ✅ Audio-only Spaces
- ✅ Video Spaces (the new fix!)
- ✅ Live monitoring
- ✅ Automatic downloads

**Your downloaded files will be in**: `download/[username]/[filename].m4a`

Enjoy! 🎵
