import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { post, put } from '../../utils/apiClient';
import t from '../../locales/i18n';

const AvatarShop = ({ isOpen, onClose }) => {
  const { user, updateUserAvatar } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'default');
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  const AVATARS = [
    {
      id: 'default',
      name: 'Mặc định',
      price: 0,
      emoji: '👤',
      description: 'Avatar cơ bản miễn phí',
      category: 'basic',
    },
    {
      id: 'student',
      name: 'Học sinh',
      price: 50,
      emoji: '🧑‍🎓',
      description: 'Dành cho học sinh chăm chỉ',
      category: 'education',
    },
    {
      id: 'friend',
      name: 'Bạn học',
      price: 100,
      emoji: '👩‍🏫',
      description: 'Phong cách bạn học thân thiện',
      category: 'education',
    },
    {
      id: 'scientist',
      name: 'Nhà khoa học',
      price: 150,
      emoji: '🧑‍🔬',
      description: 'Cho những tâm hồn nghiên cứu',
      category: 'science',
    },
    {
      id: 'artist',
      name: 'Nghệ sĩ',
      price: 120,
      emoji: '🧑‍🎨',
      description: 'Sáng tạo và đầy cảm hứng',
      category: 'creative',
    },
    {
      id: 'engineer',
      name: 'Kỹ sư',
      price: 180,
      emoji: '👷',
      description: 'Xây dựng tương lai',
      category: 'tech',
    },
    {
      id: 'astronaut',
      name: 'Phi hành gia',
      price: 250,
      emoji: '🧑‍🚀',
      description: 'Khám phá vũ trụ tri thức',
      category: 'premium',
    },
    {
      id: 'detective',
      name: 'Thám tử',
      price: 200,
      emoji: '🕵️',
      description: 'Giải mã bí ẩn tri thức',
      category: 'premium',
    },
    {
      id: 'ninja',
      name: 'Ninja',
      price: 300,
      emoji: '🥷',
      description: 'Học tập âm thầm và hiệu quả',
      category: 'premium',
    },
    {
      id: 'wizard',
      name: 'Pháp sư',
      price: 350,
      emoji: '🧙‍♂️',
      description: 'Ma thuật của tri thức',
      category: 'legendary',
    },
    {
      id: 'crown',
      name: 'Hoàng gia',
      price: 500,
      emoji: '👑',
      description: 'Đẳng cấp hoàng gia tri thức',
      category: 'legendary',
    },
    {
      id: 'unicorn',
      name: 'Kỳ lân',
      price: 400,
      emoji: '🦄',
      description: 'Hiếm có và độc đáo',
      category: 'legendary',
    },
  ];

  const CATEGORIES = {
    basic: { name: 'Cơ bản', color: 'gray' },
    education: { name: 'Giáo dục', color: 'gray' },
    science: { name: 'Khoa học', color: 'green' },
    creative: { name: 'Sáng tạo', color: 'green' },
    tech: { name: 'Công nghệ', color: 'indigo' },
    premium: { name: 'Cao cấp', color: 'yellow' },
    legendary: { name: 'Huyền thoại', color: 'indigo' },
  };

  const userCoins = user?.coins || 0;
  const ownedAvatars = user?.ownedAvatars || ['default'];

  const handlePurchaseAvatar = async (avatarId) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    if (!avatar || ownedAvatars.includes(avatarId)) return;

    if (userCoins < avatar.price) {
      alert('Không đủ xu để mua avatar này!');
      return;
    }

    setPurchaseLoading(avatarId);
    
    try {
      const response = await post('/shop/purchase-avatar', { avatarId });

      if (response.ok) {
        const data = await response.json();
        // Update user data
        updateUserAvatar(data.user);
        alert(`Đã mua thành công avatar "${avatar.name}"!`);
      } else {
        alert('Có lỗi xảy ra khi mua avatar!');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Có lỗi xảy ra khi mua avatar!');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleSelectAvatar = async (avatarId) => {
    if (!ownedAvatars.includes(avatarId)) return;

    try {
      const response = await put('/user/change-avatar', { avatarId });

      if (response.ok) {
        setSelectedAvatar(avatarId);
        updateUserAvatar({ ...user, avatar: avatarId });
      }
    } catch (error) {
      console.error('Change avatar error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-2xl w-full sm:max-w-4xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">🛒</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                Cửa hàng Avatar
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Sở hữu: {userCoins} xu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 overflow-y-auto max-h-[calc(100vh-64px)] sm:max-h-[calc(90vh-88px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {AVATARS.map((avatar) => {
              const isOwned = ownedAvatars.includes(avatar.id);
              const isSelected = selectedAvatar === avatar.id;
              const canAfford = userCoins >= avatar.price;
              const isLoading = purchaseLoading === avatar.id;
              const category = CATEGORIES[avatar.category];

              return (
                <div
                  key={avatar.id}
                  className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : isOwned
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Category Badge */}
                  <div className={`absolute -top-2 sm:-top-3 -right-2 sm:-right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-${category.color}-100 text-${category.color}-800 dark:bg-${category.color}-900/50 dark:text-${category.color}-200`}>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">●</span>
                  </div>

                  {/* Avatar */}
                  <div className="text-center flex flex-col h-full">
                    <div> {/* Content wrapper */}
                    <div className="text-5xl sm:text-6xl mb-2">{avatar.emoji}</div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm sm:text-base">
                      {avatar.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 hidden sm:block">
                      {avatar.description}
                    </p>

                    {/* Price/Status */}
                    {avatar.price === 0 ? (
                        <div className="text-green-600 dark:text-green-400 font-semibold text-sm mb-3">
                        Miễn phí
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-600 dark:text-yellow-400">🪙</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {avatar.price}
                        </span>
                      </div>
                    )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                    {isOwned ? (
                      <button
                        onClick={() => handleSelectAvatar(avatar.id)}
                        disabled={isSelected}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                          isSelected
                            ? 'bg-indigo-500 text-white cursor-default'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {isSelected ? 'Đang sử dụng' : 'Chọn'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseAvatar(avatar.id)}
                        disabled={!canAfford || isLoading}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                          canAfford
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? 'Đang mua...' : canAfford ? 'Mua' : 'Không đủ xu'}
                      </button>
                    )}
                    </div>
                  </div>

                  {/* Owned Badge */}
                  {isOwned && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full">
                        ✓ Sở hữu
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarShop;