type AddressLike = {
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
};

export const formatAddress = (address: AddressLike) =>
  [address.streetAddress, `${address.ward}, ${address.district}`, `${address.city} ${address.postalCode}`]
    .filter(Boolean)
    .join(', ');
