import { MelodyId } from '../utils/soundEngine';

export type MissionType = 'star_catcher' | 'rocket_code' | 'stretch_party';

export interface WakeMissionInfo {
  id: MissionType;
  title: string;
  description: string;
  rewardStars: number;
  durationLabel: string;
}

export interface AlarmItem {
  id: string;
  time: string; // HH:MM
  label: string;
  days: string[];
  mission: MissionType;
  melody: MelodyId;
  enabled: boolean;
}

export interface RoutineStep {
  id: string;
  title: string;
  subtitle: string;
  recommendedSeconds: number;
  stars: number;
  completed: boolean;
}

export interface FamilyReward {
  id: string;
  title: string;
  description: string;
  costStars: number;
  claimedCount: number;
}

export interface MorningSurprise {
  jokeQuestion: string;
  jokeAnswer: string;
  funFact: string;
  captainCompliment: string;
}

export const WAKE_MISSIONS: WakeMissionInfo[] = [
  {
    id: 'star_catcher',
    title: 'צייד הכוכבים המעופפים',
    description: 'תפסו 5 כוכבי בוקר זוהרים שקופצים על מסלול ההמראה כדי לכבות את השעון ולפתוח את היום!',
    rewardStars: 15,
    durationLabel: 'משחק זריזות · 20 שניות',
  },
  {
    id: 'rocket_code',
    title: 'צופן השיגור של קפטן אסטרו',
    description: 'פתרו 3 חידות חלל וחשבון מהירות כדי להפעיל את מנועי החללית ולקפוץ מהמיטה!',
    rewardStars: 20,
    durationLabel: 'אתגר מחשבה · 30 שניות',
  },
  {
    id: 'stretch_party',
    title: 'מסיבת קפיצות ומתיחות',
    description: '3 משימות תנועה אנרגטיות מחוץ למיטה: מתיחת שמיים, קפיצות אסטרונאוט וחיוך אלופים!',
    rewardStars: 15,
    durationLabel: 'תנועה ואנרגיה · 25 שניות',
  },
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    time: '07:00',
    label: 'המראה לבית הספר עם חיוך',
    days: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'],
    mission: 'star_catcher',
    melody: 'space_fanfare',
    enabled: true,
  },
  {
    id: 'alarm-2',
    time: '07:15',
    label: 'בוקר יום שישי קסום',
    days: ['ו׳'],
    mission: 'stretch_party',
    melody: 'jungle_marimba',
    enabled: true,
  },
  {
    id: 'alarm-3',
    time: '08:30',
    label: 'הרפתקת שבת בבוקר',
    days: ['ש׳'],
    mission: 'rocket_code',
    melody: 'sun_chimes',
    enabled: false,
  },
];

export const INITIAL_ROUTINE_STEPS: RoutineStep[] = [
  {
    id: 'step-1',
    title: 'קפיצת אסטרונאוט מהמיטה וסידור השמיכה',
    subtitle: 'פותחים חלון לאור השמש ומיישרים את המיטה כמו קפטנים',
    recommendedSeconds: 60,
    stars: 5,
    completed: false,
  },
  {
    id: 'step-2',
    title: 'צחצוח שיניים נוצץ ושטיפת פנים',
    subtitle: '2 דקות של שיניים מבריקות ומים קרירים ומרעננים על הפנים',
    recommendedSeconds: 120,
    stars: 10,
    completed: false,
  },
  {
    id: 'step-3',
    title: 'לבישת חליפת היום (בגדים ונעליים)',
    subtitle: 'מתלבשים מהר בלי להתעכב ומכינים כוחות ליום חדש',
    recommendedSeconds: 180,
    stars: 10,
    completed: false,
  },
  {
    id: 'step-4',
    title: 'תדלוק בוקר: כוס מים וארוחת בוקר טעימה',
    subtitle: 'אנרגיה לגוף ולמוח לפני שיוצאים לדרך',
    recommendedSeconds: 300,
    stars: 10,
    completed: false,
  },
];

export const INITIAL_REWARDS: FamilyReward[] = [
  {
    id: 'rew-1',
    title: 'בחירת ארוחת בוקר מיוחדת של אלופים',
    description: 'פנקייקים, טוסט גבינה או שייק פירות לבחירתך בבוקר שישי או שבת',
    costStars: 30,
    claimedCount: 1,
  },
  {
    id: 'rew-2',
    title: 'סיפור הרפתקאות נוסף לפני השינה',
    description: 'בוחרים שני סיפורים במקום אחד בערב עם אמא או אבא',
    costStars: 20,
    claimedCount: 2,
  },
  {
    id: 'rew-3',
    title: 'החלטה על הסרט או המשחק המשפחתי הבא',
    description: 'זכות בחירה מלאה בערב הסרט המשפחתי בסלון עם פופקורן',
    costStars: 45,
    claimedCount: 0,
  },
  {
    id: 'rew-4',
    title: '20 דקות משחק קופסה או לגו אחד-על-אחד',
    description: 'זמן איכות מיוחד של בנייה או משחק לבחירתך עם ההורים',
    costStars: 25,
    claimedCount: 1,
  },
];

export const MORNING_SURPRISES: MorningSurprise[] = [
  {
    jokeQuestion: 'איזה כוכב לכת הכי אוהב לשיר בבוקר?',
    jokeAnswer: 'נפטון — כי תמיד יש לו טון מצוין!',
    funFact: 'הידעת? בחלל האסטרונאוטים רואים זריחה חדשה בכל 90 דקות כשהם מקיפים את כדור הארץ!',
    captainCompliment: 'קמת במהירות שיא! קפטן אסטרו מצדיע לך על האנרגיה המדהימה.',
  },
  {
    jokeQuestion: 'למה השמש אף פעם לא הולכת לבית הספר?',
    jokeAnswer: 'כי יש לה כבר מיליון מעלות והיא הכי מבריקה בכיתה!',
    funFact: 'הידעת? כלבי גולדן רטריבר (כמו קפטן אסטרו!) מסוגלים לזכור יותר מ-165 מילים ופקודות שונות.',
    captainCompliment: 'איזה אלוף! החיוך שלך הבוקר מאיר יותר חזק ממנועי החללית שלנו.',
  },
  {
    jokeQuestion: 'מה אומר שעון מעורר לחבר שלו כשהוא מתעורר?',
    jokeAnswer: 'קום מהר, אין לנו שנייה לבזבז!',
    funFact: 'הידעת? צחוק של 15 שניות על הבוקר משחרר אנדורפינים שנותנים למוח אנרגיה לשעות קדימה!',
    captainCompliment: 'ביצוע מושלם! המראת מהמיטה כמו טיל אמיתי.',
  },
];
