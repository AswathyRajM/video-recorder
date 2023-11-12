import React, { useRef, useState } from 'react';
const mimeType = 'video/webm; codecs="opus,vp8"';

function VideoRecorder() {
  const mediaRecorderRef = useRef(null);
  const liveVideoFeed = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const startRecording = async () => {
    if ('MediaRecorder' in window) {
      setVideoUrl('');
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' },
        });

        const media = new MediaRecorder(videoStream, { mimeType });
        mediaRecorderRef.current = media;
        mediaRecorderRef.current.start();

        //set videostream to live feed player
        liveVideoFeed.current.srcObject = videoStream;

        setIsRecording(true);

        let localVideoChunks = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (typeof event.data === 'undefined' || event.data.size === 0)
            return;
          localVideoChunks.push(event.data);
        };
        setStream(localVideoChunks);
      } catch (e) {
        console.error(e);
        let errMsg = 'Something went wrong. Please try again later';
        if (e.message === 'Permission denied')
          errMsg = 'Please allow access to camera and audio';
        alert(errMsg);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };
  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = () => {
      setVideoUrl(URL.createObjectURL(new Blob(stream, { type: mimeType })));
      setStream([]);
    };
  };

  return (
    <div>
      <h1 className='text-3xl font-extrabold m-4'>Record Video</h1>
      <button
        className='border-2 m-4 outline-1 px-4 py-2 border-slate-300 hover:text-white hover:bg-slate-800'
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h3
          className={`${
            isRecording && 'animate-pulse'
          } m-4 text-lg font-medium`}
        >
          {!videoUrl ? (!isRecording ? '' : 'Live Feed') : 'Preivew'}
        </h3>

        <div className='max-w-[80vw] h-fit w-[20rem] m-2 '>
          {!videoUrl ? (
            <video key='live' ref={liveVideoFeed} autoPlay muted />
          ) : (
            <video key='preview' src={videoUrl} controls autoPlay />
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoRecorder;
