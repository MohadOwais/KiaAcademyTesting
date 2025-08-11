import React, { useEffect, useRef, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

interface CounterProps {
  targetDate: string;
}

const Counter: React.FC<CounterProps> = ({ targetDate }) => {
  // Refs for animations
  const daysRef = useRef<HTMLDivElement | null>(null);
  const hoursRef = useRef<HTMLDivElement | null>(null);
  const minutesRef = useRef<HTMLDivElement | null>(null);
  const secondsRef = useRef<HTMLDivElement | null>(null);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 🎯 Set your countdown target date
  const futureDate = new Date(targetDate);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = futureDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft((prev) => {
        if (prev.days !== days) daysRef.current?.classList.toggle("rotate");
        if (prev.hours !== hours) hoursRef.current?.classList.toggle("rotate");
        if (prev.minutes !== minutes)
          minutesRef.current?.classList.toggle("rotate");
        if (prev.seconds !== seconds)
          secondsRef.current?.classList.toggle("rotate");

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [futureDate]);

  const renderCard = (
    label: string,
    number: number,
    ref: React.RefObject<HTMLDivElement>
  ) => (
    <div className="col-6 col-md-3 mb-4 text-center">
      <div
        className="card shadow-sm border-0 text-white"
        ref={ref}
        style={{ transition: "transform 0.5s", backgroundColor: "var(--color-dark-2)" }}
      >
        <div className="card-body">
          <h2 className="card-title display-5">
            {number.toString().padStart(2, "0")}
          </h2>
          <p className="card-text text-uppercase">{label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        {renderCard("Days", timeLeft.days, daysRef)}
        {renderCard("Hours", timeLeft.hours, hoursRef)}
        {renderCard("Minutes", timeLeft.minutes, minutesRef)}
        {renderCard("Seconds", timeLeft.seconds, secondsRef)}
      </div>
    </div>
  );
};

export default Counter;
