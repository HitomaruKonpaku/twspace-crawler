# Pull Request: Fix Twitter Spaces downloads for video spaces and live streaming

## Summary

This PR adds comprehensive support for downloading Twitter Spaces with video content and live streaming capabilities.

## Problems Solved

### 1. Video Spaces Not Working (master_master_playlist)
- **Issue**: Spaces with video use `master_master_playlist.m3u8` URLs instead of `master_playlist.m3u8`
- **Fix**: Added detection and parsing of master_master_playlist files to extract audio streams

### 2. Live Space Downloads Failing
- **Issue**: Using `--force` on live spaces resulted in 404 errors
- **Fix**: Added support for downloading from `dynamic_playlist.m3u8` (live streams) directly

## Changes

### Core Fixes

**`src/apis/PeriscopeApi.ts`**
- Added `master_master_playlist` detection and parsing
- Added `extractStreamUrl()` method to find audio-only streams from video playlists
- Added `dynamic_playlist` support for live space downloads
- Improved fallback logic for ended vs live spaces

**`src/utils/PeriscopeUtil.ts`**
- Added URL conversion for `master_master_playlist` → `master_playlist`

### Documentation & Testing

**Test Files:**
- `test/MasterMasterPlaylist.test.ts` - Comprehensive test suite (9 tests)
- `test/TESTING_VIDEO_SPACES.md` - Testing guide with examples

**Documentation:**
- `QUICK_START.md` - Beginner-friendly setup guide
- `LIVE_SPACE_FIX.md` - Live space download documentation

**Utilities:**
- `verify-version.sh` - Version verification script
- `test-live-space.sh` - Quick test script for live spaces

## Testing

All tests pass:
```bash
npm test -- test/MasterMasterPlaylist.test.ts
# 9 tests complete (2 skipped without URL)
```

## Use Cases

This fix enables:
1. ✅ Downloading Twitter Spaces with video content (extracts audio)
2. ✅ Downloading from live spaces using `--force` flag
3. ✅ Arabic audio collection for diarization testing (original use case)

## Backwards Compatibility

✅ All existing functionality preserved
- Audio-only spaces work as before
- Ended space downloads unchanged
- No breaking changes to API

## How to Test

```bash
# Set your Twitter tokens
export TWITTER_AUTH_TOKEN="your_token"
export TWITTER_CSRF_TOKEN="your_csrf_token"

# Test with video space
node dist/index.js --id SPACE_ID

# Test live space download
node dist/index.js --id SPACE_ID --force
```

## Commits

1. `3035aeb` - Add support for master_master_playlist URLs in video spaces
2. `245ffbb` - Add comprehensive tests for master_master_playlist support
3. `6421cba` - Add beginner-friendly Quick Start guide
4. `f6a9c6c` - Fix live space downloads by supporting dynamic_playlist URLs
5. `a464a67` - Add test script for live space downloads
6. `abb0d49` - Document live space download fix

## Branch

`claude/fix-twitter-spaces-download-011CUUNN2TQE7agGP94wKhJ3`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
