export default Object.freeze({
	WS_PORT: 25563,
	MSG_TYPES: {
		CLIENT: {
			PLAYER:{
				CONNECT: '0',
				CHANGE_USERNAME: '4',
				FIND_PUBLIC_ROOM: '7',
			},
			ROOM: {
				CREATE: 'kYNwIRRsnVOade3K2xxhmP8ro5xlRFwcGLQ9AGOregZpvjD0PAdIhrYm58OGnTby',
				JOIN: 'nk301wI3jGXW9Raz6VBUKVgbxsdTs6qppM8BNNv9Qo3xmUdHaQzIy5uiFbOLNR5P',
				LEAVE: 'iDW344Gm0CdEHASKTLalkOETh7qSnT7Eey97ejBYArtuBNaeD5yVOoCnnGqRiLAt',
				READY: 'jRKbIsuMHTYu0v7J6c2bI2aYewjluRJzMCfqT0xSWwYVvCb7YY5ObiTBf6YIqAe6',
				UPDATE_SETTINGS: '5',
				KICK_PLAYER: '8',
				INFO: 'WsUVLIiGCIJU12UOKn602QCGgiAJaPX0cLy8ZMn6DOEZFpeVvUDod63qhqatAfff',
				SETTINGS: 'DhkIfoAbCPybNZPGSapzxGJtvXTjFbgSNIuDdtafmXMIovmouJTQDUnJxffPINek',
				CHANGE_TEAM: '2'
			},
			GAME: {
				INPUT: 'frKNOmDOCXVEgrXtrqiZJSzyeXNoIWPnPOTDezbgzLmCKnpsNciMaQDayjNuwyLW',
			}
		},
		SERVER: {
			ROOM: {
				CREATE: 'u8dwZFwjDXg0QooWfDVtDec8aBBUKwOpLgaAvfYWBl8iSLSnRYh8ztr9nUd5XeIf',
				JOIN: 'T9jso372r8t5RZykiHM2NJUdus7VCImSzEQFaV944B6xaqBy11zfAqcQVwXvNjdI',
				LEAVE: 'tNMauGxSg3DPaoi2RQdBa13kAQqJIPioptfI7GVILynzCMjjQFh8KLAqvIV8ivMu',
				UPDATE: 'A6zeZwUGsDsR3UsFlBiNjCBRhrjmoeCRi2SLNkM82ieBFk3vQDFPBsdY9FsPAbTq',
				INFO: 'tzVHvsiel4g10esgA6c7uib0ZGx8qtMOwbDTxvvTrzYXMylzN4t2nw2x29244opD',
				SETTINGS: 'WAFZKCQSKCpmOxKYiiQRUWQnrlzAgXMziZGkTZjQqrnbcZYFuFmXQjTPqubEbJxk',
				READY: 'vdtobApwlfdBUxPCkHuEHWoIhOygNjVntbRfceytyrdpOsePIuRFNqXEojDkmKCR',
				START: 'XLkmcoOyZAKptytNxSOtiPxFnemZqGqTDzsBUUWdcjlDpeOrASGyWyrYuYpNzodo',
				JOIN_REJECTED: '1',
			},
			GAME: {
				INIT: 'ghJHLrAICFwzRHmYKspXRTwJRhtcuYSrCwVXbomCBjkutZdvwqhrtqnPZbqHWYrB',
				START: 'Lp1GDS1BjTyUGXEY6UrYjmh55YLxaOfX4DaaTXtSszD2A1yUGRfKGPOwHnwIhce3',
				OVER: 'junCWOGTLwGFsfHNkQXkBGCxtkFdtIVrJMuLrxFshqFrNRwlDbluKYSTXAEZvhkr',
				UPDATE: 'PPTAHVGGPthHyIUKlGRIFNgFVfheqQfHkTjfCZHZZdmSHvJZLGfevtOoColzBcHz',
			}
		},
	},
});