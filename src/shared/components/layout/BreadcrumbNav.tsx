import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbNavProps = {
  items: BreadcrumbItem[];
};

export const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
      {items.map((item, index) => (
        <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
          {item.href ? <Link className="transition-colors hover:text-brand-primary" to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {index < items.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
        </li>
      ))}
    </ol>
  </nav>
);

