'use client';

import { useState } from 'react';

// Real vertical sample video URLs for Instagram Reels testing
// These are from Pexels and Pixabay - free for commercial use
const SAMPLE_VIDEOS = [
    {
        name: '🌅 Sunset Beach Walk (Vertical)',
        url: 'https://videos.pexels.com/video-files/4763824/4763824-hd_1080_1920_25fps.mp4',
        description: 'Beautiful sunset beach scene - perfect 9:16 vertical format'
    },
    {
        name: '☕ Coffee Making (Lifestyle)',
        url: 'https://videos.pexels.com/video-files/5528183/5528183-hd_1080_1920_30fps.mp4',
        description: 'Aesthetic coffee preparation - lifestyle content'
    },
    {
        name: '🏃 Fitness Workout (Vertical)',
        url: 'https://videos.pexels.com/video-files/4536453/4536453-hd_1080_1920_25fps.mp4',
        description: 'Fitness/gym workout footage - health & wellness'
    },
    {
        name: '🌸 Fashion Model (Portrait)',
        url: 'https://videos.pexels.com/video-files/5702893/5702893-hd_1080_1920_25fps.mp4',
        description: 'Fashion/lifestyle portrait video'
    },
    {
        name: '🌆 City Night Lights',
        url: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1080_1920_30fps.mp4',
        description: 'Urban nightlife city lights - cinematic vertical'
    },
    {
        name: '🍃 Nature Leaves (Aesthetic)',
        url: 'https://videos.pexels.com/video-files/4057563/4057563-hd_1080_1920_25fps.mp4',
        description: 'Calming nature footage with leaves'
    },
    {
        name: '🎵 Music/DJ (Party Vibe)',
        url: 'https://videos.pexels.com/video-files/4586627/4586627-hd_1080_1920_25fps.mp4',
        description: 'Music/party atmosphere vertical video'
    },
    {
        name: '📱 Tech/Smartphone (Product)',
        url: 'https://videos.pexels.com/video-files/6774106/6774106-hd_1080_1920_25fps.mp4',
        description: 'Tech product style video'
    }
];

const SAMPLE_CAPTIONS = [
    '🎬 Test Reel from DigitalMEng! #test #automation #digitalmarketing',
    '✨ Automated content posting made easy! #contentcreation #socialmedia',
    '🚀 First test reel - let\'s go! #testing #devlife #automation',
    '🎯 Quality content, zero effort! #ai #marketing #productivity'
];

export default function TestReelPage() {
    const [accessToken, setAccessToken] = useState('');
    const [instagramAccountId, setInstagramAccountId] = useState('');
    const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEOS[0].url);
    const [caption, setCaption] = useState(SAMPLE_CAPTIONS[0]);
    const [customVideoUrl, setCustomVideoUrl] = useState('');
    const [useCustomVideo, setUseCustomVideo] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch('/api/test-reel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken,
                    instagramAccountId,
                    videoUrl: useCustomVideo ? customVideoUrl : videoUrl,
                    caption,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to post reel');
                setResult(data);
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-3">
                        🎬 Instagram Reel Tester
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Test your Instagram Reel posting integration with sample videos
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="text-2xl">⚙️</span> Configuration
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Access Token */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Meta Access Token *
                                </label>
                                <input
                                    type="password"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                    placeholder="EAAxxxxxxx..."
                                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Get from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Graph API Explorer</a>
                                </p>
                            </div>

                            {/* Instagram Account ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Instagram Business Account ID *
                                </label>
                                <input
                                    type="text"
                                    value={instagramAccountId}
                                    onChange={(e) => setInstagramAccountId(e.target.value)}
                                    placeholder="17841400000000000"
                                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    GET /{'{page-id}'}?fields=instagram_business_account
                                </p>
                            </div>

                            {/* Video Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Video Source
                                </label>
                                <div className="flex gap-3 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setUseCustomVideo(false)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${!useCustomVideo
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        Sample Videos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUseCustomVideo(true)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${useCustomVideo
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        Custom URL
                                    </button>
                                </div>

                                {!useCustomVideo ? (
                                    <select
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        {SAMPLE_VIDEOS.map((video, i) => (
                                            <option key={i} value={video.url}>
                                                {video.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="url"
                                        value={customVideoUrl}
                                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                                        placeholder="https://your-domain.com/video.mp4"
                                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                )}
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Caption
                                </label>
                                <select
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all mb-2"
                                >
                                    {SAMPLE_CAPTIONS.map((c, i) => (
                                        <option key={i} value={c}>{c}</option>
                                    ))}
                                </select>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Or type your custom caption..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Posting Reel...
                                    </>
                                ) : (
                                    <>
                                        🚀 Post Test Reel
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info & Results Section */}
                    <div className="space-y-6">
                        {/* Video Preview */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎥</span> Video Preview
                            </h2>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    key={useCustomVideo ? customVideoUrl : videoUrl}
                                    src={useCustomVideo ? customVideoUrl : videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {useCustomVideo
                                    ? 'Custom video URL'
                                    : SAMPLE_VIDEOS.find(v => v.url === videoUrl)?.description
                                }
                            </p>
                        </div>

                        {/* Result Display */}
                        {(result || error) && (
                            <div className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border ${result?.success ? 'border-green-500/50' : 'border-red-500/50'
                                }`}>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    {result?.success ? (
                                        <>
                                            <span className="text-2xl">✅</span> Success!
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-2xl">❌</span> Error
                                        </>
                                    )}
                                </h2>

                                {result?.success ? (
                                    <div className="space-y-2">
                                        <p className="text-green-400">{result.message}</p>
                                        {result.postId && (
                                            <p className="text-sm text-gray-400">
                                                Post ID: <code className="bg-gray-700 px-2 py-1 rounded">{result.postId}</code>
                                            </p>
                                        )}
                                        {result.postUrl && (
                                            <a
                                                href={result.postUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-sm hover:opacity-90 transition-all"
                                            >
                                                View on Instagram →
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-red-400">{error || result?.error}</p>
                                        {result?.help && (
                                            <p className="text-sm text-gray-400 mt-2">
                                                💡 {result.help}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <details className="mt-4">
                                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                                        View full response
                                    </summary>
                                    <pre className="mt-2 p-3 bg-gray-900 rounded-lg text-xs overflow-auto max-h-48">
                                        {JSON.stringify(result || { error }, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {/* Setup Guide */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">📖</span> Quick Setup Guide
                            </h2>
                            <ol className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-2">
                                    <span className="text-purple-400 font-bold">1.</span>
                                    <span>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Meta Graph API Explorer</a></span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-purple-400 font-bold">2.</span>
                                    <span>Select your app & get Page Access Token</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-purple-400 font-bold">3.</span>
                                    <span>Add permissions: instagram_basic, instagram_content_publish</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-purple-400 font-bold">4.</span>
                                    <span>Get Instagram Account ID from: GET /{'{page-id}'}?fields=instagram_business_account</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-purple-400 font-bold">5.</span>
                                    <span>Select a sample video & click Post!</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 text-center text-gray-500 text-sm">
                    <p>DigitalMEng Reel Tester • Powered by Meta Graph API</p>
                </div>
            </div>
        </div>
    );
}
