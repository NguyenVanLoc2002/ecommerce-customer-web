import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { homeService } from '@/features/home/services/homeService';

export const useHomeCategories = () =>
  useQuery({
    queryKey: queryKeys.home.categories,
    queryFn: homeService.getCategories,
  });

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: queryKeys.home.featured,
    queryFn: homeService.getFeaturedProducts,
  });

export const useNewArrivals = () =>
  useQuery({
    queryKey: queryKeys.home.arrivals,
    queryFn: homeService.getNewArrivals,
  });

