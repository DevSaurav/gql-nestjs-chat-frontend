"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, gql, useMutation, useSubscription } from "@apollo/client";
import createApolloClient from "../../apollo-client";
import {
  Send,
  Phone,
  Video,
  Info,
  Search,
  Smile,
  Paperclip,
  ThumbsUp,
  MoreHorizontal,
  LogOut,
} from "lucide-react";

//list messages from and to for the current users
const GET_MESSAGES_QUERY = gql`
  query GetMessages($receiverId: String!) {
    messages(receiverId: $receiverId) {
      _id
      content
      createdAt
      user {
        _id
        username
      }
      receiver {
        _id
        username
      }
    }
  }
`;

//list messages from and to for the current users
const GET_INBOX_USERS_QUERY = gql`
  query GetInboxUsers {
    inbox {
      _id
      username
      email
      createdAt
    }
  }
`;

// listen to pubSub subscription for sent messages
const LISTEN_SUBSCRIPTION = gql`
  subscription MessageAdded {
    messageAdded {
      _id
      content
      createdAt
      content
      user {
        _id
        username
      }
      receiver {
        _id
        username
      }
    }
  }
`;
//list messages from and to for the current users
const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($content: String!, $receiverId: String!) {
    sendMessage(
      sendMessageInput: { content: $content, receiverId: $receiverId }
    ) {
      _id
      content
      createdAt
      user {
        _id
        username
      }
      receiver {
        _id
        username
      }
    }
  }
`;

const ChatPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState<any>();
  const [chatUser, setChatUser] = useState();

  //gql operations
  const {
    data: inboxData,
    loading: inboxLoading,
    error: inboxError,
  } = useQuery(GET_INBOX_USERS_QUERY, {
    client: createApolloClient,
  });
  const {
    data,
    loading,
    error,
    refetch: refetchMessage,
  } = useQuery(GET_MESSAGES_QUERY, {
    client: createApolloClient,
    variables: {
      receiverId: chatUser?._id,
    },
  });
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    client: createApolloClient,
  });

  //listen to message added subscription
  const {
    data: subscribedMessage,
    loading: subscribedMessageLoading,
    error: subscriptionError,
  } = useSubscription(LISTEN_SUBSCRIPTION, { client: createApolloClient });

  const [messages, setMessages] = useState<any>();

  //sideeffect to load initial data
  useEffect(() => {

    //redirect to login page if not access token
    if(!localStorage?.getItem("gql_chat_access_token")){
      router.push('/login')
    }
    setUserName(localStorage?.getItem("gql_chat_name"));

    setMessages(
      data?.messages.map((m) => ({
        ...m,
        id: m._id,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: m.user.username,
        avatar: m.user.username != userName ? "👨‍💼" : "",
        isOwn: m.user.username == userName ? true : false,
      }))
    );
  }, [data]);

  //set default chat user, default to first user from the list
  useEffect(() => {
    setChatUser(inboxData?.inbox[0]);
  }, [inboxData]);

  //side effect to load incoming message from subscription of messageAdded type
  useEffect(() => {
    console.log(subscribedMessage, "subscribedMessage");
    if (
      subscribedMessage?.messageAdded &&
      subscribedMessage?.messageAdded.receiver.username == userName
    ) {
      console.log(subscribedMessage, "subscribedMessage inside");
      const newMessage = {
        id: subscribedMessage?.messageAdded._id,
        sender: subscribedMessage?.messageAdded.user.username,
        content: subscribedMessage?.messageAdded.content,
        time: new Date(
          subscribedMessage?.messageAdded.createdAt
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: "👨‍💼",
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  }, [subscribedMessage]);

  // const contacts = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     avatar: "👨‍💼",
  //     status: "online",
  //     lastMessage: "That sounds exciting!",
  //     time: "2:35 PM",
  //     unread: 0,
  //   },
  //   {
  //     id: 2,
  //     name: "Mohn Doe",
  //     avatar: "👩‍💻",
  //     status: "online",
  //     lastMessage: "See you tomorrow!",
  //     time: "1:20 PM",
  //     unread: 2,
  //   },
  // ];

  const handleSendMessage = async () => {
    try {
      //TODO:: Collect receiver id from inbox box
      const { data } = await sendMessage({
        variables: { content: message, receiverId: chatUser?._id },
      });
      console.log("send success", data);
      if (message.trim()) {
        const newMessage = {
          id: messages.length + 1,
          sender: "You",
          content: message,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: true,
          avatar: "👨‍💼",
        };
        setMessages([...messages, newMessage]);
        setMessage([]);
      }

      // Handle success (e.g., show a success message, clear form)
      router.push("chat");
      setMessage("");
    } catch (err: any) {
      // Handle error (e.g., show an error message)
      console.error(err);
    }
  };

  //function to scroll on new chat
  const ScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  //logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("login");
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
            <button
              onClick={() => handleLogout()}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              <LogOut />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {inboxData?.inbox.map((contact) => (
            <div
              key={contact._id}
              onClick={() => setChatUser(contact)}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
                  {contact.avatar}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    contact.status === "online"
                      ? "bg-green-400"
                      : contact.status === "away"
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">
                    {contact.username}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {contact.lastMessage}
                  </p>
                  {contact.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white mr-3">
              👨‍💼
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {chatUser?.username}
              </h2>
              <p className="text-sm text-green-500">Active now</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-500" />
            <Video className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-500" />
            <Info className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-500" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages &&
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    msg.isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                      {msg.avatar}
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        msg.isOwn
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-gray-200 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        msg.isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          <ScrollToBottom />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-500" />
              <Smile className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-500" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              {message.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <ThumbsUp className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
