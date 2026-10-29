import React from 'react';
import type {
  Player,
  BoardState,
  BarState,
  BorneOffState,
  Move,
  BoardTheme
} from '../engine/types';

interface BackgammonBoardProps {
  board: BoardState;
  bar: BarState;
  borneOff: BorneOffState;
  currentTurn: Player;
  selectedSource: number | 'bar' | null;
  legalMoves: Move[];
  onSelectPoint: (pointIndex: number) => void;
  onSelectBar: (player: Player) => void;
  onSelectBearOff: () => void;
  theme: BoardTheme;
}

export const BackgammonBoard: React.FC<BackgammonBoardProps> = ({
  board,
  bar,
  borneOff,
  currentTurn,
  selectedSource,
  legalMoves,
  onSelectPoint,
  onSelectBar,
  onSelectBearOff,
  theme
}) => {
  // Check if a point is a legal move destination
  const isPointLegalTarget = (pointIndex: number) => {
    return legalMoves.some(m => m.to === pointIndex);
  };

  // Check if bear-off is a legal move destination
  const isBearOffLegalTarget = legalMoves.some(m => m.to === 'off');

  // Point indices layout:
  // Top Left: 12 to 17 (Points 13 to 18)
  const topLeftIndices = [12, 13, 14, 15, 16, 17];
  // Top Right: 18 to 23 (Points 19 to 24)
  const topRightIndices = [18, 19, 20, 21, 22, 23];
  // Bottom Left: 11 down to 6 (Points 12 down to 7)
  const bottomLeftIndices = [11, 10, 9, 8, 7, 6];
  // Bottom Right: 5 down to 0 (Points 6 down to 1)
  const bottomRightIndices = [5, 4, 3, 2, 1, 0];

  // Render Checkers on a point
  const renderCheckers = (pointIndex: number, isTopRow: boolean) => {
    const point = board[pointIndex];
    if (!point.player || point.count === 0) return null;

    const maxVisual = 5;
    const countToRender = Math.min(point.count, maxVisual);
    const hasMore = point.count > maxVisual;

    const checkers = [];
    for (let i = 0; i < countToRender; i++) {
      const isTopChecker = isTopRow ? i === countToRender - 1 : i === countToRender - 1;
      const isSelected = selectedSource === pointIndex && isTopChecker;

      checkers.push(
        <div
          key={i}
          className={`checker-piece checker-${point.player} ${isSelected ? 'is-selected' : ''}`}
        >
          <div className="checker-inner-ring">
            {isTopChecker && (
              <span className="checker-count-badge">
                {hasMore ? point.count : ''}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`checker-stack ${isTopRow ? 'row-top' : 'row-bottom'}`}>
        {checkers}
      </div>
    );
  };

  // Render a single triangular point
  const renderPointColumn = (pointIndex: number, isTopRow: boolean) => {
    const isTarget = isPointLegalTarget(pointIndex);
    const isLightColor = pointIndex % 2 === 0;

    return (
      <div
        key={pointIndex}
        className={`point-column ${isTopRow ? 'row-top' : 'row-bottom'} ${
          isTarget ? 'is-legal-target' : ''
        }`}
        onClick={() => onSelectPoint(pointIndex)}
      >
        {/* Triangle graphic */}
        <div
          className={`point-triangle ${isTopRow ? 'triangle-top' : 'triangle-bottom'} ${
            isLightColor ? 'color-light' : 'color-dark'
          }`}
        />

        {/* Pip Number */}
        <span className="point-number">{pointIndex + 1}</span>

        {/* Legal Target Marker */}
        {isTarget && <div className="target-pip-marker" />}

        {/* Checkers */}
        {renderCheckers(pointIndex, isTopRow)}
      </div>
    );
  };

  return (
    <div className={`bg-board-frame theme-${theme}`}>
      <div className="bg-play-field">
        {/* LEFT QUADRANT (Points 13-18 on top, 12-7 on bottom) */}
        <div className="board-half">
          <div className="points-row row-top">
            {topLeftIndices.map(idx => renderPointColumn(idx, true))}
          </div>
          <div className="points-row row-bottom">
            {bottomLeftIndices.map(idx => renderPointColumn(idx, false))}
          </div>
        </div>

        {/* CENTER BAR (Kırık Taşlar) */}
        <div className="board-center-bar">
          {/* Top Bar Zone (Black Captured) */}
          <div
            className={`bar-zone ${selectedSource === 'bar' && currentTurn === 'black' ? 'is-selected' : ''}`}
            onClick={() => onSelectBar('black')}
          >
            <span className="bar-label">BAR</span>
            {bar.black > 0 && (
              <div
                className={`checker-piece checker-black ${
                  selectedSource === 'bar' && currentTurn === 'black' ? 'is-selected' : ''
                }`}
              >
                <div className="checker-inner-ring">
                  <span className="checker-count-badge">{bar.black}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Zone (White Captured) */}
          <div
            className={`bar-zone ${selectedSource === 'bar' && currentTurn === 'white' ? 'is-selected' : ''}`}
            onClick={() => onSelectBar('white')}
          >
            {bar.white > 0 && (
              <div
                className={`checker-piece checker-white ${
                  selectedSource === 'bar' && currentTurn === 'white' ? 'is-selected' : ''
                }`}
              >
                <div className="checker-inner-ring">
                  <span className="checker-count-badge">{bar.white}</span>
                </div>
              </div>
            )}
            <span className="bar-label">BAR</span>
          </div>
        </div>

        {/* RIGHT QUADRANT (Points 19-24 on top, 6-1 on bottom) */}
        <div className="board-half">
          <div className="points-row row-top">
            {topRightIndices.map(idx => renderPointColumn(idx, true))}
          </div>
          <div className="points-row row-bottom">
            {bottomRightIndices.map(idx => renderPointColumn(idx, false))}
          </div>
        </div>
      </div>

      {/* BEAR-OFF TRAY (Toplanan Taşlar) */}
      <div className="bear-off-tray">
        {/* Black Bear-off (Top) */}
        <div
          className={`tray-half ${isBearOffLegalTarget && currentTurn === 'black' ? 'is-legal-target' : ''}`}
          onClick={isBearOffLegalTarget && currentTurn === 'black' ? onSelectBearOff : undefined}
          title="Siyah Toplanan Taşlar"
        >
          <span className="tray-label">{borneOff.black}/15</span>
          {Array.from({ length: Math.min(borneOff.black, 10) }).map((_, i) => (
            <div key={i} className="tray-checker-chip black" />
          ))}
          {isBearOffLegalTarget && currentTurn === 'black' && <div className="target-pip-marker" />}
        </div>

        {/* White Bear-off (Bottom) */}
        <div
          className={`tray-half ${isBearOffLegalTarget && currentTurn === 'white' ? 'is-legal-target' : ''}`}
          onClick={isBearOffLegalTarget && currentTurn === 'white' ? onSelectBearOff : undefined}
          title="Beyaz Toplanan Taşlar"
        >
          {isBearOffLegalTarget && currentTurn === 'white' && <div className="target-pip-marker" />}
          {Array.from({ length: Math.min(borneOff.white, 10) }).map((_, i) => (
            <div key={i} className="tray-checker-chip white" />
          ))}
          <span className="tray-label">{borneOff.white}/15</span>
        </div>
      </div>
    </div>
  );
};
