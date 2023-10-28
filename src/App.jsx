import { useEffect, useState, useRef } from "react";

const App = () => {
  const initialWorkTime = 25 * 60;
  const initialBreakTime = 5 * 60;
  const initialLongBreak = 15 * 60;

  // For testing the pattern
  // const initialWorkTime = 10; // 10 seconds
  // const initialBreakTime = 5; // 5 seconds
  // const initialLongBreak = 8; // 8 seconds

  const [mode, setMode] = useState(localStorage.getItem('mode') || "work");
  const [workSeconds, setWorkSeconds] = useState(Number(localStorage.getItem('workSeconds')) || initialWorkTime);
  const [breakSeconds, setBreakSeconds] = useState(Number(localStorage.getItem('breakSeconds')) || initialBreakTime);
  const [longBreakSeconds, setLongBreakSeconds] = useState(Number(localStorage.getItem('longBreakSeconds')) || initialLongBreak);
  const [isRunning, setIsRunning] = useState(localStorage.getItem('isRunning') === 'true');
  const [pomodoroCount, setPomodoroCount] = useState(Number(localStorage.getItem('pomodoroCount')) || 0);


  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    localStorage.setItem('mode', mode);
    localStorage.setItem('workSeconds', workSeconds);
    localStorage.setItem('breakSeconds', breakSeconds);
    localStorage.setItem('longBreakSeconds', longBreakSeconds);
    localStorage.setItem('isRunning', isRunning);
    localStorage.setItem('pomodoroCount', pomodoroCount);
  }, [mode, workSeconds, breakSeconds, longBreakSeconds, isRunning, pomodoroCount]);


  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const calculateOffset = (time, initialTime) => {
    const progress = time / initialTime; // a value between 0 and 1
    return circumference * (1 - progress);
  };

  const [strokeDashOffset, setStrokeDashOffset] = useState(
    calculateOffset(workSeconds, initialWorkTime)
  );

  useEffect(() => {
    if (mode === "work") {
      setStrokeDashOffset(calculateOffset(workSeconds, initialWorkTime));
    } else if (mode === "break") {
      setStrokeDashOffset(calculateOffset(breakSeconds, initialBreakTime));
    } else if (mode === "longBreak") {
      setStrokeDashOffset(calculateOffset(longBreakSeconds, initialLongBreak));
    }
  }, [workSeconds, breakSeconds, longBreakSeconds, mode]);

  const startPauseBtnHandler = (e) => {
    e.preventDefault();

    setIsRunning(prev => !prev)
  };

  const resetBtnHandler = (e) => {
    e.preventDefault();
    setIsRunning(false);
    setMode('work');
    setPomodoroCount(0);
    setWorkSeconds(25 * 60);  // Reset to 25 minutes
    setBreakSeconds(5 * 60);  // Reset to 5 minutes
    setLongBreakSeconds(15 * 60);  // Reset to 15 minutes (or 30 as per your need)
  };


  useEffect(() => {
    let timerId;

    if (isRunning) {
      timerId = setInterval(() => {
        if (mode === 'work') {
          setWorkSeconds((prev) => prev - 1); // decrement by a minute every second
        } else if (mode === 'break') {
          setBreakSeconds((prev) => prev - 1);
        } else if (mode === 'longBreak') {
          setLongBreakSeconds((prev) => prev - 1);
        }
      }, 1000);
    }


    return () => {
      clearInterval(timerId);
    };
  }, [isRunning, mode]);

  const pomodoroCountRef = useRef(0);

  useEffect(() => {
    if (workSeconds === 0 && mode === 'work') {
      setWorkSeconds(initialWorkTime); // Reset workSeconds for next cycle

      if (pomodoroCountRef.current >= 3) {
        setMode('longBreak');
        setLongBreakSeconds(initialLongBreak); // Reset long break time
        pomodoroCountRef.current = 0;
        setPomodoroCount(0);
      } else {
        setMode('break');
        setBreakSeconds(initialBreakTime); // Reset break time for next cycle
        pomodoroCountRef.current += 1;
        setPomodoroCount(pomodoroCountRef.current);
      }
      setIsRunning(false);
    } else if (breakSeconds === 0 && mode === 'break') {
      setMode('work');
      setWorkSeconds(initialWorkTime); // Reset workSeconds for next cycle
      setIsRunning(false);
    } else if (longBreakSeconds === 0 && mode === 'longBreak') {
      setMode('work');
      setWorkSeconds(initialWorkTime); // Reset workSeconds for next cycle
      setIsRunning(false);
    }

  }, [workSeconds, breakSeconds, longBreakSeconds, mode]);



  return (
    <>
      <div className="bg-slate-900 h-screen w-full flex flex-col justify-center items-center">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Pomodoro Timer</h1>
          <h2 className="text-3xl font-medium text-white">Cycle: {pomodoroCount}/4</h2>
          <p className={`text-2xl font-semibold ${mode === 'work' ? 'text-green-500' : (mode === 'break' ? 'text-blue-500' : 'text-red-500')}`}>
            {mode === 'work' ? 'Start' : (mode === 'break' ? 'Break' : 'Long Break')}
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <div className="relative">
            <div className="relative w-36 h-36">
              <svg className="absolute top-0 left-0" width="100%" height="100%" viewBox="0 0 100 100">
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="offsetblur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={
                    mode === 'work' ? 'green' : (mode === 'break' ? 'blue' : 'red')
                  }
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashOffset}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                  filter="url(#shadow)"  // This line applies the filter
                >
                </circle>

              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-white text-4xl">
                  {formatTime(
                    mode === 'work' ? workSeconds :
                      (mode === 'break' ? breakSeconds : longBreakSeconds)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex mt-8">
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded mr-4 transition-transform transform scale-100 hover:scale-105 hover:shadow-lg" onClick={startPauseBtnHandler}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-transform transform scale-100 hover:scale-105 hover:shadow-lg" onClick={resetBtnHandler}>
            Reset
          </button>
        </div>

        <div className="mt-6">
          <a href="https://todoist.com/productivity-methods/pomodoro-technique" target="_blank" rel="noopener noreferrer" className="text-sm text-white underline hover:text-gray-400">
            Learn more about the Pomodoro Technique
          </a>
        </div>

      </div>
    </>
  );

};

export default App;
