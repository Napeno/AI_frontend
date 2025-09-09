import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCoins } from 'react-icons/fa';

const CoinDisplay = () => {
  const { user } = useAuth();

  return (
    <div className="mb-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 shadow-md">
      <div className="flex items-center justify-center">
        <FaCoins className="text-yellow-500 mr-3 text-2xl" />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Your Coins</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {user?.coins || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinDisplay; 