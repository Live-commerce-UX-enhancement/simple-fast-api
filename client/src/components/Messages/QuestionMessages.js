import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';

import QuestionMessage from './Message/QuestionMessage';

import './Messages.css';

function QuestionMessages({ messages, broadcastId, setMessage, setMessageNo }){
  return(
    <ScrollToBottom className="messages">
    {messages.map((message, i) => <div key={i}><QuestionMessage message={message} broadcastId={broadcastId} setMessage={setMessage} setMessageNo={setMessageNo} /></div>)}
    </ScrollToBottom>
  );
}

export default QuestionMessages;