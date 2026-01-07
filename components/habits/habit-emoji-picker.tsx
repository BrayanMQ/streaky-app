import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Smile, Search, Sparkles, Activity, Brain, Coffee, GraduationCap, Palette, Heart, Sun, Box } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_EMOJIS_KEY = "recent-habit-emojis";
const MAX_RECENTS = 10;

const EMOJI_CATEGORIES = [
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

export function HabitEmojiPicker({
  selectedEmoji,
  onSelect,
  disabled,
  color
}: {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  disabled: boolean;
  color: string;
}) {
  const [search, setSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load recent emojis
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    if (stored) setRecentEmojis(JSON.parse(stored));
  }, []);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);

    const updated = [
      emoji,
      ...recentEmojis.filter((e) => e !== emoji)
    ].slice(0, MAX_RECENTS);

    setRecentEmojis(updated);
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated));
  };

  const filteredCategories = useMemo(() => {
    if (!search) return EMOJI_CATEGORIES;

    const searchTerms = search.toLowerCase().trim().split(/\s+/);

    return EMOJI_CATEGORIES.map((category) => ({
      ...category,
      emojis: category.emojis.filter((emojiObj) => {
        const targetString = `${emojiObj.keywords} ${category.label}`.toLowerCase();
        return searchTerms.every(term => targetString.includes(term));
      })
    })).filter((category) => category.emojis.length > 0);
  }, [search]);

  const scrollToCategory = (id: string) => {
    const el = categoryRefs.current[id];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: el.offsetTop - 80, // Adjust for search/tabs height
        behavior: "smooth"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const current = document.activeElement as HTMLElement;
      if (!current || !current.parentElement?.classList.contains("grid")) return;

      const grid = current.parentElement;
      const items = Array.from(grid.querySelectorAll('button'));
      const index = items.indexOf(current as any);
      const cols = 6;

      let nextIndex = index;
      if (e.key === "ArrowRight") nextIndex = Math.min(index + 1, items.length - 1);
      if (e.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0);
      if (e.key === "ArrowUp") nextIndex = Math.max(index - cols, 0);
      if (e.key === "ArrowDown") nextIndex = Math.min(index + cols, items.length - 1);

      items[nextIndex]?.focus();
    }
  };

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "group flex h-11 w-11 items-center justify-center rounded-lg border-2 transition-all hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          style={{
            borderColor: selectedEmoji ? color : "transparent",
            backgroundColor: `${color}15`
          }}
        >
          {selectedEmoji ? (
            <motion.span
              key={selectedEmoji}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl"
            >
              {selectedEmoji}
            </motion.span>
          ) : (
            <Smile className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-32px)] sm:w-80 overflow-hidden p-0 shadow-xl border-border/40 bg-popover/95 backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        {/* Mobile Drag Handle */}
        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-muted-foreground/20 sm:hidden" />

        <div className="p-3" onKeyDown={handleKeyDown}>
          {/* Search */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border bg-muted/50 px-2 transition-shadow focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Category Tabs (Desktop/Tablet Navigation) */}
          {!search && (
            <div className="mb-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {EMOJI_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    title={cat.label}
                    onClick={() => scrollToCategory(cat.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Scrollable area */}
          <div
            ref={scrollRef}
            className="max-h-80 space-y-5 overflow-y-auto pr-2 scroll-smooth"
            onWheel={(e) => e.stopPropagation()}
          >
            <AnimatePresence initial={false}>
              {/* Recent */}
              {recentEmojis.length > 0 && !search && (
                <motion.div
                  key="recent-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-2"
                >
                  <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Recent
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {recentEmojis.map((emoji) => (
                      <EmojiButton
                        key={`recent-${emoji}`}
                        emoji={emoji}
                        selected={selectedEmoji === emoji}
                        onClick={() => handleSelect(emoji)}
                        color={color}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Categories */}
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  ref={(el) => { categoryRefs.current[category.id] = el }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout="position"
                  className="space-y-2"
                >
                  <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {category.label}
                  </p>

                  <div className="grid grid-cols-6 gap-2">
                    {category.emojis.map((emojiObj) => (
                      <EmojiButton
                        key={emojiObj.char}
                        emoji={emojiObj.char}
                        selected={selectedEmoji === emojiObj.char}
                        onClick={() => handleSelect(emojiObj.char)}
                        color={color}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              {filteredCategories.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No emojis found</p>
                  <p className="text-xs text-muted-foreground/60">Try different keywords</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EmojiButton({
  emoji,
  selected,
  onClick,
  color
}: {
  emoji: string;
  selected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all duration-200",
        "hover:bg-muted"
      )}
      style={{
        backgroundColor: selected ? `${color}25` : undefined
      }}
    >
      {selected && (
        <motion.div
          layoutId="selection-ring"
          className="absolute inset-0 rounded-lg border-2"
          style={{ borderColor: color }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{emoji}</span>
    </motion.button>
  );
}