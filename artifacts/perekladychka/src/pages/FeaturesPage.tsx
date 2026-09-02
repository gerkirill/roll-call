import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  FlaskConical,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';

type FeatureSection = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    title: 'Особовий склад',
    icon: Users,
    items: [
      'Додавайте, редагуйте та видаляйте військовослужбовців.',
      'Вказуйте ім’я, по батькові або ініціали та позначайте наголос у прізвищі.',
      'Вставляйте готовий список текстом — застосунок нормалізує регістр і зайві пробіли.',
      'Змінюйте порядок людей перетягуванням. Він зберігається для переклички та журналу.',
    ],
  },
  {
    title: 'Проведення переклички',
    icon: ClipboardCheck,
    items: [
      'Починайте нову перекличку або продовжуйте активну з головного екрана.',
      'Відмічайте статус: присутній, черговий по роті, черговий по їдальні, хворий або відсутній.',
      'Порівнюйте поточні підсумки з попередньою перекличкою та переглядайте минулий статус кожної людини.',
      'Використовуйте підказки для статусів, які можуть повторитися.',
      'Скасовуйте останню відмітку, змінюйте окремі записи або видаляйте незавершену перекличку.',
    ],
  },
  {
    title: 'Журнал перекличок',
    icon: BookOpen,
    items: [
      'Переглядайте завершені переклички за датою і часом — від найновіших до найстаріших.',
      'Бачте тривалість, кількість присутніх і розподіл інших статусів.',
      'Відкривайте детальний список зі статусом кожного військовослужбовця.',
      'Фільтруйте список, щоб показати лише тих, хто не був відмічений присутнім.',
    ],
  },
  {
    title: 'Передавання та резервні копії',
    icon: Share2,
    items: [
      'Надсилайте або завантажуйте повну резервну копію у форматі JSON.',
      'Імпортуйте резервну копію з об’єднанням її вмісту з поточними даними.',
      'Передавайте дані одним стисненим текстовим рядком через системне меню або буфер обміну.',
      'Обирайте Base64 або компактніший Base32768; під час імпорту формат визначається автоматично.',
      'За потреби видаляйте всі дані після додаткового підтвердження.',
    ],
  },
  {
    title: 'Встановлення та приватність',
    icon: ShieldCheck,
    items: [
      'Встановлюйте застосунок на головний екран і користуйтеся ним без мережі після першого завантаження.',
      'Надсилайте посилання на застосунок або відкривайте його на іншому пристрої за QR-кодом.',
      'Отримуйте повідомлення, коли нова версія готова до встановлення.',
      'Працюйте без реєстрації: особовий склад і переклички зберігаються лише на поточному пристрої.',
    ],
  },
  {
    title: 'Тестові дані',
    icon: FlaskConical,
    items: [
      'У порожньому застосунку додайте 10 вигаданих військовослужбовців і дві завершені переклички, щоб швидко переглянути основні сценарії.',
    ],
  },
];

export default function FeaturesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className='flex min-h-[100dvh] flex-col bg-background'>
      <header className='sticky top-0 z-40 border-b border-border bg-card shadow-sm'>
        <div className='flex h-14 items-center gap-3 px-4'>
          <button
            type='button'
            onClick={() => setLocation('/settings')}
            aria-label='Повернутися до налаштувань'
            className='-ml-2 rounded-full p-2 text-muted-foreground active-elevate'
          >
            <ChevronLeft className='h-6 w-6' />
          </button>
          <h1 className='text-lg font-bold'>Можливості</h1>
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] md:p-6'>
        <div className='rounded-2xl border border-primary/20 bg-primary/10 p-4'>
          <h2 className='font-bold text-primary'>Що вміє «Перекличка»</h2>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
            Застосунок допомагає вести особовий склад, проводити переклички та зберігати їх результати без облікового запису.
          </p>
        </div>

        {FEATURE_SECTIONS.map(({ title, icon: Icon, items }) => (
          <section key={title} className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground'>
                <Icon className='h-5 w-5' />
              </div>
              <h2 className='text-lg font-bold'>{title}</h2>
            </div>
            <ul className='mt-3 flex flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground'>
              {items.map(item => (
                <li key={item} className='list-disc pl-1 marker:text-primary'>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
