
import React, { useState, useCallback } from 'react';
import Game from './components/game/Game';
import { MainMenu } from './components/ui/MainMenu';
import { PostRaceMenu } from './components/ui/PostRaceMenu';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [raceResults, setRaceResults] = useState<{ playerPosition: number | null }>({ playerPosition: null });

  const startGame = useCallback(() => {
    setGameState(GameState.GAME);
  }, []);

  const backToMenu = useCallback(() => {
    setGameState(GameState.MENU);
  }, []);

  const onRaceFinish = useCallback((position: number) => {
    setRaceResults({ playerPosition: position });
    setGameState(GameState.POST_RACE);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.GAME:
        return <Game onRaceFinish={onRaceFinish} />;
      case GameState.POST_RACE:
        return <PostRaceMenu playerPosition={raceResults.playerPosition} onRestart={startGame} onMenu={backToMenu} />;
      case GameState.MENU:
      default:
        return <MainMenu onStart={startGame} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      {renderContent()}
    </div>
  );
};

export default App;
