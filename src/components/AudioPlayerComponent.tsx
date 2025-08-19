//AudioPlayerComponents
import React, { useRef, useState, useEffect } from 'react';
// import './../assets/scss/style.scss'; // Make sure to create this file
import url from '../env';
import Spinner from './Spinner';
import secureLocalStorage from 'react-secure-storage';

interface CustomAudioPlayerProps {
  src: string;
  transcript?:string;
  autoPlay?:string
  title?: string;
  fileName?: string;
  timeLabel?: string;
  transcriptClass?:string
  onEnded?:()=>void;
}

const AudioPlayerComponents: React.FC<CustomAudioPlayerProps> = ({
  src,
  transcript='',
  autoPlay,
  title = 'Call Recording',
  fileName = 'audio',
  timeLabel = '1:25 PM',
  transcriptClass='',
  onEnded
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const rangeRef = useRef<HTMLInputElement>(null);
  // const [transcript,setTranscript] = useState('');
  const [isTranscriptLoader, setIsTranscriptLoader] = useState(false)

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if(autoPlay == 'true')
    {
      audio.play()
      setIsPlaying(true);
    }
    
    const update = () => setCurrentTime(audio.currentTime);
    const loaded = () => setDuration(audio.duration);

    const ended = () => {
      setIsPlaying(false);
      if (onEnded) onEnded(); // ✅ Call the function passed from parent
    };

    // const handelTranscription = async()=>{
    //   setIsTranscriptLoader(true)
    //   try{

    //       const blob = await fetch(src).then((res) => res.blob());
    //       const file = new File([blob], `${fileName}.mp3`, { type: 'audio/mpeg' });

    //       const formData = new FormData();
    //       formData.append('client_recording', file);
    //       const bearerToken = secureLocalStorage.getItem('login');
    //       const response = await fetch(`${url.nodeapipath}/all/transcript`,{
    //         method:'POST',
    //         body:formData,
    //         headers: {
    //           // 'Content-Type':'application/json',
    //           'Access-Control-Allow-Origin':'*',
    //           'Authorization': `Bearer ${bearerToken}`
    //           }
    //       });
    //       const data = await response.json();  
                            
    //       if (response.ok) {
    //         // setTotalClient(data.client.length)

    //         // console.log(data.transcript);
    //         setTranscript(data.transcript)
    //         setIsTranscriptLoader(false)
            
                                    
    //       } else {
    //           console.error('Error fetching transcript:', data);
    //       }
    //   }
    //   catch(error:any)
    //   {

    //   }
      
    // }

    // handelTranscription();
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', loaded);
    audio.addEventListener('ended', ended);

    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', loaded);
      audio.removeEventListener('ended', ended);
    };
  }, []);

  useEffect(() => {
  if (!rangeRef.current || duration === 0) return;

  const percent = (currentTime / duration) * 100;
  rangeRef.current.style.background = `linear-gradient(to right, #3b3a39 0%, #3b3a39 ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`;
}, [currentTime, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const rewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const forward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = () => {
    const rates = [1, 1.5, 2];
    const index = rates.indexOf(playbackRate);
    const newRate = rates[(index + 1) % rates.length];
    if (audioRef.current) audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const format = (time: number) => {
    const min = Math.floor(time / 60).toString().padStart(2, '0');
    const sec = Math.floor(time % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const download = async () => {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.mp3`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audio-player">
      <div className="audio-header">
        <div className="audio-title">
          <span role="img" aria-label="call">📞</span>
          <span>{title}</span>
        </div>
        <div className="audio-info">
          <button onClick={download}><i className='fas fa-download' style={{padding:'17% 0%'}}/></button>
          {/* <span>{timeLabel}</span> */}
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="controls">
        <button onClick={togglePlay}>{isPlaying ? <i className='fe-pause-circle' style={{padding:'17% 24%'}}/> : <i className='fe-play-circle' style={{padding:'17% 24%'}}/>}</button>
        <button onClick={rewind}><i className='fas fa-backward' style={{padding:'17% 24%'}}/> </button>
        <button onClick={forward}> <i className='fas fa-forward' style={{padding:'17% 24%'}}/></button>
        <button onClick={toggleMute}>{isMuted ? <i className='fe-volume-x' style={{padding:'17% 24%'}}/> : <i className='fe-volume-1' style={{padding:'17% 24%'}}/>}</button>
        <button onClick={changeSpeed}>{playbackRate}x</button>
        <span>{format(currentTime)} / {format(duration)}</span> 
      </div>

      <input
        type="range"
        ref={rangeRef}
        min={0}
        max={duration}
        value={currentTime}
        step="0.1"
        onChange={(e) => {
          const time = parseFloat(e.target.value);
          if (audioRef.current) audioRef.current.currentTime = time;
          setCurrentTime(time);
        }}
        className="audio-progress"
      />

      <div className="transcript-toggle">
        <button onClick={() => setShowTranscript(!showTranscript)}>
          {showTranscript ? 'Hide transcription ▲' : 'Show transcription ▼'}
        </button>
      </div>
      <div>
        {showTranscript && <div className="transcript">{(isTranscriptLoader)?
          <div className='d-flex justify-content-center dashboard-scheme-wrapper'>
              <Spinner key={'1'} className="m-2" color={'secondary'} type="bordered" size="md"/>
          </div>:(transcript == '')?<div className="transcript-toggle">
                No Transcription found
              </div>:<div dangerouslySetInnerHTML={{ __html: transcript }} className={transcriptClass}/>}
          </div>}
        {/* [Transcription goes here...] */}
      </div>
    </div>
  );
};

export default AudioPlayerComponents;

