import { Sparkles, Activity, Brain, Coffee, GraduationCap, Palette, Heart, Sun, Box, LucideIcon } from "lucide-react";

export const RECENT_EMOJIS_KEY = "recent-habit-emojis";
export const MAX_RECENTS = 10;

export interface EmojiItem {
    char: string;
    keywords: string;
}

export interface EmojiCategory {
    id: string;
    label: string;
    icon: LucideIcon;
    emojis: EmojiItem[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
    {
        id: "productivity",
        label: "Productivity",
        icon: Sparkles,
        emojis: [
            { char: "🎯", keywords: "target goal focus hit" },
            { char: "📅", keywords: "calendar date schedule event" },
            { char: "📝", keywords: "note write memo edit" },
            { char: "✅", keywords: "check done complete tick" },
            { char: "⏰", keywords: "clock time alarm timer" },
            { char: "📈", keywords: "chart graph growth up" },
            { char: "🧩", keywords: "puzzle logic piece" },
            { char: "💡", keywords: "idea lightbulb smart" },
            { char: "⏳", keywords: "wait sand glass time" },
            { char: "🚀", keywords: "rocket speed launch" }
        ]
    },
    {
        id: "fitness",
        label: "Health & Fitness",
        icon: Activity,
        emojis: [
            { char: "💪", keywords: "muscle strength power" },
            { char: "🏋️", keywords: "weight lift gym training" },
            { char: "🏃", keywords: "run jog fast exercise" },
            { char: "🚶", keywords: "walk step stroll" },
            { char: "🚴", keywords: "bike cycle road" },
            { char: "🏊", keywords: "swim pool water" },
            { char: "⚽", keywords: "soccer ball football" },
            { char: "🏀", keywords: "basketball hoop" },
            { char: "🎾", keywords: "tennis racket court" },
            { char: "🥊", keywords: "box punch fight" },
            { char: "🦶", keywords: "foot steps tracking" }
        ]
    },
    {
        id: "wellness",
        label: "Mind & Sleep",
        icon: Brain,
        emojis: [
            { char: "🧠", keywords: "brain think mind smart" },
            { char: "🧘", keywords: "meditate zen yoga calm" },
            { char: "🧘‍♀️", keywords: "yoga meditate woman" },
            { char: "😌", keywords: "relieved calm soft" },
            { char: "😴", keywords: "sleep rest nap dream" },
            { char: "💤", keywords: "zzz sleep bed" },
            { char: "💭", keywords: "thought dream cloud" },
            { char: "🌿", keywords: "nature plant peace" },
            { char: "✨", keywords: "stars sparkle magic" },
            { char: "🕯️", keywords: "candle light peace" }
        ]
    },
    {
        id: "food",
        label: "Food & Drink",
        icon: Coffee,
        emojis: [
            { char: "🍏", keywords: "apple fruit green healthy" },
            { char: "🍎", keywords: "apple fruit red" },
            { char: "🥗", keywords: "salad healthy green food" },
            { char: "🥑", keywords: "avocado food toast" },
            { char: "🍳", keywords: "egg cook breakfast" },
            { char: "🥛", keywords: "milk drink calcium" },
            { char: "💧", keywords: "water hydrate blue" },
            { char: "☕", keywords: "coffee tea caffeine" },
            { char: "🍵", keywords: "tea matcha green" },
            { char: "🍌", keywords: "banana fruit yellow" }
        ]
    },
    {
        id: "learning",
        label: "Learning & Tech",
        icon: GraduationCap,
        emojis: [
            { char: "📚", keywords: "books library study learn" },
            { char: "📖", keywords: "book read open" },
            { char: "✏️", keywords: "pencil write draw" },
            { char: "🧪", keywords: "science test tube chemistry" },
            { char: "🧮", keywords: "abacus math count" },
            { char: "💻", keywords: "laptop computer tech dev" },
            { char: "🎓", keywords: "grad student school" },
            { char: "⌨️", keywords: "keyboard typing tech" },
            { char: "🖱️", keywords: "mouse click computer" },
            { char: "📡", keywords: "satellite signal network" }
        ]
    },
    {
        id: "creativity",
        label: "Creativity",
        icon: Palette,
        emojis: [
            { char: "🎨", keywords: "art palette paint color" },
            { char: "🖌️", keywords: "brush paint art" },
            { char: "📷", keywords: "camera photo pic shot" },
            { char: "🎥", keywords: "movie film cinema video" },
            { char: "✍️", keywords: "write hand pencil signing" },
            { char: "🎭", keywords: "theater mask drama play" },
            { char: "🪄", keywords: "magic wand spell wizard" },
            { char: "🎵", keywords: "music note song sound" },
            { char: "🎧", keywords: "headphones listen audio" },
            { char: "🎹", keywords: "piano keys music" }
        ]
    },
    {
        id: "feelings",
        label: "Feelings",
        icon: Heart,
        emojis: [
            { char: "❤️", keywords: "heart love like" },
            { char: "🔥", keywords: "fire hot flame streak" },
            { char: "⭐", keywords: "star favorite gold" },
            { char: "😄", keywords: "happy smile joy" },
            { char: "🥳", keywords: "party celebrate happy" },
            { char: "🙏", keywords: "pray thanks gratitude" },
            { char: "🤝", keywords: "handshake partner together" },
            { char: "🥰", keywords: "love smiling face hearts" }
        ]
    },
    {
        id: "nature",
        label: "Nature",
        icon: Sun,
        emojis: [
            { char: "☀️", keywords: "sun day bright weather" },
            { char: "🌙", keywords: "moon night dark sleep" },
            { char: "☁️", keywords: "cloud weather sky" },
            { char: "🌈", keywords: "rainbow color dream" },
            { char: "🍂", keywords: "leaf autumn fall nature" },
            { char: "🌸", keywords: "flower spring blossom" },
            { char: "🌲", keywords: "tree forest green" }
        ]
    },
    {
        id: "lifestyle",
        label: "Lifestyle",
        icon: Box,
        emojis: [
            { char: "🛏️", keywords: "bed sleep rest room" },
            { char: "🚿", keywords: "shower clean water" },
            { char: "🪥", keywords: "toothbrush clean teeth" },
            { char: "🧹", keywords: "broom sweep clean home" },
            { char: "🧺", keywords: "laundry basket clothes" },
            { char: "🪴", keywords: "plant pot grow home" },
            { char: "💰", keywords: "money dollar save" },
            { char: "🧼", keywords: "soap clean scrub" },
            { char: "🚗", keywords: "car drive travel" }
        ]
    }
];
