# Real Sample Reels for Testing

This directory contains professional, royalty-free video URLs for testing Instagram Reel posting.

## 🎬 Real Vertical Videos (Ready to Use)

All videos are from **Pexels** - free for commercial use, no attribution required.
Format: MP4, 1080x1920 (9:16 vertical), perfect for Instagram Reels.

### Lifestyle & Aesthetic
| Video | Direct URL |
|-------|------------|
| 🌅 Sunset Beach Walk | `https://videos.pexels.com/video-files/4763824/4763824-hd_1080_1920_25fps.mp4` |
| ☕ Coffee Making | `https://videos.pexels.com/video-files/5528183/5528183-hd_1080_1920_30fps.mp4` |
| 🍃 Nature Leaves | `https://videos.pexels.com/video-files/4057563/4057563-hd_1080_1920_25fps.mp4` |

### Fitness & Wellness
| Video | Direct URL |
|-------|------------|
| 🏃 Fitness Workout | `https://videos.pexels.com/video-files/4536453/4536453-hd_1080_1920_25fps.mp4` |
| 🧘 Yoga/Meditation | `https://videos.pexels.com/video-files/4536477/4536477-hd_1080_1920_25fps.mp4` |

### Fashion & Portrait
| Video | Direct URL |
|-------|------------|
| 🌸 Fashion Model | `https://videos.pexels.com/video-files/5702893/5702893-hd_1080_1920_25fps.mp4` |
| 👗 Street Style | `https://videos.pexels.com/video-files/5532776/5532776-hd_1080_1920_25fps.mp4` |

### Urban & Nightlife
| Video | Direct URL |
|-------|------------|
| 🌆 City Night Lights | `https://videos.pexels.com/video-files/3571264/3571264-hd_1080_1920_30fps.mp4` |
| 🎵 DJ/Music Party | `https://videos.pexels.com/video-files/4586627/4586627-hd_1080_1920_25fps.mp4` |

### Tech & Product
| Video | Direct URL |
|-------|------------|
| 📱 Smartphone/Tech | `https://videos.pexels.com/video-files/6774106/6774106-hd_1080_1920_25fps.mp4` |

---

## Video Requirements for Instagram Reels
- **Format**: MP4 (H.264 video codec, AAC audio)
- **Aspect Ratio**: 9:16 (vertical) - 1080x1920 recommended ✅
- **Duration**: 3 seconds to 15 minutes
- **Max File Size**: 1GB
- **Must be publicly accessible via HTTPS** ✅

---

## 🚀 Quick Test with curl

```bash
curl -X POST http://localhost:3000/api/test-reel \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_META_ACCESS_TOKEN",
    "instagramAccountId": "YOUR_INSTAGRAM_BUSINESS_ID",
    "videoUrl": "https://videos.pexels.com/video-files/4763824/4763824-hd_1080_1920_25fps.mp4",
    "caption": "🌅 Beautiful sunset vibes! #sunset #beach #reels #viral"
  }'
```

---

## 📱 Using the Test Page

1. Start the app: `npm run dev`
2. Open: `http://localhost:3000/test-reel`
3. Enter your Meta credentials
4. Select a sample video from the dropdown
5. Click "Post Test Reel"

---

## 🔑 Getting Meta Credentials

### Step 1: Get Page Access Token
1. Go to [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your Meta App
3. Click "Generate Access Token" → "Get Page Access Token"
4. Select the Facebook Page linked to your Instagram
5. Add permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

### Step 2: Get Instagram Business Account ID
```
GET /{page-id}?fields=instagram_business_account
```
The `instagram_business_account.id` is your Instagram Business Account ID.

---

## ⚠️ Troubleshooting

| Error | Solution |
|-------|----------|
| Token expired | Generate a new token from Graph API Explorer |
| Permission denied | Ensure token has `instagram_content_publish` permission |
| Invalid video URL | Use HTTPS URL, video must be publicly accessible |
| Unsupported format | Use MP4 with H.264 codec |
| Account not found | Instagram must be Business/Creator type & linked to FB Page |

---

## 📺 Video Sources

All sample videos are from [Pexels](https://www.pexels.com/videos/) - free stock videos for commercial use.
