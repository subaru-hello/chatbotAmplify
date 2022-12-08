import React, { useEffect, useState } from "react";
import "./App.css";
import { Box, Button, TextField, Chip } from "@material-ui/core";
import awsConfig from "./aws-exports";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { ChatMessage } from "./models";
import { listChatMessages } from "./graphql/queries";
import { createChatMessage } from "./graphql/mutations";
// import { ListChatMessagesQuery } from "./API";

Amplify.configure(awsConfig);

const styles = {
  main: {
    margin: 16,
    height: 504,
    overflow: "auto",
  },
  footer: {
    margin: 16,
    marginLeft: 24,
    height: 64,
  },
  message: {
    margin: 8,
    padding: 8,
    display: "flex",
    width: 300,
  },
  messageInput: {
    width: 300,
    marginRight: 8,
  },
};

function App() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages]);

  async function fetchData() {
    const items = await API.graphql(graphqlOperation(listChatMessages));
    if ("data" in items && items.data) {
      const messages = items.data as any;
      setChatMessages(
        sortMessage(messages.listChatMessages?.items as ChatMessage[])
      );
    }
  }

  async function saveData() {
    const model = new ChatMessage({
      message: inputMessage,
    });
    await API.graphql(
      graphqlOperation(createChatMessage, {
        input: model,
      })
    );
    setInputMessage("");
  }

  function sortMessage(messages: ChatMessage[]) {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );
  }

  function onChange(message: string) {
    setInputMessage(message);
  }

  return (
    <>
      <Box style={styles.main}>
        {chatMessages &&
          chatMessages.map((message, index) => {
            return (
              <Chip
                key={index}
                label={message.message}
                color="primary"
                style={styles.message}
              />
            );
          })}
      </Box>
      <Box style={styles.footer}>
        <TextField
          variant="outlined"
          type="text"
          color="primary"
          size="small"
          value={inputMessage}
          style={styles.messageInput}
          onChange={(e) => onChange(e.target.value)}
          placeholder="メッセージを入力"
        />
        <Button variant="contained" color="default" onClick={() => saveData()}>
          投稿
        </Button>
      </Box>
    </>
  );
}

export default App;
