import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
};

export const SectionHeader = ({
  action,
  align = 'left',
  description,
  eyebrow,
  title,
}: SectionHeaderProps) => (
  <div
    className={`flex flex-col gap-5 ${align === 'center' ? 'items-center text-center' : 'items-start md:flex-row md:items-end md:justify-between'}`}
  >
    <div className={align === 'center' ? '' : 'max-w-2xl'}>
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-display text-[2rem] leading-[1.1] text-text-primary md:text-[3rem]">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-text-secondary">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
