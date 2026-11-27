import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbNavProps = {
  items: BreadcrumbItem[];
  appearance?: 'default' | 'product';
};

export const BreadcrumbNav = ({ appearance = 'default', items }: BreadcrumbNavProps) => (
  <nav aria-label="Breadcrumb">
    <ol className={appearance === 'product' ? 'flex items-center gap-1.5 text-sm text-text-secondary lg:gap-2' : 'flex flex-wrap items-center gap-2 text-sm text-text-secondary'}>
      {items.map((item, index) => (
        <li className={appearance === 'product' ? cn('flex min-w-0 items-center gap-1.5 whitespace-nowrap lg:gap-2', index < items.length - 1 && 'shrink-0') : 'flex items-center gap-2'} key={`${item.label}-${index}`}>
          {item.href ? <Link className="transition-colors hover:text-brand-primary" to={item.href}>{item.label}</Link> : <span aria-current="page" className={appearance === 'product' ? 'truncate font-medium text-text-primary' : undefined}>{item.label}</span>}
          {index < items.length - 1 ? (appearance === 'product' ? <span aria-hidden="true" className="text-outline">/</span> : <ChevronRight aria-hidden="true" className="h-4 w-4" />) : null}
        </li>
      ))}
    </ol>
  </nav>
);

