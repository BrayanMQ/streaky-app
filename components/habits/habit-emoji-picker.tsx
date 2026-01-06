import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";

const EMOJI_LIST = ["🎯", "💧", "🔥", "🧘", "🍏", "💪", "📚", "🏃", "⚡", "😴", "🧠", "🌱", "🎨", "🎸", "☀️", "🍎", "🚶", "🔋", "🧘‍♀️"];

export function HabitEmojiPicker({ selectedEmoji, onSelect, disabled, color }: { selectedEmoji: string, onSelect: (emoji: string) => void, disabled: boolean, color: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 transition-all hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          style={{ 
            borderColor: selectedEmoji ? color : 'transparent',
            backgroundColor: `${color}10`
          }}
        >
          {selectedEmoji ? (
            <span className="text-2xl leading-none">{selectedEmoji}</span>
          ) : (
            <Smile className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" side="bottom">
        <div className="grid grid-cols-5 gap-2">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md text-xl hover:bg-accent transition-all active:scale-90",
                selectedEmoji === emoji && "bg-accent"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}