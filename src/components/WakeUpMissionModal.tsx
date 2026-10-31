import React, { useState, useEffect } from 'react';
import { Star, Rocket, Sparkles, Volume2, VolumeX, CheckCircle2, Smile, Sun, ArrowLeft } from 'lucide-react';
import { MissionType, MORNING_SURPRISES, WAKE_MISSIONS } from '../data/morningData';
import { MelodyId, soundEngine } from '../utils/soundEngine';
import captainAstroImg from '../assets/images/captain_astro_mascot_1793475758461.jpg';
import morningPlanetBaseImg from '../assets/images/morning_planet_base_1793475759223.jpg';

interface WakeUpMissionModalProps {
  isOpen: boolean;
  childName: string;
  alarmLabel: string;
  missionType: MissionType;
  melodyId: MelodyId;
  onCompleteMission: (earnedStars: number) => void;
  onClose: () => void;
}

interface RocketQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

const ROCKET_QUESTIONS: RocketQuestion[] = [
  {
    prompt: 'כדי להדליק את מנוע החללית הראשון: כמה הם 4 כוכבים ועוד 5 כוכבים?',
    options: ['7 כוכבים', '9 כוכבים', '11 כוכבים'],
    correctIndex: 1,
  },
  {
    prompt: 'מנוע שני מתעורר! איזה כוכב מאיר לנו את השמיים בכל בוקר?',
    options: ['הירח הכסוף', 'השמש הזוהרת', 'שביט הקרח'],
    correctIndex: 1,
  },
  {
    prompt: 'קוד שיגור אחרון! אם יש לנו 3 אסטרונאוטים שלכל אחד 2 מגפיים, כמה מגפיים יש יחד?',
    options: ['6 מגפיים', '5 מגפיים', '8 מגפיים'],
    correctIndex: 0,
  },
];

const STRETCH_STEPS = [
  {
    title: 'שלב 1: עומדים על הרגליים ונוגעים בשמיים!',
    instruction: 'רד מהמיטה, מתח את שתי הידיים הכי גבוה שאפשר לכיוון התקרה ולחץ על הכפתור!',
    buttonText: 'מתחתי ידיים עד השמיים!',
  },
  {
    title: 'שלב 2: 3 קפיצות אסטרונאוט בחדר!',
    instruction: 'קפוץ עכשיו 3 פעמים במקום כמו אסטרונאוט על הירח כדי להעיר את כל הגוף!',
    buttonText: 'קפצתי 3 פעמים!',
  },
  {
    title: 'שלב 3: חיוך האלופים של הבוקר!',
    instruction: 'תן את החיוך הכי גדול שלך הבוקר כדי להטעין את סוללת השמחה של קפטן אסטרו!',
    buttonText: 'חייכתי חיוך ענק!',
  },
];

