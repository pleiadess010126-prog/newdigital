'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Brain, Clock, TrendingUp, Zap, Target,
    BarChart3, Sparkles, RefreshCw, ChevronRight, Calendar,
    Mail, MessageSquare, Users, AlertTriangle, ThumbsUp
} from 'lucide-react';

interface OptimalTimeSlot {
    dayOfWeek: number;
    hour: number;
    score: number;
    confidence: number;
}

interface Recommendation {
    type: string;
    title: string;
    description: string;
    impact: string;
    confidence: number;
    action?: string;
}

interface PredictionResult {
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    responseRate: number;
    confidence: number;
    factors: Array<{ factor: string; impact: string; score: number }>;
}

export default function AIPage() {
    const [loading, setLoading] = useState(true);
    const [optimalTimes, setOptimalTimes] = useState<OptimalTimeSlot[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [testSubject, setTestSubject] = useState('');
    const [predicting, setPredicting] = useState(false);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const response = await fetch('/api/ai/predictions');
            const data = await response.json();
            setOptimalTimes(data.optimalTimes || []);
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            // Use demo data
            setOptimalTimes([
                { dayOfWeek: 2, hour: 10, score: 92, confidence: 0.89 },
                { dayOfWeek: 3, hour: 14, score: 88, confidence: 0.85 },
                { dayOfWeek: 4, hour: 9, score: 85, confidence: 0.82 },
                { dayOfWeek: 1, hour: 11, score: 81, confidence: 0.78 },
                { dayOfWeek: 5, hour: 15, score: 76, confidence: 0.74 }
            ]);
            setRecommendations([
                {
                    type: 'subject_line',
                    title: 'Optimize Subject Lines',
                    description: 'Add personalization to increase open rates by up to 26%',
                    impact: 'high',
                    confidence: 0.92,
                    action: 'Use {{firstName}} in subject lines'
                },
                {
                    type: 'send_time',
                    title: 'Optimal Send Time',
                    description: 'Tuesday 10AM shows highest engagement for your audience',
                    impact: 'medium',
                    confidence: 0.87
                },
                {
                    type: 'audience',
                    title: 'Segment High-Value Leads',
                    description: 'Create a segment for leads with score > 80 for premium content',
                    impact: 'high',
                    confidence: 0.85
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async () => {
        if (!testSubject.trim()) return;

        setPredicting(true);
        try {
            const response = await fetch('/api/ai/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'predict-engagement',
                    subject: testSubject,
                    audienceSize: 1000
                })
            });
            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            // Demo prediction
            setPrediction({
                openRate: 24.5,
                clickRate: 3.2,
                unsubscribeRate: 0.4,
                responseRate: 1.8,
                confidence: 0.82,
                factors: [
                    { factor: 'Subject Length', impact: 'positive', score: 8 },
                    { factor: 'Personalization', impact: testSubject.includes('{{') ? 'positive' : 'neutral', score: testSubject.includes('{{') ? 9 : 5 },
                    { factor: 'Urgency Words', impact: testSubject.toLowerCase().includes('now') || testSubject.toLowerCase().includes('today') ? 'positive' : 'neutral', score: 6 },
                    { factor: 'Spam Triggers', impact: testSubject.toUpperCase() === testSubject ? 'negative' : 'positive', score: testSubject.toUpperCase() === testSubject ? 3 : 8 }
                ]
            });
        } finally {
            setPredicting(false);
        }
    };

    const formatHour = (hour: number) => {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}${suffix}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    Predictive AI
                                </h1>
                                <p className="text-slate-500 mt-1">AI-powered marketing optimization</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchPredictions}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                        <Clock className="w-8 h-8 mb-3 opacity-80" />
                        <h3 className="text-lg font-bold mb-1">Send Time Optimization</h3>
                        <p className="text-sm text-white/80">AI analyzes engagement patterns to find the best send times</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
                        <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                        <h3 className="text-lg font-bold mb-1">Engagement Prediction</h3>
                        <p className="text-sm text-white/80">Predict open rates, click rates, and conversions</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                        <Sparkles className="w-8 h-8 mb-3 opacity-80" />
                        <h3 className="text-lg font-bold mb-1">Smart Recommendations</h3>
                        <p className="text-sm text-white/80">Get AI-powered suggestions to improve campaigns</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Optimal Send Times */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-600" />
                                Optimal Send Times
                            </h2>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Based on 30-day data</span>
                        </div>
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Analyzing engagement data...</p>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-3">
                                    {optimalTimes.slice(0, 5).map((slot, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                                                    index === 1 ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                                                        'bg-slate-400'
                                                }`}>
                                                #{index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">
                                                    {dayNames[slot.dayOfWeek]} at {formatHour(slot.hour)}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {Math.round(slot.confidence * 100)}% confidence
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-violet-600">{slot.score}</p>
                                                <p className="text-xs text-slate-500">score</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Weekly Heatmap Preview */}
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                    <h4 className="text-sm font-medium text-slate-600 mb-3">Weekly Engagement Pattern</h4>
                                    <div className="flex gap-1">
                                        {dayNames.map((day, i) => (
                                            <div key={day} className="flex-1 text-center">
                                                <p className="text-xs text-slate-500 mb-1">{day}</p>
                                                <div className={`h-8 rounded ${i === 2 ? 'bg-violet-500' :
                                                        i === 3 || i === 4 ? 'bg-violet-400' :
                                                            i === 1 ? 'bg-violet-300' :
                                                                i === 5 ? 'bg-violet-200' :
                                                                    'bg-slate-200'
                                                    }`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Recommendations */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                AI Recommendations
                            </h2>
                        </div>
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${rec.type === 'subject_line' ? 'bg-blue-100' :
                                                    rec.type === 'send_time' ? 'bg-violet-100' :
                                                        rec.type === 'audience' ? 'bg-emerald-100' :
                                                            'bg-slate-100'
                                                }`}>
                                                {rec.type === 'subject_line' ? <Mail className="w-4 h-4 text-blue-600" /> :
                                                    rec.type === 'send_time' ? <Clock className="w-4 h-4 text-violet-600" /> :
                                                        rec.type === 'audience' ? <Users className="w-4 h-4 text-emerald-600" /> :
                                                            <Zap className="w-4 h-4 text-slate-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rec.impact === 'high' ? 'bg-emerald-100 text-emerald-700' :
                                                            rec.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {rec.impact} impact
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">{rec.description}</p>
                                                {rec.action && (
                                                    <p className="text-sm text-violet-600 mt-1 font-medium">💡 {rec.action}</p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Engagement Predictor */}
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-pink-600" />
                            Engagement Predictor
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Test your subject line to predict engagement metrics</p>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-4 mb-6">
                            <input
                                type="text"
                                value={testSubject}
                                onChange={(e) => setTestSubject(e.target.value)}
                                placeholder="Enter your email subject line to test..."
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <button
                                onClick={handlePredict}
                                disabled={!testSubject.trim() || predicting}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Brain className="w-4 h-4" />
                                {predicting ? 'Analyzing...' : 'Predict'}
                            </button>
                        </div>

                        {prediction && (
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-violet-600" />
                                    <span className="font-semibold text-slate-800">Prediction Results</span>
                                    <span className="text-sm text-slate-500">
                                        ({Math.round(prediction.confidence * 100)}% confidence)
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-violet-600">{prediction.openRate.toFixed(1)}%</p>
                                        <p className="text-sm text-slate-500">Open Rate</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-pink-600">{prediction.clickRate.toFixed(1)}%</p>
                                        <p className="text-sm text-slate-500">Click Rate</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-emerald-600">{prediction.responseRate.toFixed(1)}%</p>
                                        <p className="text-sm text-slate-500">Response Rate</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-amber-600">{prediction.unsubscribeRate.toFixed(1)}%</p>
                                        <p className="text-sm text-slate-500">Unsubscribe</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-slate-600">Analysis Factors</h4>
                                    {prediction.factors.map((factor, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                                            {factor.impact === 'positive' ? (
                                                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                                            ) : factor.impact === 'negative' ? (
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Target className="w-4 h-4 text-slate-400" />
                                            )}
                                            <span className="flex-1 text-sm text-slate-700">{factor.factor}</span>
                                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${factor.impact === 'positive' ? 'bg-emerald-500' :
                                                            factor.impact === 'negative' ? 'bg-red-500' :
                                                                'bg-slate-400'
                                                        }`}
                                                    style={{ width: `${factor.score * 10}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 w-8">{factor.score}/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips Banner */}
                <div className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Brain className="w-6 h-6" />
                        How AI Optimization Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold mb-2">Data Collection</h3>
                            <p className="text-sm text-white/80">We analyze opens, clicks, and conversions across all your campaigns</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold mb-2">Pattern Recognition</h3>
                            <p className="text-sm text-white/80">AI identifies patterns in audience behavior and engagement trends</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold mb-2">Smart Optimization</h3>
                            <p className="text-sm text-white/80">Get actionable recommendations to maximize campaign performance</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
