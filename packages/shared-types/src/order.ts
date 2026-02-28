export interface OrderItem {
  menuItemId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerUserId: string;
  truckId: string;
  status: string;
  totalCents: number;
  items: OrderItem[];
}
