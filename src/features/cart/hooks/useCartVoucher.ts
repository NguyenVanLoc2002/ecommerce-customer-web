import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { validateCartVoucher } from '@/shared/lib/validateCartVoucher';
import type { CommerceCart } from '@/shared/types/commerce.types';

export const useCartVoucher = (cart: CommerceCart | undefined, updating: boolean) => {
  const [code, setCode] = useState('');
  const hasItems = Boolean(cart?.items.length);
  const query = useQuery({
    queryKey: ['cart', 'voucher', code, cart?.id, cart?.updatedAt, cart?.subTotal,
      cart?.items.map(({ id, quantity, unitPrice }) => [id, quantity, unitPrice])],
    queryFn: () => validateCartVoucher(code, cart?.subTotal ?? 0),
    enabled: Boolean(code && hasItems),
    retry: false,
    staleTime: 0,
  });

  return {
    apply(rawCode: string) {
      const nextCode = rawCode.trim().toUpperCase();
      if (nextCode && nextCode === code) {
        void query.refetch();
      } else {
        setCode(nextCode);
      }
    },
    code: hasItems ? code : '',
    preview: query.isSuccess && !query.isFetching && !updating ? query.data : undefined,
    checking: Boolean(code && hasItems && (query.isFetching || updating)),
    failed: Boolean(code && query.isError && !query.isFetching && !updating),
  };
};
