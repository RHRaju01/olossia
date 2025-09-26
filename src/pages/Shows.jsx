import React, { useRef, useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from "lucide-react";

// Remote sample videos (small/medium). If you add mp4 files to /public, replace these paths.
// These are public sample files grouped into rough "genres" for demo purposes.
const sampleVideos = [
  { id: 1, src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", title: "Nature: Blooming", user: "NatureTV", avatar: "/person.svg", desc: "Slow-motion flowers in bloom." , genre: 'nature'},
  { id: 2, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", title: "Animation: Big Buck Bunny", user: "StudioB", avatar: "/person.svg", desc: "Classic open-source short animation." , genre: 'animation'},
  { id: 3, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", title: "Short Film: Elephants Dream", user: "IndieFilms", avatar: "/person.svg", desc: "A surreal short film from Blender Foundation." , genre: 'film'},
  { id: 4, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", title: "Automotive: Joyride", user: "AutoShow", avatar: "/person.svg", desc: "Car footage and scenic drives." , genre: 'automotive'},
  { id: 5, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", title: "Travel: Escapes", user: "Wanderlust", avatar: "/person.svg", desc: "Short travel montage." , genre: 'travel'},
  { id: 6, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", title: "Comedy: Tiny Meltdowns", user: "LaughLab", avatar: "/person.svg", desc: "Quick comedy moments." , genre: 'comedy'},
  { id: 7, src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", title: "Music: Beat Clip", user: "DJSet", avatar: "/person.svg", desc: "5s music teaser." , genre: 'music'},
  { id: 8, src: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4", title: "Cooking: Quick Recipe", user: "ChefAnna", avatar: "/person.svg", desc: "10s recipe highlight." , genre: 'cooking'},
  { id: 9, src: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4", title: "Fitness: HIIT Clip", user: "FitNow", avatar: "/person.svg", desc: "Short workout clip." , genre: 'fitness'},
  { id: 10, src: "https://samplelib.com/lib/preview/mp4/sample-20s.mp4", title: "Tech: Unboxing", user: "GadgetGuy", avatar: "/person.svg", desc: "20s tech unboxing." , genre: 'tech'},
  { id: 11, src: "https://samplelib.com/lib/preview/mp4/sample-30s.mp4", title: "Documentary: City Life", user: "DocuStudio", avatar: "/person.svg", desc: "Short city documentary." , genre: 'documentary'},
  { id: 12, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", title: "Animation: Bunny Teaser", user: "AnimHouse", avatar: "/person.svg", desc: "Big Buck Bunny animation (fallback)." , genre: 'animation'},
  { id: 13, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", title: "Fantasy: Sintel", user: "Blender", avatar: "/person.svg", desc: "Short from Blender." , genre: 'fantasy'},
  { id: 14, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", title: "Sci-Fi: Tears of Steel", user: "SciFiLab", avatar: "/person.svg", desc: "Action short film." , genre: 'sci-fi'},
  { id: 15, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", title: "Auto Review", user: "CarReview", avatar: "/person.svg", desc: "Car review clip." , genre: 'automotive'},
  { id: 16, src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", title: "ASMR: Soft Sounds", user: "ASMRer", avatar: "/person.svg", desc: "Soft ambient sounds (placeholder)." , genre: 'asmr'},
  { id: 17, src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", title: "Gaming: Clip", user: "GamerZone", avatar: "/person.svg", desc: "Gameplay-style cinematic (placeholder)." , genre: 'gaming'},
  { id: 18, src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", title: "Art: Motion Study", user: "ArtistCo", avatar: "/person.svg", desc: "Motion art study (webm)." , genre: 'art'},
  { id: 19, src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", title: "Dance: Studio Clip", user: "DanceCrew", avatar: "/person.svg", desc: "Short dance routine (fallback)." , genre: 'dance'},
  { id: 20, src: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4", title: "Lifestyle: City Stroll", user: "Everyday", avatar: "/person.svg", desc: "Casual lifestyle clip (fallback)." , genre: 'lifestyle'},
];

export const Shows = () => {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const videoRefs = useRef([]);
  const [liked, setLiked] = useState({});
  const [following, setFollowing] = useState({});
  const [playing, setPlaying] = useState({});
  const [muted, setMuted] = useState({});
  const [headerOffset, setHeaderOffset] = useState(0);

  useEffect(() => {
    // compute header height to avoid header overlaying the reels
    const computeHeader = () => {
      try {
        const header = document.querySelector('header');
        const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
        setHeaderOffset(h);
      } catch (e) {
        setHeaderOffset(0);
      }
    };
    computeHeader();
    window.addEventListener('resize', computeHeader);
      const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-idx"));
          if (entry.isIntersecting) {
            setActive(idx);
            // If there was a real video element we'd call play()
            try {
              const v = videoRefs.current[idx];
              if (v && v.play) {
                v.play();
                setPlaying((p) => ({ ...p, [idx]: true }));
              }
            } catch (e) {}
          } else {
            try {
              const v = videoRefs.current[idx];
              if (v && v.pause) {
                v.pause();
                setPlaying((p) => ({ ...p, [idx]: false }));
              }
            } catch (e) {}
          }
        });
      },
      { root: null, threshold: 0.55 }
    );

    const nodes = containerRef.current?.querySelectorAll(".show-slide") || [];
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  // Try to autoplay the first visible video (if browser allows). This is best-effort.
  useEffect(() => {
    const tryPlayInitial = async () => {
      const v = videoRefs.current[0];
      if (!v) return;
      try {
        await v.play();
        setPlaying((p) => ({ ...p, 0: true }));
      } catch (e) {
        // autoplay blocked — leave video paused and let user interact
      }
    };
    // Run once after a short delay to ensure refs are populated
    const t = setTimeout(tryPlayInitial, 120);
    return () => clearTimeout(t);
  }, [headerOffset]);

  // keyboard navigation: instant jump to next/previous slide and Space to toggle play/pause
  useEffect(() => {
    let lastAction = 0;
    const handler = (e) => {
      // don't intercept when user is typing or interacting with controls
      const activeEl = document.activeElement;
      const tag = activeEl?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'button' ||
        tag === 'a' ||
        tag === 'select' ||
        activeEl?.isContentEditable
      ) return;

      // Space toggles play/pause of the current active slide
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        const idx = Number(active ?? 0);
        const v = videoRefs.current[idx];
        if (!v) return;
        if (v.paused) {
          v.play();
          setPlaying((p) => ({ ...p, [idx]: true }));
        } else {
          v.pause();
          setPlaying((p) => ({ ...p, [idx]: false }));
        }
        return;
      }

      // 'm' toggles mute for the current active slide
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const idx = Number(active ?? 0);
        const v = videoRefs.current[idx];
        if (!v) return;
        // read muted from the actual video element to avoid stale closure over `muted` state
        const newMuted = !v.muted;
        v.muted = newMuted;
        setMuted((m) => ({ ...m, [idx]: newMuted }));
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const now = Date.now();
        if (now - lastAction < 120) {
          // throttle quick repeats
          e.preventDefault();
          return;
        }
        lastAction = now;
        e.preventDefault();
        const nodes = containerRef.current?.querySelectorAll('.show-slide') || [];
        if (!nodes.length) return;
        // use the active state from IntersectionObserver when possible
        let currentIndex = Number.isFinite(active) ? Number(active) : 0;
        if (isNaN(currentIndex)) currentIndex = 0;
        let targetIndex = currentIndex + (e.key === 'ArrowDown' ? 1 : -1);
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= nodes.length) targetIndex = nodes.length - 1;
        const target = nodes[targetIndex];
        if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [containerRef, active]);

  // wheel navigation: use vertical wheel to move between slides (throttled)
  useEffect(() => {
    let lastWheel = 0;
    const onWheel = (e) => {
      // only handle mostly-vertical wheel gestures
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = Date.now();
      if (now - lastWheel < 200) return; // throttle
      lastWheel = now;
      e.preventDefault();
      const nodes = containerRef.current?.querySelectorAll('.show-slide') || [];
      if (!nodes.length) return;
      let currentIndex = Number.isFinite(active) ? Number(active) : 0;
      if (isNaN(currentIndex)) currentIndex = 0;
      const dir = e.deltaY > 0 ? 1 : -1;
      let targetIndex = currentIndex + dir;
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= nodes.length) targetIndex = nodes.length - 1;
      const target = nodes[targetIndex];
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    const container = containerRef.current;
    if (container) container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (container) container.removeEventListener('wheel', onWheel);
    };
  }, [containerRef, active]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="overflow-y-auto snap-y snap-mandatory" ref={containerRef} style={{ paddingTop: headerOffset }}>
        {sampleVideos.map((s, idx) => (
          <div
            key={s.id}
            data-idx={idx}
            className="show-slide snap-start flex items-center justify-center relative"
            style={{ height: `calc(100vh - ${headerOffset}px)`, padding: '15px 0', boxSizing: 'border-box', margin: 0 }}
          >
            {/* actual video element */}
            <div className="relative w-full flex justify-center" style={{ height: '100%' }}>
              {/* portrait container: derive width from height so top/bottom padding = 15px is exact */}
              <div
                className="mx-auto relative"
                style={{
                  aspectRatio: '525 / 930',
                  height: `clamp(720px, calc(100vh - ${headerOffset}px - 30px), 930px)`,
                  maxWidth: '525px',
                }}
              >
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  data-idx={idx}
                  src={s.src}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl cursor-pointer"
                  muted={muted[idx] ?? false}
                  autoPlay
                  playsInline
                  loop
                  preload="metadata"
                  onClick={() => {
                    const v = videoRefs.current[idx];
                    if (!v) return;
                    if (v.paused) {
                      v.play();
                      setPlaying((p) => ({ ...p, [idx]: true }));
                    } else {
                      v.pause();
                      setPlaying((p) => ({ ...p, [idx]: false }));
                    }
                  }}
                />

                {/* overlay placed on top of the video for controls */}
                <div className="absolute inset-0 pointer-events-none" />

                {/* top-right overlay controls on video (pointer events enabled) */}
                <div className="absolute" style={{ top: '15px', right: '15px' }}>
                  <div className="flex flex-col items-center gap-2 bg-black/30 rounded-full p-1 pointer-events-auto">
                    <button
                      onClick={async () => {
                        const v = videoRefs.current[idx];
                        if (!v) return;
                        if (v.paused) {
                          await v.play();
                          setPlaying((p) => ({ ...p, [idx]: true }));
                        } else {
                          v.pause();
                          setPlaying((p) => ({ ...p, [idx]: false }));
                        }
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
                      aria-label="Play/Pause"
                    >
                      {playing[idx] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        const v = videoRefs.current[idx];
                        const newMuted = !(muted[idx] ?? true);
                        if (v) v.muted = newMuted;
                        setMuted((m) => ({ ...m, [idx]: newMuted }));
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
                      aria-label="Mute/Unmute"
                    >
                      {muted[idx] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* bottom info & actions inside the video container so placement aligns with video edges */}
                <div className="absolute left-0 right-0 bottom-0" style={{ paddingLeft: '5px', paddingRight: '5px', paddingBottom: '15px' }}>
                  <div className="w-full max-w-[525px] p-2 flex items-end justify-between mx-auto">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <img src={s.avatar} alt={s.user} className="w-8 h-8 rounded-full border border-white/20" />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-semibold">{s.user}</div>
                            <button
                              onClick={() => setFollowing((f) => ({ ...f, [s.id]: !f[s.id] }))}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition ${following[s.id] ? 'bg-white text-purple-600' : 'bg-white/10 text-white'}`}
                            >
                              {following[s.id] ? 'Following' : 'Follow'}
                            </button>
                          </div>
                          <h3 className="text-sm font-bold mt-1">{s.title}</h3>
                          <p className="text-[11px] text-gray-200/80 mt-1">{s.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center space-y-2 mr-2">
                      <button
                        onClick={() => setLiked((l) => ({ ...l, [s.id]: !l[s.id] }))}
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${liked[s.id] ? 'bg-white text-pink-500' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </button>
                      <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
                        <Share2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;
