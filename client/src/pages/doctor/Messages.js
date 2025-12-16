import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { List, message, Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import api from '../../utils/axiosInstance'; // ✅ centralized API

const Messages = () => {
  const { user } = useSelector(state => state.user);
  const [conversations, setConversations] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // Load conversations
  const loadConversations = async () => {
    try {
      const res = await api.get('/api/v1/message/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data.success) setConversations(res.data.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load conversations');
    }
  };

  // Open a conversation with a peer
  const openConversation = async (peer) => {
    setActivePeer(peer);
    try {
      const res = await api.get(`/api/v1/message/conversation/${peer._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data.success) setMessages(res.data.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load messages');
    }
  };

  // Send a message
  const sendReply = async () => {
    if (!text || !activePeer) return message.warning('Enter message');
    try {
      const res = await api.post(
        '/api/v1/message/send',
        {
          to: activePeer._id,
          doctorId: user.isDoctor ? user._id : null,
          text,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setText('');
        message.success('Message sent');
      }
    } catch (err) {
      console.error(err);
      message.error('Error sending message');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <Layout>
      <h2>Messages</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Conversations List */}
        <div style={{ width: 300 }}>
          <List
            bordered
            dataSource={conversations}
            renderItem={c => (
              <List.Item
                onClick={() => openConversation(c.peer)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <b>{c.peer?.name || c.peer?.email}</b>
                  <div style={{ fontSize: 12 }}>{c.lastMessage?.text}</div>
                </div>
              </List.Item>
            )}
          />
        </div>

        {/* Messages Panel */}
        <div style={{ flex: 1 }}>
          {activePeer ? (
            <div>
              <h4>Conversation with {activePeer.name || activePeer.email}</h4>
              <div
                style={{
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid #eee',
                  padding: 12,
                }}
              >
                {messages.map(m => (
                  <div
                    key={m._id}
                    style={{
                      marginBottom: 8,
                      textAlign: m.from === user._id ? 'right' : 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        background: m.from === user._id ? 'var(--accent-2)' : '#f1f1f1',
                        color: m.from === user._id ? '#fff' : '#000',
                        padding: '8px 12px',
                        borderRadius: 8,
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Input.TextArea
                  rows={3}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type your message..."
                />
                <div>
                  <Button type="primary" onClick={sendReply}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>Select a conversation</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
