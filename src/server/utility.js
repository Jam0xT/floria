// 发送 ws 信息
function sendWsMsg(ws, type, data) {
	ws.send(JSON.stringify({
		type: type,
		data: data,
	}));
}

export {
	sendWsMsg,
};