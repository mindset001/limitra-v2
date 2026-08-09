/* LIMITRA, Tweaks: defaults, context, provider & panel
   Reads control helpers from window (defined in tweaks-panel.jsx). */
const { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakColor } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroAutoplay": true,
  "heroSpeed": 5,
  "heroTransition": "slide",
  "heroArrows": true,
  "heroDots": true,
  "heroChips": true,
  "heroStats": true,
  "accent": "#F67208",
  "glows": true
}/*EDITMODE-END*/;

const LimTweaksCtx = React.createContext(null);
const useLimTweaks = () => React.useContext(LimTweaksCtx) || { t: TWEAK_DEFAULTS, setTweak: () => {} };

function LimTweaksProvider({ children }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  /* live accent-color override */
  React.useEffect(() => {
    const root = document.documentElement;
    if (t.accent) {
      root.style.setProperty('--accent', t.accent);
      root.style.setProperty('--accent-soft', t.accent + '1A');
      root.style.setProperty('--orange-soft', t.accent);
    }
    return () => {};
  }, [t.accent]);

  /* ambient glows on/off */
  React.useEffect(() => {
    document.documentElement.setAttribute('data-glow', t.glows ? 'on' : 'off');
  }, [t.glows]);

  return <LimTweaksCtx.Provider value={{ t, setTweak }}>{children}</LimTweaksCtx.Provider>;
}

function LimTweaksPanel() {
  const { t, setTweak } = useLimTweaks();
  const { theme, toggleTheme } = useStore();
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Hero carousel" />
      <TweakToggle label="Auto-advance" value={t.heroAutoplay} onChange={v => setTweak('heroAutoplay', v)} />
      <TweakSlider label="Speed" value={t.heroSpeed} min={2} max={10} step={1} unit="s" onChange={v => setTweak('heroSpeed', v)} />
      <TweakRadio label="Transition" value={t.heroTransition} options={['slide', 'fade']} onChange={v => setTweak('heroTransition', v)} />
      <TweakToggle label="Arrows" value={t.heroArrows} onChange={v => setTweak('heroArrows', v)} />
      <TweakToggle label="Dots" value={t.heroDots} onChange={v => setTweak('heroDots', v)} />
      <TweakToggle label="Floating chips" value={t.heroChips} onChange={v => setTweak('heroChips', v)} />
      <TweakToggle label="Trust stats" value={t.heroStats} onChange={v => setTweak('heroStats', v)} />

      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={t.accent} options={['#F67208', '#2F4BDB', '#1F8A5B', '#7A5AE0', '#E5484D']} onChange={v => setTweak('accent', v)} />
      <TweakToggle label="Ambient glows" value={t.glows} onChange={v => setTweak('glows', v)} />
      <TweakToggle label="Dark mode" value={theme === 'dark'} onChange={toggleTheme} />
    </TweaksPanel>
  );
}

Object.assign(window, { TWEAK_DEFAULTS, LimTweaksProvider, LimTweaksPanel, useLimTweaks });
