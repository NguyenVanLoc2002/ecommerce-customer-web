import { config } from '@/constants/config';
import { createServiceError } from '@/shared/lib/serviceError';
import { mockCatalog } from '@/shared/lib/mockCatalog';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@/shared/types/address.types';
import type { CartItem, CommerceCart, CommerceOrder, CustomerAddress, PlaceOrderInput, VoucherPreview } from '@/shared/types/commerce.types';
import type { Payment, PaymentTransaction } from '@/shared/types/payment.types';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';
import type { Shipment, ShipmentEvent } from '@/shared/types/shipment.types';
import { SHIPMENT_STATUSES } from '@/shared/types/shipment.types';
import { ADDRESS_TYPES, ORDER_STATUSES, PAYMENT_METHODS } from '@/shared/types/enums';

type StoredCartItem = {
  id: string;
  variantId: string;
  quantity: number;
};

type StoredPayment = Payment & {
  pollCount: number;
  settleAfterPolls: number;
  nextTerminalStatus: typeof PAYMENT_STATUSES.PAID | typeof PAYMENT_STATUSES.FAILED;
  retryCount: number;
};

type StoredShipment = Shipment;

type UserCommerceState = {
  cartId: string;
  cartItems: StoredCartItem[];
  addresses: CustomerAddress[];
  orders: CommerceOrder[];
  payments: StoredPayment[];
  shipments: StoredShipment[];
};

type CommerceStorage = {
  users: Record<string, UserCommerceState>;
};

const defaultStorage: CommerceStorage = {
  users: {},
};

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const readStorage = (): CommerceStorage => {
  const storage = getStorage();
  if (!storage) {
    return defaultStorage;
  }

  const raw = storage.getItem(config.mockCommerceKey);
  if (!raw) {
    return defaultStorage;
  }

  return JSON.parse(raw) as CommerceStorage;
};

const writeStorage = (value: CommerceStorage) => {
  const storage = getStorage();
  storage?.setItem(config.mockCommerceKey, JSON.stringify(value));
};

const getCurrentUserId = () => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    throw createServiceError('UNAUTHORIZED', 'You must be signed in to access customer commerce data.');
  }

  return userId;
};

const buildFullAddress = (address: Pick<Address, 'streetAddress' | 'ward' | 'district' | 'city' | 'postalCode'>) =>
  [address.streetAddress, `${address.ward}, ${address.district}`, `${address.city} ${address.postalCode}`]
    .filter(Boolean)
    .join(', ');

const normalizeAddress = (address: CustomerAddress): CustomerAddress => ({
  ...address,
  fullAddress: address.fullAddress ?? buildFullAddress(address),
});

const sortAddresses = (addresses: CustomerAddress[]) =>
  [...addresses]
    .map(normalizeAddress)
    .sort((left, right) => {
      if (left.isDefault !== right.isDefault) {
        return Number(right.isDefault) - Number(left.isDefault);
      }

      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    });

const seedAddresses = (userId: string): CustomerAddress[] => {
  if (userId !== 'customer-001') {
    return [
      {
        id: crypto.randomUUID(),
        receiverName: 'New Customer',
        phoneNumber: '+12025550199',
        streetAddress: '128 Mercer Street',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'Ho Chi Minh City',
        postalCode: '700000',
        addressType: ADDRESS_TYPES.HOME,
        label: 'Primary',
        isDefault: true,
        fullAddress: '128 Mercer Street, Ward 1, District 1, Ho Chi Minh City 700000',
        createdAt: '2026-04-25T08:10:00Z',
      },
    ];
  }

  return [
    {
      id: 'addr-primary',
      receiverName: 'Elena Hart',
      phoneNumber: '+12025550120',
      streetAddress: '28 Mercer Street',
      ward: 'Ward 1',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      postalCode: '700000',
      addressType: ADDRESS_TYPES.HOME,
      label: 'Residence',
      isDefault: true,
      fullAddress: '28 Mercer Street, Ward 1, District 1, Ho Chi Minh City 700000',
      createdAt: '2026-03-14T10:00:00Z',
    },
    {
      id: 'addr-studio',
      receiverName: 'Elena Hart',
      phoneNumber: '+12025550120',
      streetAddress: '91 Nguyen Hue Boulevard',
      ward: 'Ward 2',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      postalCode: '700000',
      addressType: ADDRESS_TYPES.OFFICE,
      label: 'Studio',
      isDefault: false,
      fullAddress: '91 Nguyen Hue Boulevard, Ward 2, District 1, Ho Chi Minh City 700000',
      createdAt: '2026-04-02T13:30:00Z',
    },
  ];
};

