import { VoiceOption, EmotionOption } from '../types';

export const VOICES: VoiceOption[] = [
  {
    id: 'female',
    name: 'Farhana',
    bengaliName: 'ফারহানা',
    gender: 'Female',
    persona: 'Natural & Expressive',
    description: 'Soothing, friendly, and crystal-clear voice ideal for educational content, documentaries, and corporate storytelling.',
    avatarBg: 'from-purple-500 via-indigo-500 to-pink-500',
    accent: 'Standard Dhaka Bangla',
    tag: 'Most Popular',
  },
  {
    id: 'male',
    name: 'Kabir',
    bengaliName: 'কবির',
    gender: 'Male',
    persona: 'Professional Narrator',
    description: 'Warm, trustworthy, and clear baritone tone suitable for podcasts, presentations, tutorials, and audiobooks.',
    avatarBg: 'from-blue-600 via-indigo-600 to-violet-700',
    accent: 'Urban Standard Dialect',
    tag: 'Professional',
  },
  {
    id: 'cute_girl',
    name: 'Rodela',
    bengaliName: 'রোদেলা',
    gender: 'Female',
    persona: 'Sweet & Vibrant Girl',
    description: 'Youthful, lively, sweet and bright voice tailored for social media, TikTok/Reels, animation, and casual banter.',
    avatarBg: 'from-rose-500 via-pink-500 to-amber-400',
    accent: 'Modern Youthful Bangla',
    tag: 'Cute & Dynamic',
  },
  {
    id: 'deep',
    name: 'Iqbal',
    bengaliName: 'ইকবাল',
    gender: 'Male',
    persona: 'Cinematic Deep Voice',
    description: 'Heavy, resonant, dramatic baritone voice perfect for movie trailers, motivational videos, mysteries, and authority roles.',
    avatarBg: 'from-slate-800 via-indigo-950 to-blue-900',
    accent: 'Deep Resonant Bangla',
    tag: 'Deep Baritone',
  },
];

export const EMOTIONS: EmotionOption[] = [
  {
    id: 'normal',
    label: 'Normal',
    bengaliLabel: 'স্বাভাবিক',
    description: 'Balanced, calm, and conversational voice',
    emoji: '😌',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-700/50',
  },
  {
    id: 'happy',
    label: 'Happy',
    bengaliLabel: 'আনন্দিত',
    description: 'Cheerful, warm smile, and lively rhythm',
    emoji: '😊',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'sad',
    label: 'Sad',
    bengaliLabel: 'বেদনাবিধুর',
    description: 'Soft, heartfelt, and melancholic delivery',
    emoji: '😢',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'angry',
    label: 'Angry',
    bengaliLabel: 'রাগান্বিত',
    description: 'Sharp, dramatic, and assertive intensity',
    emoji: '😠',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  {
    id: 'excited',
    label: 'Excited',
    bengaliLabel: 'উত্তেজিত',
    description: 'High energy, thrilling, and fast-paced enthusiasm',
    emoji: '🔥',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
];

export const SAMPLE_PROMPTS = [
  {
    title: 'স্বাগতম ও পরিচিতি',
    category: 'Bengali',
    text: 'আসসালামু আলাইকুম! Lyuna Voice AI-তে আপনাকে স্বাগতম। আধুনিক কৃত্রিম বুদ্ধিমত্তার সাহায্যে এখন খুব সহজেই যেকোনো লেখাকে প্রাণবন্ত ও বাস্তবসম্মত বাংলা কণ্ঠে রূপান্তর করুন।',
  },
  {
    title: 'সোশ্যাল মিডিয়া রিলস',
    category: 'Social Media',
    text: 'বন্ধুরা কেমন আছো সবাই? আজকের এই অসাধারণ ভিডিওতে আমি তোমাদের দেখাবো কিভাবে কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে মুহূর্তের মধ্যেই তৈরি করে নিতে পারো চমৎকার কনটেন্ট।',
  },
  {
    title: 'বিজ্ঞাপন ও প্রমোশন',
    category: 'Commercial',
    text: 'আপনার বিজনেসের সেলস বৃদ্ধি করতে চান? আজই নিয়ে আসুন সেরা অফার! আমাদের আধুনিক সেবা গ্রহণ করে আপনার ব্যবসাকে নিয়ে যান অনন্য এক উচ্চতায়।',
  },
  {
    title: 'গল্প ও উপাখ্যান',
    category: 'Storytelling',
    text: 'সেই নিস্তব্ধ পাহাড়ি গ্রামের শেষ প্রান্তে দাঁড়িয়ে থাকা প্রাচীন বটগাছটির তলায় এক অদ্ভুত রহস্য লুকিয়ে ছিল, যা বহু শতাব্দী ধরে মানুষ খুঁজে চলেছে।',
  },
  {
    title: 'English to Bengali Promo',
    category: 'English Input',
    text: 'Welcome to our exclusive weekend sale! Upgrade your creative workspace today with top-tier artificial intelligence voice generation.',
  },
  {
    title: 'Tech Announcement',
    category: 'English Input',
    text: 'Experience the future of speech synthesis with ElevenLabs level natural human cadence, crystal clarity, and seamless multilingual voice generation.',
  },
];
