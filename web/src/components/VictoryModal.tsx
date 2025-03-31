import React from 'react';
import { Color } from '../utils/chessLogic';
import { motion, AnimatePresence } from 'framer-motion';

interface VictoryModalProps {
  winner: Color | null;
  onPlayAgain: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onPlayAgain }) => {
  if (!winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-gray-900 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-700"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-center mb-6"
          >
            <h2 className="text-4xl font-bold text-white mb-2">
              🏆 Game Over! 🏆
            </h2>
            <div className="text-xl text-gray-300">
              {winner === 'w' ? 'White' : 'Black'} wins by capturing the king!
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              New Game
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VictoryModal;
