import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  description: string;
  width: number;
  weight: number;
  unit: 'metro' | 'rolo';
  price: number;
  imageUrl: string;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
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
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  setProducts,
  setLoading,
  setError,
  addProduct,
  updateProduct,
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer; 