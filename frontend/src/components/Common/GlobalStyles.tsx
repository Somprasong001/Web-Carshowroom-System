import React from 'react';

const GlobalStyles: React.FC = () => (
  <style>
    {`
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 0.8; transform: translateY(0); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      body { 
        overflow-x: hidden;
        margin: 0;
        min-height: 100vh; /* ทำให้ body สูงอย่างน้อยเท่าหน้าจอ */
        overflow-y: auto; /* เพิ่ม scrollbar แนวตั้ง */
      }
      html {
        scroll-behavior: smooth;
        scrollbar-width: thin; /* สำหรับ Firefox */
        -ms-overflow-style: auto; /* สำหรับ IE/Edge */
      }
      html::-webkit-scrollbar {
        width: 6px; /* ความกว้าง scrollbar แนวตั้ง */
        height: 6px; /* ความสูง scrollbar แนวนอน (ถ้ามี) */
      }
      html::-webkit-scrollbar-track {
        background: rgba(26, 26, 26, 0.8); /* สีพื้นหลัง track */
      }
      html::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
        border-radius: 3px;
        opacity: 0.7; /* ความโปร่งใส */
      }
      html::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #ff6b6b, #ff3366, #686de0, #4834d4);
        opacity: 1;
      }
      /* ปรับ scrollbar ในมือถือ */
      @media (max-width: 768px) {
        html::-webkit-scrollbar {
          width: 4px; /* บางลงในมือถือ */
        }
        html::-webkit-scrollbar-thumb {
          border-radius: 2px;
        }
      }
      .logout-button {
        border: 2px solid rgba(255, 51, 102, 0.7);
        border-radius: 8px;
        padding: 0.5rem 1rem !important;
        transition: all 0.3s ease;
        color: #ff3366 !important;
      }
      .logout-button:hover {
        background: rgba(255, 51, 102, 0.3);
        color: #ffffff !important;
      }
      @media (max-width: 768px) {
        .logout-button {
          display: block !important;
          width: 100%;
          padding: 1rem 0 !important;
          font-size: 1.2rem !important;
        }
      }
      @media (min-width: 769px) {
        .logout-button {
          display: block !important;
          font-size: 1.1rem !important;
        }
      }
    `}
  </style>
);

export default GlobalStyles;