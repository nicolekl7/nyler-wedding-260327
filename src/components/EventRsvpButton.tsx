import { motion, AnimatePresence } from "framer-motion";
import { Wine, Heart, Sun } from "lucide-react";

const CREAM = "#fff8f1";
const OLIVE = "#534f23";
const CHARCOAL = "#3a3a3a";

// ─── Wednesday: Refined Clink ───
const WednesdayAnimation = () => (
  <div className="relative flex items-center" style={{ width: 28, height: 16 }}>
    {/* Left glass */}
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1, rotate: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Wine size={12} color={CREAM} strokeWidth={1.5} />
    </motion.div>
    {/* Right glass */}
    <motion.div
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1, rotate: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ marginLeft: -2 }}
    >
      <Wine size={12} color={CREAM} strokeWidth={1.5} />
    </motion.div>
    {/* Clink lines: \  |  / — centered above where glasses meet */}
    {[
      { rotate: -25, x: -3 },
      { rotate: 0, x: 0 },
      { rotate: 25, x: 3 },
    ].map((line, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          top: -4,
          left: "calc(50% - 4px)",
          marginLeft: line.x,
          width: 0.5,
          height: 3,
          backgroundColor: CREAM,
          borderRadius: 0.5,
          transformOrigin: "bottom center",
          rotate: `${line.rotate}deg`,
        }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: [0, 1, 1, 1],
          scaleY: [0, 1, 1, 1],
        }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      />
    ))}
  </div>
);

// ─── Thursday: Interlocking Hearts ───
const ThursdayAnimation = () => (
  <div className="flex items-center" style={{ width: 24, height: 16 }}>
    {/* Left heart — rises from bottom */}
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1, rotate: 10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Heart size={12} color={CREAM} strokeWidth={1.5} />
    </motion.div>
    {/* Right heart — drops from top */}
    <motion.div
      style={{ marginLeft: -4 }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1, rotate: -10 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
    >
      <Heart size={12} color={CREAM} strokeWidth={1.5} />
    </motion.div>
  </div>
);

// ─── Friday: Persistent Sun ───
const FridayAnimation = () => (
  <div className="overflow-hidden flex items-center" style={{ width: 16, height: 16 }}>
    <motion.div
      initial={{ y: 12, rotate: 0, opacity: 0 }}
      animate={{ y: 0, rotate: 180, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.34, 1.4, 0.64, 1] }}
    >
      <Sun size={13} color={CREAM} strokeWidth={1.5} />
    </motion.div>
  </div>
);

const animations: Record<string, () => JSX.Element> = {
  welcome_party_rsvp: WednesdayAnimation,
  wedding_day_rsvp: ThursdayAnimation,
  pool_day_rsvp: FridayAnimation,
};

interface Props {
  eventKey: string;
  value: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

const EventRsvpButton = ({ eventKey, value, isSelected, onSelect }: Props) => {
  const isAccept = value === "accept";
  const showAnim = isAccept && isSelected;
  const AnimComponent = animations[eventKey];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="flex-1 py-3 border text-sm font-body uppercase tracking-[0.15em] overflow-hidden"
      style={{ minHeight: 48 }}
      animate={{
        backgroundColor: isSelected ? (isAccept ? OLIVE : CHARCOAL) : "transparent",
        borderColor: isSelected ? (isAccept ? OLIVE : CHARCOAL) : "hsl(63 30% 75%)",
        color: isSelected ? CREAM : "hsl(63 42% 35%)",
      }}
      transition={{ duration: 0.25 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center gap-2">
        <span>{value === "accept" ? "Accept" : "Decline"}</span>
        <AnimatePresence mode="wait">
          {showAnim && AnimComponent && (
            <motion.span
              key={`${eventKey}-a`}
              className="flex items-center"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AnimComponent />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
};

export default EventRsvpButton;
