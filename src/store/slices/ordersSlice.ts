import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  clientId: string;
  representativeId: string;
  items: OrderItem[];
  status: 'pendente' | 'producao' | 'pronto' | 'enviado' | 'concluido';
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  currentOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.items.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      }
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order['status'] }>
    ) => {
      const order = state.items.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        if (state.currentOrder?.id === action.payload.orderId) {
          state.currentOrder.status = action.payload.status;
        }
      }
    },
  },
});

export const {
  setOrders,
  setLoading,
  setError,
  setCurrentOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
} = ordersSlice.actions;

export default ordersSlice.reducer; 