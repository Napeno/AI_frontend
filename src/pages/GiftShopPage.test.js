import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GiftShopPage from './GiftShopPage';
import { get, post, put } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

jest.mock('../utils/apiClient', () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));

const response = body => ({ ok: true, json: async () => body });
const gifts = [
  { id: 'gift-1', title: 'Bộ sách khám phá', description: 'Một món quà bổ ích.', image: '/gifts/book.webp', price: 80833 },
  { id: 'gift-2', title: 'Bộ cờ vui học', description: 'Cùng chơi và rèn tư duy.', image: '/gifts/chess.jpg', price: 154167 },
];

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { chestnuts: 100000 }, updateUserChestnuts: jest.fn() });
  get.mockImplementation(url => Promise.resolve(url === '/shop/gifts' ? response({ gifts, favorites: [], chestnuts: 100000 }) : response({ history: [] })));
});

test('renders gifts, balance, and favorite panel', async () => {
  render(<MemoryRouter><GiftShopPage /></MemoryRouter>);

  expect(await screen.findByText('Bộ sách khám phá')).toBeInTheDocument();
  expect(screen.getAllByText('🌰 100.000')).toHaveLength(2);
  expect(screen.getByText('Quà tặng yêu thích')).toBeInTheDocument();
});

test('toggles a favorite and shows it in the favorite carousel', async () => {
  put.mockResolvedValue(response({ favorite: true, favorites: ['gift-1'] }));
  render(<MemoryRouter><GiftShopPage /></MemoryRouter>);
  await screen.findByText('Bộ sách khám phá');

  fireEvent.click(screen.getByRole('button', { name: 'Yêu thích Bộ sách khám phá' }));

  await waitFor(() => expect(put).toHaveBeenCalledWith('/shop/favorites/gift-1', {}));
  await waitFor(() => expect(screen.getAllByText('Bộ sách khám phá')).toHaveLength(2));
});

test('redeems a gift once and syncs the new chestnut balance', async () => {
  const updateUserChestnuts = jest.fn();
  useAuth.mockReturnValue({ user: { chestnuts: 100000 }, updateUserChestnuts });
  post.mockResolvedValue(response({ totalChestnuts: 19167, redemption: { _id: 'redemption-1', title: gifts[0].title, price: gifts[0].price, status: 'pending' } }));
  render(<MemoryRouter><GiftShopPage /></MemoryRouter>);
  await screen.findByText('Bộ sách khám phá');

  fireEvent.click(within(screen.getByRole('region', { name: 'Danh sách quà tặng' })).getAllByRole('button', { name: 'Nhận quà' })[0]);

  await waitFor(() => expect(post).toHaveBeenCalledWith('/shop/redeem', expect.objectContaining({ giftId: 'gift-1', requestId: expect.any(String) })));
  expect(updateUserChestnuts).toHaveBeenCalledWith(19167);
  expect(await screen.findByRole('alert')).toHaveTextContent('Đơn đang chờ xử lý');
});

test('does not send a redemption request when balance is insufficient', async () => {
  useAuth.mockReturnValue({ user: { chestnuts: 10 }, updateUserChestnuts: jest.fn() });
  get.mockImplementation(url => Promise.resolve(url === '/shop/gifts' ? response({ gifts, favorites: [], chestnuts: 10 }) : response({ history: [] })));
  render(<MemoryRouter><GiftShopPage /></MemoryRouter>);
  await screen.findByText('Bộ sách khám phá');

  fireEvent.click(within(screen.getByRole('region', { name: 'Danh sách quà tặng' })).getAllByRole('button', { name: 'Nhận quà' })[0]);

  expect(post).not.toHaveBeenCalled();
  expect(await screen.findByRole('alert')).toHaveTextContent('chưa đủ hạt dẻ');
});
