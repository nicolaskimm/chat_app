import React from 'react';
import styles from './MessageList.css';

const Message = props => (
	<div className={styles.Message}>
		<span className={styles.Nick}>{props.from}: </span>
	  	<span className={styles.MessageText}>{props.text}</span>
	</div>
);


const MessageList = props => (
	<div className={styles.MessageList}>
		{
			props.messages.map((message, i) => {
		  		return (
					<Message
			  			key={i}
			    		from={message.from}
			  			text={message.text}
					/>
		  		);
			})
	  	}
	</div>
  );


export default MessageList;