export const WakeUpMissionModal: React.FC<WakeUpMissionModalProps> = ({
  isOpen,
  childName,
  alarmLabel,
  missionType,
  melodyId,
  onCompleteMission,
  onClose,
}) => {
  const [activeMission, setActiveMission] = useState<MissionType>(missionType);
  const [isMuted, setIsMuted] = useState(false);
  const [phase, setPhase] = useState<'CHALLENGE' | 'VICTORY'>('CHALLENGE');

  // Star Catcher state
  const [starsCaught, setStarsCaught] = useState(0);
  const [starPos, setStarPos] = useState({ top: 35, left: 45 });

  // Rocket Code state
  const [questionIdx, setQuestionIdx] = useState(0);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  // Stretch Party state
  const [stretchIdx, setStretchIdx] = useState(0);

  // Victory surprise state
  const [surpriseIndex, setSurpriseIndex] = useState(0);
  const [jokeRevealed, setJokeRevealed] = useState(false);

  const missionMeta = WAKE_MISSIONS.find((m) => m.id === activeMission) || WAKE_MISSIONS[0];
  const surprise = MORNING_SURPRISES[surpriseIndex % MORNING_SURPRISES.length];

  useEffect(() => {
    if (isOpen) {
      setActiveMission(missionType);
      setPhase('CHALLENGE');
      setStarsCaught(0);
      setQuestionIdx(0);
      setStretchIdx(0);
      setJokeRevealed(false);
      setWrongAttempt(false);
      setSurpriseIndex(Math.floor(Math.random() * MORNING_SURPRISES.length));
      setStarPos({ top: 30, left: 50 });

      soundEngine.startAlarmLoop(melodyId);
      soundEngine.speakHebrewGreeting(
        `בוקר טוב ${childName}! קפטן אסטרו כאן. הגיע הזמן לקום עם חיוך למשימת ${missionMeta.title}!`
      );
    } else {
      soundEngine.stopAlarmLoop();
    }
    return () => {
      soundEngine.stopAlarmLoop();
    };
  }, [isOpen, missionType, melodyId, childName]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (isMuted) {
      soundEngine.startAlarmLoop(melodyId);
      setIsMuted(false);
    } else {
      soundEngine.stopAlarmLoop();
      setIsMuted(true);
    }
  };

  const triggerVictory = () => {
    soundEngine.stopAlarmLoop();
    soundEngine.playSuccessFanfare();
    soundEngine.speakHebrewGreeting(
      `כל הכבוד ${childName}! השלמת את משימת הבוקר וזכית ב-${missionMeta.rewardStars} כוכבי זהב!`
    );
    setPhase('VICTORY');
  };

  // Star Catcher Handler
  const handleCatchStar = () => {
    soundEngine.playStarCollect();
    const nextCount = starsCaught + 1;
    setStarsCaught(nextCount);
    if (nextCount >= 5) {
      triggerVictory();
    } else {
      // Move star to a new playful position
      const nextTop = 18 + Math.floor(Math.random() * 58);
      const nextLeft = 16 + Math.floor(Math.random() * 68);
      setStarPos({ top: nextTop, left: nextLeft });
    }
  };

  // Rocket Code Handler
  const handleSelectOption = (idx: number) => {
    const currentQ = ROCKET_QUESTIONS[questionIdx];
    if (idx === currentQ.correctIndex) {
      soundEngine.playStarCollect();
      setWrongAttempt(false);
      if (questionIdx + 1 >= ROCKET_QUESTIONS.length) {
        triggerVictory();
      } else {
        setQuestionIdx(questionIdx + 1);
      }
    } else {
      setWrongAttempt(true);
      soundEngine.playStepClick();
    }
  };

  // Stretch Party Handler
  const handleNextStretch = () => {
    soundEngine.playStarCollect();
    if (stretchIdx + 1 >= STRETCH_STEPS.length) {
      triggerVictory();
    } else {
      setStretchIdx(stretchIdx + 1);
    }
  };

  const handleFinishAndClaim = () => {
    onCompleteMission(missionMeta.rewardStars);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="משימת השכמה בבוקר"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Top Banner with Captain Astro & Sound Control */}
        <div className="bg-amber-50/90 border-b border-amber-200/70 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-100 shrink-0">
              <img
                src={captainAstroImg}
                alt="קפטן אסטרו"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-800">
                קריאת השכמה פעילה · {alarmLabel}
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                בוקר אור, קפטן {childName}!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              <span>{isMuted ? 'הפעל מנגינה' : 'השתק צלצול'}</span>
            </button>
          </div>
        </div>

        {/* Mission Mode Switcher inside Modal so parent/kid can test all 3 games easily */}
        {phase === 'CHALLENGE' && (
          <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">
              משימה להפסקת השעון וזכייה ב-{missionMeta.rewardStars} כוכבים:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              {WAKE_MISSIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMission(m.id);
                    setStarsCaught(0);
                    setQuestionIdx(0);
                    setStretchIdx(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    activeMission === m.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 md:p-8">
          {phase === 'CHALLENGE' ? (
            <div>
              {/* MISSION 1: STAR CATCHER */}
              {activeMission === 'star_catcher' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        תפסו 5 כוכבי בוקר קופצניים!
                      </h3>
                      <p className="text-sm text-slate-600">
                        לחצו מהר על הכוכב הזוהר בכל פעם שהוא מופיע בשמי הזריחה
                      </p>
                    </div>
                    <div className="text-left font-mono tabular-nums text-lg font-bold text-amber-600">
                      {starsCaught} / 5 כוכבים
                    </div>
                  </div>

                  {/* Interactive Arena */}
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 select-none">
                    <img
                      src={morningPlanetBaseImg}
                      alt="בסיס השיגור בזריחה"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30" />

                    {/* Progress bar at top of arena */}
                    <div className="absolute top-3 right-3 left-3 h-2.5 bg-white/25 rounded-full overflow-hidden backdrop-blur-xs">
                      <div
                        className="h-full bg-amber-400 transition-transform duration-200 origin-right"
                        style={{ transform: `scaleX(${starsCaught / 5})` }}
                      />
                    </div>

                    {/* Clickable Jumping Star */}
                    <button
                      type="button"
                      onClick={handleCatchStar}
                      style={{ top: `${starPos.top}%`, left: `${starPos.left}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 min-w-[68px] min-h-[68px] rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-90 text-slate-950 shadow-xl border-2 border-white flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 cursor-pointer"
                    >
                      <Star className="w-8 h-8 fill-slate-950 text-slate-950" />
                      <span className="text-[11px] font-bold whitespace-nowrap">תפוס אותי!</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MISSION 2: ROCKET CODE */}
              {activeMission === 'rocket_code' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        צופן השיגור של קפטן אסטרו
                      </h3>
                      <p className="text-sm text-slate-600">
                        ענו נכון על 3 שאלות בוקר קלילות כדי להדליק את מנועי החללית
                      </p>
                    </div>
                    <div className="text-left font-mono tabular-nums text-base font-bold text-amber-600">
                      מנוע {questionIdx + 1} מתוך {ROCKET_QUESTIONS.length}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-base md:text-lg font-semibold text-slate-900 mb-5">
                      {ROCKET_QUESTIONS[questionIdx].prompt}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ROCKET_QUESTIONS[questionIdx].options.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className="min-h-[56px] px-4 py-3 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-900 font-bold text-base transition-colors flex items-center justify-center shadow-2xs active:scale-[0.98]"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {wrongAttempt && (
                      <p className="mt-4 text-sm font-medium text-amber-700">
                        כמעט! נסו תשובה אחרת כדי להדליק את המנוע.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* MISSION 3: STRETCH PARTY */}
              {activeMission === 'stretch_party' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        מסיבת קפיצות ומתיחות מחוץ למיטה
                      </h3>
                      <p className="text-sm text-slate-600">
                        מעירים את הגוף ב-3 צעדים מהירים וכיפיים
                      </p>
                    </div>
                    <div className="text-left font-mono tabular-nums text-base font-bold text-amber-600">
                      צעד {stretchIdx + 1} מתוך {STRETCH_STEPS.length}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-700 flex items-center justify-center mx-auto mb-3">
                      <Sun className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                      {STRETCH_STEPS[stretchIdx].title}
                    </h4>
                    <p className="text-base text-slate-700 max-w-md mx-auto mb-6">
                      {STRETCH_STEPS[stretchIdx].instruction}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextStretch}
                      className="min-h-[52px] px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-transform active:scale-95 inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      <span>{STRETCH_STEPS[stretchIdx].buttonText}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* VICTORY & MORNING SURPRISE REVEAL */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="text-center sm:text-right flex-1">
                  <div className="text-xs font-semibold text-emerald-800 mb-1">
                    השעון כובה בהצלחה · נוספו +{missionMeta.rewardStars} כוכבי זהב!
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    בוקר של אלופים, {childName}!
                  </h3>
                  <p className="text-sm text-slate-700 mt-0.5">
                    {surprise.captainCompliment}
                  </p>
                </div>
              </div>

              {/* Daily Joke & Space Fact Card (Why kids love waking up!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-2">
                      <Smile className="w-4 h-4" />
                      <span>בדיחת הבוקר הסודית שנפתחה היום</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mb-3">
                      {surprise.jokeQuestion}
                    </p>
                  </div>

                  {jokeRevealed ? (
                    <p className="p-3 rounded-xl bg-amber-50 text-slate-900 font-semibold text-sm border border-amber-200">
                      {surprise.jokeAnswer}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playStepClick();
                        setJokeRevealed(true);
                      }}
                      className="min-h-[44px] w-full px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold text-xs transition-colors whitespace-nowrap"
                    >
                      גלה את התשובה המצחיקה!
                    </button>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>עובדת היום של קפטן אסטרו</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {surprise.funFact}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    ספר את זה להורים בארוחת הבוקר!
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleFinishAndClaim}
                  className="w-full sm:w-auto min-h-[52px] px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>אסוף +{missionMeta.rewardStars} כוכבים והמשך למרוץ הבוקר</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
