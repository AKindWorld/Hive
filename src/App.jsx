import React, { useEffect, useState } from 'react';
import initPeer from './services/peerService';
import FileUploader from './components/FileUploader';

const App = () => {
	const [peer, setPeer] = useState(null);
	const [conn, setConn] = useState(null);
	const [peerId, setPeerId] = useState('');
	const [otherPeerId, setOtherPeerId] = useState(''); // State to hold peer ID input
	const [receivedFile, setReceivedFile] = useState(null);
	const [fileURL, setFileURL] = useState(null);
	const [connectedPeers, setConnectedPeers] = useState(0);
	const [sendProgress, setSendProgress] = useState(0);
	const [transferComplete, setTransferComplete] = useState(false);
	const [sentFiles, setSentFiles] = useState([]);
	const [receivedFiles, setReceivedFiles] = useState([]);

	useEffect(() => {
	const peerInstance = initPeer();
	peerInstance.on('open', (id) => {
		setPeer(peerInstance);
		setPeerId(id);
	});

    peerInstance.on('connection', (connection) => {
		setConnectedPeers((prev) => prev + 1);
		connection.on('data', (data) => {
			if (data.file) {
			const fileName = data.file.name || 'Received File';
			setReceivedFiles((prevFiles) => [...prevFiles, fileName]);

			const reader = new FileReader();
			reader.onloadend = () => {
				setFileURL(reader.result);
			};
			reader.readAsDataURL(new Blob([data.file]));
			}
		});

      	setConn(connection);
    });

    return () => {
      	peerInstance.destroy();
    };
  	}, []);

	const connectToPeer = (otherPeerId) => {
		const connection = peer.connect(otherPeerId);
		connection.on('open', () => {
			setConnectedPeers((prev) => prev + 1);
			setConn(connection);
		});
	};

	const disconnectPeer = () => {
		if (conn && conn.open) {
		conn.close(); // Close the peer connection
		setConnectedPeers(0);
		}
	};

	const sendFile = (file) => {
		if (conn && conn.open) {
		setSentFiles((prevFiles) => [...prevFiles, file.name]);

		const fileSize = file.size;
		const chunkSize = 512 * 1024;
		let offset = 0;

		const sendChunk = () => {
			const chunk = file.slice(offset, offset + chunkSize);
			conn.send({ file: chunk });
			offset += chunkSize;
			setSendProgress(Math.min(100, (offset / fileSize) * 100));

			if (offset < fileSize) {
			setTimeout(sendChunk, 50);
			} else {
			setTransferComplete(true);
			}
		};

		sendChunk();
		}
	};

	return (
		<div>
		<div className='flex flex-row justify-center'>
			<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M15 25C15 29.1421 11.6421 32.5 7.5 32.5C3.35786 32.5 0 29.1421 0 25C0 20.8579 3.35786 17.5 7.5 17.5C11.6421 17.5 15 20.8579 15 25Z" fill="#EB5757"/>
			<path d="M50 25C50 29.1421 46.6421 32.5 42.5 32.5C38.3579 32.5 35 29.1421 35 25C35 20.8579 38.3579 17.5 42.5 17.5C46.6421 17.5 50 20.8579 50 25Z" fill="#2F80ED"/>
			<path d="M32.5 7.5C32.5 11.6421 29.1421 15 25 15C20.8579 15 17.5 11.6421 17.5 7.5C17.5 3.35786 20.8579 0 25 0C29.1421 0 32.5 3.35786 32.5 7.5Z" fill="#F2C94C"/>
			<path d="M32.5 42.5C32.5 46.6421 29.1421 50 25 50C20.8579 50 17.5 46.6421 17.5 42.5C17.5 38.3579 20.8579 35 25 35C29.1421 35 32.5 38.3579 32.5 42.5Z" fill="#6FCF97"/>
			</svg>
			<div className='flex flex-col self-center pl-5'>
			<h1 className='text-3xl font-bold'>
				Hive
			</h1>
			<h3>
				a decentralized p2p File Sharing App
			</h3>
			</div>
		</div>
		<div className='flex flex-row justify-center p-10'>
			<p>Your Room ID: {peerId}</p>
			<p>Connected Peers: {connectedPeers}</p>

			{connectedPeers > 0 && <button onClick={disconnectPeer}>Disconnect</button>}
		</div>

		<div class="mb-6 px-20">
			<label for="default-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PeerID: </label>
			<div className='flex flex-row'>
			<input 
				type="text" 
				id="peerIDInput"
				value={otherPeerId}
				placeholder="Enter peer ID to connect"
				onChange={(e) => setOtherPeerId(e.target.value)}
				className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
			<button
				className='ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800' 
				onClick={() => connectToPeer(otherPeerId)}>Connect</button>
			</div>
		</div>

		<FileUploader onFileSelected={() => {}} onSendFile={sendFile} />

		{sendProgress > 0 && sendProgress < 100 && (
			<div>
			<p>Sending: {Math.floor(sendProgress)}%</p>
			<progress value={sendProgress} max="100"></progress>
			</div>
		)}

		{transferComplete && <p>File transfer complete!</p>}

		<div className='flex flex-row justify-center'>
			<div className='flex flex-col px-8'>
				<h3 className='font-bold text-xl'>Sent Files</h3>
				<ul>
					{sentFiles.map((file, index) => (
					<li key={index}>{file}</li>
					))}
				</ul>
			</div>
			<div className='flex flex-col px-8'>
				<h3 className='font-bold text-xl'>Received Files</h3>
				<ul>
					{receivedFiles.map((file, index) => (
					<li key={index}>
						{file}
						<button>
						<a href={fileURL} download={file}>
							Download
						</a>
						</button>
					</li>
					))}
				</ul>
			</div>
		</div>
		</div>
	);
};

export default App;
