# Testing Video Spaces (master_master_playlist)

This guide explains how to test the master_master_playlist functionality with real Twitter Spaces.

## What are Video Spaces?

Twitter Spaces with video content use a different playlist structure:
- **Audio-only spaces**: `dynamic_playlist.m3u8` → `master_playlist.m3u8` → `playlist_XXXXX.m3u8`
- **Video spaces**: `dynamic_playlist.m3u8` → `master_master_playlist.m3u8` → `master_playlist.m3u8` → `playlist_XXXXX.m3u8`

## Running the Tests

### Basic Tests (No Internet Required)

Run the unit tests that verify the URL conversion and parsing logic:

```bash
npm test -- test/MasterMasterPlaylist.test.ts
```

This will test:
- ✅ URL conversion logic
- ✅ Playlist parsing logic
- ✅ Edge cases
- ⏭️ Real-world tests (skipped without URL)

### Testing with a Real Space

To test with an actual Twitter Space that has video:

1. **Find a live video space** or get a playlist URL from a previous video space
2. **Set the environment variable** and run tests:

```bash
TEST_MASTER_MASTER_URL="https://prod-fastly-ap-northeast-1.video.pscp.tv/.../master_master_playlist.m3u8" npm test -- test/MasterMasterPlaylist.test.ts
```

## How to Get a Test URL

### Method 1: From a Live Video Space

1. Find a Twitter Space with video (often from verified accounts or official channels)
2. Get the Space ID from the URL: `https://twitter.com/i/spaces/1ABC...`
3. Use twspace-crawler to monitor it:
   ```bash
   twspace-crawler --id 1ABC... --debug
   ```
4. Check the logs for the playlist URL - if it contains `master_master_playlist`, it's a video space

### Method 2: Using Twitter API

If you have Twitter API credentials:

```bash
# 1. Get space metadata
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.twitter.com/2/spaces/1ABC.../by/creator_id?space.fields=host_ids"

# 2. Get media_key from the space
# 3. Get live stream status to get the playlist URL
```

### Method 3: Check Logs

If you've been running twspace-crawler, check your logs:

```bash
# Search for master_master_playlist in your logs
grep -r "master_master_playlist" logs/

# Example log entry:
# {"id":"1ABC...","playlist_url":"https://.../master_master_playlist.m3u8"}
```

## Example: Testing the Full Flow

Here's a complete example of testing a video space:

```bash
# 1. Set up environment variable with a real URL
export TEST_MASTER_MASTER_URL="https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/YOUR_HASH/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8"

# 2. Run the tests
npm test -- test/MasterMasterPlaylist.test.ts

# Expected output:
# ✓ should successfully fetch and parse real master_master_playlist
# ✓ should download chunks from resolved playlist
# ✓ Found XX audio chunks in playlist
```

## Downloading a Video Space Manually

Once you have a video space URL, you can download it directly:

```bash
# Method 1: Using the Space ID
twspace-crawler --id 1ABC...

# Method 2: Using the playlist URL directly
twspace-crawler --url "https://.../master_master_playlist.m3u8"

# Method 3: With additional metadata
twspace-crawler --id 1ABC... --url "https://.../master_master_playlist.m3u8"
```

The tool will:
1. Detect it's a `master_master_playlist` URL
2. Parse the playlist to find the audio stream
3. Download the audio chunks
4. Convert to `.m4a` format

## Troubleshooting

### Test URLs Expire

Twitter Space playlist URLs often expire after the space ends. If you get 404 errors:
- The space may have ended and the playlist is no longer available
- Try with a different, more recent space
- Some spaces are not available for replay

### Can't Find Video Spaces

Video spaces are less common than audio-only spaces. Look for:
- Official brand accounts
- News organizations
- Large events or announcements
- Community Spaces (some support video)

### Tests Fail with Real URL

If tests fail when using a real URL:
1. Verify the URL is accessible: `curl -I "YOUR_URL"`
2. Check if the space is still available
3. Ensure the URL contains `master_master_playlist.m3u8`
4. Check the debug logs: `npm test -- test/MasterMasterPlaylist.test.ts --debug`

## Use Case: Arabic Audio Collection

For collecting Arabic audio for diarization testing:

```bash
# Monitor Arabic-speaking accounts
twspace-crawler --user account1,account2,account3

# The tool will automatically:
# - Detect when they go live
# - Handle both audio and video spaces
# - Download the audio in .m4a format
# - Save to download/[username]/ directory
```

## Contributing

If you find a video space that can be used for testing, please share:
1. The Space ID (if still available)
2. Whether it was audio-only or had video
3. Any issues encountered during download

This helps improve the tool for everyone!
