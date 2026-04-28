import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { productService } from '@/features/products/services/productService';
import type { ProductFilters } from '@/shared/types/catalog.types';

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: productService.getCategories,
  });

export const useBrands = () =>
  useQuery({
    queryKey: queryKeys.products.brands,
    queryFn: productService.getBrands,
  });

export const useProductList = (filters: ProductFilters) =>
  useQuery({
    queryKey: queryKeys.products.list(JSON.stringify(filters)),
    queryFn: () => productService.getProducts(filters),
  });

export const useProductDetail = (slug: string) =>
  useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled: Boolean(slug),
  });

export const useRelatedProducts = (slug: string) =>
  useQuery({
    queryKey: queryKeys.products.related(slug),
    queryFn: () => productService.getRelatedProducts(slug),
    enabled: Boolean(slug),
  });

