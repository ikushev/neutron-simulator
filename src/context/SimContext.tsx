import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { PhysicsState, QuizQuestion } from '../types';

interface SimContextType {
  state: PhysicsState;
  updateState: (newState: Partial<PhysicsState>) => void;
  updateConstants: (newConstants: any[]) => void;
  role: 'teacher' | 'student' | null;
  roomCode: string;
  setRoomData: (role: 'teacher' | 'student', code: string) => void;
  quiz: QuizQuestion | null;
  quizResults: number[];
  startQuiz: (q: QuizQuestion) => void;
  submitAnswer: (idx: number) => void;
  closeQuiz: () => void;
  alerts: Array<{ id: string; message: string; timestamp: string }>;
  raiseHand: (name: string) => void;
  leaveRoom: () => void;
  isDetached: boolean;
  setIsDetached: (detached: boolean) => void;
}

const SimContext = createContext<SimContextType | undefined>(undefined);

export const SimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PhysicsState>({ 
    L: 100, D: 0.8, sigmaA: 0.1, source: 1.0, fermiAge: 20,
    materials: [
      { id: '1', type: 'Гориво', name: 'U-235', density: 19.1, atomicMass: 235, sigmaA: 681, sigmaF: 582, sigmaS: 10, fraction: 3 },
      { id: '2', type: 'Забавител', name: 'H2O', density: 1.0, atomicMass: 18, sigmaA: 0.66, sigmaF: 0, sigmaS: 103, fraction: 97 }
    ],
    constants: [
      { id: 'g1', name: 'Бърза група', sigmaA: 0.015, nuSigmaF: 0.005, D: 1.2 },
      { id: 'g2', name: 'Топлинна група', sigmaA: 0.15, nuSigmaF: 0.2, D: 0.8 }
    ],
    scram: false,
    powerLevel: 100,
    fuelTemp: 500,
    coolantTemp: 280,
    dopplerAlpha: -0.00003, // Δρ/°C
    moderatorAlpha: -0.0002, // Δρ/°C
    rhoControl: 0.0005,
    linearPower: 200,
    bulkCoolantTemp: 280
  });
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [quizResults, setQuizResults] = useState<number[]>([0, 0, 0, 0]);
  const [isDetached, setIsDetachedState] = useState(false);
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; timestamp: string }>>([]);

  const isDetachedRef = React.useRef(false);
  const latestTeacherState = React.useRef<PhysicsState | null>(null);

  const setRoomData = (r: 'teacher' | 'student', code: string) => {
    setRole(r);
    setRoomCode(code);
    setIsDetachedState(false);
    isDetachedRef.current = false;
  };

  const setIsDetached = (detached: boolean) => {
    setIsDetachedState(detached);
    isDetachedRef.current = detached;
    if (!detached && latestTeacherState.current) {
      setState(latestTeacherState.current);
    }
  };

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setRole(null);
    setRoomCode('');
    setSocket(null);
    setQuiz(null);
    setQuizResults([0, 0, 0, 0]);
    setAlerts([]);
    setIsDetachedState(false);
    isDetachedRef.current = false;
  }, [socket]);

  useEffect(() => {
    if (!roomCode || !role) return;

    // Use environment variable for socket URL in production
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const s = io(socketUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    setSocket(s);

    s.emit('join-room', roomCode);

    s.on('room-not-found', () => {
      alert('Невалиден код на стая. Моля, проверете кода и опитайте отново.');
      leaveRoom();
    });

    s.on('connect', () => {
      if (role === 'student' && roomCode) {
        s.emit('request-current-state', roomCode);
      }
    });

    s.on('sync-physics', (receivedState: PhysicsState) => {
      latestTeacherState.current = receivedState;
      if (role === 'student' && !isDetachedRef.current) {
        setState(receivedState);
      }
    });

    s.on('student-alert', (data: { message: string; timestamp: string }) => {
      const id = Math.random().toString(36).substr(2, 9);
      setAlerts(prev => [...prev, { id, ...data }].slice(-5));
      const timeoutId = setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 5000);
      return () => clearTimeout(timeoutId);
    });

    s.on('incoming-quiz', (q: QuizQuestion) => {
      setQuiz(q);
    });

    s.on('quiz-closed', () => {
      setQuiz(null);
    });

    s.on('new-answer', ({ answerIndex }: { answerIndex: number }) => {
      setQuizResults(prev => {
        const next = [...prev];
        next[answerIndex] = (next[answerIndex] || 0) + 1;
        return next;
      });
    });

    return () => {
      s.disconnect();
    };
  }, [roomCode, role]);

  const updateState = useCallback((newState: Partial<PhysicsState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      if (role === 'teacher' && socket) {
        socket.emit('teacher-move', { roomCode, updated });
      }
      return updated;
    });
  }, [role, socket, roomCode]);

  const updateConstants = useCallback((newConstants: any[]) => {
    updateState({ constants: newConstants });
  }, [updateState]);

  const startQuiz = (questionData: QuizQuestion) => {
    setQuizResults(questionData.options.map(() => 0));
    socket?.emit('start-quiz', { roomCode, questionData });
    setQuiz(questionData);
  };

  const submitAnswer = (answerIndex: number) => {
    socket?.emit('submit-answer', { roomCode, answerIndex });
    setQuiz(null);
  };

  const closeQuiz = () => {
    socket?.emit('close-quiz', roomCode);
    setQuiz(null);
  };

  const raiseHand = (name: string) => {
    socket?.emit('raise-hand', { roomCode, studentName: name });
  };

  const contextValue = useMemo(() => ({ 
    state, updateState, updateConstants, role, roomCode, setRoomData, 
    quiz, quizResults, startQuiz, submitAnswer, closeQuiz,
    alerts, raiseHand, leaveRoom, isDetached, setIsDetached
  }), [
    state, updateState, updateConstants, role, roomCode, setRoomData, 
    quiz, quizResults, startQuiz, submitAnswer, closeQuiz,
    alerts, raiseHand, leaveRoom, isDetached, setIsDetached
  ]);

  return (
    <SimContext.Provider value={contextValue}>
      {children}
    </SimContext.Provider>
  );
};

export const useSim = () => {
  const context = useContext(SimContext);
  if (!context) throw new Error('useSim must be used within SimProvider');
  return context;
};