const seedOrders = (userId: string): CommerceOrder[] => {
  if (userId !== 'customer-001') {
    return [];
  }

  const blazerVariant = mockCatalog.findVariantById('hourglass-blazer-Black-s');
  const loafersVariant = mockCatalog.findVariantById('city-loafers-Black-m');

  if (!blazerVariant || !loafersVariant) {
    return [];
  }

  const primaryAddress = seedAddresses(userId)[0];
  const createdAt = '2026-04-10T10:15:00Z';
  const updatedAt = '2026-04-11T09:00:00Z';

  return [
    {
      id: 'ord-completed-001',
      code: 'FS-240410-001',
      status: ORDER_STATUSES.DELIVERED,
      createdAt,
      updatedAt,
      paymentMethod: PAYMENT_METHODS.ONLINE,
      customerNote: 'Leave at the concierge desk.',
      items: [
        {
          id: crypto.randomUUID(),
          productId: blazerVariant.product.id,
          productSlug: blazerVariant.product.slug,
          productName: blazerVariant.product.name,
          brandName: blazerVariant.product.brandName,
          variantId: blazerVariant.variant.id,
          sku: blazerVariant.variant.sku,
          color: blazerVariant.variant.color,
          size: blazerVariant.variant.size,
          quantity: 1,
          unitPrice: blazerVariant.variant.price,
          subtotal: blazerVariant.variant.price,
          primaryImage: blazerVariant.product.primaryImage,
        },
      ],
      shippingAddress: primaryAddress,
      subTotal: blazerVariant.variant.price,
      shippingFee: 0,
      discountTotal: 0,
      grandTotal: blazerVariant.variant.price,
      totalItems: 1,
      canCancel: false,
    },
    {
      id: 'ord-pending-001',
      code: 'FS-240418-002',
      status: ORDER_STATUSES.AWAITING_PAYMENT,
      createdAt: '2026-04-18T14:20:00Z',
      updatedAt: '2026-04-18T14:20:00Z',
      paymentMethod: PAYMENT_METHODS.ONLINE,
      customerNote: '',
      items: [
        {
          id: crypto.randomUUID(),
          productId: loafersVariant.product.id,
          productSlug: loafersVariant.product.slug,
          productName: loafersVariant.product.name,
          brandName: loafersVariant.product.brandName,
          variantId: loafersVariant.variant.id,
          sku: loafersVariant.variant.sku,
          color: loafersVariant.variant.color,
          size: loafersVariant.variant.size,
          quantity: 1,
          unitPrice: loafersVariant.variant.price,
          subtotal: loafersVariant.variant.price,
          primaryImage: loafersVariant.product.primaryImage,
        },
      ],
      shippingAddress: primaryAddress,
      subTotal: loafersVariant.variant.price,
      shippingFee: 0,
      discountTotal: 0,
      grandTotal: loafersVariant.variant.price,
      totalItems: 1,
      canCancel: true,
    },
  ];
};

