import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  FlaskConical,
  Share2,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';

type FeatureSection = {
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    title: 'Особовий склад',
    icon: Users,
    paragraphs: [
      'У застосунку можна створювати та впорядковувати список особового складу. У прізвищі військовослужбовця можна позначити наголос. Порядок людей можна змінювати перетягуванням. Список можна імпортувати з тексту.',
    ],
  },
  {
    title: 'Проведення переклички',
    icon: ClipboardCheck,
    paragraphs: [
      'На головному екрані можна почати нову перекличку або продовжити активну. Для кожної людини під час переклички можна встановити один зі статусів, наприклад: присутній, черговий по роті, черговий по їдальні, хворий або відсутній.',
      'Під час переклички застосунок показує поточні підсумки, попередні статуси та підказує ймовірний повторний статус військовослужбовця. Останній встановлений статус можна скасувати, якщо його було вказано помилково.',
      'Завершена перекличка зберігається в журналі. Поточну перекличку можна повністю скасувати — тоді її не буде додано до журналу.',
    ],
  },
  {
    title: 'Журнал перекличок',
    icon: BookOpen,
    paragraphs: [
      'Журнал зберігає завершені переклички та показує їх від найновішої до найстарішої. Для кожної переклички видно дату, час, тривалість, кількість присутніх і розподіл за іншими статусами.',
      'У детальному перегляді можна побачити статус кожної людини та скористатися фільтром «Лише відсутні». На головному екрані також доступні п’ять останніх перекличок.',
    ],
  },
  {
    title: 'Передавання даних',
    icon: Share2,
    paragraphs: [
      'Дані можна передати іншому користувачеві або перенести на інший пристрій у вигляді файлу чи закодованого тексту. Передавання доступне через системне меню, месенджер або буфер обміну.',
      'Під час імпорту нові дані — особовий склад і переклички — об’єднуються з наявними даними.',
      'У налаштуваннях можна видалити весь особовий склад та журнал перекличок.',
    ],
  },
  {
    title: 'Поширення та встановлення застосунку',
    icon: Smartphone,
    paragraphs: [
      'Посилання на застосунок можна надіслати або скопіювати. Для швидкого відкриття на іншому пристрої доступний QR-код.',
      'Застосунок можна встановити на головний екран як PWA та запускати в повноекранному режимі. Після першого завантаження він здатен працювати без мережі. Коли доступна нова версія та є інтернет, у налаштуваннях з’являється кнопка «Оновити».',
    ],
  },
  {
    title: 'Тестові дані',
    icon: FlaskConical,
    paragraphs: [
      'Якщо список особового складу порожній, на головному екрані є посилання для заповнення застосунку тестовими даними. Це може бути корисним для швидкої демонстрації його можливостей.',
    ],
  },
  {
    title: 'Приватність даних',
    icon: ShieldCheck,
    paragraphs: [
      'Усі робочі дані зберігаються лише на поточному пристрої. Застосунок не вимагає реєстрації та не надсилає дані на сервер.',
      'Автоматичної синхронізації між пристроями немає. Для поширення даних потрібно скористатися файловим або текстовим експортом.',
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
            «Перекличка» — мобільний застосунок для проведення переклички особового складу. Він працює без доступу до інтернету, зберігає всі дані на пристрої користувача та дає змогу ділитися результатами, наприклад через месенджер.
          </p>
        </div>

        {FEATURE_SECTIONS.map(({ title, icon: Icon, paragraphs }) => (
          <section key={title} className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground'>
                <Icon className='h-5 w-5' />
              </div>
              <h2 className='text-lg font-bold'>{title}</h2>
            </div>
            <div className='mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground'>
              {paragraphs.map(paragraph => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
