import { createStore, combineReducers, applyMiddleware } from 'redux';
import { reducer as FormReducer } from 'redux-form';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import UIReducer from './reducers/UIReducer';
import AuthReducer from './reducers/AuthReducer';

const rootReducer = combineReducers({
  auth: AuthReducer,
  ui: UIReducer,
  form: FormReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);

export default () => ({ store, persistor });
