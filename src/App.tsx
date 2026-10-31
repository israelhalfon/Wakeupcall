import React, { useState, useEffect } from 'react';
import {
  AlarmClock,
  Volume2,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Timer,
  Gift,
  Rocket,
  Sparkles,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import {
  AlarmItem,
  FamilyReward,
  INITIAL_ALARMS,
  INITIAL_REWARDS,
  INITIAL_ROUTINE_STEPS,
  MissionType,
  RoutineStep,
  WAKE_MISSIONS,
} from './data/morningData';
import { MELODIES, MelodyId, soundEngine } from './utils/soundEngine';
import { WakeUpMissionModal } from './components/WakeUpMissionModal';
import captainAstroImg from './assets/images/captain_astro_mascot_1793475758461.jpg';
import rewardTrophyChestImg from './assets/images/reward_trophy_chest_1793475760307.jpg';

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export default function App() {
  // Live clock state
  const [now, setNow] = useState<Date>(() => new Date());

  // Child profile & gamification state (persisted in localStorage)
  const [childName, setChildName] = useState<string>(() => {
    return localStorage.getItem('captain_morning_child_name') || 'איתמר';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(childName);

  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('captain_morning_stars');
    return saved ? parseInt(saved, 10) : 45;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('captain_morning_streak');
    return saved ? parseInt(saved, 10) : 4;
  });

  // Alarms state
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('captain_morning_alarms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ALARMS;
      }
    }
    return INITIAL_ALARMS;
  });

  // New alarm form state
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newTime, setNewTime] = useState('06:45');
  const [newLabel, setNewLabel] = useState('מסדר בוקר אלופים');
  const [newDays, setNewDays] = useState<string[]>(['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳']);
  const [newMission, setNewMission] = useState<MissionType>('star_catcher');
  const [newMelody, setNewMelody] = useState<MelodyId>('space_fanfare');

  // Routine checklist & turbo timer state
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(INITIAL_ROUTINE_STEPS);
  const [activeTimerStepId, setActiveTimerStepId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Family Rewards state
  const [rewards, setRewards] = useState<FamilyReward[]>(INITIAL_REWARDS);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(25);
  const [recentClaimBanner, setRecentClaimBanner] = useState<string | null>(null);

  // Active Wake-Up Mission Modal state
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [activeAlarmForModal, setActiveAlarmForModal] = useState<AlarmItem>(INITIAL_ALARMS[0]);
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState<string>('');

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('captain_morning_child_name', childName);
  }, [childName]);

  useEffect(() => {
    localStorage.setItem('captain_morning_stars', String(stars));
  }, [stars]);

  useEffect(() => {
    localStorage.setItem('captain_morning_streak', String(streakDays));
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem('captain_morning_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Live clock ticker + real-time alarm trigger check
  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);

      const hh = String(current.getHours()).padStart(2, '0');
      const mm = String(current.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;

      if (current.getSeconds() === 0 && currentHHMM !== lastTriggeredMinute) {
        const matchingAlarm = alarms.find((a) => a.enabled && a.time === currentHHMM);
        if (matchingAlarm) {
          setLastTriggeredMinute(currentHHMM);
          setActiveAlarmForModal(matchingAlarm);
          setMissionModalOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, lastTriggeredMinute]);

  // Routine Turbo Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          soundEngine.playSuccessFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formattedClock = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const primaryActiveAlarm = alarms.find((a) => a.enabled) || alarms[0];
  const completedStepsCount = routineSteps.filter((s) => s.completed).length;

  // Trigger Wake-Up Simulation with chosen alarm
  const handleTriggerAlarmNow = (alarm: AlarmItem) => {
    setActiveAlarmForModal(alarm);
    setMissionModalOpen(true);
  };

  // Complete Wake-Up Mission callback
  const handleMissionCompleted = (earnedStars: number) => {
    setStars((prev) => prev + earnedStars);
    setStreakDays((prev) => prev + 1);
  };

  // Toggle alarm on/off
  const handleToggleAlarm = (id: string) => {
    soundEngine.playStepClick();
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  // Delete alarm
  const handleDeleteAlarm = (id: string) => {
    if (alarms.length <= 1) return;
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // Add new alarm
  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AlarmItem = {
      id: `alarm-${Date.now()}`,
      time: newTime,
      label: newLabel.trim() || 'השכמה שמחה',
      days: newDays.length > 0 ? newDays : ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'],
      mission: newMission,
      melody: newMelody,
      enabled: true,
    };
    setAlarms((prev) => [created, ...prev]);
    setShowAddAlarm(false);
    soundEngine.playStarCollect();
  };

  const toggleDayInForm = (day: string) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle routine step completion
  const handleToggleRoutineStep = (step: RoutineStep) => {
    if (!step.completed) {
      soundEngine.playStarCollect();
      setStars((prev) => prev + step.stars);
    } else {
      soundEngine.playStepClick();
      setStars((prev) => Math.max(0, prev - step.stars));
    }
    setRoutineSteps((prev) =>
      prev.map((s) => (s.id === step.id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleStartStepTimer = (step: RoutineStep) => {
    soundEngine.playStepClick();
    setActiveTimerStepId(step.id);
    setTimerSecondsLeft(step.recommendedSeconds);
    setIsTimerRunning(true);
  };

  const formatTimerMMSS = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Claim family reward
  const handleClaimReward = (reward: FamilyReward) => {
    if (stars < reward.costStars) return;
    soundEngine.playSuccessFanfare();
    setStars((prev) => prev - reward.costStars);
    setRewards((prev) =>
      prev.map((r) =>
        r.id === reward.id ? { ...r, claimedCount: r.claimedCount + 1 } : r
      )
    );
    setRecentClaimBanner(`איזה כיף! פדית את הפרס: "${reward.title}". הראה להורים למימוש!`);
    setTimeout(() => setRecentClaimBanner(null), 6000);
  };

  // Add custom reward (Parent zone)
  const handleAddCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;
    const item: FamilyReward = {
      id: `rew-${Date.now()}`,
      title: newRewardTitle.trim(),
      description: newRewardDesc.trim() || 'פרס משפחתי מיוחד לאלוף הבוקר',
      costStars: Number(newRewardCost) || 20,
      claimedCount: 0,
    };
    setRewards((prev) => [item, ...prev]);
    setNewRewardTitle('');
    setNewRewardDesc('');
    soundEngine.playStarCollect();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      {/* TOP BAR CONTRACT: 1-row, 3-zone header separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Brand Title (single text element, one line) */}
          <a
            href="#top"
            className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            קפטן בוקר
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#alarms"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              שעונים ומשימות
            </a>
            <a
              href="#morning-race"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              מרוץ ההתארגנות
            </a>
            <a
              href="#treasure-chest"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              תיבת האוצר
            </a>
            <a
              href="#parent-zone"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              מתחם הורים
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleTriggerAlarmNow(primaryActiveAlarm)}
              className="min-h-[44px] px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              הפעל הדמיית השכמה
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 space-y-16">
        {/* HERO SECTION: 2-Column Split with items-stretch + Full-Width 4-Column KPI Row Below */}
        <section aria-label="לוח בקרה ראשי ושעון חי" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Right Column (7 cols): Live Clock, Kid Personalization & Wake-Up Trigger */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 md:p-10 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Unboxed metadata kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span>מרכז השיגור היומי</span>
                  <span aria-hidden="true">·</span>
                  <span>השכמה הבאה: {primaryActiveAlarm.time}</span>
                  <span aria-hidden="true">·</span>
                  <span>{primaryActiveAlarm.label}</span>
                </div>

                {/* Personalized Headline with Quick Name Edit */}
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    בוקר של אלופים, קפטן {childName}!
                  </h1>
                  {!isEditingName ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(childName);
                        setIsEditingName(true);
                      }}
                      className="min-h-[36px] px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      שינוי שם הילד/ה
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (nameInput.trim()) setChildName(nameInput.trim());
                        setIsEditingName(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 w-36 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="שם הילד/ה"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg whitespace-nowrap shrink-0"
                      >
                        שמור
                      </button>
                    </form>
                  )}
                </div>

                <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                  במקום צפצוף מעצבן, כל בוקר נפתח עם משימת חלל קצרה, מנגינה משמחת, בדיחה סודית וכוכבי זהב שמחליפים בתיבת האוצר המשפחתית.
                </p>

                {/* Live Digital Clock Display */}
                <div className="py-5 px-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 block mb-1">
                      השעה כעת בבסיס האם
                    </span>
                    <div
                      className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tabular-nums tracking-wider text-amber-400"
                      dir="ltr"
                    >
                      {formattedClock}
                    </div>
                  </div>

                  <div className="sm:text-left border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                    <span className="text-xs text-slate-400 block">משימת ההשכמה שנבחרה:</span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {WAKE_MISSIONS.find((m) => m.id === primaryActiveAlarm.mission)?.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => soundEngine.playMelodySequence(primaryActiveAlarm.melody)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>השמע טעימה מהמנגינה</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Hero Actions */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTriggerAlarmNow(primaryActiveAlarm)}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2.5 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Rocket className="w-5 h-5" />
                  <span>נסה השכמה ומשימת בוקר עכשיו!</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    soundEngine.speakHebrewGreeting(
                      `בוקר טוב קפטן ${childName}! היום הולך להיות יום נפלא מלא בחיוכים והרפתקאות!`
                    )
                  }
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-slate-700" />
                  <span>ברכת בוקר קולית מקפטן אסטרו</span>
                </button>
              </div>
            </div>

            {/* Left Column (5 cols): Visual Mascot & Launchpad Showcase */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[340px] flex flex-col justify-end">
              <img
                src={captainAstroImg}
                alt="קפטן אסטרו כלב החלל המעורר"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover lg:h-full"
              />
              {/* Measured contrast scrim for 4.5:1 legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <div className="relative z-10 p-6 md:p-8 text-white space-y-2">
                <div className="text-xs font-medium text-amber-300">
                  השותף שלך להתעוררות מהירה · קפטן אסטרו
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  &ldquo;קמים מהמיטה תוך 30 שניות ופותחים את בדיחת הבוקר!&rdquo;
                </h2>
                <p className="text-xs text-slate-200 leading-relaxed">
                  כל השכמה מוצלחת בלי נודניק מזכה ב-15 עד 20 כוכבי זהב חדשים בתיבת האוצר.
                </p>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column Metric Row Below Hero Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-xs font-medium text-slate-500 block">
                מאזן כוכבי זהב בתיבה
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-600">
                  {stars}
                </span>
                <span className="text-xs font-medium text-slate-600">כוכבים זמינים למימוש</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-xs font-medium text-slate-500 block">
                רצף קימות מהירות עם חיוך
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  {streakDays}
                </span>
                <span className="text-xs font-medium text-slate-600">בקרים ברצף</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-xs font-medium text-slate-500 block">
                מרוץ ההתארגנות הבוקר
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700">
                  {completedStepsCount}/{routineSteps.length}
                </span>
                <span className="text-xs font-medium text-slate-600">משימות הושלמו</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-xs font-medium text-slate-500 block">
                שעונים מעוררים מוגדרים
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                  {alarms.filter((a) => a.enabled).length}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  פעילים מתוך {alarms.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ALARMS & WAKE-UP MISSIONS */}
        <section id="alarms" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                01. שעונים מעוררים ומשימות השכמה
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                הגדירו את שעת הקימה ובחרו איזה משחק בוקר ומנגינה יעירו את {childName} בחיוך
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddAlarm((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddAlarm ? 'סגור טופס שעון חדש' : 'הוסף שעון מעורר חדש'}</span>
            </button>
          </div>

          {/* Add New Alarm Drawer / Form */}
          {showAddAlarm && (
            <form
              onSubmit={handleCreateAlarm}
              className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6"
            >
              <h3 className="text-lg font-bold text-slate-900">
                הגדרת שעון מעורר חדש עבור {childName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    שעת השכמה
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 font-mono tabular-nums text-xl font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    כותרת השעון (מה מחכה לנו היום?)
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="למשל: יום חוג כדורגל / המראה לבית הספר"
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Days of Week Interactive Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  ימים בשבוע
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = newDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayInForm(day)}
                        className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        יום {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mission Type & Melody Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    משימת משחק לכיבוי השעון
                  </label>
                  <div className="space-y-2">
                    {WAKE_MISSIONS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setNewMission(m.id)}
                        className={`w-full text-right p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                          newMission === m.id
                            ? 'border-amber-400 bg-amber-50/60'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{m.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {m.durationLabel} · +{m.rewardStars} כוכבים
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-700 whitespace-nowrap shrink-0">
                          {newMission === m.id ? 'נבחר' : 'בחר'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    מנגינת השכמה (לחצו להאזנה)
                  </label>
                  <div className="space-y-2">
                    {MELODIES.map((mel) => (
                      <div
                        key={mel.id}
                        onClick={() => setNewMelody(mel.id)}
                        className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                          newMelody === mel.id
                            ? 'border-amber-400 bg-amber-50/60'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{mel.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{mel.tempoLabel}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewMelody(mel.id);
                            soundEngine.playMelodySequence(mel.id);
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>נגן</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlarm(false)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold whitespace-nowrap"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold whitespace-nowrap"
                >
                  שמור שעון מעורר
                </button>
              </div>
            </form>
          )}

          {/* Alarms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {alarms.map((alarm) => {
              const missionObj =
                WAKE_MISSIONS.find((m) => m.id === alarm.mission) || WAKE_MISSIONS[0];
              const melodyObj =
                MELODIES.find((m) => m.id === alarm.melody) || MELODIES[0];

              return (
                <div
                  key={alarm.id}
                  className={`rounded-3xl p-6 border transition-colors flex flex-col justify-between ${
                    alarm.enabled
                      ? 'bg-white border-slate-200/90'
                      : 'bg-slate-100/70 border-slate-200/60 opacity-75'
                  }`}
                >
                  <div>
                    {/* Top row: Unboxed metadata + Active Toggle */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="text-xs font-medium text-slate-500">
                        <span>ימים: {alarm.days.join(', ')}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>{alarm.enabled ? 'מופעל' : 'כבוי'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAlarm(alarm.id)}
                          aria-label={alarm.enabled ? 'כבה שעון' : 'הפעל שעון'}
                          className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            alarm.enabled
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {alarm.enabled ? 'פעיל' : 'כבוי'}
                        </button>
                        {alarms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAlarm(alarm.id)}
                            aria-label="מחק שעון"
                            className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Big Tabular Time */}
                    <div
                      className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight"
                      dir="ltr"
                    >
                      {alarm.time}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2">
                      {alarm.label}
                    </h3>

                    {/* Unboxed clean metadata lines */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">משימת בוקר: </span>
                        <span>{missionObj.title}</span>
                        <span className="mx-1" aria-hidden="true">·</span>
                        <span className="font-semibold text-amber-700">
                          +{missionObj.rewardStars} כוכבים
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">מנגינה: </span>
                        <span>{melodyObj.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerAlarmNow(alarm)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <AlarmClock className="w-4 h-4" />
                      <span>הפעל משימה זו</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => soundEngine.playMelodySequence(alarm.melody)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>צליל</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: MORNING ROUTINE TURBO RACE (מרוץ ההתארגנות בבוקר) */}
        <section id="morning-race" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                02. מרוץ ההתארגנות של {childName}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                קמים מהמיטה ומנצחים את השעון! הפעילו טיימר טורבו לכל משימת בוקר ואספו כוכבי זהב על התארגנות זריזה
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playStepClick();
                setRoutineSteps((prev) => prev.map((s) => ({ ...s, completed: false })));
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>איפוס מסלול לבוקר חדש</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Routine Checklist (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
              {routineSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    step.completed ? 'bg-emerald-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleRoutineStep(step)}
                      aria-label={step.completed ? 'בטל סימון משימה' : 'סמן משימה כהושלמה'}
                      className="min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center transition-colors shrink-0 cursor-pointer bg-slate-100 hover:bg-amber-100 text-slate-700"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        <span>תחנה {index + 1}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>זמן מומלץ: {Math.round(step.recommendedSeconds / 60)} דקות</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="font-semibold text-amber-700">+{step.stars} כוכבים</span>
                      </div>
                      <h3
                        className={`text-base md:text-lg font-bold mt-0.5 ${
                          step.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartStepTimer(step)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Timer className="w-4 h-4 text-amber-600" />
                      <span>טיימר טורבו</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleRoutineStep(step)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        step.completed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {step.completed ? 'בוצע! (+כוכבים)' : 'סיימתי!'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Turbo Timer Widget (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-slate-900 text-white p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-medium text-amber-300 block">
                  שעון עצר מוזיקלי להתארגנות מהירה
                </span>
                <h3 className="text-xl font-bold mt-1">
                  {activeTimerStepId
                    ? routineSteps.find((s) => s.id === activeTimerStepId)?.title
                    : 'טיימר טורבו (צחצוח והתארגנות)'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  בואו נראה אם {childName} מצליח לסיים את המשימה לפני שהטיימר מגיע לאפס!
                </p>
              </div>

              <div className="py-6 px-4 rounded-2xl bg-slate-800/90 text-center border border-slate-700">
                <div
                  className="text-5xl font-extrabold font-mono tabular-nums text-amber-400"
                  dir="ltr"
                >
                  {formatTimerMMSS(timerSecondsLeft)}
                </div>
                <span className="text-xs text-slate-400 block mt-2">
                  {isTimerRunning ? 'השעון רץ — קדימה אלופים!' : 'מוכן להזנקה'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playStepClick();
                    setIsTimerRunning((prev) => !prev);
                  }}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isTimerRunning ? 'השהה טיימר' : 'התחל ספירה'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playStepClick();
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(120);
                  }}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  איפוס (02:00)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FAMILY TREASURE CHEST & REWARDS */}
        <section id="treasure-chest" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                03. תיבת האוצר והפרסים של {childName}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                הכוכבים שצברתם בקימה מהירה בבוקר הופכים לחוויות ופרסים משפחתיים אמיתיים!
              </p>
            </div>

            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              יתרה נוכחית: <span className="text-amber-600">{stars} כוכבי זהב</span>
            </div>
          </div>

          {recentClaimBanner && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{recentClaimBanner}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Treasure Chest Visual Showcase Card (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 relative min-h-[320px] flex flex-col justify-end">
              <img
                src={rewardTrophyChestImg}
                alt="תיבת האוצר של קפטן בוקר"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              <div className="relative z-10 p-6 text-white space-y-2">
                <div className="text-xs font-medium text-amber-300">
                  מועדון האסטרונאוטים הצעירים
                </div>
                <h3 className="text-2xl font-extrabold">
                  {stars} כוכבי זהב בקופה
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  כל בוקר שבו קמים עם חיוך בלי לכבות את השעון מוסיף כוכבים חדשים לתיבה.
                </p>
              </div>
            </div>

            {/* Rewards Grid (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = stars >= reward.costStars;
                return (
                  <div
                    key={reward.id}
                    className="rounded-3xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-mono tabular-nums font-bold text-amber-700">
                          עלות: {reward.costStars} כוכבים
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          מומש {reward.claimedCount} פעמים
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {reward.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => handleClaimReward(reward)}
                        className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                          canAfford
                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-4 h-4" />
                        <span>
                          {canAfford
                            ? `פדה פרס עכשיו (${reward.costStars} כוכבים)`
                            : `חסרים עוד ${reward.costStars - stars} כוכבים`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: PARENT CUSTOMIZATION ZONE (מתחם הורים) */}
        <section id="parent-zone" className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <UserCheck className="w-4 h-4" />
                <span>מתחם הורים · התאמה אישית למשפחה</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                הוספת פרס משפחתי חדש לתיבת האוצר
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                הגדירו יחד עם {childName} פרסים שעושים לו או לה חשק אמיתי לזנק מהמיטה בבוקר — מטיול אופניים ועד הכנת פיצה ביתית משותפת.
              </p>
            </div>

            <form
              onSubmit={handleAddCustomReward}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-3"
            >
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  שם הפרס המשפחתי
                </label>
                <input
                  type="text"
                  value={newRewardTitle}
                  onChange={(e) => setNewRewardTitle(e.target.value)}
                  placeholder="למשל: הכנת כדורי שוקולד יחד"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  פירוט קצר
                </label>
                <input
                  type="text"
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  placeholder="אחר הצהריים של כיף במטבח"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="sm:col-span-3 flex flex-col justify-end">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  מחיר בכוכבים
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={200}
                    step={5}
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(Number(e.target.value))}
                    className="w-20 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums font-bold bg-slate-50 text-slate-900"
                  />
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    הוסף
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200/80 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>קפטן בוקר — חוויית השכמה חיובית ומשחקית לילדים ולהורים</span>
          <div className="flex items-center gap-4">
            <a href="#alarms" className="hover:text-slate-900 transition-colors">
              שעונים מעוררים
            </a>
            <span aria-hidden="true">·</span>
            <a href="#morning-race" className="hover:text-slate-900 transition-colors">
              מרוץ בוקר
            </a>
            <span aria-hidden="true">·</span>
            <a href="#treasure-chest" className="hover:text-slate-900 transition-colors">
              תיבת האוצר
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Wake-Up Mission Modal */}
      <WakeUpMissionModal
        isOpen={missionModalOpen}
        childName={childName}
        alarmLabel={activeAlarmForModal.label}
        missionType={activeAlarmForModal.mission}
        melodyId={activeAlarmForModal.melody}
        onCompleteMission={handleMissionCompleted}
        onClose={() => setMissionModalOpen(false)}
      />
    </div>
  );
}
