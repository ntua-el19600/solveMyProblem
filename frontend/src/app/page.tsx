"use client";
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [dateTime, setDateTime] = useState('');
  const [healthStatus, setHealthStatus] = useState('All systems operational');

  useEffect(() => {
    const updateTime = () => setDateTime(new Date().toLocaleString());
    updateTime(); // Set initial date/time on mount
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <main style={{ position: 'relative', minHeight: 'calc(100vh - 50px)', padding: '1rem' }}>
        <div>This is the home page</div>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', textAlign: 'right' }}>
          <p>{`Current Date/Time: ${dateTime || 'Loading...'} | App Health Status: ${healthStatus}`}</p>
        </div>
      </main>
      <footer style={{ height: '50px', textAlign: 'center', padding: '1rem', background: '#f1f1f1' }}>
        <p>Copyright team-51 2024</p>
      </footer>
    </>
  );
}


