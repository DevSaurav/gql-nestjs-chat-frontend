"use client";
import React, { useState } from 'react';
import { MessageCircle, Send, Phone, Video, Info, Search, Smile, Paperclip, ThumbsUp, MoreHorizontal } from 'lucide-react';
import LoginPage from './login/page';

const ChatApp = () => {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'chat'
  

 return (
    <div>
      {currentPage === 'login' && <LoginPage/>}
    </div>
  );
};

export default ChatApp;