const createTransaction = ({
  amount,
  createdAt,
  method,
  note,
  provider,
  providerTxnId,
  referenceId,
  referenceType,
  status,
}: {
  amount: number;
  createdAt: string;
  method: PaymentTransaction['method'];
  note: string | null;
  provider: string | null;
  providerTxnId: string | null;
  referenceId: string;
  referenceType: string;
  status: PaymentTransaction['status'];
}): PaymentTransaction => ({
  id: crypto.randomUUID(),
  transactionCode: `TXN-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  status,
  amount,
  method,
  provider,
  providerTxnId,
  referenceType,
  referenceId,
  note,
  createdAt,
});

const seedPayments = (userId: string, orders: CommerceOrder[]): StoredPayment[] => {
  if (userId !== 'customer-001') {
    return [];
  }

  const deliveredOrder = orders.find((order) => order.id === 'ord-completed-001');
  const awaitingOrder = orders.find((order) => order.id === 'ord-pending-001');
  const payments: StoredPayment[] = [];

  if (deliveredOrder) {
    payments.push({
      id: 'pay-completed-001',
      orderId: deliveredOrder.id,
      orderCode: deliveredOrder.code,
      paymentCode: 'PAY-240410-001',
      method: deliveredOrder.paymentMethod,
      status: PAYMENT_STATUSES.PAID,
      amount: deliveredOrder.grandTotal,
      paidAt: '2026-04-10T10:24:00Z',
      createdAt: deliveredOrder.createdAt,
      transactions: [
        createTransaction({
          amount: deliveredOrder.grandTotal,
          createdAt: deliveredOrder.createdAt,
          method: deliveredOrder.paymentMethod,
          note: 'Payment initiated from customer storefront.',
          provider: 'FashionPay',
          providerTxnId: null,
          referenceId: deliveredOrder.id,
          referenceType: 'ORDER',
          status: PAYMENT_STATUSES.INITIATED,
        }),
        createTransaction({
          amount: deliveredOrder.grandTotal,
          createdAt: '2026-04-10T10:24:00Z',
          method: deliveredOrder.paymentMethod,
          note: 'Payment confirmed by the provider.',
          provider: 'FashionPay',
          providerTxnId: 'FP-240410-001',
          referenceId: deliveredOrder.id,
          referenceType: 'ORDER',
          status: PAYMENT_STATUSES.PAID,
        }),
      ],
      pollCount: 0,
      settleAfterPolls: 0,
      nextTerminalStatus: PAYMENT_STATUSES.PAID,
      retryCount: 0,
    });
  }

  if (awaitingOrder) {
    payments.push({
      id: 'pay-awaiting-001',
      orderId: awaitingOrder.id,
      orderCode: awaitingOrder.code,
      paymentCode: 'PAY-240418-002',
      method: awaitingOrder.paymentMethod,
      status: PAYMENT_STATUSES.FAILED,
      amount: awaitingOrder.grandTotal,
      paidAt: null,
      createdAt: awaitingOrder.createdAt,
      transactions: [
        createTransaction({
          amount: awaitingOrder.grandTotal,
          createdAt: awaitingOrder.createdAt,
          method: awaitingOrder.paymentMethod,
          note: 'Initial payment attempt created.',
          provider: 'FashionPay',
          providerTxnId: null,
          referenceId: awaitingOrder.id,
          referenceType: 'ORDER',
          status: PAYMENT_STATUSES.INITIATED,
        }),
        createTransaction({
          amount: awaitingOrder.grandTotal,
          createdAt: '2026-04-18T14:35:00Z',
          method: awaitingOrder.paymentMethod,
          note: 'The gateway declined the first attempt.',
          provider: 'FashionPay',
          providerTxnId: 'FP-240418-001',
          referenceId: awaitingOrder.id,
          referenceType: 'ORDER',
          status: PAYMENT_STATUSES.FAILED,
        }),
      ],
      pollCount: 0,
      settleAfterPolls: 0,
      nextTerminalStatus: PAYMENT_STATUSES.PAID,
      retryCount: 1,
    });
  }

  return payments;
};

const seedShipments = (userId: string, orders: CommerceOrder[]): StoredShipment[] => {
  if (userId !== 'customer-001') {
    return [];
  }

  const deliveredOrder = orders.find((order) => order.id === 'ord-completed-001');
  if (!deliveredOrder) {
    return [];
  }

  const events: ShipmentEvent[] = [
    {
      id: crypto.randomUUID(),
      status: SHIPMENT_STATUSES.DELIVERED,
      location: 'District 1, Ho Chi Minh City',
      description: 'Delivered to the concierge desk and confirmed by the carrier.',
      eventTime: '2026-04-11T09:00:00Z',
    },
    {
      id: crypto.randomUUID(),
      status: SHIPMENT_STATUSES.OUT_FOR_DELIVERY,
      location: 'District 1 Delivery Hub',
      description: 'Courier is out for the final delivery handoff.',
      eventTime: '2026-04-11T06:20:00Z',
    },
    {
      id: crypto.randomUUID(),
      status: SHIPMENT_STATUSES.IN_TRANSIT,
      location: 'Ho Chi Minh City Sorting Center',
      description: 'Shipment reached the regional sorting center.',
      eventTime: '2026-04-10T22:40:00Z',
    },
    {
      id: crypto.randomUUID(),
      status: SHIPMENT_STATUSES.PENDING,
      location: 'Maison Fulfillment Atelier',
      description: 'Order packed and handed to the carrier.',
      eventTime: '2026-04-10T16:15:00Z',
    },
  ];

  return [
    {
      id: 'ship-completed-001',
      orderId: deliveredOrder.id,
      orderCode: deliveredOrder.code,
      shipmentCode: 'SHP-240410-001',
      carrier: 'DHL Express',
      trackingNumber: 'DHL-991823740VN',
      status: SHIPMENT_STATUSES.DELIVERED,
      estimatedDeliveryDate: '2026-04-11T00:00:00Z',
      deliveredAt: '2026-04-11T09:00:00Z',
      shippingFee: 0,
      note: 'Signature release completed at reception.',
      events,
      createdAt: '2026-04-10T16:15:00Z',
      updatedAt: '2026-04-11T09:00:00Z',
    },
  ];
};

const seedCartItems = (userId: string): StoredCartItem[] => {
  if (userId !== 'customer-001') {
    return [];
  }

  return [
    {
      id: crypto.randomUUID(),
      variantId: 'silk-trench-Ivory-s',
      quantity: 1,
    },
    {
      id: crypto.randomUUID(),
      variantId: 'leather-tote-Espresso-s',
      quantity: 1,
    },
  ];
};

const ensureUserState = (userId: string, storage: CommerceStorage): UserCommerceState => {
  const existing = storage.users[userId];
  if (existing) {
    return existing;
  }

  const orders = seedOrders(userId);
  const next: UserCommerceState = {
    cartId: `cart-${userId}`,
    cartItems: seedCartItems(userId),
    addresses: seedAddresses(userId),
    orders,
    payments: seedPayments(userId, orders),
    shipments: seedShipments(userId, orders),
  };

  storage.users[userId] = next;
  writeStorage(storage);

  return next;
};

const getReservedQuantity = (storage: CommerceStorage, variantId: string) =>
  Object.values(storage.users).flatMap((userState) => userState.orders).reduce((count, order) => {
    if (order.status === ORDER_STATUSES.CANCELLED) {
      return count;
    }

    return (
      count +
      order.items.reduce((itemCount, item) => itemCount + (item.variantId === variantId ? item.quantity : 0), 0)
    );
  }, 0);

const hydrateCartItem = (item: StoredCartItem, storage: CommerceStorage): CartItem => {
  const lookup = mockCatalog.findVariantById(item.variantId);
  if (!lookup) {
    throw createServiceError('PRODUCT_VARIANT_NOT_FOUND', 'A cart item could not be matched to the current catalog.');
  }

  const reservedQuantity = getReservedQuantity(storage, item.variantId);
  const stockAvailable = Math.max(lookup.variant.stock - reservedQuantity, 0);

  return {
    id: item.id,
    productId: lookup.product.id,
    productSlug: lookup.product.slug,
    productName: lookup.product.name,
    brandName: lookup.product.brandName,
    variantId: lookup.variant.id,
    sku: lookup.variant.sku,
    color: lookup.variant.color,
    size: lookup.variant.size,
    quantity: item.quantity,
    unitPrice: lookup.variant.price,
    compareAtPrice: lookup.variant.compareAtPrice,
    subtotal: lookup.variant.price * item.quantity,
    stockAvailable,
    primaryImage: lookup.product.primaryImage,
    isStale: item.quantity > stockAvailable,
  };
};

const buildCart = (userId: string, storage: CommerceStorage): CommerceCart => {
  const userState = ensureUserState(userId, storage);
  const items = userState.cartItems.map((item) => hydrateCartItem(item, storage));
  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  const subTotal = items.reduce((count, item) => count + item.subtotal, 0);
  const staleItemCount = items.filter((item) => item.isStale).length;

  return {
    id: userState.cartId,
    items,
    totalItems,
    subTotal,
    shippingFee: 0,
    discountTotal: 0,
    grandTotal: subTotal,
    updatedAt: new Date().toISOString(),
    staleItemCount,
  };
};

const buildVoucherPreview = (code: string, orderAmount: number, cart: CommerceCart): VoucherPreview => {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode === 'FIRSTLOOK') {
    if (orderAmount < 200) {
      return {
        code: normalizedCode,
        isApplicable: false,
        message: 'Minimum order value for FIRSTLOOK is $200.',
        description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
        discountAmount: 0,
      };
    }

    return {
      code: normalizedCode,
      isApplicable: true,
      message: 'Eligible for a $40 preview discount.',
      description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
      discountAmount: 40,
    };
  }

  if (normalizedCode === 'EDITOR25') {
    if (orderAmount < 300) {
      return {
        code: normalizedCode,
        isApplicable: false,
        message: 'Minimum order value for EDITOR25 is $300.',
        description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
        discountAmount: 0,
      };
    }

    return {
      code: normalizedCode,
      isApplicable: true,
      message: 'Eligible for a $25 preview discount.',
      description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
      discountAmount: 25,
    };
  }

  if (normalizedCode === 'ACCESSORY10') {
    const accessoryPresent = cart.items.some((item) => {
      const product = mockCatalog.getAllProductDetails().find((candidate) => candidate.id === item.productId);
      return product?.categorySlugs.includes('accessories');
    });

    return accessoryPresent
      ? {
          code: normalizedCode,
          isApplicable: true,
          message: 'Eligible for a $10 accessory preview discount.',
          description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
          discountAmount: 10,
        }
      : {
          code: normalizedCode,
          isApplicable: false,
          message: 'ACCESSORY10 requires at least one accessory in the cart.',
          description: 'Preview only. Current API contract stores voucher codes but does not apply totals yet.',
          discountAmount: 0,
        };
  }

  throw createServiceError('VOUCHER_NOT_FOUND', 'This voucher code is not recognized in the mock preview service.');
};

const syncOrderWithPaidPayment = (order: CommerceOrder) => {
  order.status = ORDER_STATUSES.CONFIRMED;
  order.updatedAt = new Date().toISOString();
  order.canCancel = false;
};

const settlePaymentIfNeeded = (payment: StoredPayment, order: CommerceOrder) => {
  if (!(payment.status === PAYMENT_STATUSES.INITIATED || payment.status === PAYMENT_STATUSES.PENDING)) {
    return;
  }

  payment.pollCount += 1;
  if (payment.pollCount < payment.settleAfterPolls) {
    payment.status = PAYMENT_STATUSES.PENDING;
    return;
  }

  const settledAt = new Date().toISOString();
  payment.status = payment.nextTerminalStatus;
  payment.paidAt = payment.nextTerminalStatus === PAYMENT_STATUSES.PAID ? settledAt : null;
  payment.transactions.unshift(
    createTransaction({
      amount: payment.amount,
      createdAt: settledAt,
      method: payment.method,
      note:
        payment.nextTerminalStatus === PAYMENT_STATUSES.PAID
          ? 'Payment confirmed after gateway polling.'
          : 'Gateway reported a payment failure.',
      provider: 'FashionPay',
      providerTxnId: `FP-${Date.now()}`,
      referenceId: payment.orderId,
      referenceType: 'ORDER',
      status: payment.nextTerminalStatus,
    }),
  );

  if (payment.nextTerminalStatus === PAYMENT_STATUSES.PAID) {
    syncOrderWithPaidPayment(order);
  }
};

export const mockCommerce = {
  async getCart() {
    const storage = readStorage();
    const userId = getCurrentUserId();
    return buildCart(userId, storage);
  },
  async updateCartItemQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      throw createServiceError('CART_ITEM_QUANTITY_INVALID', 'Quantity must be at least 1.');
    }

    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const target = userState.cartItems.find((item) => item.id === itemId);

    if (!target) {
      throw createServiceError('CART_ITEM_NOT_FOUND', 'This cart item could not be found.');
    }

    target.quantity = quantity;
    writeStorage(storage);
    return buildCart(userId, storage);
  },
  async removeCartItem(itemId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);

    userState.cartItems = userState.cartItems.filter((item) => item.id !== itemId);
    writeStorage(storage);
    return buildCart(userId, storage);
  },
  async clearCart() {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);

    userState.cartItems = [];
    writeStorage(storage);
    return buildCart(userId, storage);
  },
  async addCartItem(variantId: string, quantity: number) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);

    const existing = userState.cartItems.find((item) => item.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      userState.cartItems.push({
        id: crypto.randomUUID(),
        variantId,
        quantity,
      });
    }

    writeStorage(storage);
    return buildCart(userId, storage);
  },
  async getAddresses() {
    const storage = readStorage();
    const userId = getCurrentUserId();
    return sortAddresses(ensureUserState(userId, storage).addresses);
  },
  async getAddressById(addressId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const address = ensureUserState(userId, storage).addresses.find((item) => item.id === addressId);

    if (!address) {
      throw createServiceError('ADDRESS_NOT_FOUND', 'This address could not be found.');
    }

    return normalizeAddress(address);
  },
  async createAddress(payload: CreateAddressRequest) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const shouldBecomeDefault = payload.isDefault ?? userState.addresses.length === 0;
    const nextAddress: CustomerAddress = normalizeAddress({
      id: `addr-${crypto.randomUUID()}`,
      receiverName: payload.receiverName,
      phoneNumber: payload.phoneNumber,
      streetAddress: payload.streetAddress,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      postalCode: payload.postalCode,
      addressType: payload.addressType,
      isDefault: shouldBecomeDefault,
      label: payload.label,
      createdAt: new Date().toISOString(),
    });

    userState.addresses = userState.addresses.map((address) => ({
      ...address,
      isDefault: shouldBecomeDefault ? false : address.isDefault,
    }));
    userState.addresses.unshift(nextAddress);
    writeStorage(storage);

    return nextAddress;
  },
  async updateAddress(addressId: string, payload: UpdateAddressRequest) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const addressIndex = userState.addresses.findIndex((item) => item.id === addressId);

    if (addressIndex === -1) {
      throw createServiceError('ADDRESS_NOT_FOUND', 'This address could not be found.');
    }

    const currentAddress = userState.addresses[addressIndex];
    const nextAddress = normalizeAddress({
      ...currentAddress,
      ...payload,
      isDefault: payload.isDefault ?? currentAddress.isDefault,
    });

    userState.addresses = userState.addresses.map((address) => ({
      ...address,
      isDefault: nextAddress.isDefault ? address.id === nextAddress.id : address.isDefault,
    }));
    userState.addresses[addressIndex] = nextAddress;

    const hasDefaultAddress = userState.addresses.some((address) => address.isDefault);
    if (!hasDefaultAddress) {
      userState.addresses[0] = {
        ...userState.addresses[0],
        isDefault: true,
      };
    }

    writeStorage(storage);

    return nextAddress;
  },
  async deleteAddress(addressId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const target = userState.addresses.find((address) => address.id === addressId);

    if (!target) {
      throw createServiceError('ADDRESS_NOT_FOUND', 'This address could not be found.');
    }

    userState.addresses = userState.addresses.filter((address) => address.id !== addressId);

    if (target.isDefault && userState.addresses[0]) {
      userState.addresses[0] = {
        ...userState.addresses[0],
        isDefault: true,
      };
    }

    writeStorage(storage);
  },
  async validateVoucher(code: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const cart = buildCart(userId, storage);

    return buildVoucherPreview(code, cart.subTotal, cart);
  },
  async placeOrder(input: PlaceOrderInput) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const cart = buildCart(userId, storage);

    if (cart.items.length === 0) {
      throw createServiceError('ORDER_EMPTY', 'Add at least one product before placing an order.');
    }

    if (cart.staleItemCount > 0) {
      throw createServiceError('INVENTORY_NOT_ENOUGH', 'One or more items need quantity adjustments before checkout can continue.');
    }

    const shippingAddress = userState.addresses.find((address) => address.id === input.shippingAddressId);
    if (!shippingAddress) {
      throw createServiceError('VALIDATION_ERROR', 'Select a valid shipping address.');
    }

    const now = new Date().toISOString();
    const voucherCode = input.voucherCode?.trim() ? input.voucherCode.trim().toUpperCase() : undefined;
    const order: CommerceOrder = {
      id: `order-${crypto.randomUUID()}`,
      code: `FS-${Date.now().toString().slice(-8)}`,
      status: input.paymentMethod === PAYMENT_METHODS.ONLINE ? ORDER_STATUSES.AWAITING_PAYMENT : ORDER_STATUSES.PENDING,
      createdAt: now,
      updatedAt: now,
      paymentMethod: input.paymentMethod,
      customerNote: input.customerNote,
      voucherCode,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSlug: item.productSlug,
        productName: item.productName,
        brandName: item.brandName,
        variantId: item.variantId,
        sku: item.sku,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        primaryImage: item.primaryImage,
      })),
      shippingAddress,
      subTotal: cart.subTotal,
      shippingFee: 0,
      discountTotal: 0,
      grandTotal: cart.grandTotal,
      totalItems: cart.totalItems,
      canCancel: true,
    };

    userState.orders.unshift(order);
    userState.cartItems = [];
    writeStorage(storage);

    return order;
  },
  async getOrders() {
    const storage = readStorage();
    const userId = getCurrentUserId();
    return ensureUserState(userId, storage).orders.map((order) => ({
      ...order,
      canCancel: order.status === ORDER_STATUSES.PENDING || order.status === ORDER_STATUSES.AWAITING_PAYMENT,
    }));
  },
  async getOrderById(orderId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const orders = ensureUserState(userId, storage).orders.map((order) => ({
      ...order,
      canCancel: order.status === ORDER_STATUSES.PENDING || order.status === ORDER_STATUSES.AWAITING_PAYMENT,
    }));
    return orders.find((order) => order.id === orderId) ?? null;
  },
  async getPaymentByOrderId(orderId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const order = userState.orders.find((item) => item.id === orderId);

    if (!order) {
      throw createServiceError('ORDER_NOT_FOUND', 'This order could not be located.');
    }

    const payment = userState.payments.find((item) => item.orderId === orderId);
    if (!payment) {
      throw createServiceError('PAYMENT_NOT_FOUND', 'Payment not found.');
    }

    settlePaymentIfNeeded(payment, order);
    writeStorage(storage);
    return payment;
  },
  async initiatePayment(orderId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const order = userState.orders.find((item) => item.id === orderId);

    if (!order) {
      throw createServiceError('ORDER_NOT_FOUND', 'This order could not be located.');
    }

    if (order.paymentMethod !== PAYMENT_METHODS.ONLINE) {
      throw createServiceError('BAD_REQUEST', 'Only online payment orders can be initiated.');
    }

    const existingPayment = userState.payments.find((item) => item.orderId === orderId);

    if (existingPayment) {
      if (
        existingPayment.status === PAYMENT_STATUSES.PAID ||
        existingPayment.status === PAYMENT_STATUSES.REFUNDED ||
        existingPayment.status === PAYMENT_STATUSES.PARTIALLY_REFUNDED
      ) {
        throw createServiceError('PAYMENT_ALREADY_PROCESSED', 'Payment has already been processed.');
      }

      if (existingPayment.status === PAYMENT_STATUSES.FAILED) {
        existingPayment.status = PAYMENT_STATUSES.INITIATED;
        existingPayment.pollCount = 0;
        existingPayment.settleAfterPolls = 3;
        existingPayment.nextTerminalStatus = PAYMENT_STATUSES.PAID;
        existingPayment.retryCount += 1;
        existingPayment.transactions.unshift(
          createTransaction({
            amount: existingPayment.amount,
            createdAt: new Date().toISOString(),
            method: existingPayment.method,
            note: 'Customer retried payment from the result page.',
            provider: 'FashionPay',
            providerTxnId: null,
            referenceId: existingPayment.orderId,
            referenceType: 'ORDER',
            status: PAYMENT_STATUSES.INITIATED,
          }),
        );
      }

      writeStorage(storage);
      return existingPayment;
    }

    const now = new Date().toISOString();
    const payment: StoredPayment = {
      id: `payment-${crypto.randomUUID()}`,
      orderId: order.id,
      orderCode: order.code,
      paymentCode: `PAY-${Date.now().toString().slice(-8)}`,
      method: order.paymentMethod,
      status: PAYMENT_STATUSES.INITIATED,
      amount: order.grandTotal,
      paidAt: null,
      createdAt: now,
      transactions: [
        createTransaction({
          amount: order.grandTotal,
          createdAt: now,
          method: order.paymentMethod,
          note: 'Payment initiated from customer storefront.',
          provider: 'FashionPay',
          providerTxnId: null,
          referenceId: order.id,
          referenceType: 'ORDER',
          status: PAYMENT_STATUSES.INITIATED,
        }),
      ],
      pollCount: 0,
      settleAfterPolls: 3,
      nextTerminalStatus: PAYMENT_STATUSES.PAID,
      retryCount: 0,
    };

    userState.payments.unshift(payment);
    writeStorage(storage);
    return payment;
  },
  async getShipmentByOrderId(orderId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const order = userState.orders.find((item) => item.id === orderId);

    if (!order) {
      throw createServiceError('ORDER_NOT_FOUND', 'This order could not be located.');
    }

    const shipment = userState.shipments.find((item) => item.orderId === orderId);
    if (!shipment) {
      throw createServiceError('SHIPMENT_NOT_FOUND', 'Shipment not found.');
    }

    return shipment;
  },
  async cancelOrder(orderId: string) {
    const storage = readStorage();
    const userId = getCurrentUserId();
    const userState = ensureUserState(userId, storage);
    const order = userState.orders.find((item) => item.id === orderId);

    if (!order) {
      throw createServiceError('ORDER_NOT_FOUND', 'This order could not be located.');
    }

    if (!(order.status === ORDER_STATUSES.PENDING || order.status === ORDER_STATUSES.AWAITING_PAYMENT)) {
      throw createServiceError('ORDER_CANNOT_CANCEL', 'Only pending or awaiting-payment orders can be cancelled.');
    }

    order.status = ORDER_STATUSES.CANCELLED;
    order.updatedAt = new Date().toISOString();
    order.canCancel = false;

    writeStorage(storage);
    return order;
  },
};
