import React from 'react';

interface DiceViewProps {
  dice: [number, number];
  movesLeft: number[];
  isRolling: boolean;
  onRollClick?: () => void;
  canRoll: boolean;
}

export const DiceView: React.FC<DiceViewProps> = ({
  dice,
  movesLeft,
  isRolling,
  onRollClick,
  canRoll
}) => {
  // Dot placement matrix for standard dice face values 1..6
  const renderDots = (value: number) => {
    // 3x3 grid indices:
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const dotPositions: Record<number, number[]> = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const activeIndices = dotPositions[value] || [4];

    return Array.from({ length: 9 }).map((_, idx) => (
      <div
        key={idx}
        className={activeIndices.includes(idx) ? 'die-dot' : ''}
        style={{ width: '8px', height: '8px', borderRadius: '50%' }}
      />
    ));
  };

  // Determine if a specific die in [d1, d2] is still available in movesLeft
  const isDie1Available = movesLeft.includes(dice[0]);
  const isDie2Available = movesLeft.filter(m => m === dice[1]).length > (dice[0] === dice[1] && !isDie1Available ? 0 : 0) || movesLeft.includes(dice[1]);

  return (
    <div className="dice-arena">
      <div
        className={`die-cube ${isRolling ? 'is-rolling' : ''} ${
          isDie1Available ? 'available' : 'used'
        }`}
        onClick={canRoll ? onRollClick : undefined}
        title={`Zar: ${dice[0]}`}
      >
        {renderDots(dice[0] || 1)}
      </div>

      <div
        className={`die-cube ${isRolling ? 'is-rolling' : ''} ${
          isDie2Available ? 'available' : 'used'
        }`}
        onClick={canRoll ? onRollClick : undefined}
        title={`Zar: ${dice[1]}`}
      >
        {renderDots(dice[1] || 1)}
      </div>
    </div>
  );
};
