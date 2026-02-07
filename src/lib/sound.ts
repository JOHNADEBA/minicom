let audio: HTMLAudioElement | null = null;
let unlocked = false;

export function initSound() {
  if (typeof window === "undefined") return;

  if (!audio) {
    audio = new Audio("/sounds/notify.mp3");
    audio.preload = "auto";
    audio.volume = 0;
  }
}

export function unlockSound() {
  if (!audio || unlocked) return;

  audio
    .play()
    .then(() => {
      audio!.pause();
      audio!.currentTime = 0;
      unlocked = true;
    })
    .catch((e) => {
      console.warn("[sound] unlock failed", e);
    });
}

export function playSound() {
  if (!audio) {
    console.warn("[sound] audio not initialized");
    return;
  }

  if (!unlocked) {
    console.warn("[sound] blocked (not unlocked)");
    return;
  }

  audio.currentTime = 0;
  audio.volume = 0.6;
  audio.play().catch((e) => {
    console.warn("[sound] play failed", e);
  });
}
